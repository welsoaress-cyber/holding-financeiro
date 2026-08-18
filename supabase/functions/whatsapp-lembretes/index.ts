import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ----------------------------------------------------------------
// Variáveis de ambiente (configurar como secrets no Supabase)
// ----------------------------------------------------------------
const SB_URL        = Deno.env.get('SUPABASE_URL')!
const SB_SECRET     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVO_URL       = Deno.env.get('EVOLUTION_API_URL') || 'http://163.176.122.177:8080'
const EVO_KEY       = Deno.env.get('EVOLUTION_API_KEY') || 'servnet-evo-2026'
const EVO_INSTANCE  = Deno.env.get('EVOLUTION_INSTANCE') || 'servnet'
const MP_TOKEN      = Deno.env.get('MP_ACCESS_TOKEN') || ''

// ----------------------------------------------------------------
// Normaliza telefone para formato internacional (55XXXXXXXXXXX)
// ----------------------------------------------------------------
function normalizarTelefone(tel: string): string | null {
  if (!tel) return null
  const internacional = tel.trim().startsWith('+')
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 0) return null
  // Número com "+": internacional — usa o código do país informado, sem adicionar 55
  if (internacional) return digits.length >= 10 ? digits : null
  if (digits.startsWith('55') && digits.length >= 12) return digits
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if (digits.length === 8 || digits.length === 9) return null
  return digits
}

// ----------------------------------------------------------------
// Gera link de pagamento Pix via Mercado Pago
// Retorna a URL para o cliente pagar, ou null se falhar
// ----------------------------------------------------------------
async function gerarLinkPix(
  valor: number,
  nome: string,
  descricao: string,
  dataVencimento: string, // YYYY-MM-DD
  idempotencyKey: string,
  lancId: string,         // ID do lançamento — salvo como external_reference para o webhook
): Promise<string | null> {
  if (!MP_TOKEN) return null
  try {
    const expiracao = `${dataVencimento}T23:59:59.000-03:00`
    const res = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        transaction_amount: valor,
        payment_method_id: 'pix',
        description: descricao,
        date_of_expiration: expiracao,
        external_reference: lancId, // webhook usa isso para dar baixa automática
        payer: {
          email: 'cliente@servnet.net.br',
          first_name: nome.split(' ')[0] || nome,
        },
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`⚠️ MP Pix error para ${nome}:`, err)
      return null
    }
    const json = await res.json()
    const url = json?.point_of_interaction?.transaction_data?.ticket_url
    if (url) console.log(`💳 Link Pix gerado para ${nome}: ${url}`)
    return url || null
  } catch (err) {
    console.error(`⚠️ Exceção ao gerar Pix MP para ${nome}:`, err)
    return null
  }
}

// ----------------------------------------------------------------
// Aguarda N milissegundos
// ----------------------------------------------------------------
function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

// ----------------------------------------------------------------
// Verifica se a instância Evolution API está conectada (antes de disparar)
// ----------------------------------------------------------------
async function verificarInstancia(): Promise<{ ok: boolean; estado: string }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${EVO_URL}/instance/connectionState/${EVO_INSTANCE}`, {
      headers: { 'apikey': EVO_KEY },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return { ok: false, estado: `HTTP ${res.status}` }
    const json = await res.json()
    // Evolution API v1: json.instance.state | v2: json.state
    const estado: string = json?.instance?.state ?? json?.state ?? 'desconhecido'
    return { ok: estado === 'open', estado }
  } catch (err) {
    return { ok: false, estado: `timeout/rede: ${err}` }
  }
}

// ----------------------------------------------------------------
// Envia mensagem WhatsApp via Evolution API (com retry e backoff)
// ----------------------------------------------------------------
async function enviarWhatsApp(numero: string, mensagem: string): Promise<boolean> {
  const MAX = 3
  for (let t = 1; t <= MAX; t++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
        method: 'POST',
        headers: { 'apikey': EVO_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: numero, text: mensagem }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        const err = await res.text()
        console.error(`❌ [${t}/${MAX}] Erro HTTP ao enviar para ${numero}:`, err)
        if (t < MAX) await sleep(1000 * t) // 1 s, depois 2 s
        continue
      }
      if (t > 1) console.log(`✅ Mensagem enviada para ${numero} (tentativa ${t})`)
      else       console.log(`✅ Mensagem enviada para ${numero}`)
      return true
    } catch (err) {
      console.error(`❌ [${t}/${MAX}] Exceção ao enviar para ${numero}:`, err)
      if (t < MAX) await sleep(1000 * t)
    }
  }
  console.error(`🔴 Falha definitiva para ${numero} após ${MAX} tentativas`)
  return false
}

// ----------------------------------------------------------------
// Formata valor em reais
// ----------------------------------------------------------------
function formatarValor(valor: string | number | null): string {
  const num = parseFloat(String(valor || '0'))
  if (isNaN(num)) return 'R$ 0,00'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ----------------------------------------------------------------
// Formata data YYYY-MM-DD para DD/MM/YYYY
// ----------------------------------------------------------------
function formatarData(data: string): string {
  if (!data) return ''
  const parts = data.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return data
}

// ----------------------------------------------------------------
// Monta mensagem de acordo com a situação da fatura
// ----------------------------------------------------------------
function montarMensagem(
  saudacao: string,
  nome: string,
  valorFormatado: string,
  dataFormatada: string,
  diasRestantes: number,
  linkPix?: string | null,
): string {
  const pagamento = linkPix
    ? `💰 *${valorFormatado}*\n👉 Pagar agora: ${linkPix}`
    : `💰 *${valorFormatado}*\nPix: welsoaress@gmail.com`
  const assinatura = `\n${pagamento}\n\nEm caso de dúvidas, entre em contato conosco.`

  // ── Vencidos há mais de 3 dias — reengajamento ────────────────
  // (ciclo de 5 em 5 dias no automático, ou clique no 📲 Cobrar)
  // Tom de incentivo: novidades do serviço + convite pra voltar,
  // em vez de só aviso de bloqueio.
  if (diasRestantes <= -4) {
    const dias = Math.abs(diasRestantes)
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `Sentimos sua falta por aqui! 💙\n\n` +
      `A *Servnet está com novidades*: fizemos atualizações e melhorias na rede pra você navegar ainda melhor. 🚀\n\n` +
      `Notamos que a sua fatura vencida em ${dataFormatada} (há ${dias} dias) ainda está em aberto. ` +
      `Que tal regularizar agora e voltar a aproveitar tudo isso? 😊` +
      assinatura
  }

  // ── Vencidos (até 3 dias) ─────────────────────────────────────
  if (diasRestantes === -3) {
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `⚠️ Sua fatura venceu *há 3 dias* (${dataFormatada}) e ainda não identificamos o pagamento. ` +
      `Seu acesso está temporariamente bloqueado.` +
      assinatura
  }
  if (diasRestantes === -2) {
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `⚠️ Sua fatura venceu *há 2 dias* (${dataFormatada}) e ainda não identificamos o pagamento. ` +
      `Seu acesso está temporariamente bloqueado.` +
      assinatura
  }
  if (diasRestantes === -1) {
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `⚠️ Sua fatura venceu *ontem* (${dataFormatada}) e ainda não identificamos o pagamento. ` +
      `Seu acesso está temporariamente bloqueado.` +
      assinatura
  }

  // ── Vence hoje ────────────────────────────────────────────────
  if (diasRestantes === 0) {
    const pag = linkPix
      ? `💰 *${valorFormatado}*\n👉 Pagar agora: ${linkPix}`
      : `💰 *${valorFormatado}*\nPix: welsoaress@gmail.com`
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `Lembrando que sua fatura vence *hoje* (${dataFormatada}).\n\n${pag}\n\nEm caso de dúvidas, entre em contato conosco. 😊`
  }

  // ── A vencer ──────────────────────────────────────────────────
  const pag = linkPix
    ? `💰 *${valorFormatado}*\n👉 Pagar agora: ${linkPix}`
    : `💰 *${valorFormatado}*\nPix: welsoaress@gmail.com`
  if (diasRestantes === 1) {
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `Sua fatura vence *amanhã* (${dataFormatada}).\n\n${pag}\n\nEm caso de dúvidas, entre em contato conosco. 😊`
  }
  if (diasRestantes === 2) {
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `Sua fatura vence em *2 dias* (${dataFormatada}).\n\n${pag}\n\nEm caso de dúvidas, entre em contato conosco. 😊`
  }
  // 3 dias
  return `${saudacao}, *${nome}*! 👋\n\n` +
    `Sua fatura vence em *3 dias* (${dataFormatada}).\n\n${pag}\n\nEm caso de dúvidas, entre em contato conosco. 😊`
}

// ----------------------------------------------------------------
// Função principal
// ----------------------------------------------------------------
serve(async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Filtro opcional: ?clienteId=xxx envia só para aquele cliente (útil para testes)
  const url = new URL(req.url)
  const filtroClienteId = url.searchParams.get('clienteId') || null

  const sb = createClient(SB_URL, SB_SECRET)

  // ----------------------------------------------------------------
  // Verifica se a Evolution API está online antes de qualquer disparo.
  // Falha rápida: evita tentar enviar para todos os clientes quando a
  // instância está desconectada (sessão expirada, servidor reiniciado, etc.)
  // ----------------------------------------------------------------
  const { ok: apiOK, estado: apiEstado } = await verificarInstancia()
  if (!apiOK) {
    const msg = `🔴 Evolution API OFFLINE — instância '${EVO_INSTANCE}' estado: ${apiEstado}. Acesse o painel para reconectar.`
    console.error(msg)
    return new Response(JSON.stringify({
      ok: false,
      error: `Evolution API offline (estado: ${apiEstado}). Reconecte a instância '${EVO_INSTANCE}' no painel da Evolution API e dispare novamente.`,
    }), { status: 503, headers: { 'Content-Type': 'application/json' } })
  }
  console.log(`✅ Evolution API conectada (estado: ${apiEstado})`)

  // Data de hoje ajustada para Brasília (UTC-3)
  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hoje = agora.toISOString().split('T')[0]

  // Datas futuras
  const addDias = (base: Date, n: number): string => {
    const d = new Date(base)
    d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
  }

  const alvo1dia      = addDias(agora,  1)
  const alvo2dias     = addDias(agora,  2)
  const alvo3dias     = addDias(agora,  3)

  // Datas futuras próximas (janela de aviso antecipado)
  const datasProximas = [hoje, alvo1dia, alvo2dias, alvo3dias]

  console.log(`🗓️ Hoje: ${hoje} | Próximas: ${datasProximas.join(', ')}`)

  // ----------------------------------------------------------------
  // Busca faturas não pagas:
  //   - Vencidas: TODAS, sem limite de data (nos dois modos). O ritmo de
  //     cada uma é decidido no loop abaixo:
  //       · até 3 dias de atraso → aviso diário (mensagens de bloqueio)
  //       · acima de 3 dias      → cobrança a cada 5 dias de atraso
  //                                (5, 10, 15, ...) com mensagem de
  //                                incentivo/novidades (reengajamento)
  //     No modo MANUAL (?clienteId, botão 📲 Cobrar) não há ritmo:
  //     o clique é a decisão — envia tudo que está em aberto na hora.
  //   - A vencer: hoje + próximos 3 dias (nos dois modos)
  // ----------------------------------------------------------------
  const [resVencAt, resVencNull] = await Promise.all([
    (() => {
      let q = sb.from('lancamentos').select('id, dados, user_id')
        .eq('dados->>tipo', 'Receita').neq('dados->>status', 'Pago')
        .eq('dados->>inativo', 'false').lt('dados->>data', hoje)
      if (filtroClienteId) q = q.eq('dados->>clienteId', filtroClienteId)
      return q
    })(),
    (() => {
      let q = sb.from('lancamentos').select('id, dados, user_id')
        .eq('dados->>tipo', 'Receita').neq('dados->>status', 'Pago')
        .is('dados->>inativo', null).lt('dados->>data', hoje)
      if (filtroClienteId) q = q.eq('dados->>clienteId', filtroClienteId)
      return q
    })(),
  ])

  // A vencer: hoje + próximos 3 dias
  const [resProxAt, resProxNull] = await Promise.all([
    (() => {
      let q = sb.from('lancamentos').select('id, dados, user_id')
        .eq('dados->>tipo', 'Receita').neq('dados->>status', 'Pago')
        .eq('dados->>inativo', 'false').in('dados->>data', datasProximas)
      if (filtroClienteId) q = q.eq('dados->>clienteId', filtroClienteId)
      return q
    })(),
    (() => {
      let q = sb.from('lancamentos').select('id, dados, user_id')
        .eq('dados->>tipo', 'Receita').neq('dados->>status', 'Pago')
        .is('dados->>inativo', null).in('dados->>data', datasProximas)
      if (filtroClienteId) q = q.eq('dados->>clienteId', filtroClienteId)
      return q
    })(),
  ])

  if (resVencAt.error) {
    console.error('❌ Erro ao buscar lançamentos:', resVencAt.error)
    return new Response(JSON.stringify({ ok: false, error: resVencAt.error.message }), { status: 500 })
  }

  const todoLancamentos = [
    ...(resVencAt.data || []),
    ...(resVencNull.data || []),
    ...(resProxAt.data || []),
    ...(resProxNull.data || []),
  ]

  if (filtroClienteId) console.log(`🔍 Filtro ativo: clienteId=${filtroClienteId}`)

  console.log(`📋 Faturas encontradas: ${todoLancamentos.length}`)

  // ----------------------------------------------------------------
  // Mapa de inadimplência por cliente (a partir das vencidas já buscadas).
  // Cliente com atraso >= 4 dias (régua: Inadimplente) recebe cobrança SÓ
  // da fatura MAIS ANTIGA — nada de aviso de fatura nova/a vencer enquanto
  // a dívida existe, e nada de várias mensagens no mesmo dia. Trava feita
  // AQUI no servidor de propósito: funciona mesmo que o sistema (que
  // suspende as mensalidades futuras no login) fique dias sem ser aberto.
  // ----------------------------------------------------------------
  const msDia = 24 * 60 * 60 * 1000
  const inadimplencia = new Map<string, { maxAtraso: number; oldestId: string }>()
  for (const lanc of [...(resVencAt.data || []), ...(resVencNull.data || [])]) {
    const d = lanc.dados as Record<string, string>
    const cid = d?.clienteId
    if (!cid || !d?.data) continue
    const atraso = Math.round((new Date(hoje).getTime() - new Date(d.data).getTime()) / msDia)
    const atual = inadimplencia.get(cid)
    if (!atual || atraso > atual.maxAtraso) inadimplencia.set(cid, { maxAtraso: atraso, oldestId: lanc.id })
  }

  if (todoLancamentos.length === 0) {
    return new Response(JSON.stringify({
      ok: true,
      enviados: 0,
      msg: 'Nenhuma fatura a notificar.'
    }), { status: 200 })
  }

  // Ninguém é pulado por status de cliente: toda fatura que entrou na janela
  // acima gera aviso — inadimplente também pode (e deve) pagar. O corte de
  // "vencida há mais de 3 dias" no modo automático é feito na busca, não aqui.

  let enviados = 0
  let erros = 0
  const resultados: Array<{ cliente: string; numero: string; status: string; motivo?: string }> = []

  for (const lanc of todoLancamentos) {
    const dados = lanc.dados as Record<string, string>
    const clienteId = dados?.clienteId
    const valor = dados?.valor || dados?.valorTotal || dados?.valorFatura || '0'
    const dataVenc = dados?.data || ''

    if (!clienteId) {
      console.log(`⚠️ Lançamento ${lanc.id} sem clienteId`)
      resultados.push({ cliente: '?', numero: '-', status: 'pulado', motivo: 'sem clienteId' })
      continue
    }

    // Dias exatos até o vencimento (negativo = vencido há X dias)
    const msPerDia = 24 * 60 * 60 * 1000
    const diasRestantes = dataVenc
      ? Math.round((new Date(dataVenc).getTime() - new Date(hoje).getTime()) / msPerDia)
      : 0
    const diasAtraso = -diasRestantes

    // Trava de inadimplência do modo automático: cliente com atraso >= 4
    // dias só recebe cobrança da fatura MAIS ANTIGA (a dívida) — as outras
    // faturas dele (novas, a vencer, vencidas mais recentes) ficam mudas
    // até a dívida ser paga. Modo manual (?clienteId) ignora a trava.
    const inf = inadimplencia.get(clienteId)
    if (!filtroClienteId && inf && inf.maxAtraso >= 4 && lanc.id !== inf.oldestId) {
      console.log(`⏭️ Lançamento ${lanc.id} pulado — cliente inadimplente (${inf.maxAtraso}d), cobrança focada na fatura mais antiga`)
      resultados.push({ cliente: clienteId, numero: '-', status: 'pulado', motivo: `cliente inadimplente ${inf.maxAtraso}d — só a fatura mais antiga é cobrada` })
      continue
    }

    // Ritmo do modo automático: vencida há mais de 3 dias só entra no
    // ciclo de 5 em 5 dias de atraso (5, 10, 15, ...) — aí vai a mensagem
    // de incentivo/novidades. No modo manual (?clienteId, botão 📲 Cobrar)
    // não há ritmo: o clique é a decisão, envia sempre.
    if (!filtroClienteId && diasAtraso > 3 && diasAtraso % 5 !== 0) {
      console.log(`⏭️ Lançamento ${lanc.id} vencido há ${diasAtraso} dias — fora do ciclo de 5 em 5, pulado hoje`)
      resultados.push({ cliente: clienteId, numero: '-', status: 'pulado', motivo: `atraso ${diasAtraso}d fora do ciclo 5/5` })
      continue
    }

    // Busca dados do cliente
    const { data: cliente, error: errCli } = await sb
      .from('cli_clientes')
      .select('dados')
      .eq('id', clienteId)
      .single()

    if (errCli || !cliente) {
      console.log(`⚠️ Cliente ${clienteId} não encontrado: ${errCli?.message}`)
      resultados.push({ cliente: clienteId, numero: '-', status: 'pulado', motivo: 'cliente não encontrado' })
      continue
    }

    const cliDados = cliente.dados as Record<string, string>
    const nome = cliDados?.nome || 'Cliente'

    const telRaw = cliDados?.whatsapp || cliDados?.celular || cliDados?.telefone || ''
    const telefone = normalizarTelefone(telRaw)

    if (!telefone) {
      console.log(`⚠️ ${nome}: telefone inválido (${telRaw})`)
      resultados.push({ cliente: nome, numero: telRaw || '-', status: 'pulado', motivo: 'sem telefone' })
      continue
    }

    // Saudação por horário de Brasília
    const hora = agora.getHours()
    const saudacao = hora >= 6 && hora < 12 ? 'Bom dia'
                   : hora >= 12 && hora < 18 ? 'Boa tarde'
                   : 'Boa noite'

    const dataFormatada = formatarData(dataVenc)
    const valorFormatado = formatarValor(valor)

    const tipoLog = diasRestantes < 0
      ? `vencido há ${Math.abs(diasRestantes)} dia(s)`
      : diasRestantes === 0 ? 'vence hoje'
      : `vence em ${diasRestantes} dia(s)`

    console.log(`📤 ${nome} — ${tipoLog} (${dataVenc})`)

    // Gera link Pix do Mercado Pago para todas as faturas (vencidas ou não)
    // Para vencidas, usa hoje como expiração (fim do dia) para o MP aceitar
    let linkPix: string | null = null
    if (MP_TOKEN) {
      const valorNum = parseFloat(String(valor || '0'))
      if (valorNum > 0) {
        const idempKey = `servnet-${lanc.id}-${hoje}`
        const descPix = `Mensalidade Servnet - ${nome}`
        const dataExpiracao = diasRestantes >= 0 ? (dataVenc || hoje) : hoje
        linkPix = await gerarLinkPix(valorNum, nome, descPix, dataExpiracao, idempKey, lanc.id)
      }
    }

    const mensagem = montarMensagem(saudacao, nome, valorFormatado, dataFormatada, diasRestantes, linkPix)

    const ok = await enviarWhatsApp(telefone, mensagem)
    if (ok) {
      enviados++
      resultados.push({ cliente: nome, numero: telefone, status: 'enviado' })
    } else {
      erros++
      resultados.push({ cliente: nome, numero: telefone, status: 'erro' })
    }

    await new Promise(r => setTimeout(r, 1000))
  }

  const resumo = {
    ok: true,
    data: hoje,
    faturas_encontradas: todoLancamentos.length,
    enviados,
    erros,
    resultados,
  }

  console.log('📊 Resumo:', JSON.stringify(resumo))

  return new Response(JSON.stringify(resumo), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
