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
  // Remove tudo que não é dígito
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 0) return null

  // Já tem código do país
  if (digits.startsWith('55') && digits.length >= 12) return digits

  // DDD + número (10 ou 11 dígitos)
  if (digits.length === 10 || digits.length === 11) return `55${digits}`

  // Apenas número sem DDD (improvável, mas trata)
  if (digits.length === 8 || digits.length === 9) return null

  return digits
}

// ----------------------------------------------------------------
// Envia mensagem WhatsApp via Evolution API
// ----------------------------------------------------------------
async function enviarWhatsApp(numero: string, mensagem: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

    const res = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: 'POST',
      headers: {
        'apikey': EVO_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: numero,
        text: mensagem,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const err = await res.text()
      console.error(`❌ Erro ao enviar para ${numero}:`, err)
      return false
    }

    console.log(`✅ Mensagem enviada para ${numero}`)
    return true
  } catch (err) {
    console.error(`❌ Exceção ao enviar para ${numero}:`, err)
    return false
  }
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
// Função principal
// ----------------------------------------------------------------
serve(async (req) => {
  // Permite chamada manual via GET ou POST (para o cron usar POST)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Lê parâmetro "modo" do body:
  // "manha" → só envia lembrete "vence hoje" (cron das 9h)
  // "noite" ou ausente → envia bloqueado (hoje) + lembretes 1/2/3 dias (cron das 22h15)
  let modo = 'noite'
  try {
    if (req.method === 'POST') {
      const body = await req.json()
      if (body?.modo === 'manha') modo = 'manha'
    }
  } catch {
    // body vazio ou inválido — mantém 'noite'
  }

  console.log(`🕐 Modo: ${modo}`)

  const sb = createClient(SB_URL, SB_SECRET)

  // Data de hoje (UTC ajustado para Brasil UTC-3)
  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hoje = agora.toISOString().split('T')[0]

  // Datas alvo: hoje + 1, + 2 e + 3 dias
  const data1dia = new Date(agora)
  data1dia.setDate(data1dia.getDate() + 1)
  const alvo1dia = data1dia.toISOString().split('T')[0]

  const data2dias = new Date(agora)
  data2dias.setDate(data2dias.getDate() + 2)
  const alvo2dias = data2dias.toISOString().split('T')[0]

  const data3dias = new Date(agora)
  data3dias.setDate(data3dias.getDate() + 3)
  const alvo3dias = data3dias.toISOString().split('T')[0]

  // Modo manhã: só verifica faturas que vencem HOJE
  // Modo noite: verifica hoje (bloqueado) + 1, 2 e 3 dias (lembretes)
  const todasDatas = modo === 'manha'
    ? [hoje]
    : [hoje, alvo1dia, alvo2dias, alvo3dias]

  console.log(`🗓️ Hoje: ${hoje} | Datas verificadas: ${todasDatas.join(', ')}`)

  // ----------------------------------------------------------------
  // Busca faturas não pagas nas datas alvo
  // ----------------------------------------------------------------
  const { data: lancamentos, error } = await sb
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

  // Filtra também lançamentos onde inativo não está definido (null = ativo)
  const { data: lancamentosNull } = await sb
    .from('lancamentos')
    .select('id, dados, user_id')
    .eq('dados->>tipo', 'Receita')
    .neq('dados->>status', 'Pago')
    .is('dados->>inativo', null)
    .in('dados->>data', todasDatas)

  const todoLancamentos = [
    ...(lancamentos || []),
    ...(lancamentosNull || []),
  ]

  console.log(`📋 Faturas encontradas: ${todoLancamentos.length}`)

  if (todoLancamentos.length === 0) {
    return new Response(JSON.stringify({
      ok: true,
      modo,
      enviados: 0,
      msg: 'Nenhuma fatura a notificar.'
    }), { status: 200 })
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
      console.log(`⚠️ Lançamento ${lanc.id} sem clienteId — campos disponíveis: ${Object.keys(dados || {}).join(', ')}`)
      resultados.push({ cliente: '?', numero: '-', status: 'pulado', motivo: 'sem clienteId' })
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

    // Tenta whatsapp, celular ou telefone
    const telRaw = cliDados?.whatsapp || cliDados?.celular || cliDados?.telefone || ''
    const telefone = normalizarTelefone(telRaw)

    if (!telefone) {
      const campos = Object.keys(cliDados || {}).join(', ')
      console.log(`⚠️ ${nome}: telefone inválido (${telRaw}) — campos disponíveis: ${campos}`)
      resultados.push({ cliente: nome, numero: telRaw || '-', status: 'pulado', motivo: `telefone vazio — campos: ${campos}` })
      continue
    }

    // Saudação baseada no horário de Brasília
    const hora = agora.getHours()
    let saudacao: string
    if (hora >= 6 && hora < 12) {
      saudacao = 'Bom dia'
    } else if (hora >= 12 && hora < 18) {
      saudacao = 'Boa tarde'
    } else {
      saudacao = 'Boa noite'
    }

    // Monta mensagem personalizada
    const dataFormatada = formatarData(dataVenc)
    const valorFormatado = formatarValor(valor)
    const diasRestantes = dataVenc === hoje ? 0 : dataVenc === alvo1dia ? 1 : dataVenc === alvo2dias ? 2 : 3

    let mensagem: string
    if (diasRestantes === 0 && modo === 'manha') {
      // Lembrete suave: vence hoje (enviado de manhã)
      mensagem = `${saudacao}, *${nome}*! 👋\n\n` +
        `Lembrando que sua fatura vence *hoje* (${dataFormatada}).\n\n` +
        `💰 *${valorFormatado}*\n` +
        `Pix: welsoaress@gmail.com\n\n` +
        `Em caso de dúvidas, entre em contato conosco. 😊`
    } else if (diasRestantes === 0) {
      // Acesso bloqueado (enviado à noite, não pagou no dia)
      mensagem = `${saudacao}, *${nome}*! 👋\n\n` +
        `Não identificamos o seu pagamento, com isso infelizmente seu acesso foi temporariamente bloqueado.\n\n` +
        `💰 *${valorFormatado}*\n` +
        `Pix: welsoaress@gmail.com\n\n` +
        `Em caso de dúvidas, entre em contato conosco.`
    } else if (diasRestantes === 1) {
      mensagem = `${saudacao}, *${nome}*! 👋\n\n` +
        `Gostaria de lembrar que seu vencimento é *amanhã* (${dataFormatada}).\n\n` +
        `💰 *${valorFormatado}*\n` +
        `Pix: welsoaress@gmail.com\n\n` +
        `Em caso de dúvidas, entre em contato conosco. 😊`
    } else if (diasRestantes === 2) {
      mensagem = `${saudacao}, *${nome}*! 👋\n\n` +
        `Gostaria de lembrar que seu vencimento é em *2 dias* (${dataFormatada}).\n\n` +
        `💰 *${valorFormatado}*\n` +
        `Pix: welsoaress@gmail.com\n\n` +
        `Em caso de dúvidas, entre em contato conosco. 😊`
    } else {
      mensagem = `${saudacao}, *${nome}*! 👋\n\n` +
        `Gostaria de lembrar que seu vencimento é em *3 dias* (${dataFormatada}).\n\n` +
        `💰 *${valorFormatado}*\n` +
        `Pix: welsoaress@gmail.com\n\n` +
        `Em caso de dúvidas, entre em contato conosco. 😊`
    }

    // Envia mensagem
    const ok = await enviarWhatsApp(telefone, mensagem)
    if (ok) {
      enviados++
      resultados.push({ cliente: nome, numero: telefone, status: 'enviado' })
    } else {
      erros++
      resultados.push({ cliente: nome, numero: telefone, status: 'erro' })
    }

    // Pequena pausa entre envios para não sobrecarregar
    await new Promise(r => setTimeout(r, 1000))
  }

  const resumo = {
    ok: true,
    modo,
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
