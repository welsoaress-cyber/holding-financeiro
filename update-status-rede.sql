-- ================================================================
-- STATUS DA REDE — tabela + RPCs
-- Execute no Supabase Dashboard > SQL Editor
--
-- O que faz:
--   1. Cria (ou recria) a tabela `servnet_status_rede` com um único
--      registro (id = 1) que o admin atualiza via PIN.
--   2. RPC `portal_servnet_status()` — leitura anônima do status atual.
--   3. RPC `portal_servnet_atualizar_status()` — atualiza o status;
--      valida o PIN server-side (SECURITY DEFINER + row_security = off).
-- ================================================================


-- ----------------------------------------------------------------
-- 1. TABELA
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servnet_status_rede (
  id          int  PRIMARY KEY DEFAULT 1,   -- sempre 1 registro
  status      text NOT NULL DEFAULT 'ok',   -- ok | lentidao | queda | manutencao
  titulo      text NOT NULL DEFAULT 'Rede operando normalmente',
  descricao   text NOT NULL DEFAULT '',
  admin_pin   text NOT NULL DEFAULT '1234', -- troque pelo PIN desejado
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- garante o registro único caso a tabela seja criada do zero
INSERT INTO public.servnet_status_rede (id, status, titulo, descricao, admin_pin)
VALUES (1, 'ok', 'Rede operando normalmente', '', '1234')
ON CONFLICT (id) DO NOTHING;

-- RLS: anon só lê; ninguém escreve diretamente via cliente
ALTER TABLE public.servnet_status_rede ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "status_rede_select" ON public.servnet_status_rede;
CREATE POLICY "status_rede_select"
  ON public.servnet_status_rede FOR SELECT
  TO anon USING (true);


-- ----------------------------------------------------------------
-- 2. RPC DE LEITURA (portal)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_status()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT row_to_json(r)
  FROM (
    SELECT status, titulo, descricao, updated_at
    FROM servnet_status_rede
    WHERE id = 1
  ) r;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_status() TO anon;


-- ----------------------------------------------------------------
-- 3. RPC DE ATUALIZAÇÃO (admin com PIN)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_atualizar_status(
  p_pin       text,
  p_status    text,
  p_titulo    text,
  p_descricao text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin_ok boolean;
BEGIN
  -- desativa RLS para poder ler o PIN e fazer UPDATE
  SET LOCAL row_security = off;

  -- valida PIN antes de qualquer coisa
  SELECT (admin_pin = p_pin) INTO v_pin_ok
  FROM servnet_status_rede WHERE id = 1;

  IF NOT FOUND OR NOT v_pin_ok THEN
    RETURN json_build_object('ok', false, 'msg', 'PIN incorreto.');
  END IF;

  -- valida status permitido
  IF p_status NOT IN ('ok', 'lentidao', 'queda', 'manutencao') THEN
    RETURN json_build_object('ok', false, 'msg', 'Status inválido.');
  END IF;

  UPDATE servnet_status_rede
  SET status     = p_status,
      titulo     = p_titulo,
      descricao  = p_descricao,
      updated_at = now()
  WHERE id = 1;

  RETURN json_build_object('ok', true, 'msg', 'Status atualizado com sucesso!');
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_atualizar_status(text, text, text, text) TO anon;
