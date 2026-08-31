# Changelog — Painel GrupoTom (produção em servnet.net.br/painel)

Toda alteração no painel exige atualização de versão e registro aqui.

## v2.9.40 — 2026-08-31

### Novo — Serviços contratados (contratos por cliente)
- **Cadastro do cliente aceita 1 ou mais serviços**: cada serviço vincula negócio → plano (filtrado) → periodicidade (Fixa/Mensal/Bimestral/Trimestral/Semestral/Anual) → dia de vencimento; adicionar com + e remover com ✕
- **Contas a Receber usa o serviço**: ao digitar o cliente, plano, valor, periodicidade e dia de vencimento do 1º serviço preenchem o formulário automaticamente
- Lista de clientes mostra a contagem de serviços (📦 2 serviços)
- Campos antigos (negócio/plano únicos) migram automaticamente para o novo formato ao editar

## v2.9.39 — 2026-08-31

### Novo — WhatsApp por negócio
- **`whatsapp-lembretes` roteia por tipo de negócio**: cobranças do Provedor saem pela instância `servnet` (11 96696-1138); cobranças do Servidor pela instância `servidor` (11 95449-0001, env `EVOLUTION_INSTANCE_SERVIDOR`)
- Cada instância é verificada separadamente com cache por execução — uma offline não bloqueia a outra (as faturas dela são puladas com o motivo no relatório)
- Requer redeploy da função e criação/conexão da instância `servidor` no Evolution Manager

## v2.9.38 — 2026-08-31

### Novo
- **Plano vinculado ao cliente**: no cadastro/edição do cliente, campo "Plano vinculado" filtrado pelo tipo de negócio escolhido (troca de negócio refiltra os planos na hora); o plano define o valor padrão do cliente
- **Cobrança inteligente**: em Contas a Receber, ao digitar o cliente, o plano vinculado e o valor são pré-selecionados automaticamente
- Lista de clientes mostra o plano vinculado (📦)

## v2.9.37 — 2026-08-31

### Novo
- **Menu ⋮ nas linhas de Contas a Receber/Pagar**: ✏️ Editar (descrição, valor, vencimento), 🗑️ Excluir e 🗑️ Excluir esta e futuras (para recorrências)

### Corrigido
- **Texto invisível no modo escuro**: `#page-content` agora define os tokens de tema (claro e escuro) — descrições de lançamentos, nomes de clientes e cards legíveis nos dois temas

### Alterado
- **Resumo enxuto — dash único**: removidas todas as seções (contas, discriminações, fluxo de caixa, economia, pendentes, últimas receitas/despesas, categorias, configurar resumo). Ficam: **Saldo início do mês**, **Saldo final previsto**, card **Contas a Receber (Previsto × Realizado)** e card **Contas a Pagar (Previsto × Realizado)** — os cards abrem os módulos ao clicar. Navegação de mês e botão + de lançamento rápido mantidos

## v2.9.36 — 2026-08-31

### Alterado
- **Periodicidade completa** em Contas a Receber e Contas a Pagar: Única, **Fixa (mensal, sem prazo — gera 24 meses à frente)**, Mensal, **Bimestral**, Trimestral, Semestral, Anual; campo Repetições oculto em Única e Fixa

## v2.9.35 — 2026-08-31

### Alterado
- **Popup de cobrança centralizado**: Nova cobrança e Nova conta a pagar abrem no centro da tela e só fecham pelo ✕ ou ao concluir (clique fora não fecha mais)
- **Cliente com autocompletar**: em Nova cobrança, digite o nome e as sugestões aparecem enquanto digita
- **Planos antigos visíveis**: planos legados do portal (Prata, Ouro…) sem tipo de negócio vinculado aparecem em seção própria em Tipos de Negócio, com botão de exclusão

## v2.9.34 — 2026-08-31

### Alterado
- **Plano sem dia de vencimento**: removido "Dia vencimento padrão" do cadastro de plano — vencimento pertence ao vínculo plano↔cliente, definido no campo "1º vencimento" de Contas a Receber

## v2.9.33 — 2026-08-31

### Alterado
- **"Clientes ServNet" → "Clientes"**: clientes são independentes do tipo de negócio (menu, título e lista renomeados)
- **Vínculo de negócio no cadastro**: ao editar/criar cliente há o campo "Tipo de negócio" (busca do menu Tipos de Negócio); o negócio vinculado aparece na lista (🏢)
- **Removido o botão 💰 (gerar mensalidade)** da lista de clientes — cobrança agora é exclusiva de Contas a Receber

## v2.9.32 — 2026-08-31

### Novo
- **Tipos de Negócio** (🏢): cadastro de negócios (ServNet, Holding…) e, dentro de cada um, seus **Planos** (nome, valor mensal, dia de vencimento padrão, detalhes) — armazenados em `cli_planos`, integrados ao portal
- **Contas a Receber** (📥): lista mensal de receitas com navegação por mês, totais A receber/Recebido, marcação de recebimento (e desfazer), status Atrasado automático; **+ Cobrança** vincula Cliente + Plano (valor e vencimento preenchem sozinhos) com recorrência
- **Contas a Pagar** (📤): lista mensal de despesas com totais, marcar pago/desfazer, status Atrasado; **+ Conta** com recorrência

### Corrigido
- **Módulo Contas quebrado** ("ht is not a function"): o módulo importava funções com nomes errados dos exports minificados — agora mapeia os aliases corretos; lançar contas com saldo e ajustes volta a funcionar
- **Topbar**: título da página não sobrepõe mais a marca GrupoTom — marca fixa à esquerda, título centralizado com reticências quando falta espaço

## v2.9.31 — 2026-08-31

### Novo
- **Endereço por CEP (ViaCEP)**: no cadastro de cliente, digite o CEP e o sistema preenche rua, bairro e cidade automaticamente; campos separados para Número e Ponto de referência (opcional). CEP inválido ou falha de rede permitem preenchimento manual

## v2.9.30 — 2026-08-31

### Removido
- **Menu enxuto**: excluídos da sidebar os itens Orçamentos, Objetivos, Relatórios, Gráficos, Categorias, Calendário, Recursos Premium, Ferramentas e Cafezinho (com as seções Planejar/Analisar). Ficam: Resumo, Contas, Transações, Clientes ServNet, Cartões, Configurações, Usuários e Sair
- **Tela inicial vazia**: o painel não abre mais o dashboard automaticamente após o login — escolha o módulo pelo menu

## v2.9.29 — 2026-08-31

### Alterado
- **Cadastro de cliente é só cadastro**: removidos Valor mensal e Dia de vencimento do formulário — dados de cobrança pertencem ao serviço/contrato, não à pessoa. Adicionados E-mail e Endereço (opcionais)
- **Gerar mensalidade** pergunta o valor na hora quando o cliente ainda não tem serviço vinculado
- Lista de clientes mostra CPF · telefone · status (sem dados de cobrança)

## v2.9.28 — 2026-08-31

### Novo
- **Anti-duplicidade no cadastro de clientes**: ao salvar, o sistema verifica se já existe outro cliente com o mesmo CPF ou telefone (comparação apenas por dígitos — máscara não engana). Se houver, bloqueia o salvamento e aponta qual cliente já usa o dado

## v2.9.27 — 2026-08-31

### Alterado — formulário de lançamento profissional
- **Nova Receita/Despesa reformulado**: agora com Descrição, **Cliente** (busca do cadastro `cli_clientes`, apenas receitas), **Categoria** (busca do menu Categorias), Valor, **Data de vencimento** (era "recebimento"), Status e **Recorrência**
- **Recorrência com periodicidade**: Única / Mensal / Trimestral / Semestral / Anual + número de repetições (2–60) — gera todos os lançamentos futuros de uma vez, agrupados por `grupoRecorrencia` com `parcela` (ex: 3/12)
- **Cliente selecionado preenche automaticamente** valor mensal e dia de vencimento do cadastro
- Receita com cliente recebe `negocio: Provedor/Servnet` e `clienteId` — integra com o portal do cliente

## v2.9.26 — 2026-08-31

### Novo
- **Módulo Clientes ServNet** (sidebar → 👥 Clientes ServNet): cadastro de clientes com nome, CPF, data de nascimento (login do portal), telefone, valor mensal, dia de vencimento e status
- **Gerar mensalidade** (💰 na lista de clientes): cria receita em `lancamentos` com `clienteId` — aparece imediatamente como fatura no portal do cliente (servnet.net.br/portal); com aviso contra duplicidade no mesmo mês

### Corrigido
- **Painel travado em "Verificando acesso"**: artefatos de merge (linha duplicada + marcador `>>>>>>>`) quebravam o `page-dashboard` com SyntaxError — removidos e sintaxe validada nos 4 arquivos críticos
- **Login sem perfil**: usuário master entra mesmo quando `user_profiles` está vazio (fallback em memória)
- **Inputs ilegíveis no modo escuro**: campos do modal Nova Receita/Despesa usavam fundo escuro com texto escuro — trocado para fundo neutro translúcido

## v2.9.24 — 2026-08-30

### Segurança
- **RLS ativado** em todas as tabelas: `fin_*`, `lancamentos`, `user_profiles`, `cli_clientes`, `cli_planos` — cada usuário vê apenas seus próprios dados
- **`mp-gerar-pix`**: exige JWT Supabase ou `x-function-secret` — rejeita chamadas não autenticadas (401)
- **`whatsapp-lembretes`**: exige `CRON_SECRET` no header — acesso bloqueado sem autenticação
- **`mp-webhook`**: valida assinatura HMAC x-signature do Mercado Pago — rejeita notificações forjadas (403)
- Diagnóstico GET do mp-webhook protegido com `CRON_SECRET`
- Instruções de secrets em `supabase/SECURITY_SECRETS.md`
- Versão bumped 2.9.23 → 2.9.24

## v2.9.23 — 2026-08-29

### Alterado
- **UX — tela cheia**: substituída arquitetura de janelas flutuantes por roteamento de página inteira — módulos abrem em `#page-content` (tela cheia), sem sobreposições
- **Dashboard pós-login**: após autenticação, o painel abre direto no Resumo (dashboard) em vez de exibir grade de ícones hex
- **`window.openModule`**: reescrito para injetar conteúdo em `#page-content` via evento `gt:loadModule`
- Versão bumped 2.9.22 → 2.9.23

## v2.9.22 — 2026-08-29

### Corrigido
- **Topbar**: remove texto estático "Painel de Gestão" do `#tb-page-title` — topbar limpo por padrão
- Versão bumped 2.9.21 → 2.9.22

## v2.9.21 — 2026-08-29

### Corrigido
- **Erro `date/time field value out of range: "2026-09-31"`**: queries de despesas/receitas/transferências usavam `-31` fixo para fim do mês — substituído por helper `mesEnd()` que calcula o último dia real do mês (setembro=30, fevereiro=28/29 etc.)
- **Topbar com "GRUPOTOM" em maiúsculas**: `text-transform: uppercase` e `letter-spacing: 1px` removidos da classe `.tb-brand` — nome agora exibido como "GrupoTom"
- Versão bumped 2.9.20 → 2.9.21

## v2.9.20 — 2026-08-29

### Corrigido
- **Erro `parcelas` column not found em fin_despesas_fixas/fin_receitas_fixas**: ao salvar despesa/receita recorrente, o campo `parcelas` era enviado para tabelas que não têm essa coluna — removido do payload de fixas (coluna será adicionada via migration quando disponível)
- Versão bumped 2.9.19 → 2.9.20

## v2.9.19 — 2026-08-29

### Corrigido
- **Status "Recebido" em Receitas**: campo status agora salva `"recebido"` (era `"pago"` por engano), corrigindo filtro e exibição na listagem
- **Periodicidade e Parcelas** adicionados aos módulos standalone de Receitas (`index-DIt_wP4b.js`) e Despesas (`index-DCzEq81c.js`)
- Formulários Nova Receita e Nova Despesa (módulos standalone) agora incluem: Única vez / Todo mês / Toda semana / Todo ano + campo Parcelas
- Versão bumped 2.9.18 → 2.9.19

## v2.9.18 — 2026-08-29

### Corrigido
- **Erro `invalid input syntax for type uuid: ""`** ao salvar despesa/receita: campos `id_categoria` e `id_conta` com valor vazio agora são convertidos para `null` antes do upsert
- `fSave` agora sanitiza todos os campos: string vazia `""` → `null` automaticamente

### Adicionado
- **Periodicidade** nos formulários Nova Despesa e Nova Receita: Única vez / Todo mês / Toda semana / Todo ano
- **Parcelas** no mesmo formulário para indicar quantas repetições
- Despesas/Receitas recorrentes criadas como Fixa automaticamente ao escolher periodicidade
- Versão bumped 2.9.17 → 2.9.18

## v2.9.17 — 2026-08-28

### Adicionado
- **FAB lançamento rápido** no Resumo: botão "+" flutuante abre opções Receita / Despesa
- **Modal bottom-sheet** com formulário completo (descrição, valor, data, categoria, status)
- Salva direto na tabela `lancamentos` — aparece imediatamente no Resumo após salvar
- Versão bumped 2.9.16 → 2.9.17

## v2.9.16 — 2026-08-28

### Adicionado
- **Módulo Contas** implementado com menus e submenus estilo Organizze:
  - Lista de contas com logo do banco, tipo, nome, saldo atual, saldo previsto, status
  - Menu de contexto (⋮) por conta: Editar, Extrato, Abrir app do banco, Reajustar saldo, Adicionar, Transações, Excluir/Arquivar, Calculadora, Exibir na tela de Resumo
  - Menu global: Ordenar contas, Exibir contas arquivadas
  - Formulário Nova/Editar Conta com todos os campos e toggles
  - Popup de Calculadora financeira
  - Tela de Reajustar saldo
  - Modal de Excluir/Arquivar conta
  - Tela de Extrato da conta
- Versão bumped 2.9.15 → 2.9.16

## v2.9.15 — 2026-08-28

### Alterado
- **Sidebar corrigida** para replicar exatamente o menu do Organizze:
  - Seção principal: Resumo, Contas, Transações, Cartões de crédito
  - Seção **Planejar**: Orçamentos, Objetivos
  - Seção **Analisar**: Relatórios, Gráficos, Categorias, Calendário
  - Rodapé: Recursos Premium, Ferramentas, Configurações, Usuários (RBAC), Cafezinho, Sair
- Versão bumped 2.9.14 → 2.9.15

## v2.9.14 — 2026-08-28

### Adicionado
- **Resumo (Dashboard) estilo Organizze** — tela de resumo financeiro completa com:
  - Navegação por mês (‹ Agosto 2026 ›) com estado persistido em `h.mesNav`
  - Barra de métricas: Saldo inicial / Saldo atual / Saldo previsto
  - **Contas**: lista de contas ativas com saldo individual e total consolidado
  - **Discriminação das receitas/despesas**: três colunas (Efetivadas | Vencidas | Próx. venc.)
  - **Fluxo de caixa**: barras comparativas Entrada / Saída / Saldo atual
  - **Economia mensal**: gauge circular com % economizado e valor
  - **Transações pendentes**: carrossel de 3 slides (despesas / receitas / transferências)
  - **Saldo consolidado**: donut Patrimônio vs Dívidas
  - **Últimas receitas / despesas**: listas com ícone de categoria, data, valor
  - **Receitas / Despesas por categoria**: donut + lista com percentual por categoria
  - Configurar resumo (placeholder para configurações futuras)
- Donut SVG responsivo calculado por stroke-dasharray/dashoffset
- Gauge SVG de economia mensal
- Carrossel com suporte a touch/swipe (mobile)
- Skeleton loader enquanto os dados carregam

## v2.9.13 — 2026-08-28

### Adicionado
- **Sidebar de navegação** estilo Organizze: gaveta lateral que desliza da esquerda
  ao clicar no botão ≡ (hamburger) no canto superior esquerdo do topbar.
- Sidebar exibe perfil do usuário (avatar, nome, e-mail) e workspace GrupoTom.
- Navegação segmentada por seção: Principal, Movimentações, Planejar, Analisar,
  Configurações. Cada item abre o módulo correspondente como janela flutuante.
- Itens RBAC-gated: Usuários aparece apenas para quem tem permissão.
- Overlay com backdrop e fechamento por toque fora ou swipe-left no sidebar (mobile).

## v2.9.12 — 2026-08-28

### Corrigido
- Abas do módulo Financeiro (Resumo, Despesas, Receitas, Transf., Contas…) agora
  quebram em 2 linhas de 3 abas — sem scroll lateral. Antes usavam `overflow-x:auto`
  forçando arrastar para ver todas. Agora cada aba ocupa 1/3 da largura com
  `flex-wrap:wrap` e `flex:1 1 33%`.

## v2.9.11 — 2026-08-28

### Alterado
- **Configurações** removida da grade principal — continua acessível pelos 3 pontinhos
  (menu desktop e sheet mobile). Módulo e arquivos intactos.
- **Usuários** removido da grade principal — movido para os 3 pontinhos (desktop e
  mobile sheet), visível somente para perfis com permissão `usuarios.ver`.

## v2.9.10 — 2026-08-28

### Corrigido
- Erro `does not provide an export named 'u'` em Planos: o export `u` (gerador de
  UUID via `crypto.randomUUID()`) foi adicionado em `page-lancamentos-v290.js` + F1,
  que é de onde Planos (e outros módulos) o importam.

### Removido
- Módulo **Cobranças** completamente excluído: assets (`index-Bl4esJceb.js` e F1),
  registry, card em `app.html`, RBAC todos os perfis.

## v2.9.9 — 2026-08-28

### Adicionado
- **Pull-to-refresh** na tela principal: puxe para baixo a partir do topo (com
  nenhum módulo aberto) para recarregar a página. Um indicador circular verde
  aparece acompanhando o gesto; ao soltar após ~90px dispara o reload com animação.

## v2.9.8 — 2026-08-28

### Corrigido
- Erro `does not provide an export named 'u'` no módulo Planos (e potencialmente
  em Receitas, Despesas, Transferências, Categorias, Ajustes): todos esses módulos
  importavam de `page-lancamentos-BfWtlLw7b.js` (arquivo antigo renomeado na v2.9.2).
  Substituído pelo nome correto `page-lancamentos-v290.js` em todos os 12 arquivos
  afetados (6 normais + 6 F1).

## v2.9.7 — 2026-08-28

### Removido
- Módulo **Contratos** completamente excluído: arquivos JS (`page-contratos-DsRvToNz.js`
  e espelho F1), entrada no registry de módulos, card de navegação em `app.html`,
  e todas as permissões RBAC em todos os perfis.

## v2.9.6 — 2026-08-28

### Removido
- Módulo **Contas** completamente excluído: arquivos JS (`page-contas-ChlK-aHV.js`
  e espelho F1), entrada no registry de módulos, card de navegação em `app.html`,
  e todas as permissões RBAC em todos os perfis.

## v2.9.5 — 2026-08-28

### Corrigido
- Erro `Could not find the 'obs' column of 'fin_despesas' in the schema cache` ao
  salvar nova despesa/receita/meta: o campo `obs` (Observação) existia nos
  formulários mas não nas tabelas do Supabase. Todas as 6 funções de salvamento em
  `page-lancamentos-v290.js` (e espelho F1) agora excluem `obs` do payload antes
  de enviar ao banco. Para habilitar obs no futuro, executar no Supabase:
  ```sql
  ALTER TABLE fin_despesas      ADD COLUMN IF NOT EXISTS obs text;
  ALTER TABLE fin_despesas_fixas ADD COLUMN IF NOT EXISTS obs text;
  ALTER TABLE fin_receitas       ADD COLUMN IF NOT EXISTS obs text;
  ALTER TABLE fin_objetivos      ADD COLUMN IF NOT EXISTS obs text;
  ```

### Removido
- Módulo **Relatórios** completamente excluído: arquivos JS (`index-B4kTMWCq.js`
  e espelho F1), entrada no registry de módulos, card de navegação em `app.html`
  (sidebar e grid), e todas as permissões RBAC em todos os perfis.
- Módulo **Negócios** completamente excluído: arquivos JS (`index-vE4zJAUl.js`
  e espelho F1), entrada no registry de módulos, card de navegação em `app.html`,
  e todas as permissões RBAC em todos os perfis.

## v2.9.4 — 2026-08-28

### Removido
- Módulo **Cartões** completamente excluído: arquivos JS (`page-cartoes-DpTQTZlc.js`
  e espelho F1), entrada no registry de módulos, card de navegação em `app.html`,
  e todas as permissões RBAC em todos os perfis.
- A tabela `fin_cartoes` pode ser removida do Supabase com:
  `DROP TABLE IF EXISTS fin_cartoes CASCADE;`

## v2.9.3 — 2026-08-28

### Removido
- Módulo **Clientes** completamente excluído: arquivos JS (`page-clientes-BqMxNJfD.js`
  e espelho F1), entrada no registry de módulos (`app-CkIaDDom.js`/F1),
  card de navegação em `app.html`, e todas as permissões RBAC em todos os perfis
  (master, admin, gerente, operador, visualizador).
- SQL para remover tabelas de Clientes no Supabase fornecido separadamente.

## v2.9.2 — 2026-08-28

### Corrigido
- Módulo Financeiro: renomeado arquivo de `page-lancamentos-BfWtlLw7b.js`
  para `page-lancamentos-v290.js` — força o browser a baixar versão nova,
  eliminando problema de cache HTTP que mascarava a correção anterior.
- Registry `app-CkIaDDom.js` simplificado: remoção do `.then(r=>r.i)`
  desnecessário — o módulo agora é carregado diretamente como todos os outros.

## v2.9.1 — 2026-08-28

### Corrigido
- Despesas/Receitas fixas: toggle de pago/recebido e exclusão de mês
  agora usam `fSaveValor` — busca o registro existente pelo par
  `(id_despesa_fixa|id_receita_fixa, mes_ref)` antes de inserir,
  evitando violação da constraint UNIQUE ao marcar/desmarcar rapidamente.
- Criação das 13 tabelas `fin_*` documentada em `setup-financeiro-fin-tables.sql`.

## v2.9.0 — 2026-08-28

### Reformulado
- Módulo Financeiro completamente reconstruído do zero sobre 13 tabelas
  normalizadas (`fin_*`) com colunas diretas (sem wrapper JSONB `dados`),
  soft-delete por `deleted_at` e RLS por usuário.
- 10 abas independentes: Resumo, Despesas, Receitas, Transferências,
  Contas, Cartões, Categorias, Orçamentos, Metas e Relatórios.
- Despesas e Receitas distinguem avulsas (lançamento único) de fixas
  (template + valor por mês com flag `excluido_mes`). Toggle de
  pago/recebido atualiza o registro do mês sem duplicar o template.
- Saldo de cada conta calculado em tempo real: saldo inicial + receitas
  recebidas − despesas pagas ± transferências.
- Resumo mensal com KPIs (saldo total, receitas, despesas, saldo do mês),
  cards de contas e lista dos últimos lançamentos do mês.
- Orçamentos com barra de progresso por categoria e alerta ao ultrapassar.
- Metas de poupança com aporte e percentual de conclusão.
- Relatórios: gráfico de barras dos últimos 6 meses + quebra por categoria.
- Cartões de crédito com cor, limite e dia de vencimento.
- Toda a lógica desacoplada do sistema antigo (`lancamentos`) — migração
  total para as novas tabelas `fin_*`.

## v2.8.10 — 2026-08-28

### Corrigido
- Editar recorrente via "Este e os próximos": janela de geração aumentada
  de 12 para 60 meses (5 anos) no modo edição — antes parava em agosto/2027
  para uma despesa mensal iniciada em setembro/2026.

## v2.8.9 — 2026-08-28

### Adicionado
- Financeiro: editar lançamento recorrente com "Este e os próximos" agora
  cria as parcelas futuras que ainda não existem — antes só atualizava
  entradas já cadastradas; agora, se o lançamento tem apenas 1 mês,
  o sistema gera automaticamente os próximos meses (sem duplicar
  meses que já possuam entrada com mesma descrição/cliente).

## v2.8.8 — 2026-08-28

### Performance
- Financeiro: as 4 buscas de lookup (negócios, clientes, contas,
  categorias) agora rodam em paralelo (Promise.all) ao invés de
  sequência — abre modal em 1 round-trip de rede em vez de 4.
- Pré-carregamento dos dados de lookup em background ao abrir o módulo,
  eliminando espera no primeiro clique em Novo/Editar.

## v2.8.7 — 2026-08-28

### Corrigido
- Financeiro mobile: navegação (◄ mês ►) e resumo (Receitas/Despesas/Saldo)
  agora em duas linhas separadas — nav centralizada acima, resumo centralizado abaixo.

## v2.8.6 — 2026-08-28

### Alterado
- Layout mobile do Financeiro reorganizado: navegação de mês ocupa linha
  própria (sem apertar com Receitas/Despesas), filtros de tipo e status
  em linha separada dos filtros de negócio/busca/novo. Campo de busca
  agora é flexível (não força largura fixa). Rótulo "Qualquer status"
  encurtado para "Todos" nos filtros de status.

## v2.8.5 — 2026-08-28

### Corrigido
- Editar lançamento recorrente gerava cópias duplicadas: ao salvar um
  lançamento com frequência ≠ "única", o submit entrava no branch de
  geração de série mesmo em modo edição. Corrigido — novas parcelas só
  são geradas ao criar (Novo), nunca ao editar.

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
