import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type SBClient = ReturnType<typeof createClient>

export function getSB(): SBClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}
