-- ================================================================
-- FIX: Permite login de clientes Suspensos/Inadimplentes no portal
-- Antes: só status = 'Ativo' entrava
-- Agora: qualquer status exceto 'Cancelado' entra
-- Execute no Supabase Dashboard > SQL Editor
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
  v_cli   record;
  v_dados jsonb;
  v_ct    jsonb;
  v_plano record;
BEGIN
  -- normaliza CPF: só dígitos
  p_cpf := regexp_replace(p_cpf, '[^0-9]', '', 'g');

  -- busca cliente por CPF + data de nascimento
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

  -- pega contrato de Provedor com qualquer status exceto Cancelado
  -- (Ativo, Suspenso, Inadimplente — todos devem acessar o portal)
  SELECT c INTO v_ct
  FROM jsonb_array_elements(COALESCE(v_dados->'contratos', '[]'::jsonb)) c
  WHERE lower(c->>'negocio') = 'provedor'
    AND lower(COALESCE(c->>'status', '')) <> 'cancelado'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'msg', 'Nenhum contrato encontrado para este portal.');
  END IF;

  -- busca plano vinculado ao contrato
  IF v_ct IS NOT NULL AND (v_ct->>'planoId') IS NOT NULL THEN
    SELECT id, dados INTO v_plano
    FROM cli_planos
    WHERE id::text = v_ct->>'planoId'
      AND user_id = v_cli.user_id
    LIMIT 1;
  END IF;

  RETURN json_build_object(
    'ok',            true,
    'cliente_id',    v_cli.id,
    'master_id',     v_cli.user_id,
    'nome',          v_dados->>'nome',
    'email',         v_dados->>'email',
    'telefone',      v_dados->>'telefone',
    'diaVencimento', v_dados->>'diaVencimento',
    'status',        COALESCE(v_ct->>'status', v_dados->>'status', 'Ativo'),
    'data_adesao',   COALESCE(v_ct->>'dataContrato', v_dados->>'dataCadastro'),
    'plano', CASE
      WHEN v_plano.id IS NOT NULL THEN json_build_object(
        'nome',       v_plano.dados->>'nome',
        'valor',      v_plano.dados->>'valor',
        'velocidade', v_plano.dados->>'velocidade',
        'tecnologia', v_plano.dados->>'tecnologia'
      )
      ELSE NULL
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_login(text, text) TO anon;
