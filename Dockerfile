ARG BASE_IMAGE=node:23.10-alpine3.20


FROM ${BASE_IMAGE} AS build

COPY ./package*.json ./
COPY ./src ./src
COPY tsconfig.json ./

RUN npm ci
RUN npx tsc



FROM ${BASE_IMAGE} AS deps

COPY ./package*.json ./

RUN npm ci --omit=dev



FROM ${BASE_IMAGE} AS run

WORKDIR /app

COPY --from=deps ./node_modules /app/node_modules
COPY --from=build ./dist /app/

CMD [ "node", "main.js" ]