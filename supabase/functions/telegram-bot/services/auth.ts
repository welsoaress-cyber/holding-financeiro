import { getSB } from './supabase.ts'
import type { BotUsuario, NegCod } from '../types/index.ts'

const MASTER_ID = parseInt(Deno.env.get('TELEGRAM_ADMIN_CHAT_ID') || '0')
const ALL_NEGS: NegCod[] = ['sv', 'sn', 'pt', 'po']

export async function getUsuario(telegramId: number): Promise<BotUsuario | null> {
  // Admin hardcoded via env → Master com acesso total
  if (MASTER_ID && telegramId === MASTER_ID) {
    return { telegram_id: telegramId, nome: 'Admin', role: 'Master', negocios: ALL_NEGS, ativo: true }
  }

  // Busca na tabela bot_usuarios
  const sb = getSB()
  const { data, error } = await sb
    .from('bot_usuarios')
    .select('telegram_id, nome, role, negocios, ativo')
    .eq('telegram_id', telegramId)
    .eq('ativo', true)
    .single()

  if (error || !data) return null
  return data as BotUsuario
}

export function temAcesso(usuario: BotUsuario, neg: NegCod): boolean {
  return usuario.role === 'Master' || usuario.negocios.includes(neg)
}

export function podeDisparar(usuario: BotUsuario): boolean {
  return usuario.role === 'Master' || usuario.role === 'Administrador'
}
