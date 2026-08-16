import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_TOKEN  = Deno.env.get('MP_ACCESS_TOKEN')!
const SB_URL    = Deno.env.get('SUPABASE_URL')!
const SB_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const { cliente_id, contrato_id, valor, descricao, mes_ref } = await req.json()
    if (!cliente_id || !valor) return new Response(JSON.stringify({ ok: false, msg: 'Faltam dados' }), { status: 400 })

    const sb = createClient(SB_URL, SB_SECRET)

    // 1. Cria lançamento (fatura) no banco
    const { data: lanc, error: lancErr } = await sb
      .from('lancamentos')
      .insert({
        user_id: null, // será preenchido depois
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
      .select('id')
      .single()

    if (lancErr || !lanc) return new Response(JSON.stringify({ ok: false, msg: 'Erro ao criar fatura' }), { status: 500 })

    const lancamento_id = lanc.id

    // 2. Gera Pix no MP
    const ref = `${cliente_id}|${contrato_id}|${lancamento_id}`
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json'
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
      console.error('MP error:', err)
      return new Response(JSON.stringify({ ok: false, msg: 'Erro ao gerar Pix' }), { status: 500 })
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
    }), { status: 200 })

  } catch (err) {
    console.error('Erro:', err)
    return new Response(JSON.stringify({ ok: false, msg: 'Erro interno' }), { status: 500 })
  }
})
