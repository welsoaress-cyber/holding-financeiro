import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_TOKEN       = Deno.env.get('MP_ACCESS_TOKEN')!
const SB_URL         = Deno.env.get('SUPABASE_URL')!
const SB_SECRET      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SB_ANON        = Deno.env.get('SUPABASE_ANON_KEY')!
const FUNCTION_SECRET = Deno.env.get('FUNCTION_SECRET') || ''   // set via: supabase secrets set FUNCTION_SECRET=<valor>

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization, x-function-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  // ── Autenticação: aceita JWT do Supabase OU x-function-secret ───────────
  const authHeader = req.headers.get('Authorization') || ''
  const funcSecret = req.headers.get('x-function-secret') || ''

  let autenticado = false

  // Opção 1: secret compartilhado (admin panel / portal)
  if (FUNCTION_SECRET && funcSecret === FUNCTION_SECRET) {
    autenticado = true
  }

  // Opção 2: JWT válido do Supabase
  if (!autenticado && authHeader.startsWith('Bearer ')) {
    const jwt = authHeader.slice(7)
    const sbCheck = createClient(SB_URL, SB_ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } })
    const { data: { user } } = await sbCheck.auth.getUser()
    if (user) autenticado = true
  }

  if (!autenticado) {
    return new Response(JSON.stringify({ ok: false, msg: 'Não autorizado' }), { status: 401, headers: CORS })
  }

  try {
    const { cliente_id, contrato_id, valor, descricao, mes_ref, lancamento_id: lancamento_id_existente } = await req.json()
    if (!cliente_id || !valor) return new Response(JSON.stringify({ ok: false, msg: 'Faltam dados' }), { status: 400, headers: CORS })

    const sb = createClient(SB_URL, SB_SECRET)

    // 1. Usa lancamento existente (portal do cliente) ou cria novo (admin)
    let lancamento_id = lancamento_id_existente || null

    if (!lancamento_id) {
      lancamento_id = crypto.randomUUID()
      const { error: lancErr } = await sb
        .from('lancamentos')
        .insert({
          id: lancamento_id,
          user_id: null,
          dados: {
            clienteId: cliente_id,
            contratoId: contrato_id,
            tipo: 'Receita',
            status: 'Provisionado',
            valor: String(valor),
            descricao: descricao || 'Cobrança Servnet',
            data: new Date().toISOString().split('T')[0],
            mes_referencia: mes_ref || new Date().toISOString().slice(0, 7)
          }
        })
      if (lancErr) return new Response(JSON.stringify({ ok: false, msg: 'Erro ao criar fatura', detalhe: JSON.stringify(lancErr) }), { status: 500, headers: CORS })
    }

    // 2. Gera Pix no MP
    const ref = `${cliente_id}|${contrato_id}|${lancamento_id}`
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': lancamento_id
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        payment_method_id: 'pix',
        payer: { email: 'cliente@servnet.com.br' },
        description: descricao || 'Cobrança Servnet',
        external_reference: ref
      })
    })

    if (!mpRes.ok) {
      const err = await mpRes.text()
      return new Response(JSON.stringify({ ok: false, msg: 'Erro ao gerar Pix', detalhe: err }), { status: 500, headers: CORS })
    }

    const pag = await mpRes.json()

    // 3. Retorna QR Code
    return new Response(JSON.stringify({
      ok: true,
      lancamento_id,
      pix_id: pag.id,
      qr_code: pag.point_of_interaction?.transaction_data?.qr_code,
      qr_code_url: pag.point_of_interaction?.transaction_data?.qr_code_url,
      copia_cola: pag.point_of_interaction?.transaction_data?.copy_paste_code,
      valor,
      external_reference: ref
    }), { status: 200, headers: CORS })

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, msg: 'Erro interno', detalhe: String(err) }), { status: 500, headers: CORS })
  }
})
