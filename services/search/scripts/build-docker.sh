#!/bin/sh

printf "\nBuilding: search-service\n"

docker buildx build\
    --build-arg APP_NAME=$APP_NAME\
    --build-arg GO_ENV=$GO_ENV\
    --build-arg PORT=$PORT\
    --build-arg URL=$URL\
    --build-arg OPENSEARCH_NODE=$OPENSEARCH_NODE\
    --build-arg OPENSEARCH_USERNAME=$OPENSEARCH_USERNAME\
    --build-arg OPENSEARCH_PASSWORD=$OPENSEARCH_PASSWORD\
    --build-arg NUMBER_OF_SHARDS=$NUMBER_OF_SHARDS\
    --build-arg NUMBER_OF_REPLICAS=$NUMBER_OF_REPLICAS\
    --build-arg SENTRY_DSN=$SENTRY_DSN\
    --build-arg SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT\
    --build-arg SENTRY_DEBUG=$SENTRY_DEBUG\
    --build-arg RABBITMQ_URL=$RABBITMQ_URL\
    --build-arg MONGODB_URI=$MONGODB_URI\
    --build-arg DATABASE_NAME=$DATABASE_NAME\
    --build-arg CONTENT_COLLECTION=$CONTENT_COLLECTION\
    --build-arg TAG_COLLECTION=$TAG_COLLECTION\
    --build-arg COLLECTIONS_COLLECTION=$COLLECTIONS_COLLECTION\
    --build-arg CONTENT_TAGS_COLLECTION=$CONTENT_TAGS_COLLECTION\
    --build-arg CONTENT_COLLECTIONS_COLLECTION=$CONTENT_COLLECTIONS_COLLECTION\
    --tag mfoni-search-service .

printf "Done building!"
