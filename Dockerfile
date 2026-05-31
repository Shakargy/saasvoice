# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# SaaSVoice production image (multi-stage, Next.js standalone output).
# Built to stay small enough for a GCP e2-micro free-tier VM.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
# libc compat for some native deps (e.g. Prisma engines).
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Dependencies (cached layer) -------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# --- Build -----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# A dummy DATABASE_URL lets `next build` run without a live DB at build time.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime ---------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + static assets + public dir.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Overlay the FULL node_modules from the builder on top of the standalone's
# trimmed one. It's a strict superset, so the runtime client still works AND
# the Prisma CLI (+ all its transitive deps) is present for `migrate deploy`.
# Cherry-picking @prisma/* sub-packages is fragile — engines pulls in config,
# get-platform, etc. — so we copy the whole tree. (Built on the VM, not pushed
# to a registry, so the extra size is fine.)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Entrypoint runs migrations, then boots the server.
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["./entrypoint.sh"]
