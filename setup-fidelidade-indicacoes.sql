-- ================================================================
-- FIDELIDADE + INDIQUE E GANHE — SERVNET
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- 1. TABELA DE INDICAÇÕES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servnet_indicacoes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
  referrer_id       uuid NOT NULL,
  nome_indicado     text NOT NULL,
  telefone_indicado text,
  status            text NOT NULL DEFAULT 'Pendente',  -- Pendente | Ativo
  desconto_aplicado boolean NOT NULL DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.servnet_indicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_manage_indicacoes" ON public.servnet_indicacoes
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_servnet_indicacoes_referrer
  ON public.servnet_indicacoes (referrer_id, user_id);

-- ----------------------------------------------------------------
-- 2. FUNÇÃO: LISTAR INDICAÇÕES DO CLIENTE
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_indicacoes(
  p_cliente_id uuid,
  p_master_id  uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lista        json;
  v_total_ativos int;
BEGIN
  SELECT
    json_agg(
      json_build_object(
        'id',                id,
        'nome',              nome_indicado,
        'telefone',          telefone_indicado,
        'status',            status,
        'desconto_aplicado', desconto_aplicado,
        'data',              to_char(created_at, 'DD/MM/YYYY')
      )
      ORDER BY created_at DESC
    ),
    COUNT(*) FILTER (WHERE status = 'Ativo')
  INTO v_lista, v_total_ativos
  FROM servnet_indicacoes
  WHERE referrer_id = p_cliente_id
    AND user_id     = p_master_id;

  RETURN json_build_object(
    'ok',           true,
    'indicacoes',   COALESCE(v_lista, '[]'::json),
    'total_ativos', COALESCE(v_total_ativos, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_indicacoes(uuid, uuid) TO anon;

-- ----------------------------------------------------------------
-- 3. FUNÇÃO: REGISTRAR NOVA INDICAÇÃO
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_indicar(
  p_referrer_id    uuid,
  p_master_id      uuid,
  p_nome           text,
  p_telefone       text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- impede duplicata pelo mesmo telefone
  IF EXISTS (
    SELECT 1 FROM servnet_indicacoes
    WHERE referrer_id       = p_referrer_id
      AND user_id           = p_master_id
      AND telefone_indicado = regexp_replace(p_telefone, '[^0-9]', '', 'g')
  ) THEN
    RETURN json_build_object('ok', false, 'msg', 'Este telefone já foi indicado por você.');
  END IF;

  INSERT INTO servnet_indicacoes (user_id, referrer_id, nome_indicado, telefone_indicado)
  VALUES (
    p_master_id,
    p_referrer_id,
    p_nome,
    regexp_replace(p_telefone, '[^0-9]', '', 'g')
  );

  RETURN json_build_object('ok', true, 'msg', 'Indicação registrada com sucesso!');
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_indicar(uuid, uuid, text, text) TO anon;

-- ----------------------------------------------------------------
-- 4. FUNÇÃO: CALCULAR FIDELIDADE (streak de pagamentos em dia)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_servnet_fidelidade(
  p_cliente_id uuid,
  p_master_id  uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak int := 0;
  v_rec    record;
BEGIN
  -- percorre faturas do mais recente para o mais antigo
  -- conta quantas consecutivas foram pagas até o vencimento
  FOR v_rec IN
    SELECT
      dados->>'status'        AS status,
      dados->>'vencimento'    AS vencimento,
      dados->>'dataPagamento' AS data_pagamento
    FROM servnet_faturas
    WHERE cliente_id = p_cliente_id
      AND user_id    = p_master_id
    ORDER BY dados->>'vencimento' DESC
  LOOP
    -- Fatura pendente com vencimento futuro = mês atual ainda no prazo
    -- Não conta, mas também NÃO quebra o streak
    IF lower(v_rec.status) IN ('pendente')
       AND v_rec.vencimento >= to_char(current_date, 'YYYY-MM-DD')
    THEN
      CONTINUE;
    END IF;

    -- Pago em dia = conta no streak
    IF lower(v_rec.status) = 'pago'
       AND v_rec.data_pagamento IS NOT NULL
       AND v_rec.data_pagamento <= v_rec.vencimento
    THEN
      v_streak := v_streak + 1;

    -- Qualquer outro caso (pago em atraso, vencido, pendente vencido) = zera tudo
    ELSE
      v_streak := 0;
      EXIT;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'ok',     true,
    'streak', v_streak
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_servnet_fidelidade(uuid, uuid) TO anon;
