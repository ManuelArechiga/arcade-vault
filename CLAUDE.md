# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Concretely: this project runs **Next.js 16.2.12** with React 19.2.4 — newer than most training data. Before writing any Next.js code (routing, data fetching, config, metadata, etc.), consult the bundled docs at `node_modules/next/dist/docs/` (organized into `01-app`, `02-pages`, `03-architecture`, `04-community`) rather than relying on prior knowledge.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`)

There is no test runner configured yet.

## Architecture

This is a fresh App Router project (`app/` directory) using Tailwind CSS v4 (via `@tailwindcss/postcss`, configured through the `@theme inline` block in `app/globals.css` rather than a `tailwind.config.js`). Path alias `@/*` maps to the project root (see `tsconfig.json`).

Currently the app is unmodified `create-next-app` boilerplate (`app/layout.tsx`, `app/page.tsx`) — no real product code, pages, or components exist yet.

## Product intent

Per `README.md`: Arcade Vault is meant to be an online gaming platform where users compete for high scores.

## Workflow: Spec Driven Design

This repo intends to follow spec-driven development using the `/spec` and `/spec-impl` workflow from the [fernando-skills](https://github.com/Klerith/fernando-skills) skill pack (installed via `npx skills@latest add Klerith/fernando-skills`). If those skills are available, prefer writing a spec before implementing new features.
