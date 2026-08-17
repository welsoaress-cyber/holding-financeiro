-- ================================================================
-- AGENDAMENTO DE LEMBRETES WHATSAPP
-- Execute no Supabase Dashboard > SQL Editor
--
-- Agenda a função whatsapp-lembretes para rodar todos os dias
-- às 8h da manhã (horário de Brasília = 11h UTC)
-- ================================================================

-- Habilita extensão pg_cron (necessário apenas uma vez)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove agendamento anterior se existir
SELECT cron.unschedule('whatsapp-lembretes-diario')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'whatsapp-lembretes-diario'
);

-- Agenda para rodar todo dia às 11:00 UTC (08:00 Brasília)
SELECT cron.schedule(
  'whatsapp-lembretes-diario',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url     := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/whatsapp-lembretes',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'Authorization',  'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Confirma o agendamento
SELECT jobname, schedule, command
FROM cron.job
WHERE jobname = 'whatsapp-lembretes-diario';
