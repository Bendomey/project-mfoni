# base node image
FROM node:18-bookworm-slim as base

# install all node_modules, including dev
FROM base as deps

RUN mkdir /app/
WORKDIR /app/

ADD package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production=false

# setup production node_modules
FROM base as production-deps

RUN mkdir /app/
WORKDIR /app/

ADD package.json yarn.lock /app/
RUN yarn install --frozen-lockfile --production=true

# build app
FROM base as build

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

RUN mkdir /app/
WORKDIR /app/

COPY --from=deps /app/node_modules /app/node_modules

# app code changes all the time
ADD . .
RUN yarn build

# build smaller image for running
FROM base

ENV NODE_ENV="production"
ENV PORT="3000"

ARG API_ADDRESS
ENV API_ADDRESS=$API_ADDRESS

RUN mkdir /app/
WORKDIR /app/

COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/public /app/public

CMD ["node", "server.js", "--bind", "0.0.0.0:3000"]

EXPOSE 3000

