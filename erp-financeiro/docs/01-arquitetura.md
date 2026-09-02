# ERP Financeiro Pessoal — Etapa 1: Arquitetura

Status: **aguardando aprovação**. Projeto novo, independente do sistema legado deste repositório (nada é reaproveitado).

---

## 1. Visão geral da arquitetura

### 1.1 Princípio central
O sistema é um **livro-razão (ledger) pessoal**. Tudo que altera dinheiro passa por um único motor: o **Lançamento**. Nenhuma tela grava saldo. Saldo, receitas, despesas e resultado são sempre **calculados** a partir dos lançamentos efetivados. Isso elimina divergência entre telas e impede saldo digitado manualmente.

### 1.2 Camadas

```
┌──────────────────────────────────────────────────────┐
│ UI (React + TypeScript)                              │
│  módulos de tela: dashboard, lançamentos, contas...  │
├──────────────────────────────────────────────────────┤
│ Camada de aplicação (TypeScript)                     │
│  casos de uso por módulo, validação, formatação      │
├──────────────────────────────────────────────────────┤
│ Motor financeiro (PostgreSQL)                        │
│  tabelas, constraints, funções atômicas, views de    │
│  saldo, auditoria, RLS por usuário                   │
└──────────────────────────────────────────────────────┘
```

**Decisão:** as regras de integridade financeira vivem **no banco** (constraints, funções transacionais, views). A UI nunca é a única guardiã de uma regra. Motivo: futuras integrações (importação de extrato, automações, API) usam o mesmo motor e não conseguem burlar as regras.

### 1.3 Stack

| Camada | Escolha | Justificativa |
|---|---|---|
| Banco | PostgreSQL via **Supabase** (projeto **novo**, separado do legado) | Constraints, funções, views, RLS, auth pronta, custo zero no início |
| Frontend | **React + TypeScript + Vite**, TanStack Query, Tailwind | Estrutura por módulos, tipagem forte, build estático barato |
| Hospedagem | Netlify (já existente na conta) | Custo zero |
| Backend próprio | **Nenhum** no MVP | Supabase client + funções SQL (RPC) para operações atômicas. Um backend só entra quando houver integração externa |

### 1.4 Organização do código (por módulo, não por tipo de arquivo)

```
erp-financeiro/
├── docs/                    # decisões de arquitetura
├── supabase/
│   └── migrations/          # esquema versionado, uma migration por etapa
└── app/
    └── src/
        ├── core/            # auth, cliente supabase, dinheiro, datas, layout
        ├── modules/
        │   ├── contas/
        │   ├── categorias/
        │   ├── lancamentos/
        │   └── dashboard/
        └── app/             # roteamento, menu, registro de módulos
```

Cada módulo contém suas telas, consultas, tipos e regras de apresentação. Um módulo só conversa com outro por interfaces públicas (`modules/contas/index.ts`), nunca importando arquivos internos.

---

## 2. Módulos

| # | Módulo | Prioridade | Depende de | Observação |
|---|---|---|---|---|
| 1 | **Núcleo** (auth, entidade, auditoria) | Essencial | — | Invisível ao usuário |
| 2 | **Contas** | Essencial (MVP) | Núcleo | Contas bancárias, dinheiro, carteira |
| 3 | **Categorias** | Essencial (MVP) | Núcleo | Hierárquicas desde o início |
| 4 | **Lançamentos** | Essencial (MVP) — **coração** | Contas, Categorias | Receita, despesa, transferência |
| 5 | **Dashboard** | Essencial (MVP) | Lançamentos | Só leitura |
| 6 | Contas a Pagar / Receber | Fase 2 | Lançamentos | **Não é tabela nova**: são lançamentos com status `previsto`. Vira uma tela/visão |
| 7 | Cartões de Crédito | Fase 2 | Contas, Lançamentos | Cartão = conta do tipo `cartao_credito` + entidade Fatura |
| 8 | Centros de Custo | Fase 2 | Lançamentos | Dimensão opcional do lançamento |
| 9 | Orçamento | Fase 2 | Categorias, Lançamentos | Meta por categoria × mês; realizado vem do ledger |
| 10 | Relatórios | Fase 2 | Lançamentos | Views SQL, sem lógica nova |
| 11 | Importação de extratos / Conciliação | Fase 3 | Contas, Lançamentos | Extrato importado ↔ movimento |
| 12 | Empréstimos e Financiamentos | Fase 3 | Contas, Lançamentos | Contrato gera parcelas como lançamentos previstos |
| 13 | Patrimônio | Fase 3 | Contas | Bens + contas = patrimônio líquido |
| 14 | Investimentos | Fase 3 | Contas, Patrimônio | Conta tipo `investimento` + posições |
| 15 | Planejamento / Indicadores | Fase 4 | Tudo acima | Projeção usa lançamentos previstos |
| 16 | Configurações | Essencial (mínimo) | Núcleo | Perfil, preferências |

Regra de dependência: **nenhum módulo grava fora do motor de lançamentos**. Cartão, empréstimo, orçamento e importação **produzem ou leem lançamentos**; não criam saldos paralelos.

---

## 3. Núcleo financeiro

### 3.1 Modelo: Lançamento + Movimentos
Um **Lançamento** é o evento de negócio (o que aconteceu). Um **Movimento** é o efeito em uma conta (quanto entrou/saiu de onde).

| Tipo | Movimentos gerados | Categoria |
|---|---|---|
| Receita | 1 movimento **positivo** na conta | Obrigatória (tipo receita) |
| Despesa | 1 movimento **negativo** na conta | Obrigatória (tipo despesa) |
| Transferência | 2 movimentos: **−valor** na origem, **+valor** no destino, na mesma transação SQL | **Nula** (nunca entra em receita/despesa) |

Consequências diretas:
- Saldo de uma conta = `saldo_inicial + Σ movimentos efetivados`.
- Receitas/despesas do período = Σ lançamentos efetivados por tipo. Transferência fica de fora por construção.
- Cartão, parcelamento, empréstimo, importação: tudo cabe nesse modelo sem alterá-lo.

### 3.2 Estados do lançamento

```
previsto ──► efetivado ──► (edição auditada)
   │
   └──► cancelado
```

- **previsto**: agendado / a pagar / a receber. Não afeta saldo real. Afeta saldo **projetado**.
- **efetivado**: pago / recebido. Afeta saldo real.
- **cancelado**: preservado para histórico; não afeta nada. **Não existe exclusão física** de lançamento que já foi efetivado.

### 3.3 Datas (três, com papéis distintos)

| Campo | Significado | Uso |
|---|---|---|
| `data_competencia` | Quando o fato ocorreu (compra, salário) | Relatórios por competência, orçamento |
| `data_vencimento` | Quando deve ser pago/recebido | Contas a pagar/receber, alertas |
| `data_efetivacao` | Quando o dinheiro realmente moveu | **Saldo**, fluxo de caixa |

No MVP, o formulário preenche as três com a mesma data por padrão; o usuário só altera se precisar. A estrutura já suporta cartão e vencimentos sem migração.

---

## 4. Banco de dados (entidades principais)

Convenções: chave `uuid`; `criado_em`, `atualizado_em` em tudo; valores em `numeric(14,2)`; toda tabela de negócio tem `entidade_id` protegido por RLS.

### 4.1 Núcleo
- **entidades** — a "pessoa financeira" dona dos dados (hoje: você). Existe desde o início para permitir, no futuro, família/holding/segundo usuário **sem migrar dados**. Não é multiempresa; é apenas a chave de escopo.
- **entidade_membros** — `entidade_id`, `usuario_id` (auth), `papel`.
- **auditoria** — `tabela`, `registro_id`, `acao`, `dados_antes`, `dados_depois`, `usuario_id`, `quando`. Preenchida por trigger.

### 4.2 Cadastros
- **contas** — `nome`, `tipo` (corrente, poupanca, dinheiro, carteira_digital, investimento, cartao_credito*), `saldo_inicial`, `data_inicio`, `moeda` (BRL), `ativo`, `cor/icone`.
  Regras: não pode ser excluída se possuir movimentos (apenas inativada); `saldo_inicial` só editável enquanto não houver movimentos (após isso, ajuste vira lançamento).
  *`cartao_credito` reservado, habilitado na Fase 2.
- **categorias** — `nome`, `tipo` (receita | despesa), `categoria_pai_id` (nula = raiz), `ativo`, `ordem`, `sistema` (bool, protege categorias internas como "Ajuste de saldo").
  Regras: filha herda o tipo do pai; inativa não aparece em novos lançamentos mas permanece no histórico.

### 4.3 Motor
- **lancamentos** — `tipo` (receita | despesa | transferencia), `descricao`, `valor` (> 0 sempre; o sinal é do movimento), `data_competencia`, `data_vencimento`, `data_efetivacao` (nula se previsto), `status` (previsto | efetivado | cancelado), `categoria_id` (obrigatória para receita/despesa, **nula obrigatoriamente** para transferência — constraint), `observacao`, `origem` (manual | importacao | recorrencia | sistema — reservado).
- **movimentos** — `lancamento_id`, `conta_id`, `valor` (com sinal), `data` (= data_efetivacao).
  Regras (constraints/trigger): receita/despesa têm exatamente 1 movimento; transferência tem exatamente 2, com contas distintas e soma zero; movimentos só existem para lançamentos `efetivado`.

### 4.4 Consultas derivadas (views)
- **vw_saldo_contas** — saldo real por conta.
- **vw_saldo_projetado** — saldo real + previstos até uma data.
- **vw_resultado_periodo** — receitas, despesas e resultado por mês (exclui transferências por construção).

### 4.5 Relacionamentos

```
entidades 1──n contas
entidades 1──n categorias (categorias n──1 categorias  [pai])
entidades 1──n lancamentos n──1 categorias
lancamentos 1──n movimentos n──1 contas
```

### 4.6 Reservado para fases futuras (não criado agora)
`cartoes_faturas`, `centros_custo`, `orcamentos`, `recorrencias`, `extratos_importados`, `conciliacoes`, `contratos_emprestimo`, `bens_patrimonio`, `posicoes_investimento`, `anexos`, `tags`. Todos se ligam a `lancamentos`/`contas` existentes; nenhum exige alterar o núcleo.

---

## 5. Regras fundamentais do motor financeiro

1. **Saldo nunca é gravado.** É `saldo_inicial + Σ movimentos efetivados`. Se um dia for necessário cache por performance, será materializado a partir do ledger e recalculável.
2. **Receita** = lançamento tipo receita + 1 movimento positivo. Exige categoria de receita.
3. **Despesa** = lançamento tipo despesa + 1 movimento negativo. Exige categoria de despesa.
4. **Transferência** = 1 lançamento + 2 movimentos criados em **uma função SQL atômica** (`registrar_transferencia`). Sem categoria. Nunca aparece em receita/despesa. Origem ≠ destino.
5. **Valor sempre positivo** no lançamento; o sinal pertence ao movimento. Evita erro de digitação de sinal.
6. **Previsto vs efetivado:** só o efetivado altera saldo real. Efetivar um previsto = preencher `data_efetivacao` e gerar movimentos (função `efetivar_lancamento`). "Contas a pagar" = despesas previstas; "contas a receber" = receitas previstas.
7. **Vencimento** é informação de controle, não de saldo. Atrasado = previsto com vencimento < hoje.
8. **Lançamentos futuros** entram como `previsto` com data futura. Dashboard mostra saldo real e, opcionalmente, projetado.
9. **Exclusão:** lançamento `previsto` pode ser excluído; `efetivado` só pode ser **cancelado** (auditado) ou editado (auditado). Conta e categoria com uso: apenas inativadas.
10. **Duplicidade:** aviso na UI quando existir lançamento com mesma conta, valor e data em ±1 dia; futura importação usará hash de extrato como chave única.
11. **Ajuste de saldo** (quando o usuário sabe o saldo real e o sistema diverge): nunca edita saldo; gera lançamento com categoria de sistema "Ajuste de saldo", rastreável.
12. **Datas** armazenadas como `date` (sem fuso); dinheiro em `numeric(14,2)` no banco e inteiro em centavos na UI para evitar erro de ponto flutuante.
13. **Toda mutação passa por função SQL ou pela tabela com constraints**; a UI não implementa regra que o banco não valide.

---

## 6. Navegação (MVP)

```
▣ Dashboard
▣ Lançamentos           (lista + filtro por período/conta/categoria/tipo; novo: receita | despesa | transferência)
▣ Contas
▣ Categorias
▣ Configurações
```

Estrutura futura do menu (grupos aparecem apenas quando o módulo existir):

```
Visão geral      Dashboard · Indicadores
Movimentação     Lançamentos · Contas a pagar · Contas a receber · Transferências
Cadastros        Contas · Cartões · Categorias · Centros de custo
Planejamento     Orçamento · Planejamento financeiro
Patrimônio       Patrimônio · Investimentos · Empréstimos e financiamentos
Relatórios       Relatórios · Conciliação · Importação
Configurações
```

Layout: barra lateral fixa à esquerda, cabeçalho com seletor de período (mês) global, conteúdo à direita. Sem gráficos além do essencial no MVP.

---

## 7. Evolução sem quebrar o existente

- **Núcleo estável:** `lancamentos` e `movimentos` não mudam de significado. Novos módulos adicionam tabelas que **apontam para** eles, não os alteram.
- **Migrations versionadas:** cada etapa = uma migration numerada; nunca se edita migration aplicada.
- **Módulos registrados:** o menu e as rotas são montados a partir de um registro (`app/modules.ts`). Adicionar módulo = adicionar pasta + uma linha no registro.
- **Contratos públicos por módulo:** um módulo expõe `index.ts`; outros só consomem isso.
- **Campos reservados já previstos:** `origem` no lançamento, tipo `cartao_credito` na conta, `entidade_id` em tudo — evitam migrações de dados nas fases 2–3.
- **Views como API de leitura:** relatórios e dashboards leem views; mudar a implementação interna não quebra telas.
- **Testes de regra no banco:** cada regra da seção 5 ganha um teste SQL (pgTAP) antes de o módulo ser considerado pronto.

---

## 8. Roadmap

| Etapa | Entrega | Critério de pronto |
|---|---|---|
| 1 | Arquitetura (este documento) | Aprovação sua |
| 2 | Fundação: projeto Supabase novo, app Vite, auth, `entidades`, `auditoria`, layout com menu, migration inicial | Login funciona; menu vazio profissional |
| 3 | Contas | CRUD, inativação, saldo calculado por view (com saldo inicial) |
| 4 | Categorias | CRUD hierárquico, categorias padrão iniciais (semente) |
| 5 | Lançamentos | Receita, despesa, transferência atômica, previsto/efetivado, cancelamento auditado, filtros, aviso de duplicidade |
| 6 | Dashboard | Saldo total, receitas, despesas, resultado do período, últimas movimentações |
| 7+ | Fase 2 | Contas a pagar/receber (visão), cartões/faturas, orçamento, centros de custo, relatórios |
| — | Fase 3 | Importação/conciliação, empréstimos, patrimônio, investimentos |
| — | Fase 4 | Planejamento, indicadores, automações |

Sequência mantida como você propôs. Única troca sugerida: **Etapa 2 (Fundação) entra antes de Contas** porque auth, entidade e layout são pré-requisito de qualquer tela.

---

## 9. Definição do MVP

**Escopo:** Etapas 2 a 6. Contas, Categorias, Lançamentos (receita/despesa/transferência, previsto/efetivado) e Dashboard.

**Fora do MVP:** IA, automações, integração bancária, Open Finance, investimentos, conciliação, documentos, multiempresa, contabilidade, cartão de crédito (estrutura reservada, tela na Fase 2), recorrência (campo reservado, lógica na Fase 2).

**Pronto quando:** saldo de qualquer conta bate com `saldo_inicial + Σ movimentos` em qualquer tela; transferência não aparece como receita/despesa; lançamento efetivado não pode ser apagado; cadastros em uso não podem ser excluídos.

---

## 10. Decisões que precisam da sua confirmação

1. **Projeto Supabase novo** (separado do legado). Recomendado; evita contaminação de esquema e RLS.
2. **Pasta `erp-financeiro/` neste repositório** por enquanto. Se preferir, migro para repositório próprio na Etapa 2.
3. **Stack**: React + TypeScript + Vite + Supabase + Netlify.
4. **Modelo Lançamento + Movimentos** com transferência = 2 movimentos.
5. **Sem exclusão física** de lançamento efetivado (cancelamento auditado).
