#!/bin/bash

echo This script will update all dependencies. Press any key to continue...
read

# Install all dependencies
(
    cd ../frontend/app
    npm update
)
(
    cd ../backend/api
    npm update
)
(
    cd ../backend/external-data.service
    npm update
)
(
    cd ../backend/updater.service
    npm update
)

echo Updated dependencies. Press any key to continue...
read
