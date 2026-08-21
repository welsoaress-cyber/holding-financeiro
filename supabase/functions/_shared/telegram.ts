// ----------------------------------------------------------------
// Helper compartilhado — envia mensagem para o admin via Telegram
// Secrets necessários:
//   TELEGRAM_BOT_TOKEN   — token do @BotFather
//   TELEGRAM_ADMIN_CHAT_ID — chat ID do admin
// ----------------------------------------------------------------

const TG_TOKEN   = Deno.env.get('TELEGRAM_BOT_TOKEN')   || ''
const TG_CHAT_ID = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID') || ''
const TG_API     = `https://api.telegram.org/bot${TG_TOKEN}`

export async function enviarTelegram(texto: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
  if (!TG_TOKEN || !TG_CHAT_ID) {
    console.warn('⚠️ Telegram não configurado (TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_CHAT_ID ausentes)')
    return false
  }
  try {
    const res = await fetch(`${TG_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: texto,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('❌ Telegram erro:', err)
      return false
    }
    return true
  } catch (err) {
    console.error('❌ Telegram exceção:', err)
    return false
  }
}

export { TG_API, TG_TOKEN, TG_CHAT_ID }
