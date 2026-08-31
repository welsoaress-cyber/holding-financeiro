-- ----------------------------------------------------------------
-- fix-portal-faturas-v4: flag ocultarPortal + campo negocio por fatura
-- Lançamentos com dados->>'ocultarPortal' = true NÃO aparecem
-- como fatura no portal do cliente (controlado pelo painel,
-- checkbox "Mostrar no portal do cliente" e menu ⋮ → Ocultar).
-- Rodar no Supabase SQL Editor. Idempotente.
-- ----------------------------------------------------------------

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
      'negocio',        l.dados->>'negocio',
      'link_boleto',    l.dados->>'linkBoleto',
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
    AND lower(COALESCE(l.dados->>'tipo','')) = 'receita'
    AND COALESCE((l.dados->>'inativo')::boolean, false) = false
    -- v4: painel controla a visibilidade; devolve tambem o negocio
    AND COALESCE((l.dados->>'ocultarPortal')::boolean, false) = false
    AND (
          l.dados->>'clienteId'   = p_cliente_id
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
