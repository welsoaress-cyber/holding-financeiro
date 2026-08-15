-- ================================================================
-- PORTAL SERVNET — MÚLTIPLOS CONTRATOS + FATURAS REAIS
-- Execute no Supabase Dashboard > SQL Editor
--
-- O que muda:
--   1. portal_servnet_login   → devolve TODOS os contratos ativos de
--      Provedor, não só o primeiro (antes: LIMIT 1).
--   2. portal_servnet_faturas → passa a ler as receitas reais do admin
--      (tabela `lancamentos`), em vez da tabela `servnet_faturas`, que
--      nunca é populada por ninguém.
--   3. portal_servnet_fidelidade → streak por contrato.
--   4. faturas/fidelidade passam a receber os IDs como text. Os IDs do
--      admin são text (cli_xxx / ct_xxx) e a assinatura uuid antiga
--      falhava na conversão — daí o "Erro ao carregar fatura".
--
-- Sobre o vencimento das faturas pagas:
--   Ao dar baixa, o admin sobrescreve `dados->>'data'` com a data do
--   pagamento — o vencimento original se perde. Reconstruímos assim,
--   em ordem de confiabilidade:
--     a) âncora da recorrência: qualquer parcela ainda não paga da mesma
--        série (`recorrenciaId`) guarda o vencimento real; deslocamos pela
--        diferença de `recorrenciaIndex` em meses. Preciso.
--     b) fallback: dia de vencimento do contrato, no mês do pagamento.
--   Nada disso exige alterar o painel administrativo.
-- ================================================================


-- ----------------------------------------------------------------
-- 1. LOGIN — devolve todos os contratos ativos de Provedor
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_login(
  p_cpf        text,
  p_nascimento text   -- formato YYYY-MM-DD
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cli       record;
  v_dados     jsonb;
  v_contratos json;
  v_primeiro  jsonb;
BEGIN
  -- normaliza CPF: só dígitos
  p_cpf := regexp_replace(p_cpf, '[^0-9]', '', 'g');

  SELECT id, dados, user_id INTO v_cli
  FROM cli_clientes
  WHERE regexp_replace(dados->>'cpfCnpj', '[^0-9]', '', 'g') = p_cpf
    AND (
      dados->>'dataNascimento' = p_nascimento
      OR dados->>'dataNascimento' = to_char(p_nascimento::date, 'DD/MM/YYYY')
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'msg', 'CPF ou data de nascimento não conferem.');
  END IF;

  v_dados := v_cli.dados;

  -- TODOS os contratos ativos de Provedor, cada um com o seu plano.
  -- Ordena pelo dia de vencimento só pra dar uma ordem estável na tela.
  SELECT json_agg(to_jsonb(x) - 'ord' ORDER BY x.ord, x.contrato_id)
  INTO v_contratos
  FROM (
    SELECT
      c->>'id'                  AS contrato_id,
      c->>'status'              AS status,
      c->>'diaVencimento'       AS "diaVencimento",
      c->>'dataContrato'        AS "dataContrato",
      c->>'enderecoInstalacao'  AS "enderecoInstalacao",
      c->>'observacoes'         AS observacoes,
      COALESCE(NULLIF(c->>'diaVencimento','')::int, 99) AS ord,
      CASE
        WHEN pl.id IS NOT NULL THEN json_build_object(
          'nome',       pl.dados->>'nome',
          'valor',      pl.dados->>'valor',
          'velocidade', pl.dados->>'velocidade',
          'tecnologia', pl.dados->>'tecnologia'
        )
        ELSE NULL
      END AS plano
    FROM jsonb_array_elements(COALESCE(v_dados->'contratos', '[]'::jsonb)) c
    LEFT JOIN cli_planos pl
      ON pl.id::text = c->>'planoId'
     AND pl.user_id  = v_cli.user_id
    WHERE c->>'status' = 'Ativo'
      AND lower(c->>'negocio') = 'provedor'
  ) x;

  -- nenhum contrato ativo de Provedor = cliente não pertence a este portal
  IF v_contratos IS NULL THEN
    RETURN json_build_object('ok', false, 'msg', 'Nenhum contrato ativo encontrado para este portal.');
  END IF;

  v_primeiro := (v_contratos::jsonb) -> 0;

  RETURN json_build_object(
    'ok',         true,
    'cliente_id', v_cli.id,
    'master_id',  v_cli.user_id,
    'nome',       v_dados->>'nome',
    'email',      v_dados->>'email',
    'telefone',   v_dados->>'telefone',
    'status',     COALESCE(v_dados->>'status', 'Ativo'),
    'contratos',  v_contratos,
    -- campos legados: espelham o primeiro contrato, para o portal antigo
    -- e para a RPC de upgrade continuarem funcionando sem alteração
    'diaVencimento', COALESCE(v_primeiro->>'diaVencimento', v_dados->>'diaVencimento'),
    'data_adesao',   v_primeiro->>'dataContrato',
    'plano',         v_primeiro->'plano'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_login(text, text) TO anon;


-- ----------------------------------------------------------------
-- 2. FATURAS — lê as receitas reais do admin (tabela `lancamentos`)
--    e reconstrói o vencimento das que já foram pagas
-- ----------------------------------------------------------------
-- Remove a versão antiga com assinatura uuid. Os IDs do admin são text
-- (cli_xxx / ct_xxx), então a versão uuid quebrava na conversão — é o mesmo
-- motivo pelo qual portal_servnet_solicitar já tinha sido migrada para text.
-- Sem o DROP as duas assinaturas coexistem e o PostgREST pode chamar a errada.
DROP FUNCTION IF EXISTS public.portal_servnet_faturas(uuid, uuid);

CREATE OR REPLACE FUNCTION public.portal_servnet_faturas(
  p_cliente_id text,
  p_master_id  text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_faturas json;
BEGIN
  -- contratos ativos de Provedor deste cliente (os que o portal exibe)
  WITH contratos AS (
    SELECT
      c->>'id' AS contrato_id,
      NULLIF(c->>'diaVencimento','')::int AS dia_venc
    FROM cli_clientes cl,
         jsonb_array_elements(COALESCE(cl.dados->'contratos','[]'::jsonb)) c
    WHERE cl.id::text      = p_cliente_id
      AND cl.user_id::text = p_master_id
      AND c->>'status' = 'Ativo'
      AND lower(c->>'negocio') = 'provedor'
  ),
  base AS (
    -- receitas do cliente ligadas a um contrato de Provedor.
    -- Receitas de outros negócios (ex: Servidor) ficam de fora do portal.
    SELECT
      l.id,
      l.dados,
      l.dados->>'contratoId'                        AS contrato_id,
      l.dados->>'recorrenciaId'                     AS rec_id,
      NULLIF(l.dados->>'recorrenciaIndex','')::int  AS rec_idx,
      l.dados->>'data'                              AS data_lanc,
      COALESCE(l.dados->>'status','Provisionado')   AS status
    FROM lancamentos l
    WHERE l.user_id::text = p_master_id
      AND l.dados->>'clienteId' = p_cliente_id
      AND l.dados->>'tipo'      = 'Receita'
      AND COALESCE((l.dados->>'inativo')::boolean, false) = false
      AND l.dados->>'contratoId' IN (SELECT contrato_id FROM contratos)
  ),
  -- âncora: parcela ainda NÃO paga da mesma série guarda o vencimento real
  ancora AS (
    SELECT DISTINCT ON (rec_id)
      rec_id,
      data_lanc::date AS anc_data,
      rec_idx         AS anc_idx
    FROM base
    WHERE rec_id IS NOT NULL
      AND rec_idx IS NOT NULL
      AND status <> 'Pago'
    ORDER BY rec_id, rec_idx ASC
  ),
  calc AS (
    SELECT
      b.*,
      ct.dia_venc,
      CASE
        -- não paga: `data` ainda É o vencimento
        WHEN b.status <> 'Pago' THEN b.data_lanc::date
        -- paga, com âncora da recorrência: desloca pelos meses de diferença
        WHEN a.rec_id IS NOT NULL THEN
          (a.anc_data + ((b.rec_idx - a.anc_idx) * interval '1 month'))::date
        -- paga, sem âncora: dia de vencimento do contrato no mês do pagamento
        WHEN ct.dia_venc IS NOT NULL THEN
          (date_trunc('month', b.data_lanc::date)
            + (LEAST(
                 ct.dia_venc,
                 EXTRACT(DAY FROM (date_trunc('month', b.data_lanc::date)
                                   + interval '1 month - 1 day'))::int
               ) - 1) * interval '1 day')::date
        -- sem nada: assume que foi paga no vencimento
        ELSE b.data_lanc::date
      END AS vencimento
    FROM base b
    LEFT JOIN ancora    a  ON a.rec_id      = b.rec_id
    LEFT JOIN contratos ct ON ct.contrato_id = b.contrato_id
  )
  SELECT json_agg(
    json_build_object(
      'id',             id,
      'contrato_id',    contrato_id,
      'valor',          COALESCE((dados->>'valor')::numeric, 0),
      'vencimento',     to_char(vencimento, 'YYYY-MM-DD'),
      'status',         CASE WHEN status = 'Pago' THEN 'Pago' ELSE 'Pendente' END,
      'mes_referencia', to_char(vencimento, 'YYYY-MM'),
      'descricao',      dados->>'descricao',
      'link_boleto',    dados->>'linkBoleto',
      -- em lançamento pago, `data` é a data do pagamento
      'data_pagamento', CASE WHEN status = 'Pago' THEN data_lanc ELSE NULL END
    )
    ORDER BY vencimento DESC
  )
  INTO v_faturas
  FROM calc;

  RETURN json_build_object(
    'ok',      true,
    'faturas', COALESCE(v_faturas, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_faturas(text, text) TO anon;


-- ----------------------------------------------------------------
-- 3. FIDELIDADE — um streak por contrato
--    Mantida para compatibilidade; o portal calcula o streak no
--    front a partir de portal_servnet_faturas. Aqui devolvemos o
--    mesmo cálculo por contrato, para quem consumir a RPC direto.
-- ----------------------------------------------------------------
DROP FUNCTION IF EXISTS public.portal_servnet_fidelidade(uuid, uuid);

CREATE OR REPLACE FUNCTION public.portal_servnet_fidelidade(
  p_cliente_id text,
  p_master_id  text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fat      json;
  v_rec      record;
  v_ct       record;
  v_streak   int;
  v_por_ct   jsonb := '{}'::jsonb;
  v_melhor   int := 0;
BEGIN
  -- reaproveita a reconstrução de vencimento da RPC de faturas
  SELECT (public.portal_servnet_faturas(p_cliente_id, p_master_id)->>'faturas')::json
  INTO v_fat;

  FOR v_ct IN
    SELECT DISTINCT f->>'contrato_id' AS contrato_id
    FROM json_array_elements(v_fat) f
  LOOP
    v_streak := 0;

    FOR v_rec IN
      SELECT
        f->>'status'         AS status,
        f->>'vencimento'     AS vencimento,
        f->>'data_pagamento' AS data_pagamento
      FROM json_array_elements(v_fat) f
      WHERE f->>'contrato_id' IS NOT DISTINCT FROM v_ct.contrato_id
      ORDER BY f->>'vencimento' DESC
    LOOP
      -- fatura pendente com vencimento futuro: mês corrente ainda no prazo.
      -- Não conta como selo, mas também não quebra o streak.
      IF lower(v_rec.status) = 'pendente'
         AND v_rec.vencimento >= to_char(current_date, 'YYYY-MM-DD')
      THEN
        CONTINUE;
      END IF;

      IF lower(v_rec.status) = 'pago'
         AND v_rec.data_pagamento IS NOT NULL
         AND v_rec.data_pagamento <= v_rec.vencimento
      THEN
        v_streak := v_streak + 1;
      ELSE
        -- Atraso, vencida ou pendente fora do prazo: encerra a contagem.
        -- NÃO zera o que já foi contado — a varredura vem do vencimento
        -- mais recente para o mais antigo, então os selos já somados são
        -- justamente os posteriores ao atraso. (A versão anterior desta
        -- função zerava aqui e devolvia 0 para quem tivesse qualquer
        -- atraso no passado, por mais antigo que fosse.)
        EXIT;
      END IF;
    END LOOP;

    v_por_ct := v_por_ct || jsonb_build_object(COALESCE(v_ct.contrato_id,'—'), v_streak);
    IF v_streak > v_melhor THEN v_melhor := v_streak; END IF;
  END LOOP;

  RETURN json_build_object(
    'ok',            true,
    'por_contrato',  v_por_ct,
    -- legado: melhor streak entre os contratos
    'streak',        v_melhor
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_fidelidade(text, text) TO anon;
