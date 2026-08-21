import { getSB } from './supabase.ts'
import {
  hojeISO, toISO, dataNoMes, dataVencida, mesAnterior, diasNoMes, diaAtual,
} from '../utils/date.ts'
import { pct } from '../utils/formatters.ts'
import type {
  NegCod, ResumoStats, ProjecaoStats, InadimpItem, ClientesStats, ConsolidadoItem,
} from '../types/index.ts'

// ----------------------------------------------------------------
// Configuração dos negócios
// ----------------------------------------------------------------
export const NEGOCIOS: Record<NegCod, { nome: string; emoji: string; dbNome: string }> = {
  sv: { nome: 'Servidor',     emoji: '🖥️', dbNome: 'Servidor'     },
  sn: { nome: 'ServNet',      emoji: '📡', dbNome: 'ServNet'      },
  pt: { nome: 'Precautec',    emoji: '⚙️', dbNome: 'Precautec'   },
  po: { nome: 'Porto Odonto', emoji: '🦷', dbNome: 'Porto Odonto' },
}

export function getWhUrl(neg: NegCod): string {
  const urls: Record<NegCod, string> = {
    sv: Deno.env.get('WH_URL_SV') || '',
    sn: Deno.env.get('WH_URL_SN') || Deno.env.get('WHATSAPP_LEMBRETES_URL') || '',
    pt: Deno.env.get('WH_URL_PT') || '',
    po: Deno.env.get('WH_URL_PO') || '',
  }
  return urls[neg]
}

// ----------------------------------------------------------------
// Helpers internos
// ----------------------------------------------------------------
export function isInadimp(status: string): boolean {
  return (status || '').toLowerCase() !== 'pago'
}

function somaValor(arr: any[]): number {
  return arr.reduce((s: number, l: any) => s + parseFloat(String(l.dados?.valor || 0)), 0)
}

async function buscarLancs(dbNome?: string) {
  const sb = getSB()
  let q1 = sb.from('lancamentos').select('dados').eq('dados->>inativo', 'false')
  let q2 = sb.from('lancamentos').select('dados').is('dados->>inativo', null)
  if (dbNome) {
    q1 = q1.eq('dados->>negocio', dbNome)
    q2 = q2.eq('dados->>negocio', dbNome)
  }
  const [r1, r2] = await Promise.all([q1, q2])
  return [...(r1.data || []), ...(r2.data || [])]
}

async function buscarClientes(dbNome?: string) {
  const sb = getSB()
  let q1 = sb.from('cli_clientes').select('id, dados').eq('dados->>inativo', 'false')
  let q2 = sb.from('cli_clientes').select('id, dados').is('dados->>inativo', null)
  let qT = sb.from('cli_clientes').select('id, dados')
  if (dbNome) {
    q1 = q1.eq('dados->>negocio', dbNome)
    q2 = q2.eq('dados->>negocio', dbNome)
    qT = qT.eq('dados->>negocio', dbNome)
  }
  const [r1, r2, rT] = await Promise.all([q1, q2, qT])
  return {
    ativos: [...(r1.data || []), ...(r2.data || [])],
    total: rT.data || [],
  }
}

// ----------------------------------------------------------------
// Funções públicas
// ----------------------------------------------------------------
export async function getResumo(neg: NegCod): Promise<ResumoStats> {
  const h      = hojeISO()
  const mesAt  = h.slice(0, 7)
  const mesAnt = mesAnterior(mesAt)
  const dbNome = NEGOCIOS[neg].dbNome

  const [lancs, { ativos }] = await Promise.all([
    buscarLancs(dbNome),
    buscarClientes(dbNome),
  ])

  const recAt  = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && dataNoMes(l.dados?.data, mesAt))
  const recAnt = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && dataNoMes(l.dados?.data, mesAnt))
  const desAt  = lancs.filter((l: any) => l.dados?.tipo === 'Despesa' && dataNoMes(l.dados?.data, mesAt))
  const desAnt = lancs.filter((l: any) => l.dados?.tipo === 'Despesa' && dataNoMes(l.dados?.data, mesAnt))

  const totalRec  = somaValor(recAt)
  const totalRecA = somaValor(recAnt)
  const totalDes  = somaValor(desAt)
  const totalDesA = somaValor(desAnt)
  const pagas     = recAt.filter((l: any) => !isInadimp(l.dados?.status))
  const pendentes = recAt.filter((l: any) => isInadimp(l.dados?.status))
  const totalPago = somaValor(pagas)
  const totalPend = somaValor(pendentes)
  const vencidos  = lancs.filter((l: any) =>
    l.dados?.tipo === 'Receita' && isInadimp(l.dados?.status) && dataVencida(l.dados?.data, h)
  )
  const totalVenc = somaValor(vencidos)
  const nInadimp  = new Set(vencidos.map((l: any) => l.dados?.clienteId).filter(Boolean)).size

  return {
    totalRec, totalPago, totalPend, totalDes,
    totalRecAnt: totalRecA, totalDesAnt: totalDesA,
    saldo: totalRec - totalDes, saldoAnt: totalRecA - totalDesA,
    taxaRec: pct(totalPago, totalRec),
    ticketMedio: pagas.length > 0 ? totalPago / pagas.length : 0,
    totalVenc, nClientes: ativos.length, nInadimp,
  }
}

export async function getInadimplentes(
  neg: NegCod,
): Promise<{ lista: InadimpItem[]; nomeMap: Map<string, string> }> {
  const sb     = getSB()
  const h      = hojeISO()
  const dbNome = NEGOCIOS[neg].dbNome

  let q1 = sb.from('lancamentos').select('id, dados')
    .eq('dados->>tipo', 'Receita').neq('dados->>status', 'Pago').eq('dados->>inativo', 'false')
  let q2 = sb.from('lancamentos').select('id, dados')
    .eq('dados->>tipo', 'Receita').neq('dados->>status', 'Pago').is('dados->>inativo', null)
  q1 = q1.eq('dados->>negocio', dbNome)
  q2 = q2.eq('dados->>negocio', dbNome)

  const [r1, r2] = await Promise.all([q1, q2])
  const todos = [...(r1.data || []), ...(r2.data || [])]
    .filter((l: any) => isInadimp(l.dados?.status) && dataVencida(l.dados?.data, h))

  const mapa = new Map<string, InadimpItem>()
  for (const lanc of todos) {
    const d   = lanc.dados as any
    const cid = d?.clienteId
    if (!cid) continue
    const valor    = parseFloat(String(d?.valor || 0))
    const dataISO  = toISO(d?.data || h)
    const dias     = Math.round((new Date(h).getTime() - new Date(dataISO).getTime()) / 86400000)
    const atual    = mapa.get(cid)
    if (!atual) {
      mapa.set(cid, { clienteId: cid, valor, diasAtraso: dias, faturas: 1 })
    } else {
      atual.valor += valor
      atual.faturas++
      if (dias > atual.diasAtraso) atual.diasAtraso = dias
    }
  }

  const ids = [...mapa.keys()]
  const nomeMap = new Map<string, string>()
  if (ids.length > 0) {
    const { data: clientes } = await getSB()
      .from('cli_clientes').select('id, dados').in('id', ids)
    for (const c of (clientes || [])) {
      nomeMap.set(c.id, (c.dados as any)?.nome || c.id)
    }
  }

  return {
    lista: [...mapa.values()].sort((a, b) => b.diasAtraso - a.diasAtraso),
    nomeMap,
  }
}

export async function getClientes(neg: NegCod): Promise<ClientesStats> {
  const h      = hojeISO()
  const mesAt  = h.slice(0, 7)
  const mesAnt = mesAnterior(mesAt)
  const dbNome = NEGOCIOS[neg].dbNome
  const { ativos, total } = await buscarClientes(dbNome)

  const novosAt  = total.filter((c: any) =>
    dataNoMes(c.dados?.dataCadastro || c.dados?.createdAt || '', mesAt))
  const novosAnt = total.filter((c: any) =>
    dataNoMes(c.dados?.dataCadastro || c.dados?.createdAt || '', mesAnt))

  const planoMap = new Map<string, number>()
  for (const c of ativos) {
    const plano = (c.dados as any)?.plano || (c.dados as any)?.nomePlano || 'Sem plano'
    planoMap.set(plano, (planoMap.get(plano) || 0) + 1)
  }

  return {
    ativos: ativos.length, total: total.length,
    inativos: total.length - ativos.length,
    novosAt: novosAt.length, novosAnt: novosAnt.length,
    planos: [...planoMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
  }
}

export async function getProjecao(neg: NegCod): Promise<ProjecaoStats> {
  const h      = hojeISO()
  const mesAt  = h.slice(0, 7)
  const dbNome = NEGOCIOS[neg].dbNome
  const lancs  = await buscarLancs(dbNome)

  const recAt    = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && dataNoMes(l.dados?.data, mesAt))
  const desAt    = lancs.filter((l: any) => l.dados?.tipo === 'Despesa' && dataNoMes(l.dados?.data, mesAt))
  const pagas    = recAt.filter((l: any) => !isInadimp(l.dados?.status))
  const aReceber = recAt.filter((l: any) => isInadimp(l.dados?.status) && !dataVencida(l.dados?.data, h))

  const totalPrev = somaValor(recAt)
  const totalPago = somaValor(pagas)
  const totalARec = somaValor(aReceber)
  const totalDes  = somaValor(desAt)

  const totalDias  = diasNoMes(mesAt)
  const diaHoje    = diaAtual()
  const diasRest   = totalDias - diaHoje
  const progresso  = Math.round((diaHoje / totalDias) * 100)
  const taxaDiaria = diaHoje > 0 ? totalPago / diaHoje : 0
  const projecaoFim = totalPago + taxaDiaria * diasRest
  const confianca  = progresso >= 70 ? 'Alta' : progresso >= 40 ? 'Média' : 'Baixa'

  return {
    totalPrev, totalPago, totalARec, totalDes,
    totalDias, diaHoje, diasRest, progresso,
    projecaoFim, saldoProj: projecaoFim - totalDes,
    confianca, nFaturasARec: aReceber.length,
  }
}

export async function getConsolidado(): Promise<ConsolidadoItem[]> {
  const negs: NegCod[] = ['sv', 'sn', 'pt', 'po']
  return Promise.all(negs.map(async (neg) => {
    const h      = hojeISO()
    const mesAt  = h.slice(0, 7)
    const dbNome = NEGOCIOS[neg].dbNome

    const [lancs, { ativos, total }] = await Promise.all([
      buscarLancs(dbNome),
      buscarClientes(dbNome),
    ])

    const recAt   = lancs.filter((l: any) => l.dados?.tipo === 'Receita' && dataNoMes(l.dados?.data, mesAt))
    const vencidos = lancs.filter((l: any) =>
      l.dados?.tipo === 'Receita' && isInadimp(l.dados?.status) && dataVencida(l.dados?.data, h)
    )
    const mesAnt  = mesAnterior(mesAt)
    const novosAt = total.filter((c: any) =>
      dataNoMes(c.dados?.dataCadastro || c.dados?.createdAt || '', mesAt)
    )

    return {
      neg,
      totalRec:  somaValor(recAt),
      totalVenc: somaValor(vencidos),
      ativos:    ativos.length,
      novosAt:   novosAt.length,
    }
  }))
}

export async function dispararWhatsApp(
  whUrl: string,
): Promise<{ ok: boolean; enviados?: number; erros?: number; faturas?: number; erro?: string }> {
  if (!whUrl) return { ok: false, erro: 'URL de disparo não configurada para este negócio' }
  try {
    const res  = await fetch(whUrl, { method: 'GET' })
    const json = await res.json()
    if (json?.ok) return { ok: true, enviados: json.enviados, erros: json.erros, faturas: json.faturas_encontradas }
    return { ok: false, erro: json?.error || 'resposta inesperada' }
  } catch (e) {
    return { ok: false, erro: String(e) }
  }
}
