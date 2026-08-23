-- ================================================================
-- PORTAL SERVNET — Planos + Upgrade com dados de plano
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- 1. LISTA OS PLANOS DO PROVEDOR (para o portal exibir ao cliente)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_planos(
  p_master_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_planos json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id',         id,
      'nome',       dados->>'nome',
      'valor',      (dados->>'valor')::numeric,
      'velocidade', dados->>'velocidade',
      'tecnologia', dados->>'tecnologia'
    )
    ORDER BY (dados->>'valor')::numeric ASC NULLS LAST
  )
  INTO v_planos
  FROM cli_planos
  WHERE user_id::text = p_master_id
    AND lower(dados->>'negocio') = 'provedor';

  RETURN json_build_object(
    'ok',     true,
    'planos', COALESCE(v_planos, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_planos(text) TO anon;

-- ----------------------------------------------------------------
-- 2. ATUALIZA portal_servnet_solicitar — inclui planoAtual e
--    planoDesejado no dados do chamado.
--    DROP antes pois mudamos a assinatura (parâmetros extras).
-- ----------------------------------------------------------------
DROP FUNCTION IF EXISTS public.portal_servnet_solicitar(text, text, text, text);

CREATE OR REPLACE FUNCTION public.portal_servnet_solicitar(
  p_cliente_id      text,
  p_master_id       text,
  p_tipo            text,        -- 'upgrade' | 'suporte'
  p_descricao       text DEFAULT '',
  p_plano_atual     text DEFAULT '',
  p_plano_desejado  text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id      text;
  v_numero  text;
  v_nome    text;
  v_negocio text;
  v_motivo  text;
  v_tipo_chamado text;
BEGIN
  -- valida que o cliente pertence ao master
  SELECT
    dados->>'nome',
    COALESCE(
      (SELECT c->>'negocio' FROM jsonb_array_elements(COALESCE(dados->'contratos','[]'::jsonb)) c
       WHERE c->>'status' = 'Ativo' LIMIT 1),
      ''
    )
  INTO v_nome, v_negocio
  FROM cli_clientes
  WHERE id::text = p_cliente_id AND user_id::text = p_master_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'msg', 'Cliente não identificado.');
  END IF;

  v_id     := 'cham_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_' || LEFT(md5(random()::text), 4);
  v_numero := 'PT-' || to_char(now(), 'YYYYMMDD') || '-' || UPPER(LEFT(md5(random()::text), 4));
  v_tipo_chamado := 'Suporte técnico';

  IF p_tipo = 'upgrade' THEN
    v_motivo := 'Solicitação de upgrade de plano enviada pelo cliente via portal.'
                || CASE WHEN p_plano_atual    <> '' THEN E'\nPlano atual: '    || p_plano_atual    ELSE '' END
                || CASE WHEN p_plano_desejado <> '' THEN E'\nPlano desejado: ' || p_plano_desejado ELSE '' END
                || CASE WHEN p_descricao      <> '' THEN E'\n\nMensagem do cliente: ' || p_descricao ELSE '' END;
  ELSE
    v_motivo := 'Solicitação de suporte enviada pelo cliente via portal.'
                || CASE WHEN p_descricao <> '' THEN E'\n\nMensagem: ' || p_descricao ELSE '' END;
  END IF;

  INSERT INTO cli_chamados(id, user_id, dados, updated_at)
  VALUES (
    v_id,
    p_master_id,
    jsonb_build_object(
      'clienteId',       p_cliente_id,
      'negocio',         v_negocio,
      'tipo',            v_tipo_chamado,
      'prioridade',      'Normal',
      'motivo',          v_motivo,
      'tecnicoId',       '',
      'dataAgendada',    '',
      'status',          'Aberto',
      'valorCobranca',   0,
      'observacoes',     '',
      'numero',          v_numero,
      'dataCadastro',    to_char(now(), 'YYYY-MM-DD'),
      'lancadoPor',      'Portal — ' || COALESCE(v_nome, 'Cliente'),
      'administrativo',  true,
      'tipoSolicitacao', p_tipo,
      'planoAtual',      p_plano_atual,
      'planoDesejado',   p_plano_desejado
    ),
    now()
  );

  RETURN json_build_object('ok', true, 'numero', v_numero);
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_solicitar(text, text, text, text, text, text) TO anon;
