# Changelog — Painel GrupoTom (produção em servnet.net.br/painel)

Toda alteração no painel exige atualização de versão e registro aqui.

## v2.8.4 — 2026-08-28

### Corrigido
- Modal "Editar lançamento": campo Frequência (🔁) voltou a aparecer —
  estava escondido no modo edição (só aparecia em Novo). Agora o select
  de frequência sempre exibe e mostra o valor gravado no lançamento;
  as opções de término de recorrência permanecem exclusivas do Novo.

## v2.8.3 — 2026-08-27

### Corrigido
- Autocomplete de Cliente no modal Novo/Editar lançamento não sugeria
  nomes ao digitar: o código buscava na tabela inexistente "clientes"
  em vez de "cli_clientes". Corrigido — agora funciona mesmo sem ter
  aberto o módulo Clientes antes.

## v2.8.2 — 2026-08-27

### Corrigido
- Módulo Contratos: campo "Dia de Vencimento" limitava o máximo a 28,
  impedindo salvar contratos com vencimento nos dias 29, 30 ou 31.
  Corrigido para aceitar 1–31.

## v2.8.1 — 2026-08-27

### Adicionado
- Seleção em massa e exclusão em lote na tela de Clientes: checkbox em
  cada linha, "Selecionar todos (N)" no topo da lista e botão
  "🗑️ Excluir (N)" que aparece ao selecionar 1 ou mais clientes.
  A seleção é limpa automaticamente ao trocar filtro ou negócio.

## v2.8.0 — 2026-08-27

### Adicionado
- Exclusão em massa com escopo de recorrência: o botão "Excluir (N)" agora
  pergunta se quer excluir apenas os selecionados, estes e os próximos de
  cada série (não pagos), ou todos da série (incluindo pagos). Funciona igual
  ao botão Excluir individual mas aplicado a cada entrada selecionada.

## v2.7.9 — 2026-08-27

### Corrigido
- "Erro ao excluir: Carga incompleta de lançamentos: 5017/5021" — fetchAll
  contava as linhas primeiro e lançava erro se a contagem não batia (pode
  ocorrer por race condition ou inconsistência do Supabase). Reescrito para
  paginar até a página retornar vazia, sem depender de count.

## v2.7.8 — 2026-08-27

### Corrigido
- Editar lançamento recorrente (tipo, valor etc.) com "aplicar nos próximos/todos"
  só atualizava o mês atual — os meses futuros eram ignorados porque a store só
  carrega um mês. Corrigido: agora busca todos os lançamentos do banco antes de
  aplicar a alteração em massa (mesmo padrão já usado no Excluir).

## v2.7.7 — 2026-08-27

### Alterado
- Campo Cliente no modal de Novo/Editar lançamento: substituído o
  `<datalist>` nativo (que exibia todos os clientes ao abrir) por um
  autocomplete customizado — o dropdown só aparece ao digitar e filtra
  os clientes cadastrados em tempo real (até 10 sugestões por vez).

## v2.7.6 — 2026-08-27

### Corrigido
- Módulo Clientes quebrado com "Invalid or unexpected token": aspas duplas
  dentro de expressão `${}` de template literal estavam escapadas com `\"`
  (inválido em contexto de expressão JS). Corrigido para aspas sem barra.

## v2.7.5 — 2026-08-27

### Removido
- Card "Receita Bruta" dos KPIs do módulo Planos — Planos é cadastro
  de produtos, não módulo financeiro; o card não fazia sentido ali.

## v2.7.4 — 2026-08-27

### Removido
- Coluna "Periodicidade" da tabela de listagem de Planos — campo não
  faz mais parte do cadastro (sempre Mensal); removidos cabeçalho `<th>`
  e célula `<td>` correspondente em todos os arquivos.

## v2.7.3 — 2026-08-27

### Corrigido
- "Painel de Gestão" voltou ao mobile (havia sido removido por engano na v2.7.2):
  agora posicionado na borda inferior da topbar (bottom: 4px) para não
  sobrepor o texto de versão que fica no centro-alto.

## v2.7.2 — 2026-08-27

### Corrigido
- Versão não aparecia no celular: opacidade aumentada (0.45→0.75),
  cor em destaque (accent verde), `text-transform:none` para exibir
  "v2.7.2" sem maiúsculas.

## v2.7.1 — 2026-08-27

### Corrigido
- Módulo Planos: campo "Periodicidade" removido do formulário de criação/edição
  de plano — periodicidade é sempre "Mensal" por padrão, sem exigir seleção.
- Módulo Planos: erro "column cli_planos.created_at does not exist" — query
  corrigida para usar `updated_at` (coluna real da tabela).
- Portal do cliente: login retornava "CPF ou data de nascimento não conferem"
  para clientes cadastrados — dados ficavam gravados em `{dados:{dados:{...}}}`
  (duplo aninhamento). Corrigido em `page-clientes`: salvamento agora usa `{id, ...obj}`.
- Portal do cliente: faturas não apareciam — RPC `portal_servnet_faturas`
  apontava para tabela errada (`servnet_faturas`); corrigida para ler `lancamentos`.
- Clientes: mensagem de erro no login do portal inclui link WhatsApp para
  clientes recém-cadastrados ainda sem acesso ativado.

## v2.5.5 — 2026-08-19

### Adicionado
- Dashboard de Clientes clicável: os cartões (Total, Ativos,
  Inadimplentes, Bloqueados) e os chips da Distribuição por Status
  levam à lista de clientes já filtrada pelo status escolhido.

## v2.5.4 — 2026-08-19

### Corrigido
- Versão da topbar e da tela Sobre desencontradas: agora ambas leem a
  MESMA constante do app — impossível divergirem de novo.

## v2.5.3 — 2026-08-19

### Alterado
- Calibragem do visual clean: as cores dos módulos e chips voltam
  (hexágonos coloridos, ícones coloridos), apenas ~20% mais suaves que
  o original. Emojis fora dos textos e glifos de ação permanecem.

## v2.5.2 — 2026-08-19

### Corrigido
- Busca "1 letra por vez" corrigida em TODAS as telas (Financeiro,
  Clientes, Contas e demais): a lista atualiza 350ms após parar de
  digitar e o cursor permanece na caixa de busca. Cobranças já havia
  sido corrigida na v2.4.12.

## v2.5.1 — 2026-08-19

### Adicionado
- Campo Negócio no editor de lançamento do Financeiro (lista os
  negócios cadastrados e os já usados nos lançamentos).

### Corrigido
- BUG GRAVE: salvar um lançamento pelo Financeiro descartava os campos
  que não estavam no formulário (negócio, data de pagamento etc.).
  Agora a edição preserva todos os dados originais e altera apenas o
  que foi mexido.

## v2.5.0 — 2026-08-19

### Alterado
- Visual clean/minimalista em todas as telas: cores dessaturadas nas
  janelas e barras de título, ícones dos módulos em tom neutro
  (grayscale), hexágonos com fundo uniforme discreto e cards sem
  bordas coloridas.
- Emojis removidos dos textos, avisos e botões — ações usam glifos
  neutros (✆ cobrar, ✓ pago, ✎ editar, ⊘ bloquear; toasts ✓ ✕ i !).

## v2.4.13 — 2026-08-19

### Adicionado
- Botão ✏️ Editar em cada linha de Cobranças: edita descrição, valor,
  vencimento, negócio e situação da fatura, ou exclui — direto na tela,
  sem precisar caçar o mês no Financeiro. Alterar o vencimento atualiza
  o mes_ref automaticamente (mantém o Relatórios correto).

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
