# Changelog — Painel GrupoTom (produção em servnet.net.br/painel)

Toda alteração no painel exige atualização de versão e registro aqui.

## v2.4.2 — 2026-08-19

### Adicionado
- Snap de janelas estilo Windows: arraste a janela pela barra de título
  até a borda esquerda ou direita para encaixá-la em meia tela, ou até o
  topo para maximizar. Uma prévia translúcida mostra onde ela vai
  encaixar antes de soltar.

## v2.4.1 — 2026-08-19

### Corrigido
- Modal de edição de lançamento abria com campos invisíveis (texto branco
  em fundo branco) — o modal não herdava os tokens de cor das janelas.
- Tela de Cobranças (e demais telas que usam os tokens antigos --text-1/
  --text-2/--surface) ilegível dentro das janelas claras — tokens escuros
  remapeados para valores legíveis no escopo de .win-body e #modal-overlay.
- Modais não fecham mais ao selecionar texto e soltar o mouse fora da
  caixa (proteção mousedown+click aplicada em todos os overlays).

### Adicionado
- Controle de tamanho da colmeia (botão 📐 na topbar): slider de 70% a
  150%, persistido por navegador.
- Colmeia hexagonal escala com a largura da tela (até 220px por hexágono
  em monitores grandes), com ícones, rótulos e saudação proporcionais.
- Versão exibida ao lado do nome GrupoTom na topbar.

### Alterado
- Saudação da home mais compacta (respiro 80px→52px, margem 32px→12px)
  para dar mais espaço vertical à colmeia.

## v2.4.0 — 2026-08-18 (base)
- Publicação do painel v2 em servnet.net.br/painel (build Vite do
  repositório holding-financeiro-v2, antes hospedado na Vercel).
- Hex nav, alternância de tema, 4 modos de layout, login redesenhado,
  RBAC por perfil (tabela user_profiles), clientes multi-negócio,
  CRUD de planos.
