-- =============================================================
-- MÓDULO USUÁRIOS — GrupoTom / Sistema de Gestão
-- Execute UMA VEZ no Supabase SQL Editor.
-- Idempotente: usa CREATE TABLE IF NOT EXISTS + DO $$ para policies.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. usr_roles — Perfis de acesso
-- =============================================================
CREATE TABLE IF NOT EXISTS usr_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL UNIQUE,
  descricao  TEXT,
  cor        TEXT NOT NULL DEFAULT '#6B7280',
  nivel      INTEGER NOT NULL DEFAULT 0,   -- 0=Visualizador … 4=Administrador
  sistema    BOOLEAN NOT NULL DEFAULT TRUE, -- não pode ser excluído
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 2. usr_role_permissoes — Permissões padrão por role × módulo
-- =============================================================
CREATE TABLE IF NOT EXISTS usr_role_permissoes (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id  UUID NOT NULL REFERENCES usr_roles(id) ON DELETE CASCADE,
  modulo   TEXT NOT NULL,
  ver      BOOLEAN NOT NULL DEFAULT FALSE,
  criar    BOOLEAN NOT NULL DEFAULT FALSE,
  editar   BOOLEAN NOT NULL DEFAULT FALSE,
  excluir  BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (role_id, modulo)
);

-- =============================================================
-- 3. usr_usuarios — Cadastro de usuários
-- =============================================================
CREATE TABLE IF NOT EXISTS usr_usuarios (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id        UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Identificação
  nome_completo       TEXT NOT NULL,
  email               TEXT NOT NULL,
  cpf_cnpj            TEXT,
  telefone            TEXT,
  data_nascimento     DATE,

  -- Acesso
  role_id             UUID REFERENCES usr_roles(id) ON DELETE RESTRICT,
  status              TEXT NOT NULL DEFAULT 'Pendente',
    -- 'Ativo' | 'Inativo' | 'Bloqueado' | 'Pendente'

  -- Empresa
  departamento        TEXT,
  cargo               TEXT,
  gerente_id          UUID REFERENCES usr_usuarios(id) ON DELETE SET NULL,
  data_admissao       DATE,
  data_demissao       DATE,

  -- Segurança
  tentativas_login    INTEGER NOT NULL DEFAULT 0,
  bloqueio_ate        TIMESTAMPTZ,
  ultimo_acesso       TIMESTAMPTZ,
  ultima_troca_senha  TIMESTAMPTZ,
  forcar_troca_senha  BOOLEAN NOT NULL DEFAULT TRUE,
  dois_fatores        BOOLEAN NOT NULL DEFAULT FALSE,

  -- Tokens
  email_verificado    BOOLEAN NOT NULL DEFAULT FALSE,
  token_verificacao   TEXT,
  token_recuperacao   TEXT,
  token_expiracao     TIMESTAMPTZ,

  -- Auditoria
  criado_por          UUID REFERENCES usr_usuarios(id) ON DELETE SET NULL,
  atualizado_por      UUID REFERENCES usr_usuarios(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ,

  -- Extras
  observacoes         TEXT,
  tags                TEXT[],
  tema                TEXT NOT NULL DEFAULT 'sistema'

  -- Constraints
  CONSTRAINT usr_usuarios_email_unique UNIQUE (email),
  CONSTRAINT usr_usuarios_cpfcnpj_unique UNIQUE (cpf_cnpj),
  CONSTRAINT usr_usuarios_status_check CHECK (status IN ('Ativo','Inativo','Bloqueado','Pendente'))
);

-- =============================================================
-- 4. usr_usuarios_unidades — Usuário ↔ Unidades de Negócio (N:N)
-- =============================================================
CREATE TABLE IF NOT EXISTS usr_usuarios_unidades (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id   UUID NOT NULL REFERENCES usr_usuarios(id) ON DELETE CASCADE,
  unidade_id   UUID NOT NULL,
  unidade_nome TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, unidade_id)
);

-- =============================================================
-- 5. usr_permissoes — Permissões por usuário (override do role)
-- =============================================================
CREATE TABLE IF NOT EXISTS usr_permissoes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES usr_usuarios(id) ON DELETE CASCADE,
  modulo      TEXT NOT NULL,
  ver         BOOLEAN NOT NULL DEFAULT FALSE,
  criar       BOOLEAN NOT NULL DEFAULT FALSE,
  editar      BOOLEAN NOT NULL DEFAULT FALSE,
  excluir     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, modulo)
);

-- =============================================================
-- 6. usr_sessoes — Sessões ativas
-- =============================================================
CREATE TABLE IF NOT EXISTS usr_sessoes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id   UUID NOT NULL REFERENCES usr_usuarios(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  ip           TEXT,
  user_agent   TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em    TIMESTAMPTZ NOT NULL,
  encerrado_em TIMESTAMPTZ
);

-- =============================================================
-- 7. usr_logs — Log de auditoria
-- =============================================================
CREATE TABLE IF NOT EXISTS usr_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID REFERENCES usr_usuarios(id) ON DELETE SET NULL,
  acao        TEXT NOT NULL,   -- 'criar' | 'editar' | 'excluir' | 'login' | 'logout' | 'bloqueio'
  modulo      TEXT NOT NULL DEFAULT 'usuarios',
  registro_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  ip          TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- ÍNDICES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_usr_usuarios_email       ON usr_usuarios(email)              WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usr_usuarios_status      ON usr_usuarios(status)             WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usr_usuarios_role        ON usr_usuarios(role_id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usr_usuarios_status_role ON usr_usuarios(status, role_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usr_usuarios_gerente     ON usr_usuarios(gerente_id)         WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usr_usuarios_created     ON usr_usuarios(created_at DESC)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usr_unidades_usuario     ON usr_usuarios_unidades(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usr_permissoes_usuario   ON usr_permissoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usr_logs_usuario         ON usr_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usr_logs_created         ON usr_logs(criado_em DESC);

-- =============================================================
-- RLS
-- =============================================================
ALTER TABLE usr_roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_role_permissoes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_usuarios_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_permissoes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_sessoes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_logs              ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Roles: leitura para autenticados
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_roles' AND policyname='usr_roles_select') THEN
    CREATE POLICY usr_roles_select ON usr_roles FOR SELECT TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_role_permissoes' AND policyname='usr_rp_select') THEN
    CREATE POLICY usr_rp_select ON usr_role_permissoes FOR SELECT TO authenticated USING (TRUE);
  END IF;

  -- Usuários: autenticados leem registros não deletados
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_usuarios' AND policyname='usr_usuarios_select') THEN
    CREATE POLICY usr_usuarios_select ON usr_usuarios FOR SELECT TO authenticated USING (deleted_at IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_usuarios' AND policyname='usr_usuarios_insert') THEN
    CREATE POLICY usr_usuarios_insert ON usr_usuarios FOR INSERT TO authenticated WITH CHECK (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_usuarios' AND policyname='usr_usuarios_update') THEN
    CREATE POLICY usr_usuarios_update ON usr_usuarios FOR UPDATE TO authenticated USING (deleted_at IS NULL);
  END IF;

  -- Unidades, permissões, sessões, logs: acesso amplo para autenticados
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_usuarios_unidades' AND policyname='usr_unidades_all') THEN
    CREATE POLICY usr_unidades_all ON usr_usuarios_unidades FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_permissoes' AND policyname='usr_permissoes_all') THEN
    CREATE POLICY usr_permissoes_all ON usr_permissoes FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_sessoes' AND policyname='usr_sessoes_select') THEN
    CREATE POLICY usr_sessoes_select ON usr_sessoes FOR SELECT TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usr_logs' AND policyname='usr_logs_all') THEN
    CREATE POLICY usr_logs_all ON usr_logs FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

-- =============================================================
-- SEED — Roles padrão do sistema
-- =============================================================
INSERT INTO usr_roles (nome, descricao, cor, nivel, sistema) VALUES
  ('Administrador', 'Acesso total. Gerencia usuários, configurações e todos os módulos.', '#DC2626', 4, TRUE),
  ('Gerente',       'Acesso a relatórios, aprovações e gestão da equipe.',                '#D97706', 3, TRUE),
  ('Supervisor',    'Supervisiona operações, pode editar registros operacionais.',         '#2563EB', 2, TRUE),
  ('Operador',      'Operações do dia a dia: criar e editar registros.',                  '#059669', 1, TRUE),
  ('Visualizador',  'Somente leitura. Não pode criar, editar ou excluir.',               '#6B7280', 0, TRUE)
ON CONFLICT (nome) DO NOTHING;

-- Permissões padrão
DO $$
DECLARE
  r_admin    UUID; r_gerente  UUID; r_supervisor UUID;
  r_operador UUID; r_viewer   UUID;
  mods TEXT[] := ARRAY[
    'financeiro.lancamentos','financeiro.contas','financeiro.cartoes',
    'clientes','cobrancas','relatorios','negocios',
    'configuracoes','contratos','planos','usuarios'
  ];
  m TEXT;
BEGIN
  SELECT id INTO r_admin     FROM usr_roles WHERE nome='Administrador';
  SELECT id INTO r_gerente   FROM usr_roles WHERE nome='Gerente';
  SELECT id INTO r_supervisor FROM usr_roles WHERE nome='Supervisor';
  SELECT id INTO r_operador  FROM usr_roles WHERE nome='Operador';
  SELECT id INTO r_viewer    FROM usr_roles WHERE nome='Visualizador';

  FOREACH m IN ARRAY mods LOOP
    -- Administrador: tudo
    INSERT INTO usr_role_permissoes (role_id,modulo,ver,criar,editar,excluir)
      VALUES (r_admin,m,TRUE,TRUE,TRUE,TRUE) ON CONFLICT(role_id,modulo) DO NOTHING;

    -- Gerente: ver+criar+editar, sem excluir | sem acesso a configuracoes+usuarios
    INSERT INTO usr_role_permissoes (role_id,modulo,ver,criar,editar,excluir) VALUES (
      r_gerente, m,
      TRUE,
      m NOT IN ('relatorios','configuracoes','usuarios'),
      m NOT IN ('relatorios','configuracoes','usuarios'),
      FALSE
    ) ON CONFLICT(role_id,modulo) DO NOTHING;

    -- Supervisor: ver em tudo operacional, criar+editar em operacionais
    INSERT INTO usr_role_permissoes (role_id,modulo,ver,criar,editar,excluir) VALUES (
      r_supervisor, m,
      m NOT IN ('configuracoes','usuarios'),
      m IN ('clientes','cobrancas','contratos','planos'),
      m IN ('clientes','cobrancas','contratos','planos'),
      FALSE
    ) ON CONFLICT(role_id,modulo) DO NOTHING;

    -- Operador: ver+criar em operacionais
    INSERT INTO usr_role_permissoes (role_id,modulo,ver,criar,editar,excluir) VALUES (
      r_operador, m,
      m IN ('clientes','cobrancas','contratos','planos','financeiro.lancamentos'),
      m IN ('clientes','cobrancas'),
      FALSE, FALSE
    ) ON CONFLICT(role_id,modulo) DO NOTHING;

    -- Visualizador: só ver em alguns
    INSERT INTO usr_role_permissoes (role_id,modulo,ver,criar,editar,excluir) VALUES (
      r_viewer, m,
      m IN ('relatorios','clientes'),
      FALSE, FALSE, FALSE
    ) ON CONFLICT(role_id,modulo) DO NOTHING;
  END LOOP;
END $$;

-- =============================================================
-- Verificação rápida
-- =============================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema='public' AND table_name LIKE 'usr_%'
-- ORDER BY table_name;
-- SELECT nome, nivel, cor FROM usr_roles ORDER BY nivel DESC;
