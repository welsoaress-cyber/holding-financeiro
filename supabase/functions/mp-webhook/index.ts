import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_TOKEN  = Deno.env.get('MP_ACCESS_TOKEN')!
const SB_URL    = Deno.env.get('SUPABASE_URL')!
const SB_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // MP pode enviar GET para validar a URL
  if (req.method === 'GET') return new Response('ok', { status: 200 })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const body = await req.json()

    // Só processa notificações de pagamento
    if (body.type !== 'payment' || !body.data?.id) {
      return new Response('ignored', { status: 200 })
    }

    const paymentId = String(body.data.id)

    // Busca detalhes do pagamento no MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
    })

    if (!mpRes.ok) {
      console.error('Erro ao buscar pagamento MP:', await mpRes.text())
      return new Response('erro mp', { status: 500 })
    }

    const pag = await mpRes.json()

    // Só processa aprovados
    if (pag.status !== 'approved') {
      console.log(`Pagamento ${paymentId} com status ${pag.status} — ignorado`)
      return new Response('not approved', { status: 200 })
    }

    // external_reference = "clienteId|contratoId|lancamentoId"
    const ref = pag.external_reference || ''
    const lancamento_id = ref.split('|')[2] || null

    if (!lancamento_id) {
      console.error('lancamento_id ausente em external_reference:', ref)
      return new Response('sem lancamento_id', { status: 200 })
    }

    const sb = createClient(SB_URL, SB_SECRET)

    // Busca dados atuais do lançamento
    const { data: lanc, error: fetchErr } = await sb
      .from('lancamentos')
      .select('dados')
      .eq('id', lancamento_id)
      .single()

    if (fetchErr || !lanc) {
      console.error('Lancamento não encontrado:', lancamento_id, fetchErr)
      return new Response('lancamento nao encontrado', { status: 200 })
    }

    // Mescla status Pago mantendo todos os outros campos do JSONB
    const dadosAtualizados = {
      ...(lanc.dados || {}),
      status: 'Pago',
      pix_id: String(pag.id),
      data_pagamento: new Date().toISOString().split('T')[0]
    }

    const { error: upErr } = await sb
      .from('lancamentos')
      .update({ dados: dadosAtualizados })
      .eq('id', lancamento_id)

    if (upErr) {
      console.error('Erro ao atualizar lancamento:', upErr)
      return new Response('erro update', { status: 500 })
    }

    console.log(`✅ Pagamento ${paymentId} aprovado → lancamento ${lancamento_id} = Pago`)
    return new Response('ok', { status: 200 })

  } catch (err) {
    console.error('Erro webhook:', err)
    return new Response('erro interno', { status: 500 })
  }
})
