-- ================================================================
-- PORTAL SERVNET — CORREÇÃO v2
-- Execute no Supabase Dashboard > SQL Editor
--
-- Problemas corrigidos:
--   1. "Plano não identificado" — portal_servnet_contratos fazia JOIN
--      por pl.id = planoId, mas o painel grava o NOME do plano em planoId
--      (não o UUID). Corrigido: JOIN tenta pelo ID e pelo nome.
--
--   2. "Erro ao carregar fatura" — portal_servnet_faturas procurava
--      l.dados->>'clienteId' (UUID) e tipo = 'Receita' (maiúscula),
--      mas o painel grava l.dados->>'cliente' (nome) e tipo = 'receita'
--      (minúscula). Corrigido: busca por clienteId OU por nome,
--      comparação de tipo case-insensitive, campo de data compatível
--      com data_vencimento (usado pelo painel).
--
--   3. negocio 'Provedor/Servnet' — o painel usa 'Provedor/Servnet'
--      mas as funções antigas filtravam lower()='provedor' (exato).
--      Corrigido: aceita qualquer negocio que comece com 'provedor'.
-- ================================================================


-- ----------------------------------------------------------------
-- 1. CONTRATOS — plano por ID ou por nome; negocio mais abrangente
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_contratos(
  p_cliente_id text,
  p_master_id  text
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_agg(to_jsonb(x) - 'ord' ORDER BY x.ord, x.contrato_id)
  FROM (
    SELECT
      c->>'id'                  AS contrato_id,
      c->>'status'              AS status,
      c->>'diaVencimento'       AS "diaVencimento",
      c->>'dataContrato'        AS "dataContrato",
      c->>'enderecoInstalacao'  AS "enderecoInstalacao",
      c->>'observacoes'         AS observacoes,
      COALESCE(NULLIF(c->>'diaVencimento','')::int, 99) AS ord,
      CASE
        WHEN pl.id IS NOT NULL THEN json_build_object(
          'nome',       pl.dados->>'nome',
          'valor',      pl.dados->>'valor',
          'velocidade', pl.dados->>'velocidade',
          'tecnologia', pl.dados->>'tecnologia'
        )
        ELSE NULL
      END AS plano
    FROM cli_clientes cl
    CROSS JOIN LATERAL jsonb_array_elements(
      COALESCE(cl.dados->'contratos','[]'::jsonb)
    ) c
    -- Tenta pelo ID do plano (UUID) OU pelo nome (painel salva o nome em planoId)
    LEFT JOIN cli_planos pl
      ON (
            pl.id::text       = c->>'planoId'
         OR pl.dados->>'nome' = COALESCE(NULLIF(c->>'planoNome',''), c->>'planoId')
         )
     AND pl.user_id = cl.user_id
    WHERE cl.id::text      = p_cliente_id
      AND cl.user_id::text = p_master_id
      -- Aceita 'Provedor', 'Provedor/Servnet', 'provedor/servnet' etc.
      AND lower(COALESCE(c->>'negocio','')) LIKE 'provedor%'
      -- Qualquer status exceto Cancelado
      AND lower(COALESCE(c->>'status','')) <> 'cancelado'
  ) x;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_contratos(text, text) TO anon;


-- ----------------------------------------------------------------
-- 2. LOGIN — usa portal_servnet_contratos atualizado (sem mudança extra)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_login(
  p_cpf        text,
  p_nascimento text   -- formato YYYY-MM-DD
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cli       record;
  v_dados     jsonb;
  v_contratos json;
  v_primeiro  jsonb;
BEGIN
  p_cpf := regexp_replace(p_cpf, '[^0-9]', '', 'g');

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

  v_contratos := public.portal_servnet_contratos(v_cli.id::text, v_cli.user_id::text);

  IF v_contratos IS NULL THEN
    RETURN json_build_object(
      'ok',  false,
      'msg', 'Nenhum contrato de Provedor encontrado. Se você se cadastrou recentemente, fale pelo WhatsApp para ativar seu acesso.'
    );
  END IF;

  v_primeiro := (v_contratos::jsonb) -> 0;

  RETURN json_build_object(
    'ok',            true,
    'cliente_id',    v_cli.id,
    'master_id',     v_cli.user_id,
    'nome',          v_dados->>'nome',
    'email',         v_dados->>'email',
    'telefone',      v_dados->>'telefone',
    'status',        COALESCE(v_dados->>'status', 'Ativo'),
    'contratos',     v_contratos,
    'diaVencimento', COALESCE(v_primeiro->>'diaVencimento', v_dados->>'diaVencimento'),
    'data_adesao',   v_primeiro->>'dataContrato',
    'plano',         v_primeiro->'plano'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_login(text, text) TO anon;


-- ----------------------------------------------------------------
-- 3. FATURAS — reescrita robusta
--
-- Mudanças principais:
--   • Busca por clienteId (UUID) OU por nome do cliente (campo
--     'cliente', 'clienteNome') — compatível com lançamentos criados
--     tanto pelo módulo Financeiro quanto pelo módulo Contratos.
--   • tipo case-insensitive: lower()='receita' (aceita 'receita' e
--     'Receita').
--   • Usa data_vencimento como campo de vencimento (padrão do painel),
--     com fallback para 'data' (formato legado).
--   • Não exige contratoId: mostra todas as receitas do cliente,
--     independente de estarem vinculadas a um contrato específico.
--   • data_pagamento compatível com ambos os campos (data_pagamento e
--     dataPagamento).
-- ----------------------------------------------------------------
DROP FUNCTION IF EXISTS public.portal_servnet_faturas(uuid, uuid);

CREATE OR REPLACE FUNCTION public.portal_servnet_faturas(
  p_cliente_id text,
  p_master_id  text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cli_nome text;
  v_faturas  json;
BEGIN
  -- Nome do cliente: lançamentos do Financeiro gravam o nome em
  -- dados->>'cliente'; lançamentos do Contratos gravam o UUID em
  -- dados->>'clienteId'. Buscar por ambos.
  SELECT dados->>'nome' INTO v_cli_nome
  FROM cli_clientes
  WHERE id::text      = p_cliente_id
    AND user_id::text = p_master_id
  LIMIT 1;

  SELECT json_agg(
    json_build_object(
      'id',             l.id,
      'contrato_id',    l.dados->>'contratoId',
      'valor',          COALESCE((l.dados->>'valor')::numeric, 0),
      -- data_vencimento é o campo novo; 'data' é o legado
      'vencimento',     COALESCE(
                          NULLIF(l.dados->>'data_vencimento', ''),
                          NULLIF(l.dados->>'data', '')
                        ),
      'status',         CASE
                          WHEN lower(COALESCE(l.dados->>'status','')) = 'pago'
                          THEN 'Pago'
                          ELSE 'Pendente'
                        END,
      'mes_referencia', COALESCE(
                          NULLIF(l.dados->>'mes_ref', ''),
                          LEFT(COALESCE(
                            NULLIF(l.dados->>'data_vencimento',''),
                            NULLIF(l.dados->>'data','')
                          ), 7)
                        ),
      'descricao',      l.dados->>'descricao',
      'link_boleto',    l.dados->>'linkBoleto',
      -- data_pagamento: campo novo (painel atual) ou dataPagamento (legado)
      'data_pagamento', NULLIF(COALESCE(
                          l.dados->>'data_pagamento',
                          l.dados->>'dataPagamento'
                        ), '')
    )
    ORDER BY COALESCE(
      NULLIF(l.dados->>'data_vencimento',''),
      NULLIF(l.dados->>'data','')
    ) DESC NULLS LAST
  )
  INTO v_faturas
  FROM lancamentos l
  WHERE l.user_id::text = p_master_id
    -- Case-insensitive: aceita 'receita' (painel atual) e 'Receita' (legado)
    AND lower(COALESCE(l.dados->>'tipo','')) = 'receita'
    AND COALESCE((l.dados->>'inativo')::boolean, false) = false
    AND (
      -- Lançamento do módulo Contratos (tem clienteId = UUID)
          l.dados->>'clienteId'   = p_cliente_id
      -- Lançamento do módulo Financeiro (tem cliente = nome)
      OR  (v_cli_nome IS NOT NULL AND l.dados->>'cliente'     = v_cli_nome)
      OR  (v_cli_nome IS NOT NULL AND l.dados->>'clienteNome' = v_cli_nome)
    );

  RETURN json_build_object(
    'ok',      true,
    'faturas', COALESCE(v_faturas, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_faturas(text, text) TO anon;


-- ----------------------------------------------------------------
-- VERIFICAÇÃO — rode depois para confirmar (substitua pelo CPF/data real)
-- ----------------------------------------------------------------
-- SELECT public.portal_servnet_login('000.000.000-00', '1990-01-01');
