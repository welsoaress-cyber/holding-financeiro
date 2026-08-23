export function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function pct(part: number, total: number): string {
  if (!total) return '0%'
  return `${((part / total) * 100).toFixed(1)}%`
}

export function variacao(atual: number, anterior: number): string {
  if (!anterior) return atual > 0 ? '🆕 novo' : '—'
  const diff = ((atual - anterior) / anterior) * 100
  if (diff > 0) return `▲ ${diff.toFixed(0)}%`
  if (diff < 0) return `▼ ${Math.abs(diff).toFixed(0)}%`
  return 'Estável'
}
