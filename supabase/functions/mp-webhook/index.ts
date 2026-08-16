// ================================================================
// MERCADO PAGO WEBHOOK — ativa cliente automaticamente ao pagar
// ================================================================
// Fluxo:
//   1. MP chama este endpoint com {action, data.id} quando um
//      pagamento muda de status.
//   2. Buscamos o pagamento na API do MP para confirmar que está "approved".
//   3. Lemos o external_reference (= cliente_id gravado na geração do Pix).
//   4. Marcamos a fatura como Pago e o contrato como Ativo no banco.
// ================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_TOKEN  = Deno.env.get('MP_ACCESS_TOKEN')!
const SB_URL    = Deno.env.get('SUPABASE_URL')!
const SB_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // MP envia GET com ?topic=payment&id=xxx para validar o endpoint
  if (req.method === 'GET') {
    return new Response('OK', { status: 200 })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    console.log('MP webhook payload:', JSON.stringify(body))

    // Só processa notificações de pagamento
    const topic  = body.topic  || body.type
    const pagId  = body.data?.id || body.id
    if (topic !== 'payment' || !pagId) {
      return new Response('ignored', { status: 200 })
    }

    // 1. Busca dados do pagamento no MP
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${pagId}`,
      { headers: { Authorization: `Bearer ${MP_TOKEN}` } }
    )
    if (!mpRes.ok) {
      console.error('MP API error:', mpRes.status)
      return new Response('mp error', { status: 200 })
    }
    const pag = await mpRes.json()
    console.log('Pagamento MP:', pag.id, pag.status, pag.external_reference)

    // Só age se foi aprovado
    if (pag.status !== 'approved') {
      return new Response('not approved', { status: 200 })
    }

    // external_reference = "cli_xxx|ct_xxx|lanc_xxx" gravado na geração do Pix
    const ref = pag.external_reference || ''
    const [clienteId, contratoId, lancamentoId] = ref.split('|')
    if (!clienteId) {
      console.error('external_reference inválido:', ref)
      return new Response('no reference', { status: 200 })
    }

    const sb = createClient(SB_URL, SB_SECRET)

    // 2. Marca lançamento (fatura) como Pago
    if (lancamentoId) {
      const { data: lanc } = await sb
        .from('lancamentos')
        .select('dados')
        .eq('id', lancamentoId)
        .single()

      if (lanc) {
        const novosDados = {
          ...lanc.dados,
          status: 'Pago',
          dataPagamento: new Date().toISOString().split('T')[0],
          mp_payment_id: String(pag.id)
        }
        await sb
          .from('lancamentos')
          .update({ dados: novosDados })
          .eq('id', lancamentoId)
        console.log('Fatura marcada como Paga:', lancamentoId)
      }
    }

    // 3. Ativa o contrato e o cliente
    const { data: cli } = await sb
      .from('cli_clientes')
      .select('dados')
      .eq('id', clienteId)
      .single()

    if (!cli) {
      console.error('Cliente não encontrado:', clienteId)
      return new Response('cliente nao encontrado', { status: 200 })
    }

    const dados = cli.dados as Record<string, unknown>

    // Ativa status geral do cliente
    dados.status = 'Ativo'

    // Ativa o contrato específico dentro do array
    if (contratoId && Array.isArray(dados.contratos)) {
      dados.contratos = (dados.contratos as Record<string, unknown>[]).map(c =>
        c.id === contratoId ? { ...c, status: 'Ativo' } : c
      )
    }

    await sb
      .from('cli_clientes')
      .update({ dados })
      .eq('id', clienteId)

    console.log('Cliente ativado:', clienteId, contratoId)

    return new Response(JSON.stringify({ ok: true, clienteId, contratoId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Erro no webhook:', err)
    return new Response('error', { status: 200 }) // sempre 200 pro MP não retentar em loop
  }
})
