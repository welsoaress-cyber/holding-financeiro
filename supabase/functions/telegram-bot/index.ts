import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TG_API, TG_CHAT_ID } from '../_shared/telegram.ts'

// ----------------------------------------------------------------
// Versão
// ----------------------------------------------------------------
const BOT_VERSION = '1.1.0'

// ----------------------------------------------------------------
// Env
// ----------------------------------------------------------------
const SB_URL    = Deno.env.get('SUPABASE_URL')!
const SB_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVO_URL   = Deno.env.get('EVOLUTION_API_URL')  || 'http://163.176.122.177:8080'
const EVO_KEY   = Deno.env.get('EVOLUTION_API_KEY')  || 'servnet-evo-2026'
const EVO_INST  = Deno.env.get('EVOLUTION_INSTANCE') || 'servnet'
const WH_URL    = Deno.env.get('WHATSAPP_LEMBRETES_URL') || ''

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function pct(part: number, total: number): string {
  if (!total) return '0%'
  return `${((part / total) * 100).toFixed(1)}%`
}

function variacao(atual: number, anterior: number): string {
  if (!anterior) return atual > 0 ? '🆕 novo' : '—'
  const diff = ((atual - anterior) / anterior) * 100
  if (diff > 0) return `📈 +${diff.toFixed(1)}%`
  if (diff < 0) return `📉 ${diff.toFixed(1)}%`
  return '➡️ estável'
}

function hoje(): string {
  const d = new Date()
  d.setHours(d.getHours() - 3)
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}

// Converte "DD/MM/YYYY" → "YYYY-MM-DD". Datas já em ISO passam direto.
function toISO(dataStr: string): string {
  if (!dataStr) return ''
  if (dataStr.length === 10 && dataStr[2] === '/' && dataStr[5] === '/') {
    const [dd, mm, yyyy] = dataStr.split('/')
    return `${yyyy}-${mm}-${dd}`
  }
  return dataStr
}

// Verifica se uma data (qualquer formato) pertence ao mês "YYYY-MM"
function dataNoMes(dataStr: string, mes: string): boolean {
  return toISO(dataStr).startsWith(mes)
}

// True se a data já passou (inadimplente)
function dataVencida(dataStr: string, hoje: string): boolean {
  return toISO(dataStr) < hoje
}

// True se o status indica inadimplente
function isInadimplente(status: string): boolean {
  const s = (status || '').toLowerCase()
  return s !== 'pago' // pega Pendente, Vencido, vencido, etc.
}

function mesAnterior(mesAtual: string): string {
  const [y, m] = mesAtual.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function diasNoMes(mesAtual: string): number {
  const [y, m] = mesAtual.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function diaAtual(): number {
  const d = new Date()
  d.setHours(d.getHours() - 3)
  return d.getDate()
}

// ----------------------------------------------------------------
// Carregar todos os lançamentos (ativo + null)
// ----------------------------------------------------------------
async function carregarLancamentos(sb: ReturnType<typeof createClient>) {
  const [resAt, resNull] = await Promise.all([
    sb.from('lancamentos').select('dados').eq('dados->>inativo', 'false'),
    sb.from('lancamentos').select('dados').is('dados->>inativo', null),
  ])
  return [...(resAt.data || []), ...(resNull.data || [])]
}

async function carregarClientes(sb: ReturnType<typeof createClient>) {
  const [resAt, resNull, resTotal] = await Promise.all([
    sb.from('cli_clientes').select('id, dados').eq('dados->>inativo', 'false'),
    sb.from('cli_clientes').select('id, dados').is('dados->>inativo', null),
    sb.from('cli_clientes').select('id, dados'),
  ])
  const ativos = [...(resAt.data || []), ...(resNull.data || [])]
  return { ativos, total: resTotal.data || [] }
}

// ----------------------------------------------------------------
// Telegram helpers
// ----------------------------------------------------------------
async function enviar(chatId: number | string, texto: string, teclado?: object, messageId?: number) {
  const body: Record<string, unknown> = {
    chat_id: chatId, text: texto, parse_mode: 'HTML', disable_web_page_preview: true,
  }
  if (teclado) body.reply_markup = teclado
  const endpoint = messageId ? 'editMessageText' : 'sendMessage'
  if (messageId) body.message_id = messageId
  try {
    await fetch(`${TG_API}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // Se editMessageText falhar (ex: "message not modified"), envia nova mensagem
    if (messageId) {
      await fetch(`${TG_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'HTML',
          disable_web_page_preview: true, ...(teclado ? { reply_markup: teclado } : {}) }),
      })
    }
  }
}

async function answerCallback(id: string) {
  await fetch(`${TG_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id }),
  })
}

// ----------------------------------------------------------------
// Teclados
// ----------------------------------------------------------------
const MENU_TECLADO = {
  inline_keyboard: [
    [{ text: '📡 Status WhatsApp',       callback_data: 'status'        }],
    [{ text: '📊 Resumo do mês',          callback_data: 'resumo'        }],
    [{ text: '⚠️ Inadimplentes',          callback_data: 'inadimplentes' }],
    [{ text: '👥 Clientes',              callback_data: 'clientes'      }],
    [{ text: '🔮 Projeção do mês',        callback_data: 'projecao'      }],
    [{ text: '🚀 Disparar WhatsApp agora', callback_data: 'disparar'     }],
  ],
}

const BTN_MENU = {
  inline_keyboard: [[{ text: '🏠 Menu', callback_data: 'menu' }]],
}

// ================================================================
// COMANDOS ANALÍTICOS
// ================================================================

// ── Status ───────────────────────────────────────────────────────
async function cmdStatus(): Promise<string> {
  let apiStatus = '🔴 Offline'
  let ping = '—'
  try {
    const ctrl = new AbortController()
    const t0 = Date.now()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(`${EVO_URL}/instance/connectionState/${EVO_INST}`, {
      headers: { apikey: EVO_KEY }, signal: ctrl.signal,
    })
    clearTimeout(timer)
    ping = `${Date.now() - t0}ms`
    if (res.ok) {
      const json = await res.json()
      const estado = json?.instance?.state ?? json?.state ?? 'desconhecido'
      apiStatus = estado === 'open' ? '🟢 Online' : `🟡 ${estado}`
    }
  } catch { ping = 'timeout' }

  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📡  <b>Status do Sistema</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `WhatsApp API:  ${apiStatus}\n` +
    `Latência:       <code>${ping}</code>\n` +
    `Instância:      <code>${EVO_INST}</code>\n\n` +
    `🕐  <b>${hora}</b>\n` +
    `📅  ${data.charAt(0).toUpperCase() + data.slice(1)}\n\n` +
    `<i>Bot v${BOT_VERSION}</i>`
  )
}

// ── Resumo analítico ─────────────────────────────────────────────
async function cmdResumo(sb: ReturnType<typeof createClient>): Promise<string> {
  const h       = hoje()
  const mesAt   = h.slice(0, 7)
  const mesAnt  = mesAnterior(mesAt)
  const [yM, mM] = mesAt.split('-')
  const nomeMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mM) - 1]

  const lancs = await carregarLancamentos(sb)

  // Filtros por mês (suporta DD/MM/YYYY e YYYY-MM-DD)
  const recAt  = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && dataNoMes(l.dados?.data, mesAt))
  const recAnt = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && dataNoMes(l.dados?.data, mesAnt))
  const desAt  = lancs.filter((l: any) => l.dados?.tipo === 'Despesa' && dataNoMes(l.dados?.data, mesAt))
  const desAnt = lancs.filter((l: any) => l.dados?.tipo === 'Despesa' && dataNoMes(l.dados?.data, mesAnt))

  const somaValor = (arr: any[]) => arr.reduce((s, l) => s + parseFloat(String(l.dados?.valor || 0)), 0)

  const totalRec  = somaValor(recAt)
  const totalRecA = somaValor(recAnt)
  const totalDes  = somaValor(desAt)
  const totalDesA = somaValor(desAnt)
  const saldo     = totalRec - totalDes
  const saldoAnt  = totalRecA - totalDesA

  // Pagamentos: receitas do mês
  const pagas    = recAt.filter((l: any) => !isInadimplente(l.dados?.status))
  const pendentes = recAt.filter((l: any) => isInadimplente(l.dados?.status))
  const totalPago = somaValor(pagas)
  const totalPend = somaValor(pendentes)
  const taxaRec   = pct(totalPago, totalRec)

  // Ticket médio
  const ticketMedio = pagas.length > 0 ? totalPago / pagas.length : 0

  // Inadimplência geral: Vencido ou Pendente com data no passado
  const vencidos   = lancs.filter((l: any) =>
    l.dados?.tipo === 'Receita' &&
    isInadimplente(l.dados?.status) &&
    dataVencida(l.dados?.data, h)
  )
  const totalVenc  = somaValor(vencidos)

  // Clientes ativos
  const { ativos } = await carregarClientes(sb)
  const nAtivos = ativos.length

  const saldoEmoji = saldo >= 0 ? '📈' : '📉'

  return (
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📊  <b>Resumo — ${nomeMes}/${yM}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>💰 RECEITA</b>\n` +
    `  Total previsto:  <b>${formatBRL(totalRec)}</b>\n` +
    `  Recebido:        <b>${formatBRL(totalPago)}</b>  (${taxaRec})\n` +
    `  A receber:       ${formatBRL(totalPend)}\n` +
    `  vs mês anterior: ${variacao(totalRec, totalRecA)}\n\n` +
    `<b>🔴 DESPESAS</b>\n` +
    `  Total:           <b>${formatBRL(totalDes)}</b>\n` +
    `  vs mês anterior: ${variacao(totalDes, totalDesA)}\n\n` +
    `<b>${saldoEmoji} SALDO</b>\n` +
    `  Líquido:         <b>${formatBRL(saldo)}</b>\n` +
    `  vs mês anterior: ${variacao(saldo, saldoAnt)}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>📋 MÉTRICAS</b>\n` +
    `  Ticket médio:    ${formatBRL(ticketMedio)}\n` +
    `  Clientes ativos: <b>${nAtivos}</b>\n` +
    `  Inadimplência:   <b>${formatBRL(totalVenc)}</b>  (${pct(totalVenc, totalRec)} da receita)\n` +
    `━━━━━━━━━━━━━━━━━━━━━`
  )
}

// ── Inadimplentes analítico ───────────────────────────────────────
async function cmdInadimplentes(sb: ReturnType<typeof createClient>): Promise<string> {
  const h = hoje()

  const [resAt, resNull] = await Promise.all([
    sb.from('lancamentos').select('id, dados').eq('dados->>tipo', 'Receita')
      .neq('dados->>status', 'Pago').eq('dados->>inativo', 'false').lt('dados->>data', h),
    sb.from('lancamentos').select('id, dados').eq('dados->>tipo', 'Receita')
      .neq('dados->>status', 'Pago').is('dados->>inativo', null).lt('dados->>data', h),
  ])

  const todos = [...(resAt.data || []), ...(resNull.data || [])]
    .filter((l: any) => isInadimplente(l.dados?.status) && dataVencida(l.dados?.data, h))
  if (!todos.length) return '✅  <b>Nenhum inadimplente!</b>\n\nTodas as faturas estão em dia. 🎉'

  // Agrupa por cliente
  const mapa = new Map<string, { clienteId: string; valor: number; diasAtraso: number; faturas: number }>()
  for (const lanc of todos) {
    const d   = lanc.dados as any
    const cid = d?.clienteId
    if (!cid) continue
    const valor = parseFloat(String(d?.valor || 0))
    const dataISO = toISO(d?.data || h)
    const dias  = Math.round((new Date(h).getTime() - new Date(dataISO).getTime()) / 86400000)
    const atual = mapa.get(cid)
    if (!atual) {
      mapa.set(cid, { clienteId: cid, valor, diasAtraso: dias, faturas: 1 })
    } else {
      atual.valor += valor
      atual.faturas += 1
      if (dias > atual.diasAtraso) atual.diasAtraso = dias
    }
  }

  // Nomes
  const ids = [...mapa.keys()]
  const { data: clientes } = await sb.from('cli_clientes').select('id, dados').in('id', ids)
  const nomeMap = new Map<string, string>()
  for (const c of (clientes || [])) nomeMap.set(c.id, (c.dados as any)?.nome || c.id)

  const lista = [...mapa.values()].sort((a, b) => b.diasAtraso - a.diasAtraso)
  const totalGeral = lista.reduce((s, l) => s + l.valor, 0)

  // Faixas de atraso
  const f7    = lista.filter(l => l.diasAtraso <= 7)
  const f30   = lista.filter(l => l.diasAtraso > 7 && l.diasAtraso <= 30)
  const f60   = lista.filter(l => l.diasAtraso > 30 && l.diasAtraso <= 60)
  const f60p  = lista.filter(l => l.diasAtraso > 60)
  const soma  = (arr: typeof lista) => arr.reduce((s, l) => s + l.valor, 0)

  let txt =
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚠️  <b>Inadimplência</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>FAIXAS DE ATRASO</b>\n` +
    `🟡 Até 7d:    ${f7.length} cliente${f7.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f7))}\n` +
    `🟠 8–30d:     ${f30.length} cliente${f30.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f30))}\n` +
    `🔴 31–60d:    ${f60.length} cliente${f60.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f60))}\n` +
    `🚨 +60d:      ${f60p.length} cliente${f60p.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f60p))}\n\n` +
    `<b>Total geral: ${formatBRL(totalGeral)}</b>  (${lista.length} clientes)\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>TOP INADIMPLENTES</b>\n\n`

  for (const item of lista.slice(0, 12)) {
    const nome    = nomeMap.get(item.clienteId) || item.clienteId
    const risco   = item.diasAtraso > 60 ? '🚨' : item.diasAtraso > 30 ? '🔴' : item.diasAtraso > 7 ? '🟠' : '🟡'
    const fatStr  = item.faturas > 1 ? `  <i>${item.faturas} faturas</i>` : ''
    txt += `${risco} <b>${nome}</b>${fatStr}\n   ${formatBRL(item.valor)}  ·  ${item.diasAtraso}d de atraso\n\n`
  }
  if (lista.length > 12) txt += `<i>...e mais ${lista.length - 12} clientes.</i>`

  return txt.trim()
}

// ── Clientes analítico ────────────────────────────────────────────
async function cmdClientes(sb: ReturnType<typeof createClient>): Promise<string> {
  const h      = hoje()
  const mesAt  = h.slice(0, 7)
  const mesAnt = mesAnterior(mesAt)
  const [yM, mM] = mesAt.split('-')
  const nomeMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mM) - 1]

  const { ativos, total } = await carregarClientes(sb)
  const nAtivos  = ativos.length
  const nTotal   = total.length
  const nInativos = nTotal - nAtivos

  // Novos no mês atual e anterior
  const novosAt  = total.filter((c: any) => (c.dados?.dataCadastro || c.dados?.createdAt || '').startsWith(mesAt))
  const novosAnt = total.filter((c: any) => (c.dados?.dataCadastro || c.dados?.createdAt || '').startsWith(mesAnt))

  // Planos (se existir o campo)
  const planoMap = new Map<string, number>()
  for (const c of ativos) {
    const plano = (c.dados as any)?.plano || (c.dados as any)?.nomePlano || 'Sem plano'
    planoMap.set(plano, (planoMap.get(plano) || 0) + 1)
  }
  const planosOrdenados = [...planoMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  let txt =
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥  <b>Clientes — ${nomeMes}/${yM}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>SITUAÇÃO ATUAL</b>\n` +
    `🟢  Ativos:    <b>${nAtivos}</b>\n` +
    `🔴  Inativos:  <b>${nInativos}</b>\n` +
    `📋  Total:     <b>${nTotal}</b>\n\n` +
    `<b>CRESCIMENTO</b>\n` +
    `  Novos em ${nomeMes}:     <b>${novosAt.length}</b>\n` +
    `  Novos no mês ant.: <b>${novosAnt.length}</b>  ${variacao(novosAt.length, novosAnt.length)}\n`

  if (planosOrdenados.length > 0 && !planosOrdenados.every(p => p[0] === 'Sem plano')) {
    txt += `\n<b>POR PLANO</b>\n`
    for (const [plano, qtd] of planosOrdenados) {
      const barra = '▓'.repeat(Math.round((qtd / nAtivos) * 10)) + '░'.repeat(10 - Math.round((qtd / nAtivos) * 10))
      txt += `  ${barra}  ${plano}: <b>${qtd}</b>  (${pct(qtd, nAtivos)})\n`
    }
  }

  txt += `━━━━━━━━━━━━━━━━━━━━━`
  return txt
}

// ── Projeção ──────────────────────────────────────────────────────
async function cmdProjecao(sb: ReturnType<typeof createClient>): Promise<string> {
  const h      = hoje()
  const mesAt  = h.slice(0, 7)
  const [yM, mM] = mesAt.split('-')
  const nomeMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mM) - 1]

  const lancs = await carregarLancamentos(sb)

  const recAt = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && dataNoMes(l.dados?.data, mesAt))
  const desAt = lancs.filter((l: any) => l.dados?.tipo === 'Despesa' && dataNoMes(l.dados?.data, mesAt))

  const somaValor = (arr: any[]) => arr.reduce((s, l) => s + parseFloat(String(l.dados?.valor || 0)), 0)

  const pagas     = recAt.filter((l: any) => !isInadimplente(l.dados?.status))
  const aReceber  = recAt.filter((l: any) => isInadimplente(l.dados?.status) && !dataVencida(l.dados?.data, h))
  const totalPrev = somaValor(recAt)
  const totalPago = somaValor(pagas)
  const totalARec = somaValor(aReceber)
  const totalDes  = somaValor(desAt)

  const totalDias  = diasNoMes(mesAt)
  const diaHoje    = diaAtual()
  const diasRest   = totalDias - diaHoje
  const progresso  = Math.round((diaHoje / totalDias) * 100)
  const barraLen   = 10
  const preenchido = Math.round((progresso / 100) * barraLen)
  const barra      = '▓'.repeat(preenchido) + '░'.repeat(barraLen - preenchido)

  // Projeção linear de receita até fim do mês
  const taxaDiaria   = diaHoje > 0 ? totalPago / diaHoje : 0
  const projecaoFim  = totalPago + taxaDiaria * diasRest
  const saldoProj    = projecaoFim - totalDes
  const confianca    = progresso >= 70 ? 'Alta' : progresso >= 40 ? 'Média' : 'Baixa'

  return (
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔮  <b>Projeção — ${nomeMes}/${yM}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>PROGRESSO DO MÊS</b>\n` +
    `  ${barra}  ${progresso}%\n` +
    `  Dia ${diaHoje} de ${totalDias}  ·  ${diasRest}d restantes\n\n` +
    `<b>RECEITA</b>\n` +
    `  Prevista total:    ${formatBRL(totalPrev)}\n` +
    `  Recebida até hoje: <b>${formatBRL(totalPago)}</b>\n` +
    `  Agendada (${aReceber.length} fat.): ${formatBRL(totalARec)}\n` +
    `  Projeção fim/mês:  <b>${formatBRL(projecaoFim)}</b>  <i>(${confianca} conf.)</i>\n\n` +
    `<b>DESPESAS</b>\n` +
    `  Registradas:       ${formatBRL(totalDes)}\n\n` +
    `<b>SALDO PROJETADO</b>\n` +
    `  ${saldoProj >= 0 ? '📈' : '📉'} <b>${formatBRL(saldoProj)}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Projeção linear baseada no ritmo dos últimos ${diaHoje} dias.</i>`
  )
}

// ── Disparar ──────────────────────────────────────────────────────
async function cmdDisparar(): Promise<string> {
  if (!WH_URL) return '❌ WHATSAPP_LEMBRETES_URL não configurada.'
  try {
    const res  = await fetch(WH_URL, { method: 'GET' })
    const json = await res.json()
    if (json?.ok) {
      return (
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `🚀  <b>Disparo concluído!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `✅  Enviados:  <b>${json.enviados}</b>\n` +
        `❌  Erros:    <b>${json.erros}</b>\n` +
        `📄  Faturas:  <b>${json.faturas_encontradas}</b>`
      )
    }
    return `❌ Erro: ${json?.error || 'resposta inesperada'}`
  } catch (err) {
    return `❌ Exceção: ${err}`
  }
}

// ----------------------------------------------------------------
// Menu
// ----------------------------------------------------------------
function textoMenu(): string {
  const agora = new Date()
  agora.setHours(agora.getHours() - 3)
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `👋  <b>Servnet Admin</b>  <code>v${BOT_VERSION}</code>\n\nEscolha uma opção:\n\n🕐 ${hora} BRT`
}

// ================================================================
// HANDLER PRINCIPAL
// ================================================================
serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 })

  let update: any
  try { update = await req.json() } catch { return new Response('bad request', { status: 400 }) }

  const adminId = parseInt(TG_CHAT_ID)

  async function executarCmd(cmd: string, sb: ReturnType<typeof createClient>): Promise<[string, object]> {
    let texto = ''
    let teclado: object = BTN_MENU
    switch (cmd) {
      case 'menu':    texto = textoMenu();              teclado = MENU_TECLADO; break
      case 'status':  texto = await cmdStatus();                                break
      case 'resumo':  texto = await cmdResumo(sb);                              break
      case 'inadimplentes': texto = await cmdInadimplentes(sb);                 break
      case 'clientes': texto = await cmdClientes(sb);                           break
      case 'projecao': texto = await cmdProjecao(sb);                           break
    }
    return [texto, teclado]
  }

  // ── Callback de botão ─────────────────────────────────────────
  if (update?.callback_query) {
    const cb      = update.callback_query
    const chatId  = cb.message?.chat?.id
    const msgId   = cb.message?.message_id
    const data    = cb.data || ''
    if (chatId !== adminId) { await answerCallback(cb.id); return new Response('ok') }
    await answerCallback(cb.id)
    const sb = createClient(SB_URL, SB_SECRET)

    if (data === 'disparar') {
      await enviar(chatId, '⏳  Disparando mensagens WhatsApp...', undefined, msgId)
      const texto = await cmdDisparar()
      await enviar(chatId, texto, BTN_MENU)
      return new Response('ok')
    }

    const [texto, teclado] = await executarCmd(data, sb)
    if (texto) await enviar(chatId, texto, teclado, msgId)
    return new Response('ok')
  }

  // ── Mensagem de texto ─────────────────────────────────────────
  const msg = update?.message
  if (!msg) return new Response('ok')

  const chatId = msg.chat?.id
  const texto  = (msg.text || '').trim()
  if (chatId !== adminId) { await enviar(chatId, '⛔ Acesso não autorizado.'); return new Response('ok') }

  const sb  = createClient(SB_URL, SB_SECRET)
  const raw = texto.split(' ')[0].toLowerCase().replace('@servnet_admin_bot', '').replace('/', '')
  const cmd = raw === 'start' ? 'menu' : raw

  if (cmd === 'disparar') {
    await enviar(chatId, '⏳  Disparando mensagens WhatsApp...')
    const resp = await cmdDisparar()
    await enviar(chatId, resp, BTN_MENU)
    return new Response('ok')
  }

  const [resposta, teclado] = await executarCmd(cmd, sb)
  if (resposta) {
    await enviar(chatId, resposta, teclado)
  } else {
    await enviar(chatId, `❓ Comando não reconhecido: <code>/${raw}</code>`, MENU_TECLADO)
  }
  return new Response('ok')
})
