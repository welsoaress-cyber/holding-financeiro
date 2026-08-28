-- =========================================================
-- FIX v2: Drop e recriar todas as tabelas fin_* do zero
-- Execute UMA VEZ no Supabase SQL Editor.
-- !! Apaga todos os dados das tabelas fin_* !!
-- =========================================================

-- ── 1. Remove tabelas na ordem certa (filhos antes dos pais) ──
DROP TABLE IF EXISTS fin_orcamentos           CASCADE;
DROP TABLE IF EXISTS fin_objetivos            CASCADE;
DROP TABLE IF EXISTS fin_transferencias       CASCADE;
DROP TABLE IF EXISTS fin_receitas_fixas_valor CASCADE;
DROP TABLE IF EXISTS fin_despesas_fixas_valor CASCADE;
DROP TABLE IF EXISTS fin_receitas_fixas       CASCADE;
DROP TABLE IF EXISTS fin_despesas_fixas       CASCADE;
DROP TABLE IF EXISTS fin_receitas             CASCADE;
DROP TABLE IF EXISTS fin_despesas             CASCADE;
DROP TABLE IF EXISTS fin_cartoes              CASCADE;
DROP TABLE IF EXISTS fin_subcategorias        CASCADE;
DROP TABLE IF EXISTS fin_categorias           CASCADE;
DROP TABLE IF EXISTS fin_contas               CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. fin_contas ────────────────────────────────────────────
CREATE TABLE fin_contas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  tipo          TEXT NOT NULL DEFAULT 'corrente',
  banco         TEXT,
  saldo_inicial NUMERIC(14,2) NOT NULL DEFAULT 0,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. fin_categorias ────────────────────────────────────────
CREATE TABLE fin_categorias (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       TEXT NOT NULL,
  tipo       TEXT NOT NULL DEFAULT 'despesa',
  cor        TEXT NOT NULL DEFAULT '#6b7280',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. fin_subcategorias ─────────────────────────────────────
CREATE TABLE fin_subcategorias (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_categoria  UUID REFERENCES fin_categorias(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. fin_cartoes ───────────────────────────────────────────
CREATE TABLE fin_cartoes (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome               TEXT NOT NULL,
  bandeira           TEXT,
  limite             NUMERIC(14,2) DEFAULT 0,
  dia_fechamento     INTEGER,
  dia_vencimento     INTEGER,
  id_conta_pagamento UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  cor                TEXT DEFAULT '#7c3aed',
  deleted_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. fin_despesas ──────────────────────────────────────────
CREATE TABLE fin_despesas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  valor           NUMERIC(14,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento  DATE,
  id_conta        UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  id_categoria    UUID REFERENCES fin_categorias(id) ON DELETE SET NULL,
  id_subcategoria UUID REFERENCES fin_subcategorias(id) ON DELETE SET NULL,
  id_cartao       UUID REFERENCES fin_cartoes(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pendente',
  observacoes     TEXT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 7. fin_receitas ──────────────────────────────────────────
CREATE TABLE fin_receitas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao        TEXT NOT NULL,
  valor            NUMERIC(14,2) NOT NULL,
  data_previsao    DATE NOT NULL,
  data_recebimento DATE,
  id_conta         UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  id_categoria     UUID REFERENCES fin_categorias(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pendente',
  observacoes      TEXT,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 8. fin_despesas_fixas ────────────────────────────────────
CREATE TABLE fin_despesas_fixas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao      TEXT NOT NULL,
  valor          NUMERIC(14,2) NOT NULL,
  dia_vencimento INTEGER NOT NULL DEFAULT 10,
  id_conta       UUID REFERENCES fin_contas(id) ON DELETE SET NULL,
  id_categoria   UUID REFERENCES fin_categorias(id) ON DELETE SET NULL,
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 9. fin_despesas_fixas_valor ──────────────────────────────
CREATE TABLE fin_despesas_fixas_valor (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_despesa_fixa UUID NOT NULL REFERENCES fin_despesas_fixas(id) ON DELETE CASCADE,
  mes_ref         TEXT NOT NULL,
  valor           NUMERIC(14,2),
  status          TEXT DEFAULT 'pendente',
  data_pagamento  DATE,
  excluido_mes    BOOLEAN DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_despesa_fixa, mes_ref)
);

-- ── 10. fin_receitas_fixas ───────────────────────────────────
CREATE TABLE fin_receitas_fixas (
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

-- ── 11. fin_receitas_fixas_valor ─────────────────────────────
CREATE TABLE fin_receitas_fixas_valor (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_receita_fixa UUID NOT NULL REFERENCES fin_receitas_fixas(id) ON DELETE CASCADE,
  mes_ref         TEXT NOT NULL,
  valor           NUMERIC(14,2),
  status          TEXT DEFAULT 'pendente',
  data_recebimento DATE,
  excluido_mes    BOOLEAN DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_receita_fixa, mes_ref)
);

-- ── 12. fin_transferencias ───────────────────────────────────
CREATE TABLE fin_transferencias (
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

-- ── 13. fin_orcamentos ───────────────────────────────────────
CREATE TABLE fin_orcamentos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_categoria UUID REFERENCES fin_categorias(id) ON DELETE CASCADE,
  mes_ref      TEXT NOT NULL,
  valor_limite NUMERIC(14,2) NOT NULL,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, id_categoria, mes_ref)
);

-- ── 14. fin_objetivos ────────────────────────────────────────
CREATE TABLE fin_objetivos (
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

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX idx_fin_despesas_user_mes   ON fin_despesas(user_id, data_vencimento);
CREATE INDEX idx_fin_receitas_user_mes   ON fin_receitas(user_id, data_previsao);
CREATE INDEX idx_fin_transferencias_user ON fin_transferencias(user_id);
CREATE INDEX idx_fin_despfixval_user_mes ON fin_despesas_fixas_valor(user_id, mes_ref);
CREATE INDEX idx_fin_recfixval_user_mes  ON fin_receitas_fixas_valor(user_id, mes_ref);
CREATE INDEX idx_fin_orcamentos_user_mes ON fin_orcamentos(user_id, mes_ref);

-- ── RLS ──────────────────────────────────────────────────────
DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'fin_contas','fin_categorias','fin_subcategorias','fin_cartoes',
    'fin_despesas','fin_despesas_fixas','fin_despesas_fixas_valor',
    'fin_receitas','fin_receitas_fixas','fin_receitas_fixas_valor',
    'fin_transferencias','fin_orcamentos','fin_objetivos'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())',
      'own_' || t, t
    );
  END LOOP;
END $$;

-- ── Verificação ───────────────────────────────────────────────
SELECT table_name, COUNT(column_name) as colunas
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name LIKE 'fin_%'
GROUP BY table_name
ORDER BY table_name;
