-- ═══════════════════════════════════════════════════════════════════════════
-- Corrige site_lead_cadastrar: aceita p_codigo_indicacao (5º parâmetro)
-- que o formulário do site já envia. Sem ele, o cadastro de leads falhava.
-- Execute no Supabase → SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.site_lead_cadastrar(text, text, text, text);

CREATE OR REPLACE FUNCTION public.site_lead_cadastrar(
  p_nome             text,
  p_telefone         text,
  p_plano            text DEFAULT NULL,
  p_endereco         text DEFAULT NULL,
  p_codigo_indicacao text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tel text;
BEGIN
  v_tel := regexp_replace(p_telefone, '[^0-9]', '', 'g');

  -- Evita duplicata do mesmo telefone nas últimas 2 horas
  IF EXISTS (
    SELECT 1 FROM site_leads
    WHERE dados->>'telefone' = v_tel
      AND created_at > now() - interval '2 hours'
  ) THEN
    RETURN json_build_object('ok', true, 'msg', 'Cadastro recebido! Em breve entraremos em contato.');
  END IF;

  INSERT INTO site_leads (dados)
  VALUES (jsonb_build_object(
    'nome',             p_nome,
    'telefone',         v_tel,
    'plano',            COALESCE(p_plano, ''),
    'endereco',         COALESCE(p_endereco, ''),
    'codigo_indicacao', COALESCE(p_codigo_indicacao, ''),
    'status',           'Novo',
    'origem',           'site'
  ));

  RETURN json_build_object('ok', true, 'msg', 'Cadastro realizado com sucesso!');
END;
$$;

GRANT EXECUTE ON FUNCTION public.site_lead_cadastrar(text, text, text, text, text) TO anon;
