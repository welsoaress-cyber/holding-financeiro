import type { BotUsuario, NegCod } from '../types/index.ts'
import { NEGOCIOS } from '../services/analytics.ts'

export function kbMenu(usuario: BotUsuario) {
  const negs = (Object.entries(NEGOCIOS) as [NegCod, typeof NEGOCIOS[NegCod]][])
    .filter(([cod]) => usuario.role === 'Master' || usuario.negocios.includes(cod))
    .map(([cod, cfg]) => [{ text: `${cfg.emoji} ${cfg.nome}`, callback_data: `n:${cod}` }])

  return {
    inline_keyboard: [
      ...negs,
      [{ text: '📊 Consolidado', callback_data: 'consolidado' }],
      [{ text: '❓ Ajuda', callback_data: 'ajuda' }],
    ],
  }
}

export function kbNegocio(cod: NegCod) {
  return {
    inline_keyboard: [
      [
        { text: '📊 Resumo',        callback_data: `r:${cod}` },
        { text: '⚠️ Inadimplentes', callback_data: `i:${cod}` },
      ],
      [
        { text: '👥 Clientes',      callback_data: `c:${cod}` },
        { text: '🔮 Projeção',      callback_data: `p:${cod}` },
      ],
      [
        { text: '📡 Status',        callback_data: `s:${cod}` },
        { text: '🚀 Disparar',      callback_data: `d:${cod}` },
      ],
      [{ text: '🏠 Menu Principal', callback_data: 'menu' }],
    ],
  }
}

export function kbVoltar(cod: NegCod) {
  return {
    inline_keyboard: [
      [
        { text: `◀️ ${NEGOCIOS[cod].nome}`, callback_data: `n:${cod}` },
        { text: '🏠 Menu', callback_data: 'menu' },
      ],
    ],
  }
}

export const kbSoMenu = {
  inline_keyboard: [[{ text: '🏠 Menu', callback_data: 'menu' }]],
}
