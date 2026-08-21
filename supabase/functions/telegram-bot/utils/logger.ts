export function log(
  level: 'INFO' | 'WARN' | 'ERROR',
  msg: string,
  meta?: Record<string, unknown>,
): void {
  const entry = { ts: new Date().toISOString(), level, msg, ...(meta || {}) }
  if (level === 'ERROR') console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}
