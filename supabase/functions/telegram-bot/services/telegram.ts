const TG_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
export const TG_API = `https://api.telegram.org/bot${TG_TOKEN}`

export async function sendMessage(
  chatId: number,
  text: string,
  keyboard?: object,
): Promise<void> {
  const body: Record<string, unknown> = {
    chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true,
  }
  if (keyboard) body.reply_markup = keyboard
  try {
    await fetch(`${TG_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('sendMessage error:', e)
  }
}

export async function editMessage(
  chatId: number,
  msgId: number,
  text: string,
  keyboard?: object,
): Promise<void> {
  const body: Record<string, unknown> = {
    chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML', disable_web_page_preview: true,
  }
  if (keyboard) body.reply_markup = keyboard
  try {
    const res = await fetch(`${TG_API}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      // "message is not modified" → ignorar silenciosamente
      if ((err as any)?.description?.includes('not modified')) return
      // Outro erro → fallback para nova mensagem
      await sendMessage(chatId, text, keyboard)
    }
  } catch {
    await sendMessage(chatId, text, keyboard)
  }
}

// Edita se tiver msgId, senão envia nova
export async function enviar(
  chatId: number,
  text: string,
  keyboard?: object,
  msgId?: number,
): Promise<void> {
  if (msgId) await editMessage(chatId, msgId, text, keyboard)
  else await sendMessage(chatId, text, keyboard)
}

export async function answerCallback(id: string): Promise<void> {
  await fetch(`${TG_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id }),
  })
}
