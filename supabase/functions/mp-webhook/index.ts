import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ----------------------------------------------------------------
// Variáveis de ambiente
// ----------------------------------------------------------------
const SB_URL    = Deno.env.get('SUPABASE_URL')!
const SB_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MP_TOKEN  = Deno.env.get('MP_ACCESS_TOKEN') || ''

// ----------------------------------------------------------------
// Handler principal
// ----------------------------------------------------------------
serve(async (req) => {
  // Mercado Pago envia POST com JSON
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  console.log('📩 MP Webhook recebido:', JSON.stringify(body))

  // Mercado Pago envia: { type: "payment", action: "payment.updated", data: { id: "..." } }
  const tipo = body?.type as string | undefined
  const paymentId = (body?.data as Record<string, unknown>)?.id as string | undefined

  // Ignora notificações que não são de pagamento
  if (tipo !== 'payment' || !paymentId) {
    console.log(`ℹ️ Notificação ignorada — tipo: ${tipo}, id: ${paymentId}`)
    // Sempre retorna 200 para o Mercado Pago não retentar
    return new Response(JSON.stringify({ ok: true, msg: 'ignorado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ----------------------------------------------------------------
  // Busca detalhes do pagamento no Mercado Pago para verificar status
  // e obter external_reference (= ID do lançamento no Supabase)
  // ----------------------------------------------------------------
  if (!MP_TOKEN) {
    console.error('❌ MP_ACCESS_TOKEN não configurado')
    return new Response(JSON.stringify({ ok: false, error: 'MP_ACCESS_TOKEN ausente' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let pagamento: Record<string, unknown>
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}` },
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`❌ Erro ao buscar pagamento ${paymentId} no MP:`, err)
      return new Response(JSON.stringify({ ok: false, error: `MP API error: ${err}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    pagamento = await res.json()
  } catch (err) {
    console.error(`❌ Exceção ao consultar MP para pagamento ${paymentId}:`, err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const status = pagamento?.status as string | undefined
  const externalRef = pagamento?.external_reference as string | undefined
  const valorPago = pagamento?.transaction_amount as number | undefined

  console.log(`💳 Pagamento ${paymentId} — status: ${status}, external_reference: ${externalRef}`)

  // Só processa pagamentos aprovados
  if (status !== 'approved') {
    console.log(`ℹ️ Pagamento ${paymentId} não aprovado (status: ${status}) — sem ação`)
    return new Response(JSON.stringify({ ok: true, msg: `status ${status} — sem ação` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Precisa da referência para identificar o lançamento
  if (!externalRef) {
    console.error(`⚠️ Pagamento ${paymentId} aprovado mas sem external_reference — não é possível dar baixa`)
    return new Response(JSON.stringify({ ok: false, error: 'external_reference ausente' }), {
      status: 200, // retorna 200 para MP não retentar
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ----------------------------------------------------------------
  // Busca o lançamento no Supabase pelo ID (external_reference)
  // ----------------------------------------------------------------
  const sb = createClient(SB_URL, SB_SECRET)

  const { data: lancamento, error: errBusca } = await sb
    .from('lancamentos')
    .select('id, dados')
    .eq('id', externalRef)
    .single()

  if (errBusca || !lancamento) {
    console.error(`❌ Lançamento ${externalRef} não encontrado:`, errBusca?.message)
    return new Response(JSON.stringify({ ok: false, error: `Lançamento ${externalRef} não encontrado` }), {
      status: 200, // retorna 200 para MP não retentar
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const dados = lancamento.dados as Record<string, unknown>

  // Evita dar baixa dupla
  if (dados?.status === 'Pago') {
    console.log(`ℹ️ Lançamento ${externalRef} já está como Pago — sem ação`)
    return new Response(JSON.stringify({ ok: true, msg: 'já pago' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ----------------------------------------------------------------
  // Data de hoje em Brasília (UTC-3) para registrar como dataPagamento
  // ----------------------------------------------------------------
  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hoje = agora.toISOString().split('T')[0]

  // Atualiza o lançamento: marca como Pago
  const dadosAtualizados = {
    ...dados,
    status: 'Pago',
    dataPagamento: hoje,
    formaPagamento: 'Pix',
    // Registra o ID do pagamento MP para rastreabilidade
    mpPaymentId: String(paymentId),
    ...(valorPago !== undefined ? { valorPago: String(valorPago) } : {}),
  }

  const { error: errUpdate } = await sb
    .from('lancamentos')
    .update({ dados: dadosAtualizados })
    .eq('id', externalRef)

  if (errUpdate) {
    console.error(`❌ Erro ao atualizar lançamento ${externalRef}:`, errUpdate.message)
    return new Response(JSON.stringify({ ok: false, error: errUpdate.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const cliente = dados?.clienteNome || dados?.nome || externalRef
  console.log(`✅ Baixa automática: lançamento ${externalRef} (${cliente}) marcado como Pago via Pix MP — pagamento ${paymentId}`)

  return new Response(JSON.stringify({
    ok: true,
    msg: 'Baixa realizada com sucesso',
    lancamento: externalRef,
    pagamento: paymentId,
    status: 'Pago',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
