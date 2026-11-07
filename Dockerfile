ARG image=node:22.23.4-alpine3.23

FROM ${image} AS buildDeps

COPY package*.json ./

RUN npm ci



FROM ${image} AS build

COPY . .
COPY --from=buildDeps node_modules ./node_modules

RUN npx tsc



FROM ${image} AS deps

COPY package*.json ./

RUN npm ci --omit=dev



FROM ${image} AS bot

WORKDIR /bot

COPY --from=deps node_modules ./node_modules
COPY --from=build dist .
COPY drizzle ./drizzle

CMD [ "node", "main" ]
