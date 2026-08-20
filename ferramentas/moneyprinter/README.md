# MoneyPrinterTurbo — Afiliados Tom
## Gerador automático de vídeos · Nicho: Finanças Pessoais

---

## O que é?

O [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) gera vídeos curtos automaticamente para TikTok, Reels e YouTube Shorts usando IA. Você digita o tema, ele entrega o vídeo pronto com:

- ✅ Roteiro gerado por IA (GPT-4o-mini)
- ✅ Narração em português (voz natural)
- ✅ Vídeos de fundo do Pexels (royalty-free)
- ✅ Legendas automáticas
- ✅ Formato 9:16 (Stories/Reels/Shorts)

---

## Requisitos

| Ferramenta | Como instalar |
|---|---|
| **Python 3.10+** | [python.org](https://www.python.org/downloads/) |
| **ffmpeg** | macOS: `brew install ffmpeg` · Ubuntu: `sudo apt install ffmpeg` · Windows: [ffmpeg.org](https://ffmpeg.org/download.html) |
| **Git** | [git-scm.com](https://git-scm.com) |

---

## Setup (primeira vez)

```bash
# 1. Clone este repositório e entre na pasta
cd ferramentas/moneyprinter

# 2. Rode o setup automático
chmod +x setup.sh
./setup.sh
```

---

## Configurar chaves de API

Edite o arquivo `config.toml` e preencha:

### OpenAI (gera o roteiro)
1. Acessa [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Cria uma nova chave
3. Cola em `openai_api_key`
4. **Custo:** ~R$0,05-0,10 por vídeo usando `gpt-4o-mini`

### Pexels (vídeos de fundo — GRATUITO)
1. Acessa [pexels.com/api](https://www.pexels.com/api/)
2. Cria conta gratuita
3. Pega a API key
4. Cola em `pexels_api_key`
5. **Custo:** R$0 (plano gratuito é suficiente)

### Voz (edge_tts — GRATUITO)
- Já configurado! Usa a voz `pt-BR-AntonioNeural` da Microsoft
- Não precisa de chave de API

---

## Como usar

```bash
cd ferramentas/moneyprinter/MoneyPrinterTurbo
source venv/bin/activate
python main.py
```

Acessa **http://localhost:8501** no navegador e:

1. Cola um dos prompts de `prompts/financas-pessoais.md`
2. Clica em **"Gerar vídeo"**
3. Aguarda ~2-5 minutos
4. Vídeo salvo em `videos_gerados/`

---

## Estratégia de postagem

Ver: `prompts/financas-pessoais.md`

- **15 prompts prontos** divididos em 3 categorias
- **Frequência:** 2-3 vídeos/dia no TikTok, 1-2 no Instagram
- **Bio:** sempre com link da landing `viva-com-dinheiro.pages.dev`
- **Meta:** 1 lead orgânico por dia nos primeiros 30 dias

---

## Custo estimado mensal

| Item | Custo |
|---|---|
| OpenAI (60 vídeos/mês) | ~R$18 |
| Pexels | R$0 |
| Voz (edge_tts) | R$0 |
| **Total** | **~R$18/mês** |

---

## Links úteis

- [MoneyPrinterTurbo no GitHub](https://github.com/harry0703/MoneyPrinterTurbo)
- [Pexels API](https://www.pexels.com/api/)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Landing Viva com Dinheiro](../afiliados-tom/landing-viva-com-dinheiro/)
