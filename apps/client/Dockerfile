# base node image
FROM node:20-bookworm-slim as base

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

ARG SENTRY_DSN
ENV SENTRY_DSN=$SENTRY_DSN

ARG AWS_SECRET_KEY
ENV MFONI_AWS_SECRET_KEY=$AWS_SECRET_KEY

ARG AWS_ACCESS_KEY
ENV MFONI_AWS_ACCESS_KEY=$AWS_ACCESS_KEY

ARG AWS_REGION
ENV MFONI_AWS_REGION=$AWS_REGION

ARG S3_BUCKET
ENV S3_BUCKET=$S3_BUCKET

ARG REKOGNITION_COLLECTION
ENV REKOGNITION_COLLECTION=$REKOGNITION_COLLECTION

ARG GOOGLE_AUTH_CLIENT_ID
ENV MFONI_GOOGLE_AUTH_CLIENT_ID=$GOOGLE_AUTH_CLIENT_ID

ARG TWITTER_CONSUMER_KEY
ENV TWITTER_CONSUMER_KEY=$TWITTER_CONSUMER_KEY

ARG TWITTER_CONSUMER_SECRET
ENV TWITTER_CONSUMER_SECRET=$TWITTER_CONSUMER_SECRET

ARG FACEBOOK_APP_ID
ENV FACEBOOK_APP_ID=$FACEBOOK_APP_ID

ARG FACEBOOK_APP_SECRET
ENV FACEBOOK_APP_SECRET=$FACEBOOK_APP_SECRET

ARG METRIC_CLIENT_ID
ENV METRIC_CLIENT_ID=$METRIC_CLIENT_ID

ARG METRIC_CLIENT_SECRET
ENV METRIC_CLIENT_SECRET=$METRIC_CLIENT_SECRET

ARG TAWK_ID
ENV TAWK_ID=$TAWK_ID

ARG REMIX_SERVER_JWT_SECRET
ENV REMIX_SERVER_JWT_SECRET=$REMIX_SERVER_JWT_SECRET

ARG REMIX_SERVER_JWT_ISSUER
ENV REMIX_SERVER_JWT_ISSUER=$REMIX_SERVER_JWT_ISSUER

ARG REMIX_JWT
ENV REMIX_JWT=$REMIX_JWT

RUN mkdir /app/
WORKDIR /app/

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/server-build /app/server-build
COPY --from=build /app/index.js /app/index.js
COPY --from=build /app/package.json /app/package.json

CMD ["yarn", "start", "--bind", "0.0.0.0:3000"]

EXPOSE 3000

