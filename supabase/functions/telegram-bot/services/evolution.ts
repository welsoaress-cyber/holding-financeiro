const EVO_URL  = Deno.env.get('EVOLUTION_API_URL')  || 'http://163.176.122.177:8080'
const EVO_KEY  = Deno.env.get('EVOLUTION_API_KEY')  || 'servnet-evo-2026'
const EVO_INST = Deno.env.get('EVOLUTION_INSTANCE') || 'servnet'

export async function getWhatsAppStatus(): Promise<{ status: string; ping: string }> {
  const ctrl = new AbortController()
  const t0 = Date.now()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(`${EVO_URL}/instance/connectionState/${EVO_INST}`, {
      headers: { apikey: EVO_KEY },
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const ping = `${Date.now() - t0}ms`
    if (res.ok) {
      const j = await res.json()
      const estado = j?.instance?.state ?? j?.state ?? 'desconhecido'
      return { status: estado === 'open' ? '🟢 Online' : `🟡 ${estado}`, ping }
    }
    return { status: '🔴 Offline', ping }
  } catch {
    clearTimeout(timer)
    return { status: '🔴 Offline', ping: 'timeout' }
  }
}
