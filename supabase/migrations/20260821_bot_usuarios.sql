-- ================================================================
-- GRUPOTOM Admin Bot — Tabela de usuários autorizados
-- ================================================================

-- Tabela de usuários do bot
CREATE TABLE IF NOT EXISTS public.bot_usuarios (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id   BIGINT      UNIQUE NOT NULL,
  nome          TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'Operador'
                            CHECK (role IN ('Master', 'Administrador', 'Operador')),
  negocios      TEXT[]      DEFAULT '{}',  -- ['sv','sn','pt','po']
  ativo         BOOLEAN     DEFAULT true,
  criado_em     TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: apenas service_role acessa (bot usa SUPABASE_SERVICE_ROLE_KEY)
ALTER TABLE public.bot_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full" ON public.bot_usuarios
  FOR ALL USING (auth.role() = 'service_role');

-- ================================================================
-- MIGRAÇÃO: adicionar campo negocio nos lançamentos existentes
-- ================================================================
-- Execute este bloco UMA VEZ para atribuir negócio aos registros
-- que ainda não têm o campo preenchido.
-- Ajuste 'ServNet' para o negócio correto dos registros legados.

-- UPDATE lancamentos
-- SET dados = dados || '{"negocio": "ServNet"}'::jsonb
-- WHERE dados->>'negocio' IS NULL;

-- UPDATE cli_clientes
-- SET dados = dados || '{"negocio": "ServNet"}'::jsonb
-- WHERE dados->>'negocio' IS NULL;

-- ================================================================
-- EXEMPLOS: inserir usuários adicionais
-- ================================================================
-- Administrador com acesso a ServNet e Servidor:
-- INSERT INTO bot_usuarios (telegram_id, nome, role, negocios)
-- VALUES (123456789, 'João', 'Administrador', ARRAY['sv','sn']);

-- Operador com acesso apenas à ServNet:
-- INSERT INTO bot_usuarios (telegram_id, nome, role, negocios)
-- VALUES (987654321, 'Maria', 'Operador', ARRAY['sn']);
