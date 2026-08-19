-- ================================================================
-- CORREÇÃO CRÍTICA — PORTAL SERVNET
-- Todo cliente com contrato de Provedor (qualquer status exceto
-- Cancelado) deve conseguir fazer login e ver suas faturas.
--
-- O problema: portal_servnet_contratos filtrava status = 'Ativo',
-- bloqueando clientes Suspensos, Inadimplentes etc.
--
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================


-- ----------------------------------------------------------------
-- 1. CONTRATOS — libera acesso para qualquer status exceto Cancelado
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_contratos(
  p_cliente_id text,
  p_master_id  text
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_agg(to_jsonb(x) - 'ord' ORDER BY x.ord, x.contrato_id)
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
    FROM cli_clientes cl
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(cl.dados->'contratos','[]'::jsonb)) c
    LEFT JOIN cli_planos pl
      ON pl.id::text = c->>'planoId'
     AND pl.user_id  = cl.user_id
    WHERE cl.id::text      = p_cliente_id
      AND cl.user_id::text = p_master_id
      AND lower(COALESCE(c->>'negocio','')) = 'provedor'
      AND lower(COALESCE(c->>'status',''))  <> 'cancelado'
      -- Remove o filtro 'Ativo' — Suspenso, Inadimplente etc. têm acesso
  ) x;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_contratos(text, text) TO anon;


-- ----------------------------------------------------------------
-- 2. LOGIN — atualiza a mensagem de erro e mantém alinhado
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

  -- Usa portal_servnet_contratos — já inclui qualquer status exceto Cancelado
  v_contratos := public.portal_servnet_contratos(v_cli.id::text, v_cli.user_id::text);

  IF v_contratos IS NULL THEN
    RETURN json_build_object('ok', false, 'msg', 'Nenhum contrato de Provedor encontrado.');
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
    -- campos legados: espelham o primeiro contrato
    'diaVencimento', COALESCE(v_primeiro->>'diaVencimento', v_dados->>'diaVencimento'),
    'data_adesao',   v_primeiro->>'dataContrato',
    'plano',         v_primeiro->'plano'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_login(text, text) TO anon;


-- ----------------------------------------------------------------
-- 3. FATURAS — igual ao update-portal-multi-contrato.sql,
--    mas o filtro de contratos já usa a nova função (sem 'Ativo')
-- ----------------------------------------------------------------
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
  WITH contratos AS (
    SELECT
      c->>'id' AS contrato_id,
      NULLIF(c->>'diaVencimento','')::int AS dia_venc
    FROM cli_clientes cl,
         jsonb_array_elements(COALESCE(cl.dados->'contratos','[]'::jsonb)) c
    WHERE cl.id::text      = p_cliente_id
      AND cl.user_id::text = p_master_id
      AND lower(COALESCE(c->>'negocio','')) = 'provedor'
      AND lower(COALESCE(c->>'status',''))  <> 'cancelado'
      -- mesmo critério da função de contratos: qualquer status exceto Cancelado
  ),
  base AS (
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
        WHEN b.status <> 'Pago' THEN b.data_lanc::date
        WHEN b.data_pgto IS NOT NULL THEN b.data_lanc::date
        WHEN a.rec_id IS NOT NULL THEN
          (a.anc_data + ((b.rec_idx - a.anc_idx) * interval '1 month'))::date
        WHEN ct.dia_venc IS NOT NULL THEN
          (date_trunc('month', b.data_lanc::date)
            + (LEAST(
                 ct.dia_venc,
                 EXTRACT(DAY FROM (date_trunc('month', b.data_lanc::date)
                                   + interval '1 month - 1 day'))::int
               ) - 1) * interval '1 day')::date
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
      'data_pagamento', CASE
        WHEN status <> 'Pago'      THEN NULL
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
-- VERIFICAÇÃO — rode depois para confirmar
-- ----------------------------------------------------------------
-- SELECT public.portal_servnet_login('346.484.818-36', '1986-11-10');
