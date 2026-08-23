-- =========================================================
-- Migração: normalizar dados v1 → formato v2
-- =========================================================
-- O v1 salvava lançamentos com:
--   tipo   = "Receita" / "Despesa"   (inicial maiúscula)
--   status = "Pago" / "Pendente"     (inicial maiúscula)
--   data   = "YYYY-MM-DD"            (campo raiz no JSONB)
--   (sem campo mes_ref)
--   (sem campo data_vencimento)
--
-- O v2 espera:
--   tipo            = "receita" / "despesa"   (minúsculo)
--   status          = "pago" / "pendente"     (minúsculo)
--   data_vencimento = "YYYY-MM-DD"
--   mes_ref         = "YYYY-MM"
--
-- Execute UMA VEZ no Supabase SQL Editor.
-- É idempotente: rodar duas vezes não causa problema.
-- =========================================================

UPDATE lancamentos
SET dados = dados || jsonb_build_object(
  -- Normaliza case
  'tipo',             lower(coalesce(dados->>'tipo', '')),
  'status',           lower(coalesce(dados->>'status', 'pendente')),
  -- Copia campo "data" para "data_vencimento" se ausente
  'data_vencimento',  coalesce(dados->>'data_vencimento', dados->>'data'),
  -- Calcula mes_ref a partir da data disponível
  'mes_ref',          coalesce(
                        dados->>'mes_ref',
                        to_char(
                          to_date(
                            coalesce(dados->>'data_vencimento', dados->>'data'),
                            'YYYY-MM-DD'
                          ),
                          'YYYY-MM'
                        )
                      )
)
WHERE dados IS NOT NULL
  AND (
    dados->>'mes_ref' IS NULL
    OR dados->>'data_vencimento' IS NULL
    OR dados->>'tipo' IS DISTINCT FROM lower(dados->>'tipo')
    OR dados->>'status' IS DISTINCT FROM lower(dados->>'status')
  );

-- Verificação (opcional): conta quantos foram atualizados
-- SELECT count(*) FROM lancamentos WHERE dados->>'mes_ref' IS NOT NULL;
