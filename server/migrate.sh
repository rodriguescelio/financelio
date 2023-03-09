#!/bin/bash

# Load .env
export $(grep -v '^#' .env | xargs)

DOCKER_IMAGE=flyway/flyway

# Run migration
docker run --net host \
  -v $(pwd)/src/migrations:/flyway/sql \
  $DOCKER_IMAGE \
  migrate \
    -url="jdbc:postgresql://$DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME" \
    -user=$DATABASE_USER \
    -password=$DATABASE_PASS
