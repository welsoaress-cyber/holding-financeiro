-- ================================================================
-- ATUALIZAÇÃO — PORTAL SERVNET
-- Filtra contratos do negócio "Provedor" (não todos os negócios)
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. ATUALIZA A FUNÇÃO DE LOGIN PARA FILTRAR POR negocio = 'Provedor'
CREATE OR REPLACE FUNCTION public.portal_servnet_login(
  p_cpf       text,
  p_nascimento text   -- formato YYYY-MM-DD
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cli    record;
  v_dados  jsonb;
  v_ct     jsonb;
  v_plano  record;
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

  -- pega contrato ativo do negócio "Provedor"
  SELECT c INTO v_ct
  FROM jsonb_array_elements(COALESCE(v_dados->'contratos', '[]'::jsonb)) c
  WHERE c->>'status' = 'Ativo'
    AND lower(c->>'negocio') = 'provedor'
  LIMIT 1;

  -- se não achou contrato ativo de Provedor, cliente não pertence a este portal
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'msg', 'Nenhum contrato ativo encontrado para este portal.');
  END IF;

  -- busca plano se houver contrato ativo
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
    'status',        COALESCE(v_dados->>'status', 'Ativo'),
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

-- ================================================================
-- 2. CORRIGE O CLIENTE DE TESTE — atualiza negocio para 'Provedor'
-- ================================================================
UPDATE public.cli_clientes
SET dados = jsonb_set(
  dados,
  '{contratos}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN c->>'negocio' = 'Servnet'
        THEN jsonb_set(c, '{negocio}', '"Provedor"')
        ELSE c
      END
    )
    FROM jsonb_array_elements(dados->'contratos') c
  )
)
WHERE dados->>'cpfCnpj' = '123.456.789-09';

-- Confirma a alteração
SELECT dados->>'nome' AS nome,
       dados->'contratos'->0->>'negocio' AS negocio,
       dados->'contratos'->0->>'status'  AS status
FROM cli_clientes
WHERE dados->>'cpfCnpj' = '123.456.789-09';
