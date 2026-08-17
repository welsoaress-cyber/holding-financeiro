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
  diasRestantes: number
): string {
  const assinatura = `\n💰 *${valorFormatado}*\nPix: welsoaress@gmail.com\n\nEm caso de dúvidas, entre em contato conosco.`

  // ── Vencidos ──────────────────────────────────────────────────
  if (diasRestantes <= -3) {
    const dias = Math.abs(diasRestantes)
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `⚠️ Sua fatura venceu *há ${dias} dias* (${dataFormatada}) e ainda não identificamos o pagamento. ` +
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
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `Lembrando que sua fatura vence *hoje* (${dataFormatada}).\n\n` +
      `💰 *${valorFormatado}*\nPix: welsoaress@gmail.com\n\nEm caso de dúvidas, entre em contato conosco. 😊`
  }

  // ── A vencer ──────────────────────────────────────────────────
  if (diasRestantes === 1) {
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `Sua fatura vence *amanhã* (${dataFormatada}).\n\n` +
      `💰 *${valorFormatado}*\nPix: welsoaress@gmail.com\n\nEm caso de dúvidas, entre em contato conosco. 😊`
  }
  if (diasRestantes === 2) {
    return `${saudacao}, *${nome}*! 👋\n\n` +
      `Sua fatura vence em *2 dias* (${dataFormatada}).\n\n` +
      `💰 *${valorFormatado}*\nPix: welsoaress@gmail.com\n\nEm caso de dúvidas, entre em contato conosco. 😊`
  }
  // 3 dias
  return `${saudacao}, *${nome}*! 👋\n\n` +
    `Sua fatura vence em *3 dias* (${dataFormatada}).\n\n` +
    `💰 *${valorFormatado}*\nPix: welsoaress@gmail.com\n\nEm caso de dúvidas, entre em contato conosco. 😊`
}

// ----------------------------------------------------------------
// Função principal
// ----------------------------------------------------------------
serve(async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

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

  // Datas passadas (vencidos)
  const alvoOntem     = addDias(agora, -1)
  const alvo2diasAtras = addDias(agora, -2)
  const alvo3diasAtras = addDias(agora, -3)

  // Disparo único diário (9h): vencidos (até 3 dias atrás) + hoje + próximos 3 dias
  const todasDatas = [alvo3diasAtras, alvo2diasAtras, alvoOntem, hoje, alvo1dia, alvo2dias, alvo3dias]

  console.log(`🗓️ Hoje: ${hoje} | Datas: ${todasDatas.join(', ')}`)

  // ----------------------------------------------------------------
  // Busca faturas não pagas dentro da janela de notificação
  // ----------------------------------------------------------------
  const { data: lancamentosAtivos, error } = await sb
    .from('lancamentos')
    .select('id, dados, user_id')
    .eq('dados->>tipo', 'Receita')
    .neq('dados->>status', 'Pago')
    .eq('dados->>inativo', 'false')
    .in('dados->>data', todasDatas)

  if (error) {
    console.error('❌ Erro ao buscar lançamentos:', error)
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 })
  }

  // Inclui lançamentos sem campo inativo definido (null = ativo)
  const { data: lancamentosNull } = await sb
    .from('lancamentos')
    .select('id, dados, user_id')
    .eq('dados->>tipo', 'Receita')
    .neq('dados->>status', 'Pago')
    .is('dados->>inativo', null)
    .in('dados->>data', todasDatas)

  const todoLancamentos = [
    ...(lancamentosAtivos || []),
    ...(lancamentosNull || []),
  ]

  console.log(`📋 Faturas encontradas: ${todoLancamentos.length}`)

  if (todoLancamentos.length === 0) {
    return new Response(JSON.stringify({
      ok: true,
      enviados: 0,
      msg: 'Nenhuma fatura a notificar.'
    }), { status: 200 })
  }

  // ----------------------------------------------------------------
  // Identifica inadimplentes: clientes com faturas não pagas FORA da
  // janela de notificação (vencidas há mais de 3 dias). Esses clientes
  // não recebem aviso de novas parcelas — só a mais antiga aparece
  // dentro da janela, ou já saiu dela e ninguém mais avisa.
  // ----------------------------------------------------------------
  const clienteIdsNaJanela = [
    ...new Set(
      todoLancamentos
        .map(l => (l.dados as Record<string, string>)?.clienteId)
        .filter((id): id is string => !!id)
    ),
  ]

  const inadimplentesSet = new Set<string>()

  if (clienteIdsNaJanela.length > 0) {
    const [{ data: devAt }, { data: devNull }] = await Promise.all([
      sb.from('lancamentos')
        .select('dados')
        .eq('dados->>tipo', 'Receita')
        .neq('dados->>status', 'Pago')
        .eq('dados->>inativo', 'false')
        .lt('dados->>data', alvo3diasAtras)
        .in('dados->>clienteId', clienteIdsNaJanela),
      sb.from('lancamentos')
        .select('dados')
        .eq('dados->>tipo', 'Receita')
        .neq('dados->>status', 'Pago')
        .is('dados->>inativo', null)
        .lt('dados->>data', alvo3diasAtras)
        .in('dados->>clienteId', clienteIdsNaJanela),
    ])

    for (const d of [...(devAt || []), ...(devNull || [])]) {
      const cid = (d.dados as Record<string, string>)?.clienteId
      if (cid) inadimplentesSet.add(cid)
    }

    if (inadimplentesSet.size > 0) {
      console.log(`🚫 Inadimplentes bloqueados (dívida fora da janela): ${inadimplentesSet.size}`)
    }
  }

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

    // Pula clientes inadimplentes (têm dívida vencida fora da janela)
    if (inadimplentesSet.has(clienteId)) {
      console.log(`⏭️ Lançamento ${lanc.id} pulado — cliente ${clienteId} inadimplente`)
      resultados.push({ cliente: clienteId, numero: '-', status: 'pulado', motivo: 'inadimplente' })
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

    // Calcula quantos dias faltam (negativo = vencido)
    const dataFormatada = formatarData(dataVenc)
    const valorFormatado = formatarValor(valor)
    const diasRestantes =
      dataVenc === alvo3diasAtras ? -3 :
      dataVenc === alvo2diasAtras ? -2 :
      dataVenc === alvoOntem      ? -1 :
      dataVenc === hoje           ?  0 :
      dataVenc === alvo1dia       ?  1 :
      dataVenc === alvo2dias      ?  2 : 3

    const tipoLog = diasRestantes < 0
      ? `vencido há ${Math.abs(diasRestantes)} dia(s)`
      : diasRestantes === 0 ? 'vence hoje'
      : `vence em ${diasRestantes} dia(s)`

    console.log(`📤 ${nome} — ${tipoLog} (${dataVenc})`)

    const mensagem = montarMensagem(saudacao, nome, valorFormatado, dataFormatada, diasRestantes)

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
