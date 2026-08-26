/**
 * scrape-barbearias.js
 * Raspa barbearias do Google Maps e salva CSV com nome, telefone, endereço.
 *
 * Uso:
 *   node scrape-barbearias.js
 *   node scrape-barbearias.js --cidade "Campinas" --max 100
 *
 * Saída: barbearias-{cidade}-{data}.csv
 */

const { chromium } = require('playwright-core')
const fs  = require('fs')
const path = require('path')

// ── Config ──────────────────────────────────────────────────────────────────
const args   = process.argv.slice(2)
const cidade = args.includes('--cidade') ? args[args.indexOf('--cidade') + 1] : 'São Paulo'
const maxRes = args.includes('--max')    ? parseInt(args[args.indexOf('--max') + 1])  : 200

// ── Helpers ──────────────────────────────────────────────────────────────────
function normalizePhone(raw) {
  if (!raw) return ''
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, '')
  // Garante formato brasileiro: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
  if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  return digits
}

function csvRow(fields) {
  return fields.map(f => `"${String(f ?? '').replace(/"/g, '""')}"`).join(',')
}

function slugDate() {
  return new Date().toISOString().slice(0,10)
}

// ── Main ─────────────────────────────────────────────────────────────────────
;(async () => {
  const outFile = `barbearias-${cidade.replace(/\s+/g, '-')}-${slugDate()}.csv`
  const results = []
  const seen    = new Set()

  console.log(`🔍 Buscando barbearias em "${cidade}" (máx ${maxRes})…`)
  console.log(`📄 Saída: ${outFile}\n`)

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const context = await browser.newContext({
    locale: 'pt-BR',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })
  const page = await context.newPage()

  // Abre o Maps com busca pronta
  const query = encodeURIComponent(`barbearia ${cidade}`)
  await page.goto(`https://www.google.com/maps/search/${query}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3000)

  // Fecha dialogs de cookie se aparecerem
  try {
    const cookieBtn = await page.$('button[aria-label*="Aceitar"]') ||
                      await page.$('button[aria-label*="Accept"]') ||
                      await page.$('form[action*="consent"] button')
    if (cookieBtn) await cookieBtn.click()
    await page.waitForTimeout(1000)
  } catch {}

  // Seletor do painel lateral de resultados
  const FEED_SELECTOR  = 'div[role="feed"]'
  const RESULT_SELECTOR = 'div[role="feed"] > div > div > a'

  await page.waitForSelector(FEED_SELECTOR, { timeout: 15000 }).catch(() => {
    console.error('❌ Não encontrou a lista de resultados. Talvez o Google bloqueou ou mudou o layout.')
    process.exit(1)
  })

  console.log('✅ Lista de resultados carregada. Iniciando coleta…\n')

  let scrollAttempts = 0
  const MAX_SCROLL   = 40   // cada scroll carrega ~5-7 resultados

  while (results.length < maxRes && scrollAttempts < MAX_SCROLL) {
    // Coleta links visíveis no feed
    const links = await page.$$(RESULT_SELECTOR)

    for (const link of links) {
      if (results.length >= maxRes) break

      const href = await link.getAttribute('href')
      if (!href || seen.has(href)) continue
      seen.add(href)

      // Clica no resultado pra abrir o painel de detalhe
      try {
        await link.click()
        await page.waitForTimeout(2000)

        // Extrai dados do painel
        const nome    = await page.$eval('h1.DUwDvf', el => el.textContent.trim()).catch(() => '')
        const end     = await page.$$eval('button[data-item-id="address"] span', els => els[0]?.textContent.trim() ?? '').catch(() => '')
        const tel     = await page.$$eval('button[data-item-id^="phone:tel"] span', els => els[0]?.textContent.trim() ?? '').catch(() => '')
        const rating  = await page.$eval('div.F7nice span[aria-hidden]', el => el.textContent.trim()).catch(() => '')
        const website = await page.$$eval('a[data-item-id="authority"] span', els => els[0]?.textContent.trim() ?? '').catch(() => '')

        if (!nome) continue

        const telClean = normalizePhone(tel)
        // Só inclui se tem telefone (os sem tel não servem pra WA)
        if (!telClean) {
          process.stdout.write(`  ⏩ Sem tel: ${nome}\n`)
          continue
        }

        results.push({ nome, tel: telClean, endereco: end, avaliacao: rating, site: website })
        process.stdout.write(`  ✅ [${results.length}] ${nome} — ${telClean}\n`)

        // Volta pra lista
        const backBtn = await page.$('button[aria-label="Voltar"]') ||
                        await page.$('button[jsaction*="back"]') ||
                        await page.$('button[aria-label="Back"]')
        if (backBtn) {
          await backBtn.click()
          await page.waitForTimeout(1500)
        } else {
          // Se não achar botão voltar, navega de volta
          await page.goBack({ timeout: 5000 }).catch(() => {})
          await page.waitForTimeout(2000)
        }

      } catch (e) {
        process.stdout.write(`  ⚠️  Erro ao processar item: ${e.message}\n`)
        await page.goBack({ timeout: 5000 }).catch(() => {})
        await page.waitForTimeout(1500)
      }
    }

    // Scrolla o painel lateral pra carregar mais
    try {
      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]')
        if (feed) feed.scrollBy(0, 1000)
      })
      await page.waitForTimeout(2000)
    } catch {}

    scrollAttempts++

    // Detecta fim da lista
    const endMsg = await page.$('span.HlvSq').catch(() => null)
    if (endMsg) {
      console.log('\n📌 Fim da lista do Maps.')
      break
    }
  }

  await browser.close()

  if (!results.length) {
    console.log('\n❌ Nenhum resultado coletado.')
    process.exit(1)
  }

  // Salva CSV
  const header = csvRow(['Nome', 'Telefone', 'WhatsApp Link', 'Endereço', 'Avaliação', 'Site'])
  const rows   = results.map(r => csvRow([
    r.nome,
    r.tel,
    `https://wa.me/55${r.tel.replace(/\D/g, '')}`,
    r.endereco,
    r.avaliacao,
    r.site
  ]))

  fs.writeFileSync(outFile, [header, ...rows].join('\n'), 'utf8')

  console.log(`\n✅ Pronto! ${results.length} barbearias salvas em: ${outFile}`)
  console.log(`\n💡 Dica: abra no Excel/Sheets → filtre coluna "Telefone" → envie no máximo 20-30 por dia`)
})()
