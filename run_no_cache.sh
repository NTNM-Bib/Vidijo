#!/bin/bash

echo "Starting Vidijo..."

docker-compose build --no-cache
docker-compose up -d
