#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# MoneyPrinterTurbo — Setup Automático
# Afiliados Tom · Nicho: Finanças Pessoais
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  MoneyPrinterTurbo · Setup Afiliados Tom    │"
echo "└─────────────────────────────────────────────┘"
echo ""

# 1. Verifica dependências
echo "▶ Verificando dependências..."
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 não encontrado. Instale em python.org"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "❌ ffmpeg não encontrado."; echo "   macOS: brew install ffmpeg"; echo "   Ubuntu: sudo apt install ffmpeg"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ git não encontrado."; exit 1; }
echo "✅ Dependências OK"

# 2. Clona MoneyPrinterTurbo
if [ ! -d "MoneyPrinterTurbo" ]; then
  echo ""
  echo "▶ Clonando MoneyPrinterTurbo..."
  git clone https://github.com/harry0703/MoneyPrinterTurbo.git
  echo "✅ Clone OK"
else
  echo "✅ MoneyPrinterTurbo já existe"
fi

cd MoneyPrinterTurbo

# 3. Cria ambiente virtual
echo ""
echo "▶ Criando ambiente virtual..."
python3 -m venv venv
source venv/bin/activate
echo "✅ venv ativado"

# 4. Instala dependências Python
echo ""
echo "▶ Instalando dependências Python..."
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "✅ Dependências Python OK"

# 5. Copia configuração customizada
echo ""
echo "▶ Aplicando configuração personalizada..."
cp ../config.toml ./config.toml
echo "✅ config.toml aplicado"

# 6. Cria pasta de saída
mkdir -p ../videos_gerados

echo ""
echo "┌─────────────────────────────────────────────────────────────────────┐"
echo "│  ✅ Setup concluído!                                                │"
echo "│                                                                     │"
echo "│  PRÓXIMO PASSO: edite config.toml e adicione suas chaves de API    │"
echo "│                                                                     │"
echo "│  Para rodar:                                                        │"
echo "│    cd MoneyPrinterTurbo                                             │"
echo "│    source venv/bin/activate                                         │"
echo "│    python main.py                                                   │"
echo "│                                                                     │"
echo "│  Acesse: http://localhost:8501                                      │"
echo "└─────────────────────────────────────────────────────────────────────┘"
echo ""
