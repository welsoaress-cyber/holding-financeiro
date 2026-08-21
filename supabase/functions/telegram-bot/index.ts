import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { enviarTelegram, TG_API, TG_CHAT_ID } from '../_shared/telegram.ts'

// ----------------------------------------------------------------
// Variáveis de ambiente
// ----------------------------------------------------------------
const SB_URL    = Deno.env.get('SUPABASE_URL')!
const SB_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVO_URL   = Deno.env.get('EVOLUTION_API_URL')    || 'http://163.176.122.177:8080'
const EVO_KEY   = Deno.env.get('EVOLUTION_API_KEY')    || 'servnet-evo-2026'
const EVO_INST  = Deno.env.get('EVOLUTION_INSTANCE')   || 'servnet'
const WH_URL    = Deno.env.get('WHATSAPP_LEMBRETES_URL') || ''  // URL da Edge Function whatsapp-lembretes

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function formatBRL(v: string | number | null): string {
  const n = parseFloat(String(v || '0'))
  if (isNaN(n)) return 'R$ 0,00'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function hoje(): string {
  const d = new Date()
  d.setHours(d.getHours() - 3) // BRT
  return d.toISOString().split('T')[0]
}

async function responder(chatId: number | string, texto: string) {
  await fetch(`${TG_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: texto,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })
}

// ----------------------------------------------------------------
// Comandos
// ----------------------------------------------------------------

async function cmdStatus(chatId: number): Promise<string> {
  // Verifica Evolution API
  let apiStatus = '🔴 Offline'
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(`${EVO_URL}/instance/connectionState/${EVO_INST}`, {
      headers: { apikey: EVO_KEY }, signal: ctrl.signal,
    })
    clearTimeout(t)
    if (res.ok) {
      const json = await res.json()
      const estado = json?.instance?.state ?? json?.state ?? 'desconhecido'
      apiStatus = estado === 'open' ? '🟢 Online' : `🟡 ${estado}`
    }
  } catch { /* timeout */ }

  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const data = agora.toLocaleDateString('pt-BR')

  return `📡 <b>Status do sistema</b>\n\n` +
    `WhatsApp: ${apiStatus}\n` +
    `Horário BRT: ${hora} de ${data}\n\n` +
    `<i>Use /resumo para ver os dados do negócio.</i>`
}

async function cmdResumo(chatId: number, sb: ReturnType<typeof createClient>): Promise<string> {
  const h = hoje()
  const mesAtual = h.slice(0, 7) // YYYY-MM

  // Lançamentos do mês (inativo=false OU inativo ausente)
  const [resLancAtivo, resLancNull] = await Promise.all([
    sb.from('lancamentos').select('dados').eq('dados->>inativo', 'false'),
    sb.from('lancamentos').select('dados').is('dados->>inativo', null),
  ])
  const lancs = [...(resLancAtivo.data || []), ...(resLancNull.data || [])]

  const receitas = (lancs || []).filter((l: any) => {
    const d = l.dados
    return d?.tipo === 'Receita' && (d?.data || '').startsWith(mesAtual)
  })
  const despesas = (lancs || []).filter((l: any) => {
    const d = l.dados
    return d?.tipo === 'Despesa' && (d?.data || '').startsWith(mesAtual)
  })
  const vencidos = (lancs || []).filter((l: any) => {
    const d = l.dados
    return d?.tipo === 'Receita' && d?.status !== 'Pago' && d?.status !== 'pago' && (d?.data || '') < h
  })

  const totalReceita = receitas.reduce((s: number, l: any) => s + parseFloat(String(l.dados?.valor || 0)), 0)
  const totalDespesa = despesas.reduce((s: number, l: any) => s + parseFloat(String(l.dados?.valor || 0)), 0)
  const totalVencido = vencidos.reduce((s: number, l: any) => s + parseFloat(String(l.dados?.valor || 0)), 0)

  // Clientes ativos (inativo=false OU inativo ausente)
  const [resCliAtivo, resCliNull] = await Promise.all([
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).eq('dados->>inativo', 'false'),
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).is('dados->>inativo', null),
  ])
  const totalClientes = (resCliAtivo.count || 0) + (resCliNull.count || 0)

  const mes = mesAtual.split('-')
  const nomeMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mes[1]) - 1]

  return `📊 <b>Resumo — ${nomeMes}/${mes[0]}</b>\n\n` +
    `💰 Receita: <b>${formatBRL(totalReceita)}</b>\n` +
    `🔴 Despesas: <b>${formatBRL(totalDespesa)}</b>\n` +
    `📈 Saldo: <b>${formatBRL(totalReceita - totalDespesa)}</b>\n\n` +
    `👥 Clientes ativos: <b>${totalClientes || 0}</b>\n` +
    `⚠️ Inadimplentes: <b>${formatBRL(totalVencido)}</b> em aberto\n\n` +
    `<i>Use /inadimplentes para ver a lista completa.</i>`
}

async function cmdInadimplentes(chatId: number, sb: ReturnType<typeof createClient>): Promise<string> {
  const h = hoje()

  const [resAt, resNull] = await Promise.all([
    sb.from('lancamentos').select('id, dados').eq('dados->>tipo', 'Receita')
      .neq('dados->>status', 'Pago').eq('dados->>inativo', 'false').lt('dados->>data', h),
    sb.from('lancamentos').select('id, dados').eq('dados->>tipo', 'Receita')
      .neq('dados->>status', 'Pago').is('dados->>inativo', null).lt('dados->>data', h),
  ])

  const todos = [...(resAt.data || []), ...(resNull.data || [])]
  if (todos.length === 0) return '✅ <b>Nenhum inadimplente!</b> Todas as faturas estão em dia.'

  // Agrupa por cliente (pior atraso)
  const mapaCliente = new Map<string, { clienteId: string; valor: number; diasAtraso: number; dataVenc: string }>()
  for (const lanc of todos) {
    const d = lanc.dados as any
    const cid = d?.clienteId
    if (!cid) continue
    const valor = parseFloat(String(d?.valor || 0))
    const msPerDia = 86400000
    const dias = Math.round((new Date(h).getTime() - new Date(d?.data || h).getTime()) / msPerDia)
    const atual = mapaCliente.get(cid)
    if (!atual || dias > atual.diasAtraso) {
      mapaCliente.set(cid, { clienteId: cid, valor, diasAtraso: dias, dataVenc: d?.data || '' })
    }
  }

  // Busca nomes
  const clienteIds = [...mapaCliente.keys()]
  const { data: clientes } = await sb.from('cli_clientes').select('id, dados').in('id', clienteIds)
  const nomeMap = new Map<string, string>()
  for (const c of (clientes || [])) nomeMap.set(c.id, (c.dados as any)?.nome || c.id)

  // Ordena por atraso
  const lista = [...mapaCliente.values()].sort((a, b) => b.diasAtraso - a.diasAtraso)
  const totalGeral = lista.reduce((s, l) => s + l.valor, 0)

  let txt = `⚠️ <b>Inadimplentes (${lista.length})</b> — Total: <b>${formatBRL(totalGeral)}</b>\n\n`
  for (const item of lista.slice(0, 20)) {
    const nome = nomeMap.get(item.clienteId) || item.clienteId
    txt += `• <b>${nome}</b> — ${formatBRL(item.valor)} (${item.diasAtraso}d atraso)\n`
  }
  if (lista.length > 20) txt += `\n<i>...e mais ${lista.length - 20} clientes.</i>`

  return txt
}

async function cmdClientes(chatId: number, sb: ReturnType<typeof createClient>): Promise<string> {
  const h = hoje()
  const mesAtual = h.slice(0, 7)

  const [resAtivo, resNulo] = await Promise.all([
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).eq('dados->>inativo', 'false'),
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).is('dados->>inativo', null),
  ])
  const ativos = (resAtivo.count || 0) + (resNulo.count || 0)
  const { count: total } = await sb.from('cli_clientes').select('id', { count: 'exact', head: true })

  return `👥 <b>Clientes</b>\n\n` +
    `Ativos: <b>${ativos || 0}</b>\n` +
    `Total cadastrado: <b>${total || 0}</b>\n\n` +
    `<i>Use /resumo para ver receita e inadimplência.</i>`
}

async function cmdDisparar(chatId: number): Promise<string> {
  if (!WH_URL) return '❌ URL da função whatsapp-lembretes não configurada (WHATSAPP_LEMBRETES_URL).'
  try {
    const res = await fetch(WH_URL, { method: 'GET' })
    const json = await res.json()
    if (json?.ok) {
      return `✅ <b>Disparo concluído!</b>\n\nEnviados: ${json.enviados}\nErros: ${json.erros}\nFaturas: ${json.faturas_encontradas}`
    }
    return `❌ Erro no disparo: ${json?.error || 'resposta inesperada'}`
  } catch (err) {
    return `❌ Exceção ao disparar: ${err}`
  }
}

// ----------------------------------------------------------------
// Handler principal
// ----------------------------------------------------------------
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('ok', { status: 200 })
  }

  let update: any
  try {
    update = await req.json()
  } catch {
    return new Response('bad request', { status: 400 })
  }

  const msg = update?.message
  if (!msg) return new Response('ok')

  const chatId: number = msg.chat?.id
  const texto: string  = (msg.text || '').trim()
  const adminId = parseInt(TG_CHAT_ID)

  // Segurança: só responde ao admin
  if (chatId !== adminId) {
    await responder(chatId, '⛔ Acesso não autorizado.')
    return new Response('ok')
  }

  const sb = createClient(SB_URL, SB_SECRET)
  const cmd = texto.split(' ')[0].toLowerCase().replace('@servnet_admin_bot', '')

  let resposta = ''

  switch (cmd) {
    case '/start':
      resposta = `👋 <b>Servnet Admin</b>\n\nComandos disponíveis:\n\n` +
        `/status — WhatsApp online?\n` +
        `/resumo — Receita e saldo do mês\n` +
        `/inadimplentes — Lista de inadimplentes\n` +
        `/clientes — Total de clientes ativos\n` +
        `/disparar — Dispara WhatsApp agora`
      break

    case '/status':
      resposta = await cmdStatus(chatId)
      break

    case '/resumo':
      resposta = await cmdResumo(chatId, sb)
      break

    case '/inadimplentes':
      resposta = await cmdInadimplentes(chatId, sb)
      break

    case '/clientes':
      resposta = await cmdClientes(chatId, sb)
      break

    case '/disparar':
      await responder(chatId, '⏳ Disparando mensagens...')
      resposta = await cmdDisparar(chatId)
      break

    default:
      resposta = `❓ Comando não reconhecido: <code>${cmd}</code>\n\nUse /start para ver os comandos.`
  }

  if (resposta) await responder(chatId, resposta)
  return new Response('ok')
})
