#!/bin/bash

echo This script overwrite the shared folders in all services with the one from the api
echo Press any key to continue or cancel with CTRL + C...
read

# Replace the shared folder in all services with the one in /backend/api
yes | rm -rf ../backend/external-data.service/src/shared
yes | rm -rf ../backend/updater.service/src/shared

yes | cp -rf ../backend/api/src/shared/ ../backend/external-data.service/src
yes | cp -rf ../backend/api/src/shared/ ../backend/updater.service/src

echo Replaced shared folders. Press any key to continue...
read
