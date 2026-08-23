-- ═══════════════════════════════════════════════════════════════════════════
-- user_profiles: perfil e permissões dos usuários do painel GrupoTom v2
-- Execute no Supabase → SQL Editor (pode rodar mais de uma vez sem erro)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  perfil        TEXT NOT NULL DEFAULT 'operador'
                  CHECK (perfil IN ('master','admin','gerente','operador','visualizador')),
  permissoes    JSONB NOT NULL DEFAULT '{}',
  status        BOOLEAN NOT NULL DEFAULT true,
  ultimo_acesso TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_perfil ON user_profiles(perfil);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_le_proprio" ON user_profiles;
CREATE POLICY "usuario_le_proprio" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuario_atualiza_proprio" ON user_profiles;
CREATE POLICY "usuario_atualiza_proprio" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "master_select_todos" ON user_profiles;
CREATE POLICY "master_select_todos" ON user_profiles
  FOR SELECT USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'welsoaress@gmail.com'
  );

DROP POLICY IF EXISTS "master_insert" ON user_profiles;
CREATE POLICY "master_insert" ON user_profiles
  FOR INSERT WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'welsoaress@gmail.com'
  );

DROP POLICY IF EXISTS "master_update_todos" ON user_profiles;
CREATE POLICY "master_update_todos" ON user_profiles
  FOR UPDATE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'welsoaress@gmail.com'
  );

DROP POLICY IF EXISTS "master_delete_todos" ON user_profiles;
CREATE POLICY "master_delete_todos" ON user_profiles
  FOR DELETE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'welsoaress@gmail.com'
  );
