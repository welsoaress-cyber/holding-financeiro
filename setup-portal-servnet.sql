-- ================================================================
-- PORTAL DO CLIENTE — SERVNET
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. TABELA DE FATURAS DA SERVNET
CREATE TABLE IF NOT EXISTS public.servnet_faturas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  cliente_id uuid NOT NULL,
  dados      jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.servnet_faturas ENABLE ROW LEVEL SECURITY;

-- Apenas o master (admin) gerencia as faturas direto
CREATE POLICY "master_manage_faturas" ON public.servnet_faturas
  FOR ALL USING (auth.uid() = user_id);

-- Índice para busca rápida por cliente
CREATE INDEX IF NOT EXISTS idx_servnet_faturas_cliente
  ON public.servnet_faturas (cliente_id, user_id);

-- ----------------------------------------------------------------
-- 2. FUNÇÃO DE LOGIN DO PORTAL
--    Valida CPF + data de nascimento e retorna dados do cliente
-- ----------------------------------------------------------------
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

  -- pega contrato ativo
  SELECT c INTO v_ct
  FROM jsonb_array_elements(COALESCE(v_dados->'contratos', '[]'::jsonb)) c
  WHERE c->>'status' = 'Ativo'
  LIMIT 1;

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

-- ----------------------------------------------------------------
-- 3. FUNÇÃO PARA LISTAR FATURAS DO CLIENTE
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_faturas(
  p_cliente_id uuid,
  p_master_id  uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_faturas json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id',            id,
      'valor',         (dados->>'valor')::numeric,
      'vencimento',    dados->>'vencimento',
      'status',        COALESCE(dados->>'status', 'Pendente'),
      'mes_referencia',dados->>'mesReferencia',
      'link_boleto',   dados->>'linkBoleto',
      'data_pagamento',dados->>'dataPagamento'
    )
    ORDER BY dados->>'vencimento' DESC
  )
  INTO v_faturas
  FROM servnet_faturas
  WHERE cliente_id = p_cliente_id
    AND user_id    = p_master_id;

  RETURN json_build_object(
    'ok',     true,
    'faturas', COALESCE(v_faturas, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_faturas(uuid, uuid) TO anon;
