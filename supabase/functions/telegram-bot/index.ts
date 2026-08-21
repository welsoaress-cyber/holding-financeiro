import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

import { enviar, sendMessage, answerCallback } from './services/telegram.ts'
import { getUsuario, temAcesso, podeDisparar } from './services/auth.ts'
import {
  NEGOCIOS, getWhUrl,
  getResumo, getInadimplentes, getClientes, getProjecao,
  getConsolidado, dispararWhatsApp,
} from './services/analytics.ts'
import { getWhatsAppStatus } from './services/evolution.ts'
import { kbMenu, kbNegocio, kbVoltar, kbSoMenu } from './handlers/keyboards.ts'
import {
  txtMenu, txtNegocio, txtResumo, txtInadimplentes,
  txtClientes, txtProjecao, txtStatus, txtConsolidado, txtAjuda,
} from './handlers/texts.ts'
import { log } from './utils/logger.ts'
import type { NegCod } from './types/index.ts'

// ----------------------------------------------------------------
// Mapa de comandos de texto → negócio
// ----------------------------------------------------------------
const CMD_NEG: Record<string, NegCod> = {
  servidor:    'sv',
  servnet:     'sn',
  precautec:   'pt',
  portoodonto: 'po',
}

// ----------------------------------------------------------------
// Handler principal
// ----------------------------------------------------------------
serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 })

  let update: any
  try { update = await req.json() } catch { return new Response('bad request', { status: 400 }) }

  const userId = update?.message?.from?.id ?? update?.callback_query?.from?.id
  if (!userId) return new Response('ok')

  const usuario = await getUsuario(userId)
  if (!usuario) {
    const chatId = update?.message?.chat?.id ?? update?.callback_query?.message?.chat?.id
    if (chatId) await sendMessage(chatId, '⛔ <b>Acesso não autorizado.</b>')
    return new Response('ok')
  }

  // ── CALLBACK QUERY (clique em botão) ─────────────────────────
  if (update?.callback_query) {
    const cb     = update.callback_query
    const chatId = cb.message?.chat?.id
    const msgId  = cb.message?.message_id
    const data   = cb.data || ''

    await answerCallback(cb.id)
    log('INFO', 'callback', { userId, data })

    // Menu principal
    if (data === 'menu') {
      await enviar(chatId, txtMenu(usuario), kbMenu(usuario), msgId)
      return new Response('ok')
    }

    // Ajuda
    if (data === 'ajuda') {
      await enviar(chatId, txtAjuda(), kbSoMenu, msgId)
      return new Response('ok')
    }

    // Consolidado
    if (data === 'consolidado') {
      await enviar(chatId, '⏳ Carregando consolidado...', undefined, msgId)
      const items = await getConsolidado()
      await sendMessage(chatId, txtConsolidado(items), kbSoMenu)
      return new Response('ok')
    }

    // Submenu de negócio: n:sv, n:sn, n:pt, n:po
    if (data.startsWith('n:')) {
      const cod = data.slice(2) as NegCod
      if (!NEGOCIOS[cod]) return new Response('ok')
      if (!temAcesso(usuario, cod)) {
        await enviar(chatId, '⛔ Sem acesso a este negócio.', kbSoMenu, msgId)
        return new Response('ok')
      }
      await enviar(chatId, txtNegocio(cod), kbNegocio(cod), msgId)
      return new Response('ok')
    }

    // Ações de painel: r:sv, i:sv, c:sv, p:sv, s:sv, d:sv
    const colonIdx = data.indexOf(':')
    if (colonIdx > 0) {
      const acao   = data.slice(0, colonIdx)
      const cod    = data.slice(colonIdx + 1) as NegCod
      if (!NEGOCIOS[cod]) return new Response('ok')

      if (!temAcesso(usuario, cod)) {
        await enviar(chatId, '⛔ Sem acesso a este negócio.', kbSoMenu, msgId)
        return new Response('ok')
      }

      const kb = kbVoltar(cod)

      try {
        switch (acao) {
          case 'r': {
            await enviar(chatId, '⏳ Carregando resumo...', undefined, msgId)
            const s = await getResumo(cod)
            await sendMessage(chatId, txtResumo(cod, s), kb)
            break
          }
          case 'i': {
            await enviar(chatId, '⏳ Carregando inadimplentes...', undefined, msgId)
            const { lista, nomeMap } = await getInadimplentes(cod)
            await sendMessage(chatId, txtInadimplentes(cod, lista, nomeMap), kb)
            break
          }
          case 'c': {
            await enviar(chatId, '⏳ Carregando clientes...', undefined, msgId)
            const s = await getClientes(cod)
            await sendMessage(chatId, txtClientes(cod, s), kb)
            break
          }
          case 'p': {
            await enviar(chatId, '⏳ Carregando projeção...', undefined, msgId)
            const s = await getProjecao(cod)
            await sendMessage(chatId, txtProjecao(cod, s), kb)
            break
          }
          case 's': {
            const { status, ping } = await getWhatsAppStatus()
            await enviar(chatId, txtStatus(status, ping), kb, msgId)
            break
          }
          case 'd': {
            if (!podeDisparar(usuario)) {
              await enviar(chatId, '⛔ Sem permissão para disparar mensagens.', kb, msgId)
              break
            }
            await enviar(chatId, '⏳ Disparando mensagens WhatsApp...', undefined, msgId)
            const result = await dispararWhatsApp(getWhUrl(cod))
            if (result.ok) {
              await sendMessage(chatId,
                `🚀 <b>Disparo concluído — ${NEGOCIOS[cod].nome}</b>\n\n` +
                `✅ Enviados: <b>${result.enviados}</b>\n` +
                `❌ Erros:    <b>${result.erros}</b>\n` +
                `📄 Faturas:  <b>${result.faturas}</b>`,
                kb,
              )
            } else {
              await sendMessage(chatId, `❌ Erro no disparo: <code>${result.erro}</code>`, kb)
            }
            break
          }
          default:
            await enviar(chatId, '❓ Ação não reconhecida.', kb, msgId)
        }
      } catch (e) {
        log('ERROR', 'handler error', { acao, cod, err: String(e) })
        await sendMessage(chatId, '❌ Erro interno. Tente novamente.', kb)
      }
    }

    return new Response('ok')
  }

  // ── MENSAGEM DE TEXTO (comandos) ──────────────────────────────
  const msg    = update?.message
  if (!msg) return new Response('ok')

  const chatId = msg.chat?.id
  const texto  = (msg.text || '').trim()
  const raw    = texto.split(' ')[0].toLowerCase()
    .replace(/^\//, '')
    .replace(/@\w+$/, '')

  log('INFO', 'command', { userId, raw })

  if (!raw || raw === 'start' || raw === 'menu') {
    await sendMessage(chatId, txtMenu(usuario), kbMenu(usuario))
    return new Response('ok')
  }

  if (raw === 'ajuda' || raw === 'help') {
    await sendMessage(chatId, txtAjuda(), kbSoMenu)
    return new Response('ok')
  }

  if (raw === 'consolidado') {
    await sendMessage(chatId, '⏳ Carregando consolidado...')
    const items = await getConsolidado()
    await sendMessage(chatId, txtConsolidado(items), kbSoMenu)
    return new Response('ok')
  }

  const negCod = CMD_NEG[raw]
  if (negCod) {
    if (!temAcesso(usuario, negCod)) {
      await sendMessage(chatId, '⛔ Sem acesso a este negócio.', kbSoMenu)
      return new Response('ok')
    }
    await sendMessage(chatId, txtNegocio(negCod), kbNegocio(negCod))
    return new Response('ok')
  }

  await sendMessage(
    chatId,
    `❓ Comando não reconhecido: <code>/${raw}</code>\n\nDigite /ajuda para ver os comandos.`,
    kbSoMenu,
  )
  return new Response('ok')
})
