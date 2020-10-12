#!/bin/bash

echo This script will install all dependencies. Press any key to continue...
read

# Install all dependencies
(
    cd ../frontend/app
    npm install
)
(
    cd ../backend/api
    npm install
)
(
    cd ../backend/external-data.service
    npm install
)
(
    cd ../backend/importer.service
    npm install
)
(
    cd ../backend/updater.service
    npm install
)
(
    cd ../backend/user.service
    npm install
)

echo Installed dependencies. Press any key to continue...
read
