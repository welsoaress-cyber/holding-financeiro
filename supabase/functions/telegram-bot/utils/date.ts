export function agoraBRT(): Date {
  const d = new Date()
  d.setHours(d.getHours() - 3)
  return d
}

export function hojeISO(): string {
  return agoraBRT().toISOString().split('T')[0]
}

// Converte "DD/MM/YYYY" → "YYYY-MM-DD". ISO passa direto.
export function toISO(dataStr: string): string {
  if (!dataStr) return ''
  if (dataStr.length === 10 && dataStr[2] === '/' && dataStr[5] === '/') {
    const [dd, mm, yyyy] = dataStr.split('/')
    return `${yyyy}-${mm}-${dd}`
  }
  return dataStr
}

export function dataNoMes(dataStr: string, mes: string): boolean {
  return toISO(dataStr).startsWith(mes)
}

export function dataVencida(dataStr: string, hoje: string): boolean {
  if (!dataStr) return false
  return toISO(dataStr) < hoje
}

export function mesAnterior(mesAtual: string): string {
  const [y, m] = mesAtual.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function diasNoMes(mesAtual: string): number {
  const [y, m] = mesAtual.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function diaAtual(): number {
  return agoraBRT().getDate()
}

export function nomeMes(mesISO: string): string {
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return meses[parseInt(mesISO.split('-')[1]) - 1]
}

export function dataHoraBRT(): string {
  const d = agoraBRT()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`
}
