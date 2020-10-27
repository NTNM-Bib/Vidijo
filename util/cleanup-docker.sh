#!/bin/bash

echo This script will remove docker containers and cached images. Press any key to continue...
read

docker rm -f $(docker ps -a -q)
docker image rm -f vidijo_updater.service
docker image rm -f vidijo_api-gateway
docker image rm -f vidijo_app
docker image rm -f vidijo_user.service
docker image rm -f vidijo_external-data.service
docker image rm -f vidijo_api

echo Docker cleanup complete. Press any key to continue...
read
