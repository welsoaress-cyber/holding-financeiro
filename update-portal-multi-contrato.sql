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
--   3. portal_servnet_fidelidade → removida; a regra do cartão vive no
--      portal, calculada a partir de portal_servnet_faturas.
--   4. faturas passa a receber os IDs como text. Os IDs do admin são text
--      (cli_xxx / ct_xxx) e a assinatura uuid antiga falhava na conversão
--      — daí o "Erro ao carregar fatura".
--
-- Sobre o vencimento das faturas pagas:
--   O admin ATUAL preserva `dados->>'data'` como vencimento e grava o
--   recebimento em `dados->>'dataPagamento'` — nesse caso lemos os dois
--   direto, sem reconstruir nada.
--   Faturas pagas ANTES dessa mudança têm `data` sobrescrito com a data do
--   pagamento e nenhum `dataPagamento`. Para essas, reconstruímos assim,
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
      NULLIF(l.dados->>'dataPagamento','')          AS data_pgto,
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
        -- Não paga: `data` é o vencimento.
        WHEN b.status <> 'Pago' THEN b.data_lanc::date
        -- Paga pelo admin ATUAL: ele preserva `data` como vencimento e grava
        -- o recebimento em `dataPagamento`. Nada a reconstruir.
        WHEN b.data_pgto IS NOT NULL THEN b.data_lanc::date
        -- Daqui para baixo, faturas pagas sob a regra ANTIGA, em que a baixa
        -- sobrescrevia `data` com a data do pagamento e o vencimento se perdia.
        -- Âncora da recorrência: uma parcela não paga da mesma série guarda o
        -- vencimento real; desloca pela diferença de índice em meses.
        WHEN a.rec_id IS NOT NULL THEN
          (a.anc_data + ((b.rec_idx - a.anc_idx) * interval '1 month'))::date
        -- Sem âncora: dia de vencimento do contrato, no mês do pagamento.
        WHEN ct.dia_venc IS NOT NULL THEN
          (date_trunc('month', b.data_lanc::date)
            + (LEAST(
                 ct.dia_venc,
                 EXTRACT(DAY FROM (date_trunc('month', b.data_lanc::date)
                                   + interval '1 month - 1 day'))::int
               ) - 1) * interval '1 day')::date
        -- Sem nada: assume que foi paga no vencimento.
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
      -- admin atual grava dataPagamento; no legado, `data` virou a data da baixa
      'data_pagamento', CASE
        WHEN status <> 'Pago'    THEN NULL
        WHEN data_pgto IS NOT NULL THEN data_pgto
        ELSE data_lanc
      END
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
-- 3. FIDELIDADE — removida
--
-- A regra do cartão (12 meses a partir do mês seguinte ao cadastro, selo
-- por fatura paga até o vencimento, 6 selos → 50%, 12 → 100%) vive no
-- portal, que a calcula a partir de portal_servnet_faturas.
--
-- Esta função reimplementava a mesma regra em SQL e ficou para trás quando
-- a regra mudou — passou a devolver números que não batiam com o cartão.
-- Duas implementações da mesma regra divergem; fica só uma.
-- ----------------------------------------------------------------
DROP FUNCTION IF EXISTS public.portal_servnet_fidelidade(text, text);
DROP FUNCTION IF EXISTS public.portal_servnet_fidelidade(uuid, uuid);
