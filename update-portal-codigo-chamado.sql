-- ================================================================
-- Adiciona campo 'codigo' ao retorno de portal_servnet_login
-- Permite que o portal inclua o código do cliente na mensagem
-- de chamado enviada pelo WhatsApp para o suporte.
-- ================================================================

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
    'codigo',     v_dados->>'codigo',          -- << NOVO: código numérico do cliente
    'contratos',  v_contratos,
    -- campos legados: espelham o primeiro contrato
    'diaVencimento', COALESCE(v_primeiro->>'diaVencimento', v_dados->>'diaVencimento'),
    'data_adesao',   v_primeiro->>'dataContrato',
    'plano',         v_primeiro->'plano'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_login(text, text) TO anon;
