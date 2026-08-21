import { agoraBRT, hojeISO, nomeMes, dataHoraBRT } from '../utils/date.ts'
import { formatBRL, pct, variacao } from '../utils/formatters.ts'
import type {
  BotUsuario, NegCod, ResumoStats, ProjecaoStats, InadimpItem, ClientesStats, ConsolidadoItem,
} from '../types/index.ts'
import { NEGOCIOS } from '../services/analytics.ts'

export const BOT_VERSION = '2.0.0'

// ── Menu principal ───────────────────────────────────────────────
export function txtMenu(usuario: BotUsuario): string {
  const agora = agoraBRT()
  const hora  = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return (
    `🏢 <b>GRUPOTOM</b>  <code>v${BOT_VERSION}</code>\n` +
    `<i>Assistente Administrativo</i>\n\n` +
    `Olá, <b>${usuario.nome}</b>! Escolha um negócio:\n\n` +
    `🕐 ${hora} BRT`
  )
}

// ── Menu do negócio ──────────────────────────────────────────────
export function txtNegocio(cod: NegCod): string {
  const cfg = NEGOCIOS[cod]
  return `${cfg.emoji} <b>${cfg.nome}</b>\n\nEscolha um painel:`
}

// ── Resumo analítico ─────────────────────────────────────────────
export function txtResumo(cod: NegCod, s: ResumoStats): string {
  const h    = hojeISO()
  const mesAt = h.slice(0, 7)
  const [ano] = mesAt.split('-')
  const cfg   = NEGOCIOS[cod]
  const saldoEmoji = s.saldo >= 0 ? '📈' : '📉'
  const taxaPct    = parseFloat(s.taxaRec)
  const taxaEmoji  = taxaPct >= 80 ? '✅' : taxaPct >= 50 ? '⚠️' : '🔴'

  return (
    `📊 <b>RESUMO — ${cfg.nome}</b>\n` +
    `📅 ${nomeMes(mesAt)}/${ano}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>💰 FATURAMENTO</b>\n` +
    `• Previsto:     <b>${formatBRL(s.totalRec)}</b>\n` +
    `• Realizado:    <b>${formatBRL(s.totalPago)}</b>\n` +
    `• A receber:    ${formatBRL(s.totalPend)}\n` +
    `• Taxa receb.:  ${s.taxaRec} ${taxaEmoji}\n\n` +
    `<b>📈 MÊS ANTERIOR</b>\n` +
    `• Receita ant.: ${formatBRL(s.totalRecAnt)}\n` +
    `• Variação:     ${variacao(s.totalRec, s.totalRecAnt)}\n\n` +
    `<b>📉 DESPESAS</b>\n` +
    `• Mês atual:    <b>${formatBRL(s.totalDes)}</b>\n` +
    `• Mês anterior: ${formatBRL(s.totalDesAnt)}\n` +
    `• Variação:     ${variacao(s.totalDes, s.totalDesAnt)}\n\n` +
    `<b>${saldoEmoji} SALDO LÍQUIDO: ${formatBRL(s.saldo)}</b>\n\n` +
    `<b>📌 TICKET MÉDIO: ${formatBRL(s.ticketMedio)}</b>\n` +
    `<b>⚠️ INADIMPLÊNCIA: ${formatBRL(s.totalVenc)}</b>  (${s.nInadimp} clientes)\n\n` +
    `🕒 ${dataHoraBRT()}`
  )
}

// ── Inadimplentes ────────────────────────────────────────────────
export function txtInadimplentes(
  cod: NegCod,
  lista: InadimpItem[],
  nomeMap: Map<string, string>,
): string {
  const cfg = NEGOCIOS[cod]
  if (!lista.length) {
    return (
      `✅ <b>Nenhum inadimplente — ${cfg.nome}</b>\n\n` +
      `Todas as faturas estão em dia. 🎉\n\n` +
      `🕒 ${dataHoraBRT()}`
    )
  }

  const f7   = lista.filter(l => l.diasAtraso <= 7)
  const f30  = lista.filter(l => l.diasAtraso > 7  && l.diasAtraso <= 30)
  const f60  = lista.filter(l => l.diasAtraso > 30 && l.diasAtraso <= 60)
  const f60p = lista.filter(l => l.diasAtraso > 60)
  const soma = (arr: InadimpItem[]) => arr.reduce((s, l) => s + l.valor, 0)
  const total = lista.reduce((s, l) => s + l.valor, 0)

  let txt =
    `⚠️ <b>INADIMPLENTES — ${cfg.nome}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>FAIXAS DE ATRASO</b>\n` +
    `🟡 Até 7d:   ${f7.length} cliente${f7.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f7))}\n` +
    `🟠 8–30d:    ${f30.length} cliente${f30.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f30))}\n` +
    `🔴 31–60d:   ${f60.length} cliente${f60.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f60))}\n` +
    `🚨 +60d:     ${f60p.length} cliente${f60p.length !== 1 ? 's' : ''}  ·  ${formatBRL(soma(f60p))}\n\n` +
    `<b>Total: ${formatBRL(total)}</b>  (${lista.length} clientes)\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>TOP INADIMPLENTES</b>\n\n`

  for (const item of lista.slice(0, 10)) {
    const nome  = nomeMap.get(item.clienteId) || item.clienteId
    const risco = item.diasAtraso > 60 ? '🚨' : item.diasAtraso > 30 ? '🔴' : item.diasAtraso > 7 ? '🟠' : '🟡'
    const fats  = item.faturas > 1 ? `  <i>${item.faturas} fat.</i>` : ''
    txt += `${risco} <b>${nome}</b>${fats}\n   ${formatBRL(item.valor)}  ·  ${item.diasAtraso}d de atraso\n\n`
  }
  if (lista.length > 10) txt += `<i>...e mais ${lista.length - 10} clientes.</i>\n\n`
  txt += `🕒 ${dataHoraBRT()}`
  return txt.trim()
}

// ── Clientes ─────────────────────────────────────────────────────
export function txtClientes(cod: NegCod, s: ClientesStats): string {
  const h    = hojeISO()
  const mesAt = h.slice(0, 7)
  const [ano] = mesAt.split('-')
  const cfg   = NEGOCIOS[cod]

  let txt =
    `👥 <b>CLIENTES — ${cfg.nome}</b>\n` +
    `📅 ${nomeMes(mesAt)}/${ano}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>SITUAÇÃO ATUAL</b>\n` +
    `🟢 Ativos:   <b>${s.ativos}</b>\n` +
    `🔴 Inativos: <b>${s.inativos}</b>\n` +
    `📋 Total:    <b>${s.total}</b>\n\n` +
    `<b>CRESCIMENTO</b>\n` +
    `• Novos em ${nomeMes(mesAt)}: <b>${s.novosAt}</b>\n` +
    `• Mês anterior:    <b>${s.novosAnt}</b>  ${variacao(s.novosAt, s.novosAnt)}\n`

  const planosReais = s.planos.filter(p => p[0] !== 'Sem plano')
  if (planosReais.length > 0) {
    txt += `\n<b>POR PLANO</b>\n`
    for (const [plano, qtd] of s.planos) {
      const fill  = Math.round((qtd / Math.max(s.ativos, 1)) * 10)
      const barra = '▓'.repeat(fill) + '░'.repeat(10 - fill)
      txt += `  ${barra} ${plano}: <b>${qtd}</b> (${pct(qtd, s.ativos)})\n`
    }
  }

  txt += `\n🕒 ${dataHoraBRT()}`
  return txt
}

// ── Projeção ─────────────────────────────────────────────────────
export function txtProjecao(cod: NegCod, s: ProjecaoStats): string {
  const h    = hojeISO()
  const mesAt = h.slice(0, 7)
  const [ano] = mesAt.split('-')
  const cfg   = NEGOCIOS[cod]

  const preenchido = Math.round((s.progresso / 100) * 10)
  const barra      = '▓'.repeat(preenchido) + '░'.repeat(10 - preenchido)
  const saldoEmoji = s.saldoProj >= 0 ? '📈' : '📉'

  return (
    `🔮 <b>PROJEÇÃO — ${cfg.nome}</b>\n` +
    `📅 ${nomeMes(mesAt)}/${ano}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>PROGRESSO DO MÊS</b>\n` +
    `${barra}  ${s.progresso}%\n` +
    `Dia ${s.diaHoje} de ${s.totalDias}  ·  ${s.diasRest}d restantes\n\n` +
    `<b>RECEITA</b>\n` +
    `• Prevista total:     ${formatBRL(s.totalPrev)}\n` +
    `• Recebida até hoje:  <b>${formatBRL(s.totalPago)}</b>\n` +
    `• Agendada (${s.nFaturasARec} fat.): ${formatBRL(s.totalARec)}\n` +
    `• Projeção fim/mês:   <b>${formatBRL(s.projecaoFim)}</b>  <i>(conf. ${s.confianca})</i>\n\n` +
    `<b>DESPESAS</b>\n` +
    `• Registradas: ${formatBRL(s.totalDes)}\n\n` +
    `<b>${saldoEmoji} SALDO PROJETADO: ${formatBRL(s.saldoProj)}</b>\n\n` +
    `<i>Projeção linear — últimos ${s.diaHoje} dias.</i>\n` +
    `🕒 ${dataHoraBRT()}`
  )
}

// ── Status do sistema ────────────────────────────────────────────
export function txtStatus(status: string, ping: string): string {
  const agora = agoraBRT()
  const hora  = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return (
    `📡 <b>STATUS DO SISTEMA</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `WhatsApp API:  ${status}\n` +
    `Latência:      <code>${ping}</code>\n\n` +
    `🕐 ${hora} BRT\n` +
    `🕒 ${dataHoraBRT()}`
  )
}

// ── Consolidado ──────────────────────────────────────────────────
export function txtConsolidado(items: ConsolidadoItem[]): string {
  const h    = hojeISO()
  const mesAt = h.slice(0, 7)
  const [ano] = mesAt.split('-')

  let totalRec = 0, totalInad = 0, totalClientes = 0, totalNovos = 0
  const linhas: string[] = []

  for (const item of items) {
    const cfg = NEGOCIOS[item.neg]
    totalRec      += item.totalRec
    totalInad     += item.totalVenc
    totalClientes += item.ativos
    totalNovos    += item.novosAt
    linhas.push(
      `${cfg.emoji} <b>${cfg.nome}</b>\n` +
      `   Fat: ${formatBRL(item.totalRec)}  ·  Inadimp: ${formatBRL(item.totalVenc)}  ·  Clientes: ${item.ativos}`
    )
  }

  return (
    `📊 <b>CONSOLIDADO — GRUPOTOM</b>\n` +
    `📅 ${nomeMes(mesAt)}/${ano}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💰 <b>RECEITA TOTAL: ${formatBRL(totalRec)}</b>\n` +
    `📤 <b>INADIMPLÊNCIA TOTAL: ${formatBRL(totalInad)}</b>  (${pct(totalInad, totalRec)})\n` +
    `👥 <b>CLIENTES ATIVOS: ${totalClientes}</b>  (+${totalNovos} este mês)\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>POR NEGÓCIO</b>\n\n` +
    linhas.join('\n\n') +
    `\n\n🕒 ${dataHoraBRT()}`
  )
}

// ── Ajuda ────────────────────────────────────────────────────────
export function txtAjuda(): string {
  return (
    `❓ <b>AJUDA — GRUPOTOM Admin</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>COMANDOS</b>\n` +
    `/start — Menu principal\n` +
    `/menu — Menu principal\n` +
    `/servidor — Painel Servidor\n` +
    `/servnet — Painel ServNet\n` +
    `/precautec — Painel Precautec\n` +
    `/portoodonto — Painel Porto Odonto\n` +
    `/consolidado — Visão geral da holding\n` +
    `/ajuda — Esta mensagem\n\n` +
    `<b>PAINÉIS POR NEGÓCIO</b>\n` +
    `📊 Resumo · ⚠️ Inadimplentes · 👥 Clientes\n` +
    `🔮 Projeção · 📡 Status · 🚀 Disparar\n\n` +
    `<b>VERSÃO</b>  <code>v${BOT_VERSION}</code>\n` +
    `🕒 ${dataHoraBRT()}`
  )
}
