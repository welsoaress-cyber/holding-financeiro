import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TG_API, TG_CHAT_ID } from '../_shared/telegram.ts'

// ----------------------------------------------------------------
// Variáveis de ambiente
// ----------------------------------------------------------------
const SB_URL    = Deno.env.get('SUPABASE_URL')!
const SB_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVO_URL   = Deno.env.get('EVOLUTION_API_URL')    || 'http://163.176.122.177:8080'
const EVO_KEY   = Deno.env.get('EVOLUTION_API_KEY')    || 'servnet-evo-2026'
const EVO_INST  = Deno.env.get('EVOLUTION_INSTANCE')   || 'servnet'
const WH_URL    = Deno.env.get('WHATSAPP_LEMBRETES_URL') || ''

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
  d.setHours(d.getHours() - 3)
  return d.toISOString().split('T')[0]
}

// ----------------------------------------------------------------
// Envio de mensagem com botões opcionais
// ----------------------------------------------------------------
async function enviar(
  chatId: number | string,
  texto: string,
  teclado?: object,
  messageId?: number,
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: texto,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }
  if (teclado) body.reply_markup = teclado

  // Se tiver messageId, edita a mensagem (callback de botão)
  const endpoint = messageId ? 'editMessageText' : 'sendMessage'
  if (messageId) body.message_id = messageId

  await fetch(`${TG_API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function answerCallback(callbackId: string) {
  await fetch(`${TG_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId }),
  })
}

// ----------------------------------------------------------------
// Teclado do menu principal
// ----------------------------------------------------------------
const MENU_TECLADO = {
  inline_keyboard: [
    [
      { text: '📡 Status WhatsApp', callback_data: 'status' },
      { text: '📊 Resumo do mês',   callback_data: 'resumo' },
    ],
    [
      { text: '⚠️ Inadimplentes',   callback_data: 'inadimplentes' },
      { text: '👥 Clientes',        callback_data: 'clientes' },
    ],
    [
      { text: '🚀 Disparar WhatsApp agora', callback_data: 'disparar' },
    ],
  ],
}

const BTN_MENU = {
  inline_keyboard: [[{ text: '🏠 Voltar ao menu', callback_data: 'menu' }]],
}

// ----------------------------------------------------------------
// Comandos
// ----------------------------------------------------------------
async function cmdStatus(): Promise<string> {
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

  return (
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📡  <b>Status do Sistema</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `WhatsApp:  ${apiStatus}\n` +
    `🕐 BRT:  <b>${hora}</b> de ${data}\n\n` +
    `<i>Use /resumo para ver os dados financeiros.</i>`
  )
}

async function cmdResumo(sb: ReturnType<typeof createClient>): Promise<string> {
  const h = hoje()
  const mesAtual = h.slice(0, 7)

  const [resLancAtivo, resLancNull] = await Promise.all([
    sb.from('lancamentos').select('dados').eq('dados->>inativo', 'false'),
    sb.from('lancamentos').select('dados').is('dados->>inativo', null),
  ])
  const lancs = [...(resLancAtivo.data || []), ...(resLancNull.data || [])]

  const receitas = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && (l.dados?.data || '').startsWith(mesAtual))
  const despesas = lancs.filter((l: any) => l.dados?.tipo === 'Despesa' && (l.dados?.data || '').startsWith(mesAtual))
  const vencidos = lancs.filter((l: any) =>
    l.dados?.tipo === 'Receita' &&
    l.dados?.status !== 'Pago' && l.dados?.status !== 'pago' &&
    (l.dados?.data || '') < h
  )

  const totalReceita = receitas.reduce((s: number, l: any) => s + parseFloat(String(l.dados?.valor || 0)), 0)
  const totalDespesa = despesas.reduce((s: number, l: any) => s + parseFloat(String(l.dados?.valor || 0)), 0)
  const totalVencido = vencidos.reduce((s: number, l: any) => s + parseFloat(String(l.dados?.valor || 0)), 0)
  const saldo = totalReceita - totalDespesa

  const [resCliAtivo, resCliNull] = await Promise.all([
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).eq('dados->>inativo', 'false'),
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).is('dados->>inativo', null),
  ])
  const totalClientes = (resCliAtivo.count || 0) + (resCliNull.count || 0)

  const mes = mesAtual.split('-')
  const nomeMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mes[1]) - 1]
  const saldoEmoji = saldo >= 0 ? '📈' : '📉'

  return (
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📊  <b>Resumo — ${nomeMes}/${mes[0]}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💰  Receita:    <b>${formatBRL(totalReceita)}</b>\n` +
    `🔴  Despesas:   <b>${formatBRL(totalDespesa)}</b>\n` +
    `${saldoEmoji}  Saldo:      <b>${formatBRL(saldo)}</b>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥  Clientes ativos:  <b>${totalClientes}</b>\n` +
    `⚠️  Inadimplência:    <b>${formatBRL(totalVencido)}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━`
  )
}

async function cmdInadimplentes(sb: ReturnType<typeof createClient>): Promise<string> {
  const h = hoje()

  const [resAt, resNull] = await Promise.all([
    sb.from('lancamentos').select('id, dados').eq('dados->>tipo', 'Receita')
      .neq('dados->>status', 'Pago').eq('dados->>inativo', 'false').lt('dados->>data', h),
    sb.from('lancamentos').select('id, dados').eq('dados->>tipo', 'Receita')
      .neq('dados->>status', 'Pago').is('dados->>inativo', null).lt('dados->>data', h),
  ])

  const todos = [...(resAt.data || []), ...(resNull.data || [])]
  if (todos.length === 0) return '✅  <b>Nenhum inadimplente!</b>\n\nTodas as faturas estão em dia. 🎉'

  const mapaCliente = new Map<string, { clienteId: string; valor: number; diasAtraso: number }>()
  for (const lanc of todos) {
    const d = lanc.dados as any
    const cid = d?.clienteId
    if (!cid) continue
    const valor = parseFloat(String(d?.valor || 0))
    const dias = Math.round((new Date(h).getTime() - new Date(d?.data || h).getTime()) / 86400000)
    const atual = mapaCliente.get(cid)
    if (!atual || dias > atual.diasAtraso) {
      mapaCliente.set(cid, { clienteId: cid, valor, diasAtraso: dias })
    }
  }

  const clienteIds = [...mapaCliente.keys()]
  const { data: clientes } = await sb.from('cli_clientes').select('id, dados').in('id', clienteIds)
  const nomeMap = new Map<string, string>()
  for (const c of (clientes || [])) nomeMap.set(c.id, (c.dados as any)?.nome || c.id)

  const lista = [...mapaCliente.values()].sort((a, b) => b.diasAtraso - a.diasAtraso)
  const totalGeral = lista.reduce((s, l) => s + l.valor, 0)

  let txt =
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚠️  <b>Inadimplentes (${lista.length})</b>\n` +
    `💸  Total: <b>${formatBRL(totalGeral)}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n`

  for (const item of lista.slice(0, 15)) {
    const nome = nomeMap.get(item.clienteId) || item.clienteId
    const urgencia = item.diasAtraso >= 30 ? '🔴' : item.diasAtraso >= 7 ? '🟡' : '🟠'
    txt += `${urgencia} <b>${nome}</b>\n   ${formatBRL(item.valor)} · ${item.diasAtraso}d em atraso\n\n`
  }
  if (lista.length > 15) txt += `<i>...e mais ${lista.length - 15} clientes.</i>`

  return txt.trim()
}

async function cmdClientes(sb: ReturnType<typeof createClient>): Promise<string> {
  const [resAtivo, resNulo, resTotal] = await Promise.all([
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).eq('dados->>inativo', 'false'),
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }).is('dados->>inativo', null),
    sb.from('cli_clientes').select('id', { count: 'exact', head: true }),
  ])
  const ativos = (resAtivo.count || 0) + (resNulo.count || 0)
  const total  = resTotal.count || 0
  const inativos = total - ativos

  return (
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥  <b>Clientes</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🟢  Ativos:    <b>${ativos}</b>\n` +
    `🔴  Inativos:  <b>${inativos}</b>\n` +
    `📋  Total:     <b>${total}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━`
  )
}

async function cmdDisparar(): Promise<string> {
  if (!WH_URL) return '❌ URL da função whatsapp-lembretes não configurada.'
  try {
    const res = await fetch(WH_URL, { method: 'GET' })
    const json = await res.json()
    if (json?.ok) {
      return (
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `🚀  <b>Disparo concluído!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `✅  Enviados:  <b>${json.enviados}</b>\n` +
        `❌  Erros:     <b>${json.erros}</b>\n` +
        `📄  Faturas:   <b>${json.faturas_encontradas}</b>`
      )
    }
    return `❌ Erro no disparo: ${json?.error || 'resposta inesperada'}`
  } catch (err) {
    return `❌ Exceção ao disparar: ${err}`
  }
}

function textoMenu(): string {
  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return (
    `👋  <b>Servnet Admin</b>\n\n` +
    `Olá! Escolha uma opção abaixo:\n\n` +
    `🕐  ${hora} BRT`
  )
}

// ----------------------------------------------------------------
// Handler principal
// ----------------------------------------------------------------
serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 })

  let update: any
  try { update = await req.json() } catch { return new Response('bad request', { status: 400 }) }

  const adminId = parseInt(TG_CHAT_ID)

  // ── Callback de botão ──────────────────────────────────────────
  if (update?.callback_query) {
    const cb = update.callback_query
    const chatId: number = cb.message?.chat?.id
    const messageId: number = cb.message?.message_id
    const data: string = cb.data || ''

    if (chatId !== adminId) {
      await answerCallback(cb.id)
      return new Response('ok')
    }

    await answerCallback(cb.id)
    const sb = createClient(SB_URL, SB_SECRET)

    let texto = ''
    let teclado: object = BTN_MENU

    switch (data) {
      case 'menu':
        texto  = textoMenu()
        teclado = MENU_TECLADO
        break
      case 'status':
        texto = await cmdStatus()
        break
      case 'resumo':
        texto = await cmdResumo(sb)
        break
      case 'inadimplentes':
        texto = await cmdInadimplentes(sb)
        break
      case 'clientes':
        texto = await cmdClientes(sb)
        break
      case 'disparar':
        texto   = '⏳  Disparando mensagens WhatsApp...'
        teclado = {}
        await enviar(chatId, texto, undefined, messageId)
        texto   = await cmdDisparar()
        teclado = BTN_MENU
        await enviar(chatId, texto, teclado)
        return new Response('ok')
    }

    if (texto) await enviar(chatId, texto, teclado, messageId)
    return new Response('ok')
  }

  // ── Mensagem de texto ──────────────────────────────────────────
  const msg = update?.message
  if (!msg) return new Response('ok')

  const chatId: number = msg.chat?.id
  const texto: string  = (msg.text || '').trim()

  if (chatId !== adminId) {
    await enviar(chatId, '⛔ Acesso não autorizado.')
    return new Response('ok')
  }

  const sb  = createClient(SB_URL, SB_SECRET)
  const cmd = texto.split(' ')[0].toLowerCase().replace('@servnet_admin_bot', '')

  let resposta = ''
  let teclado: object | undefined = BTN_MENU

  switch (cmd) {
    case '/start':
    case '/menu':
      resposta = textoMenu()
      teclado  = MENU_TECLADO
      break
    case '/status':
      resposta = await cmdStatus()
      break
    case '/resumo':
      resposta = await cmdResumo(sb)
      break
    case '/inadimplentes':
      resposta = await cmdInadimplentes(sb)
      break
    case '/clientes':
      resposta = await cmdClientes(sb)
      break
    case '/disparar':
      await enviar(chatId, '⏳  Disparando mensagens WhatsApp...')
      resposta = await cmdDisparar()
      break
    default:
      resposta = `❓ Comando não reconhecido: <code>${cmd}</code>\n\nUse /start para ver o menu.`
      teclado  = MENU_TECLADO
  }

  if (resposta) await enviar(chatId, resposta, teclado)
  return new Response('ok')
})
