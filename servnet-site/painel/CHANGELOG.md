# Changelog — Painel GrupoTom (produção em servnet.net.br/painel)

Toda alteração no painel exige atualização de versão e registro aqui.

## v2.4.12 — 2026-08-19

### Corrigido
- Busca de Cobranças permitia digitar só uma letra por vez: a tela se
  reconstruía a cada tecla e o cursor saía da caixa. Agora a lista
  atualiza 350ms após parar de digitar e o cursor permanece na busca.

## v2.4.11 — 2026-08-19

### Corrigido
- Correções não chegavam ao navegador sem atualização forçada: assets
  com hash eram editados mantendo o nome e o cache servia a versão
  antiga. Assets alterados renomeados e cache de /painel/assets
  limitado a 60 segundos.

## v2.4.10 — 2026-08-19

### Corrigido
- Filtro "Pendentes" do Financeiro não retornava nada: o rótulo
  Pendente é calculado (não pago, não cancelado, não vencido), mas o
  filtro comparava com o texto gravado no banco. Agora o filtro usa o
  mesmo critério do rótulo.

## v2.4.9 — 2026-08-19

### Removido
- Frase "Selecione um módulo para começar." da home — fica só a
  saudação com o nome.

## v2.4.8 — 2026-08-19

### Corrigido
- Lentidão (lag) na tela de Cobranças: a tabela renderizava as 5.000+
  faturas de uma vez a cada clique. Agora exibe as 300 mais urgentes
  (mais atrasadas primeiro) com aviso do total — busca, filtros, KPIs e
  "Selecionar todos" continuam considerando a lista completa.

## v2.4.7 — 2026-08-19

### Alterado
- Saudação fixada no topo da tela, centralizada logo abaixo do título
  "Painel de Gestão" — longe dos cards/colmeia.

## v2.4.6 — 2026-08-19

### Adicionado
- Arrastar para reordenar módulos em TODOS os layouts (quadrado,
  círculo e retângulo, além da colmeia). A ordem é uma só, compartilhada
  entre os layouts e salva no navegador.

### Corrigido
- Layouts alternativos ignoravam a ordem personalizada salva.

## v2.4.5 — 2026-08-19

### Alterado
- Saudação da home discreta: "Bom dia, Wellington · Selecione um módulo"
  em linha única, pequena, logo abaixo da topbar — a colmeia vira o
  destaque da tela.

## v2.4.4 — 2026-08-19

### Alterado
- Conteúdo das janelas centralizado (máx. 1100px) — telas como
  Relatórios não ficam mais coladas à esquerda com vazio à direita.

## v2.4.3 — 2026-08-19

### Adicionado
- Hexágonos da colmeia arrastáveis: arraste um módulo em cima de outro
  e eles trocam de lugar. A ordem fica salva no navegador. O hexágono
  central GT permanece fixo.

### Corrigido
- Nome do usuário espremido na topbar (agora com respiro e sem quebra).

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
