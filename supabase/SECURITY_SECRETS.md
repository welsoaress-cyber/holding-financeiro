# Secrets necessários no Supabase

Execute no terminal após instalar o Supabase CLI e autenticar:

```bash
# Gera valores seguros
FUNCTION_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)
MP_WEBHOOK_SECRET=<copiar do MP Dashboard → Seu negócio → Notificações → Webhooks>

# Define no Supabase
supabase secrets set FUNCTION_SECRET=$FUNCTION_SECRET
supabase secrets set CRON_SECRET=$CRON_SECRET
supabase secrets set MP_WEBHOOK_SECRET=$MP_WEBHOOK_SECRET
```

## Como usar

### mp-gerar-pix
Chamar do frontend com um dos dois:
- `Authorization: Bearer <JWT do usuário Supabase>` (já é enviado automaticamente pelo supabase-js), **ou**
- `x-function-secret: <FUNCTION_SECRET>` (para chamadas server-side)

### whatsapp-lembretes (cron)
- Configurar no cron job: `Authorization: Bearer <CRON_SECRET>`

### mp-webhook
- Configurar o `MP_WEBHOOK_SECRET` copiando o "Secret" da aba Webhooks no MP Dashboard
- O Mercado Pago envia `x-signature` automaticamente em cada notificação

### RLS migration
Aplicar em: Supabase Dashboard → SQL Editor → colar conteúdo de `supabase/migrations/20260830_security_rls.sql`
