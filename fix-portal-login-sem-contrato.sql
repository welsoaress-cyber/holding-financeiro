-- ================================================================
-- fix-portal-login-sem-contrato
-- Clientes sem dados->'contratos' preenchido mas com lancamentos
-- de Provedor agora conseguem fazer login no portal.
--
-- A função portal_servnet_contratos ganha um fallback:
-- se não há contratos no cadastro, sintetiza um contrato
-- a partir dos lançamentos existentes.
--
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

CREATE OR REPLACE FUNCTION public.portal_servnet_contratos(
  p_cliente_id text,
  p_master_id  text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_resultado json;
BEGIN
  -- 1ª tentativa: contratos declarados no cadastro do cliente
  SELECT json_agg(to_jsonb(x) - 'ord' ORDER BY x.ord, x.contrato_id)
  INTO   v_resultado
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
  ) x;

  -- Se encontrou contratos declarados, devolve
  IF v_resultado IS NOT NULL THEN
    RETURN v_resultado;
  END IF;

  -- 2ª tentativa (fallback): sintetiza contrato a partir dos lançamentos
  -- Útil para clientes cadastrados antes da implantação do campo contratos
  SELECT json_build_array(
    json_build_object(
      'contrato_id',     NULL,
      'status',          'Ativo',
      'diaVencimento',   NULL,
      'dataContrato',    MIN(l.dados->>'data'),
      'enderecoInstalacao', NULL,
      'observacoes',     NULL,
      'plano',           NULL
    )
  )
  INTO v_resultado
  FROM lancamentos l
  WHERE l.user_id::text         = p_master_id
    AND l.dados->>'clienteId'   = p_cliente_id
    AND l.dados->>'tipo'        = 'receita'
    AND COALESCE((l.dados->>'inativo')::boolean, false) = false
    AND lower(COALESCE(l.dados->>'negocio','')) = 'provedor'
  HAVING COUNT(*) > 0;

  RETURN v_resultado;  -- NULL se não há nada mesmo
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_contratos(text, text) TO anon;


-- ----------------------------------------------------------------
-- VERIFICAÇÃO (ajuste o CPF/nascimento do cliente que falhou)
-- ----------------------------------------------------------------
-- SELECT public.portal_servnet_login('346.484.818-36', '1986-11-10');
