# Holding Financeiro — Claude Instructions

## Active Skills

- **servnet-design**: ServNet's visual design system. Invoke automatically when editing any file under `servnet-site/`. Load via the skill file at `.claude/skills/servnet-design.md`.

## Standing Rules

- **Security**: Never paste or store MP Access Token in code or chat — Supabase secrets only.
- **Versioning**: Bump version + update CHANGELOG on every change to `servnet-site/painel/`.
- **F1 mirror**: Every `*.js` asset in `servnet-site/painel/assets/` has a `*F1.js` twin — always `cp` after editing. Both files must be identical.
- **Branch**: Feature work → `claude/requested-change-not-done-da364n`; merge to main after each change set.
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/lkymiclirksgqkeiglyw/sql/new
- **Deploy target**: No Netlify. Push to GitHub, site serves from repo.

## Project Structure

```
holding-financeiro/
├── servnet-site/          # servnet.net.br public site
│   ├── index.html         # Main site — apply servnet-design skill
│   ├── painel/            # Customer panel SPA (Vite build output)
│   │   ├── assets/        # Compiled JS — all have F1 twin files
│   │   └── CHANGELOG.md   # Bump on every change
│   └── portal.html        # Portal redirect
└── .claude/
    └── skills/
        └── servnet-design.md  # Visual design system for ServNet
```

## Supabase Pattern

- Project: `lkymiclirksgqkeiglyw`
- Tables use `dados` JSONB column except: `categorias`, `negocios` (flat columns)
- O Set pattern: `O = new Set(["categorias","negocios"])` — only these skip JSONB

## ERP Financeiro Pessoal (Novo Projeto)

Architecture approved. Stack: React + TypeScript + Vite + Tailwind + Supabase.
5 tables: profiles, accounts, categories, transactions, recurrences.
Core principle: balance is always calculated from transactions, never stored.
**Status: awaiting Etapa 1 kickoff.**
