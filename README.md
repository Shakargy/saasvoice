# SaaSVoice

**Turn product updates into founder-style posts that sound human.**

SaaSVoice takes raw product updates — changelogs, bug fixes, feature launches, lessons learned, metrics, founder thoughts — and turns them into short, specific posts for X and LinkedIn. It's built for SaaS founders, indie hackers, devtool makers, and technical creators who want to post consistently without sounding like generic AI.

What makes it different is the **Anti-AI Voice Score**: a deterministic checker that flags generic phrasing, buzzwords, weak hooks, fake-sounding excitement, and posts that read like ChatGPT wrote them — before you ever publish.

> A full-stack portfolio project. Runs end-to-end with zero API keys thanks to a built-in mock AI provider.

## Why it exists

Most AI post generators produce the same beige marketing copy: "Excited to announce", "game-changer", "supercharge your workflow". That content gets ignored. SaaSVoice optimizes for the opposite — specific, credible, founder-voice posts grounded in the actual update — and scores every draft so you can see *why* something sounds generic and how to fix it.

It's not another scheduler. It doesn't try to replace Buffer or Hootsuite. It focuses on writing better founder-led content. Copy and CSV export work today; direct platform posting is intentionally left as a future integration.

## Features

- **Changelog → content** — paste a raw update, get usable posts
- **Import from GitHub** — paste a public repo, pick a commit, and it prefills an update (no login, no token)
- **Founder voice generation** — five distinct variations per update: punchy, founder progress, educational, storytelling, opinionated
- **Anti-AI Voice Score** — deterministic scoring with concrete reasons and a suggested fix for every post
- **Edit, approve, queue, copy** — keep the posts that sound like you
- **Content queue** — line up approved posts with a planned date
- **CSV export** — your content, portable
- **Guided onboarding** + mobile-first UI with a native-style bottom tab bar

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript (strict)
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- Prisma ORM + PostgreSQL
- Auth.js / NextAuth v5 (email + password, bcrypt, JWT sessions)
- Zod validation, React Hook Form
- Pluggable AI provider layer — a **mock** provider (no API key, default) and **Gemini**, with room for more
- Vitest unit tests for the scoring engine and GitHub utilities
- Docker + Docker Compose; deployable to a single free-tier GCP VM

## Architecture

- **App Router** with server components for data fetching; route handlers under `src/app/api/*` for mutations.
- **Auth** is split so the edge proxy (`src/proxy.ts`) stays lightweight: `auth.config.ts` is edge-safe and guards routes, while `auth.ts` adds the Credentials provider (Prisma + bcrypt).
- **The Anti-AI Voice Score is deterministic and server-authoritative** (`src/lib/ai/scoring.ts`). The AI returns post *text only*; the server scores it. This keeps scores consistent, testable, and free — and identical in mock mode.
- **AI providers** implement a small interface (`src/lib/ai/types.ts`). `generate-posts.ts` selects the provider from `AI_PROVIDER`, generates, validates with Zod, then scores each post.
- **Usage** is enforced server-side: one generation run counts as one unit against the monthly free limit.
- **Every API route** verifies the session user exists and checks resource ownership, and always responds with JSON.

```
src/
  app/            routes (marketing, auth, dashboard) + /api handlers
  components/     ui primitives, dashboard, forms, posts, marketing
  lib/
    ai/           scoring (+ tests), providers (mock, gemini), prompt, orchestrator
    validators/   Zod schemas
    auth*.ts, db.ts, usage.ts, github.ts (+ tests), api.ts, client.ts
prisma/           schema, migrations, seed
docker/           entrypoint, Caddyfile
```

## Getting started (local)

Requirements: Node 20+ and Docker (for Postgres).

```bash
# 1. Install dependencies
npm install

# 2. Environment (defaults run locally with the mock AI provider)
cp .env.example .env

# 3. Start Postgres (maps to host port 5433) and apply migrations
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate

# 4. (Optional) seed a demo account
npm run db:seed      # demo@saasvoice.dev / demo1234

# 5. Run it
npm run dev          # http://localhost:3000
```

`AI_PROVIDER=mock` (the default) means the whole app — generation, scoring, export — works with **no API keys**. To use real generation, set `AI_PROVIDER=gemini` and `GEMINI_API_KEY` (free via Google AI Studio).

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run db:migrate` | Apply Prisma migrations (dev) |
| `npm run db:seed` | Seed the demo account |

## Production (Docker)

The production stack (app + Postgres, optional Caddy TLS proxy) runs from one compose file. Migrations apply automatically on container start.

```bash
cp .env.example .env     # set POSTGRES_PASSWORD, NEXTAUTH_SECRET, URLs
docker compose up -d --build
```

To deploy on a free-tier Google Cloud VM, see **[DEPLOY_GCP_FREE_TIER.md](DEPLOY_GCP_FREE_TIER.md)** — a step-by-step guide for an `e2-micro` instance (with a budget alert, swap setup, and clear cost warnings).

## Security

This repository is public; secrets never live in it.

- Real values go in `.env`, which is gitignored. Only `.env.example` (placeholders) is committed.
- AI API keys are read server-side only, never exposed to the client.
- Usage limits and resource ownership are always enforced on the server, never trusted from the client.
- Passwords are hashed with bcrypt; sessions are HTTP-only JWT cookies.

## Known limitations

- Direct posting to X / LinkedIn isn't implemented (copy/export instead) — platform APIs are paid, so it's a planned premium feature.
- GitHub import covers **public** repos only; private repos need the future OAuth integration.
- One product profile per user in this version.
- The in-memory rate limiter is per-instance (fine for a single VM, not a cluster).

## Roadmap

- Stripe billing and a Pro plan
- X / LinkedIn OAuth and direct posting (premium)
- GitHub OAuth for private repos and release-notes import
- Brand voice learned from past posts
- Content calendar, team approval, multi-product workspaces, analytics

## License

[MIT](LICENSE) © Aviad Shakargy
