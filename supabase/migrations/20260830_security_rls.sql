-- ═══════════════════════════════════════════════════════════════════════════
-- SEGURANÇA: RLS em todas as tabelas financeiras e de usuários
-- Idempotente: usa IF NOT EXISTS / DO $$ para não quebrar re-execuções
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Tabelas financeiras (user_id = auth.uid()) ───────────────────────────
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'fin_contas','fin_categorias','fin_subcategorias','fin_cartoes',
    'fin_despesas','fin_despesas_fixas','fin_despesas_fixas_valor',
    'fin_receitas','fin_receitas_fixas','fin_receitas_fixas_valor',
    'fin_transferencias','fin_orcamentos','fin_objetivos'
  ] LOOP
    -- habilita RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    -- política CRUD: user vê/altera apenas suas linhas
    EXECUTE format($q$
      DO $inner$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = %L AND policyname = %L
        ) THEN
          EXECUTE format($p$
            CREATE POLICY %I ON %I
              USING (user_id = auth.uid())
              WITH CHECK (user_id = auth.uid())
          $p$, %L, %L);
        END IF;
      END $inner$;
    $q$, tbl, 'own_' || tbl, 'own_' || tbl, tbl);
  END LOOP;
END $$;

-- ─── lancamentos (user_id pode ser NULL quando criado por service role) ────
ALTER TABLE IF EXISTS lancamentos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- usuário autenticado vê apenas suas próprias linhas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lancamentos' AND policyname = 'own_lancamentos'
  ) THEN
    CREATE POLICY own_lancamentos ON lancamentos
      USING (user_id = auth.uid() OR user_id IS NULL)
      WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  END IF;
END $$;

-- ─── user_profiles ────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'own_user_profiles'
  ) THEN
    CREATE POLICY own_user_profiles ON user_profiles
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- ─── cli_clientes / cli_planos — somente service role (sem acesso direto) ─
-- Usuários normais NÃO leem dados ISP diretamente; apenas via Edge Function
ALTER TABLE IF EXISTS cli_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cli_planos   ENABLE ROW LEVEL SECURITY;

-- Sem policy = nenhum acesso via anon/authenticated JWT.
-- Service role ignora RLS por padrão.
