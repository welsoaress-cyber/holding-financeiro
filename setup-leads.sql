-- ================================================================
-- LEADS DO SITE — SERVNET
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. TABELA DE LEADS
CREATE TABLE IF NOT EXISTS public.site_leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dados      jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_leads ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados (admin/master) podem ler e atualizar
CREATE POLICY "auth_read_site_leads" ON public.site_leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_update_site_leads" ON public.site_leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Índice por data de criação (leads mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_site_leads_created
  ON public.site_leads (created_at DESC);

-- ----------------------------------------------------------------
-- 2. FUNÇÃO: CADASTRAR LEAD (chamada pelo site público)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_lead_cadastrar(
  p_nome     text,
  p_telefone text,
  p_plano    text DEFAULT NULL,
  p_endereco text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tel text;
BEGIN
  -- Normaliza telefone: só dígitos
  v_tel := regexp_replace(p_telefone, '[^0-9]', '', 'g');

  -- Evita duplicata do mesmo telefone nas últimas 2 horas
  IF EXISTS (
    SELECT 1 FROM site_leads
    WHERE dados->>'telefone' = v_tel
      AND created_at > now() - interval '2 hours'
  ) THEN
    -- Retorna ok mesmo assim (não expõe ao público que já existe)
    RETURN json_build_object('ok', true, 'msg', 'Cadastro recebido! Em breve entraremos em contato.');
  END IF;

  INSERT INTO site_leads (dados)
  VALUES (jsonb_build_object(
    'nome',     p_nome,
    'telefone', v_tel,
    'plano',    COALESCE(p_plano, ''),
    'endereco', COALESCE(p_endereco, ''),
    'status',   'Novo',
    'origem',   'site'
  ));

  RETURN json_build_object('ok', true, 'msg', 'Cadastro realizado com sucesso!');
END;
$$;

GRANT EXECUTE ON FUNCTION public.site_lead_cadastrar(text, text, text, text) TO anon;
