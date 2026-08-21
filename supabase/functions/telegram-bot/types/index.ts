export type Role = 'Master' | 'Administrador' | 'Operador'
export type NegCod = 'sv' | 'sn' | 'pt' | 'po'

export interface BotUsuario {
  telegram_id: number
  nome: string
  role: Role
  negocios: NegCod[]
  ativo: boolean
}

export interface NegocioConfig {
  nome: string
  emoji: string
  dbNome: string
}

export interface ResumoStats {
  totalRec: number
  totalPago: number
  totalPend: number
  totalDes: number
  totalRecAnt: number
  totalDesAnt: number
  saldo: number
  saldoAnt: number
  taxaRec: string
  ticketMedio: number
  totalVenc: number
  nClientes: number
  nInadimp: number
}

export interface ProjecaoStats {
  totalPrev: number
  totalPago: number
  totalARec: number
  totalDes: number
  totalDias: number
  diaHoje: number
  diasRest: number
  progresso: number
  projecaoFim: number
  saldoProj: number
  confianca: string
  nFaturasARec: number
}

export interface InadimpItem {
  clienteId: string
  valor: number
  diasAtraso: number
  faturas: number
}

export interface ClientesStats {
  ativos: number
  total: number
  inativos: number
  novosAt: number
  novosAnt: number
  planos: [string, number][]
}

export interface ConsolidadoItem {
  neg: NegCod
  totalRec: number
  totalVenc: number
  ativos: number
  novosAt: number
}
