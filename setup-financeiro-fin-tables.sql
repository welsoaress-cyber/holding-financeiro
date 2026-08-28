-- =========================================================
-- Configuração completa das tabelas fin_* (Novo Financeiro)
-- Módulo Financeiro v2.9.0 — GrupoTom / Servnet
--
-- Execute UMA VEZ no Supabase SQL Editor.
-- Idempotente: usa CREATE TABLE IF NOT EXISTS.
-- =========================================================

-- ── Extensão necessária ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- 1. fin_contas  (contas bancárias / carteiras)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_contas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  tipo          TEXT NOT NULL DEFAULT 'corrente',   -- corrente | poupanca | investimento | carteira
  banco         TEXT,
  saldo_inicial NUMERIC(14,2) NOT NULL DEFAULT 0,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 2. fin_categorias
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_categorias (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       TEXT NOT NULL,
  tipo       TEXT NOT NULL DEFAULT 'despesa',   -- despesa | receita
  cor        TEXT NOT NULL DEFAULT '#6b7280',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 3. fin_subcategorias
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_subcategorias (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_categoria  UUID REFERENCES fin_categorias(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 4. fin_cartoes  (cartões de crédito)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_cartoes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome              TEXT NOT NULL,
  bandeira          TEXT,
  limite            NUMERIC(14,2) DEFAULT 0,
  dia_fechamento    INTEGER,
  dia_vencimento    INTEGER,
  id_conta_pagamento UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  cor               TEXT DEFAULT '#7c3aed',
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 5. fin_despesas  (despesas avulsas)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_despesas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao        TEXT NOT NULL,
  valor            NUMERIC(14,2) NOT NULL,
  data_vencimento  DATE NOT NULL,
  data_pagamento   DATE,
  id_conta         UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  id_categoria     UUID REFERENCES fin_categorias(id) ON DELETE SET NULL,
  id_subcategoria  UUID REFERENCES fin_subcategorias(id) ON DELETE SET NULL,
  id_cartao        UUID REFERENCES fin_cartoes(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pendente',  -- pendente | pago | cancelado
  observacoes      TEXT,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 6. fin_despesas_fixas  (template de despesa fixa)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_despesas_fixas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  valor           NUMERIC(14,2) NOT NULL,
  dia_vencimento  INTEGER NOT NULL DEFAULT 10,
  id_conta        UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  id_categoria    UUID REFERENCES fin_categorias(id) ON DELETE SET NULL,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 7. fin_despesas_fixas_valor  (valor/status por mês)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_despesas_fixas_valor (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_despesa_fixa  UUID NOT NULL REFERENCES fin_despesas_fixas(id) ON DELETE CASCADE,
  mes_ref          TEXT NOT NULL,  -- YYYY-MM
  valor            NUMERIC(14,2),
  status           TEXT DEFAULT 'pendente',  -- pendente | pago | cancelado
  data_pagamento   DATE,
  excluido_mes     BOOLEAN DEFAULT FALSE,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_despesa_fixa, mes_ref)
);

-- ═══════════════════════════════════════════════════════════
-- 8. fin_receitas  (receitas avulsas)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_receitas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao        TEXT NOT NULL,
  valor            NUMERIC(14,2) NOT NULL,
  data_previsao    DATE NOT NULL,
  data_recebimento DATE,
  id_conta         UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  id_categoria     UUID REFERENCES fin_categorias(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pendente',  -- pendente | recebido
  observacoes      TEXT,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 9. fin_receitas_fixas  (template de receita fixa)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_receitas_fixas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  valor           NUMERIC(14,2) NOT NULL,
  dia_recebimento INTEGER NOT NULL DEFAULT 5,
  id_conta        UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  id_categoria    UUID REFERENCES fin_categorias(id) ON DELETE SET NULL,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 10. fin_receitas_fixas_valor  (valor/status por mês)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_receitas_fixas_valor (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_receita_fixa  UUID NOT NULL REFERENCES fin_receitas_fixas(id) ON DELETE CASCADE,
  mes_ref          TEXT NOT NULL,  -- YYYY-MM
  valor            NUMERIC(14,2),
  status           TEXT DEFAULT 'pendente',  -- pendente | recebido | cancelado
  data_recebimento DATE,
  excluido_mes     BOOLEAN DEFAULT FALSE,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_receita_fixa, mes_ref)
);

-- ═══════════════════════════════════════════════════════════
-- 11. fin_transferencias
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_transferencias (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao        TEXT,
  valor            NUMERIC(14,2) NOT NULL,
  data             DATE NOT NULL DEFAULT CURRENT_DATE,
  id_conta_origem  UUID NOT NULL REFERENCES fin_contas(id) ON DELETE RESTRICT,
  id_conta_destino UUID NOT NULL REFERENCES fin_contas(id) ON DELETE RESTRICT,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 12. fin_orcamentos  (orçamento mensal por categoria)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_orcamentos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_categoria  UUID REFERENCES fin_categorias(id) ON DELETE CASCADE,
  mes_ref       TEXT NOT NULL,  -- YYYY-MM
  valor_limite  NUMERIC(14,2) NOT NULL,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, id_categoria, mes_ref)
);

-- ═══════════════════════════════════════════════════════════
-- 13. fin_objetivos  (metas / objetivos de poupança)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fin_objetivos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  valor_alvo  NUMERIC(14,2) NOT NULL,
  valor_atual NUMERIC(14,2) NOT NULL DEFAULT 0,
  data_alvo   DATE,
  id_conta    UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  obs         TEXT,
  concluido   BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- ÍNDICES (performance)
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_fin_despesas_user_mes    ON fin_despesas(user_id, data_vencimento);
CREATE INDEX IF NOT EXISTS idx_fin_receitas_user_mes    ON fin_receitas(user_id, data_previsao);
CREATE INDEX IF NOT EXISTS idx_fin_transferencias_user  ON fin_transferencias(user_id);
CREATE INDEX IF NOT EXISTS idx_fin_despfixval_user_mes  ON fin_despesas_fixas_valor(user_id, mes_ref);
CREATE INDEX IF NOT EXISTS idx_fin_recfixval_user_mes   ON fin_receitas_fixas_valor(user_id, mes_ref);
CREATE INDEX IF NOT EXISTS idx_fin_orcamentos_user_mes  ON fin_orcamentos(user_id, mes_ref);

-- ═══════════════════════════════════════════════════════════
-- RLS (Row Level Security) — cada user só vê seus próprios dados
-- ═══════════════════════════════════════════════════════════
DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'fin_contas','fin_categorias','fin_subcategorias','fin_cartoes',
    'fin_despesas','fin_despesas_fixas','fin_despesas_fixas_valor',
    'fin_receitas','fin_receitas_fixas','fin_receitas_fixas_valor',
    'fin_transferencias','fin_orcamentos','fin_objetivos'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    -- Política: usuário vê/altera apenas suas próprias linhas
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I ON %I
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid())
    ', 'own_' || t, t);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════
-- Verificação rápida (opcional)
-- ═══════════════════════════════════════════════════════════
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'fin_%'
-- ORDER BY table_name;
