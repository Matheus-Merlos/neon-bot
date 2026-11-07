# syntax=docker/dockerfile:1
ARG image=node:26.12.1-alpine3.23

FROM ${image} AS base
RUN npm i -g pnpm@12
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

FROM ${image} AS bot
ENV NODE_ENV=production
WORKDIR /bot

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist .
COPY --chown=node:node drizzle ./drizzle

USER node
CMD ["node", "main"]
