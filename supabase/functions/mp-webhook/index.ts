import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ----------------------------------------------------------------
// Variáveis de ambiente
// ----------------------------------------------------------------
const SB_URL         = Deno.env.get('SUPABASE_URL')!
const SB_SECRET      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MP_TOKEN       = Deno.env.get('MP_ACCESS_TOKEN') || ''
const MP_WEBHOOK_SECRET = Deno.env.get('MP_WEBHOOK_SECRET') || ''  // set via: supabase secrets set MP_WEBHOOK_SECRET=<valor do MP Dashboard>
const ADMIN_TOKEN    = Deno.env.get('CRON_SECRET') || ''           // reutiliza CRON_SECRET para chamadas manuais GET

// ─── Valida assinatura HMAC do Mercado Pago ───────────────────────────────
// Ref: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
async function validarAssinaturaMP(req: Request, body: string, url: URL): Promise<boolean> {
  if (!MP_WEBHOOK_SECRET) return true  // sem secret configurado: aceita (modo dev)
  const xSig  = req.headers.get('x-signature') || ''
  const xReqId = req.headers.get('x-request-id') || ''
  const dataId = url.searchParams.get('data.id') || ''

  // Formato: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(xSig.split(',').map(p => p.split('=')))
  const ts    = parts['ts'] || ''
  const v1    = parts['v1'] || ''
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xReqId};ts:${ts};`
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(MP_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === v1
}

// ----------------------------------------------------------------
// Processa baixa automática para um paymentId do Mercado Pago
// ----------------------------------------------------------------
async function processarBaixa(paymentId: string): Promise<{ ok: boolean; msg: string }> {
  if (!MP_TOKEN) {
    console.error('❌ MP_ACCESS_TOKEN não configurado')
    return { ok: false, msg: 'MP_ACCESS_TOKEN ausente' }
  }

  // Busca detalhes do pagamento no Mercado Pago
  let pagamento: Record<string, unknown>
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}` },
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`❌ Erro ao buscar pagamento ${paymentId} no MP:`, err)
      return { ok: false, msg: `MP API error: ${err}` }
    }
    pagamento = await res.json()
  } catch (err) {
    console.error(`❌ Exceção ao consultar MP para pagamento ${paymentId}:`, err)
    return { ok: false, msg: `Exceção: ${err}` }
  }

  const status        = pagamento?.status as string | undefined
  const externalRef   = pagamento?.external_reference as string | undefined
  const valorPago     = pagamento?.transaction_amount as number | undefined
  const statusDetalhe = pagamento?.status_detail as string | undefined

  // Log detalhado para diagnóstico
  console.log(`💳 Pagamento ${paymentId}: status=${status} (${statusDetalhe}), external_reference=${externalRef ?? '(vazio)'}, valor=${valorPago}`)

  // Só processa pagamentos aprovados
  if (status !== 'approved') {
    console.log(`ℹ️ Pagamento ${paymentId} não aprovado (status: ${status}) — sem ação`)
    return { ok: true, msg: `status ${status} — sem ação` }
  }

  // Precisa da referência para identificar o lançamento
  if (!externalRef) {
    console.error(`⚠️ Pagamento ${paymentId} aprovado mas sem external_reference — Pix gerado sem ID do lançamento`)
    return { ok: false, msg: 'external_reference ausente' }
  }

  // Busca o lançamento no Supabase pelo ID (external_reference)
  const sb = createClient(SB_URL, SB_SECRET)
  console.log(`🔍 Buscando lançamento id="${externalRef}" no Supabase`)

  const { data: lancamento, error: errBusca } = await sb
    .from('lancamentos')
    .select('id, dados')
    .eq('id', externalRef)
    .single()

  if (errBusca || !lancamento) {
    console.error(`❌ Lançamento "${externalRef}" não encontrado:`, errBusca?.message)
    return { ok: false, msg: `Lançamento "${externalRef}" não encontrado: ${errBusca?.message}` }
  }

  const dados = lancamento.dados as Record<string, unknown>

  // Evita dar baixa dupla
  if (dados?.status === 'Pago') {
    console.log(`ℹ️ Lançamento ${externalRef} já Pago — sem ação`)
    return { ok: true, msg: 'já pago' }
  }

  // Data de hoje em Brasília (UTC-3)
  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hoje = agora.toISOString().split('T')[0]

  const dadosAtualizados = {
    ...dados,
    status: 'Pago',
    dataPagamento: hoje,
    formaPagamento: 'Pix',
    mpPaymentId: String(paymentId),
    ...(valorPago !== undefined ? { valorPago: String(valorPago) } : {}),
  }

  const { error: errUpdate } = await sb
    .from('lancamentos')
    .update({ dados: dadosAtualizados })
    .eq('id', externalRef)

  if (errUpdate) {
    console.error(`❌ Erro ao atualizar lançamento ${externalRef}:`, errUpdate.message)
    return { ok: false, msg: `Erro ao atualizar: ${errUpdate.message}` }
  }

  const cliente = dados?.clienteNome || dados?.nome || externalRef
  console.log(`✅ Baixa automática: lançamento ${externalRef} (${cliente}) marcado como Pago — pagamento MP ${paymentId}`)
  return { ok: true, msg: `Baixa realizada — ${cliente} marcado como Pago` }
}

// ----------------------------------------------------------------
// Handler principal
// ----------------------------------------------------------------
serve(async (req) => {
  const url = new URL(req.url)

  // ── Autenticação por role ─────────────────────────────────────────────────
  // GET (diagnóstico manual): exige CRON_SECRET
  // POST (webhook MP): valida assinatura HMAC do MP
  if (req.method === 'GET' && ADMIN_TOKEN) {
    const provided = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    if (provided !== ADMIN_TOKEN) {
      return new Response(JSON.stringify({ ok: false, msg: 'Não autorizado' }), { status: 401 })
    }
  }

  // ----------------------------------------------------------------
  // GET → diagnóstico e recuperação manual
  // ?paymentId=xxx  → busca pagamento no MP e processa baixa
  // ?lancId=xxx     → força baixa manual por ID do lançamento
  // ----------------------------------------------------------------
  if (req.method === 'GET') {
    const paymentId = url.searchParams.get('paymentId')
    const lancId    = url.searchParams.get('lancId')

    if (paymentId) {
      console.log(`🔧 Diagnóstico manual — paymentId: ${paymentId}`)
      const resultado = await processarBaixa(paymentId)
      return new Response(JSON.stringify({ paymentId, ...resultado }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (lancId) {
      console.log(`🔧 Baixa manual solicitada — lancId: ${lancId}`)
      const sb = createClient(SB_URL, SB_SECRET)
      const { data: lanc, error: errB } = await sb
        .from('lancamentos')
        .select('id, dados')
        .eq('id', lancId)
        .single()

      if (errB || !lanc) {
        return new Response(JSON.stringify({ ok: false, msg: `Lançamento "${lancId}" não encontrado: ${errB?.message}` }), {
          status: 200, headers: { 'Content-Type': 'application/json' },
        })
      }

      const dados = lanc.dados as Record<string, unknown>
      if (dados?.status === 'Pago') {
        return new Response(JSON.stringify({ ok: true, msg: 'já pago', lancamento: lancId }), {
          status: 200, headers: { 'Content-Type': 'application/json' },
        })
      }

      const agora = new Date()
      agora.setHours(agora.getHours() - 3)
      const hoje = agora.toISOString().split('T')[0]

      const { error: errU } = await sb
        .from('lancamentos')
        .update({ dados: { ...dados, status: 'Pago', dataPagamento: hoje, formaPagamento: 'Pix' } })
        .eq('id', lancId)

      if (errU) {
        return new Response(JSON.stringify({ ok: false, msg: `Erro ao atualizar: ${errU.message}` }), {
          status: 200, headers: { 'Content-Type': 'application/json' },
        })
      }

      const cliente = dados?.clienteNome || dados?.nome || lancId
      console.log(`✅ Baixa manual: lançamento ${lancId} (${cliente}) marcado como Pago`)
      return new Response(JSON.stringify({ ok: true, msg: `Baixa manual OK — ${cliente}`, lancamento: lancId }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, msg: 'MP Webhook ativo. Use ?paymentId=xxx ou ?lancId=xxx.' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  // ----------------------------------------------------------------
  // POST → notificação do Mercado Pago
  // Retorna 200 IMEDIATAMENTE e processa em background via waitUntil
  // para evitar EarlyDrop (função derrubada antes de concluir)
  // ----------------------------------------------------------------
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Lê body como texto para validação de assinatura
  let bodyText: string
  try { bodyText = await req.text() } catch { return new Response('Bad request', { status: 400 }) }

  // Valida assinatura HMAC do Mercado Pago
  const assinaturaValida = await validarAssinaturaMP(req, bodyText, url)
  if (!assinaturaValida) {
    console.warn('⚠️ Assinatura MP inválida — requisição rejeitada')
    return new Response('Forbidden', { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = JSON.parse(bodyText) } catch { return new Response('Bad request', { status: 400 }) }

  console.log('📩 MP Webhook recebido:', JSON.stringify(body))

  const tipo      = body?.type as string | undefined
  const action    = body?.action as string | undefined
  const paymentId = (body?.data as Record<string, unknown>)?.id as string | undefined

  console.log(`   type=${tipo}, action=${action}, payment_id=${paymentId}`)

  // Ignora notificações que não são de pagamento
  if (tipo !== 'payment' || !paymentId) {
    console.log(`ℹ️ Notificação ignorada — tipo=${tipo}, id=${paymentId}`)
    return new Response(JSON.stringify({ ok: true, msg: 'ignorado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Responde 200 IMEDIATAMENTE para o Mercado Pago não retentar
  // e processa a baixa em background para evitar EarlyDrop
  const resposta = new Response(JSON.stringify({ ok: true, msg: 'recebido', paymentId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  // EdgeRuntime.waitUntil garante que o processamento termine
  // mesmo após a resposta HTTP ser enviada
  try {
    // deno-lint-ignore no-explicit-any
    ;(globalThis as any).EdgeRuntime?.waitUntil(
      processarBaixa(String(paymentId))
        .catch(err => console.error(`❌ Erro no processamento background de ${paymentId}:`, err))
    )
  } catch {
    // Se waitUntil não estiver disponível, processa inline (pode causar EarlyDrop)
    // mas pelo menos tentamos
    processarBaixa(String(paymentId))
      .catch(err => console.error(`❌ Erro inline de ${paymentId}:`, err))
  }

  return resposta
})
