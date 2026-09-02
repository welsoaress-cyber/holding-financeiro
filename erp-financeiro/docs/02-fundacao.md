# Etapa 2 — Fundação

Status: **implementada e testada localmente; aguardando validação e 2 decisões suas** (ver seção 6).

> **Pendência aprovada em documentação, ainda não aplicada no código:** renomear `entidades` → `organizacoes` e `entidade_membros` → `organizacao_membros` (ver `01-arquitetura.md`, seção 11.8). Será feito na retomada da Fundação, antes de aplicar a migration no Supabase.

## 1. O que existe

### Banco (`supabase/migrations/20260902000001_fundacao.sql`)
| Objeto | Função |
|---|---|
| `entidades` | Escopo de dados. Toda tabela financeira futura terá `entidade_id`. |
| `entidade_membros` | Vínculo `auth.users` × entidade, com papel `proprietario` / `membro`. |
| `auditoria` | Trilha imutável: tabela, registro, ação, antes/depois (JSON), usuário, quando. |
| `tg_auditoria()` | Trigger genérico. Basta anexar a qualquer tabela nova. Grava via `security definer` porque clientes não têm permissão de escrita na auditoria. |
| `tg_atualizado_em()` | Mantém `atualizado_em`, ignorando valor enviado pelo cliente. |
| `tg_novo_usuario()` | Ao criar usuário no Auth, cria a entidade dele e o vincula como proprietário. |
| `minhas_entidades()` / `sou_proprietario()` | Helpers `security definer` usados nas policies (evitam recursão de RLS). |

Sem extensões adicionais: `gen_random_uuid()` é nativo do Postgres 13+.

### RLS e privilégios
- RLS habilitado nas 3 tabelas.
- `entidades`: membro lê; **só proprietário edita**; sem insert/delete pelo cliente.
- `entidade_membros`: membro lê os membros da própria entidade; sem escrita pelo cliente.
- `auditoria`: membro lê a trilha da própria entidade; **nenhuma escrita pelo cliente**.
- `anon` não tem acesso a nada. Grants revogados explicitamente além do RLS (defesa em profundidade).
- Todas as funções têm `search_path` fixo.

### Aplicação (`app/`)
```
src/
├── app/            App.tsx (providers), router.tsx (rotas geradas do registro), modulos.ts (REGISTRO)
├── core/
│   ├── supabase/   cliente único; tela de erro se .env ausente
│   ├── auth/       AuthProvider, useAuth, RequireAuth / SomenteAnonimo
│   ├── entidade/   EntidadeProvider, useEntidade (entidade atual = escopo de todas as consultas futuras)
│   ├── modulos/    contrato DefinicaoModulo
│   ├── layout/     AppShell, BarraLateral, BarraSuperior (responsivo)
│   ├── ui/         Botao, Campo, Alerta, Carregando, Cartao, CabecalhoPagina, ModuloEmBreve, Icone
│   └── erros/      ErrorBoundary, mensagemDeErro (tradução de erros do Supabase)
├── modules/        dashboard, lancamentos, contas, categorias, configuracoes (placeholders, sem lógica financeira)
└── pages/auth/     LoginPage, CadastroPage
```
**Adicionar um módulo** = criar `src/modules/<nome>/index.ts` exportando `DefinicaoModulo` e incluir em `src/app/modulos.ts`. Menu e rotas são derivados do registro.

## 2. Decisões técnicas desta etapa
1. **Tailwind v4** via plugin do Vite; tokens de cor em `src/index.css`.
2. **TanStack Query** já na fundação: única forma de consultar dados nos módulos futuros (cache, loading, erro padronizados).
3. **Ícones inline** (SVG próprio) em vez de biblioteca: 6 ícones não justificam dependência.
4. **Nome da entidade** no signup = nome informado no cadastro (metadata `nome`); fallback = parte local do e-mail.
5. **Chaves**: usar a chave *publishable* (`sb_publishable_...`) do projeto, nunca a `service_role`.
6. **Auditoria sem FK** para `entidades`: histórico sobrevive a qualquer remoção futura.
7. Hooks separados dos providers (`useAuth.ts`, `useEntidade.ts`) por exigência do Fast Refresh.

## 3. Testes realizados
| Teste | Como | Resultado |
|---|---|---|
| Migration + RLS + auditoria (`supabase/tests/fundacao_test.sql`, T1–T6) | Postgres 16 local com shim do `auth` (`00_shim_local.sql`) | OK |
| T1 signup cria entidade, membro proprietário e auditoria | SQL | OK |
| T2 usuário vê somente a própria entidade/membros/auditoria | `set role authenticated` + claim `sub` | OK |
| T3 proprietário edita; auditoria grava antes/depois e `usuario_id`; `atualizado_em` sobrescrito | SQL | OK |
| T4 update em entidade alheia afeta 0 linhas | SQL | OK |
| T5 insert/delete em entidades, membros e auditoria negados ao cliente | SQL (`insufficient_privilege`) | OK |
| T6 `anon` sem acesso a tabelas e funções | SQL | OK |
| Typecheck + build (`tsc -b && vite build`) | npm | OK |
| Lint (`oxlint`) | npm | 0 avisos |
| Sem `.env`: tela "Supabase não configurado" | Chromium headless | OK |
| `/entrar`, `/cadastro` renderizam; `/` e `/contas` sem sessão redirecionam ao login | Chromium headless | OK |
| Shell autenticado: menu, nome da entidade, e-mail, botão Sair, placeholders, Configurações | Chromium headless + mock local da API REST + sessão simulada | OK |

**Não testado ainda** (depende do projeto Supabase real): signup/login/logout ponta a ponta contra o Auth.

Rodar os testes de banco localmente:
```
createdb erp_test
psql -d erp_test -f supabase/tests/00_shim_local.sql -f supabase/migrations/20260902000001_fundacao.sql
psql -d erp_test -f supabase/tests/fundacao_test.sql   # deve terminar com OK
```

## 4. Como rodar o app
```
cd erp-financeiro/app
cp .env.example .env.local   # preencher URL e chave publishable do projeto
npm install
npm run dev
```

## 5. Hospedagem / deploy — NÃO configurado (aguardando autorização)
Recomendação: **Cloudflare Pages**.
- Serviço: hospedagem de site estático (o build do Vite é 100% estático).
- Por quê: sem Netlify; plano gratuito sem cartão; 500 builds/mês; banda e requisições ilimitadas; SPA fallback nativo.
- Cobrança: **nenhuma** no plano Free. Só há custo se você contratar manualmente o plano Workers Paid (US$ 5/mês) para recursos que este projeto não usa.
- Alternativa: GitHub Pages (gratuito; em repositório privado exige GitHub Pro).

Nada foi criado, conectado ou configurado. Configuro após seu OK.

## 6. Bloqueio: criação do projeto Supabase
A API retornou custo **US$ 0/mês** e a criação foi tentada, mas foi **recusada**: o plano gratuito permite **2 projetos ativos por conta** e a conta já tem `navalha-app` e `holding-financeiro`.

Opções (decisão sua; não executei nenhuma):
| Opção | Custo | Efeito |
|---|---|---|
| A. Pausar um projeto legado (`holding-financeiro` ou `navalha-app`) | R$ 0 | Reversível; o projeto pausado fica fora do ar até ser restaurado |
| B. Excluir um projeto legado | R$ 0 | Irreversível |
| C. Supabase Pro | US$ 25/mês + US$ 10/mês por projeto extra | Não recomendado para uso pessoal |

Limitações conhecidas do plano Free do Supabase: projeto **pausa após 7 dias sem uso** (restauração manual no painel, sem perda de dados); e-mails de confirmação pelo remetente padrão têm limite de poucos envios por hora, suficiente para uso pessoal.

Assim que o projeto existir: aplicar a migration, preencher `.env.local`, testar signup/login/logout ponta a ponta.
