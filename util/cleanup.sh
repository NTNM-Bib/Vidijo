#!/bin/bash

echo This script will remove node_modules, dist folders and logs. Press any key to continue...
read

(
    cd ../frontend/app
    rm -rf node_modules
    rm -rf dist
    rm -f package-lock.json
    npm cache clean --force
    npm install
)
(
    cd ../backend/api
    rm -rf dist
    rm -rf logs
    rm -rf node_modules
    rm -f package-lock.json
    npm cache clean --force
    npm install
)
(
    cd ../backend/external-data.service
    rm -rf dist
    rm -rf logs
    rm -rf node_modules
    rm -f package-lock.json
    npm cache clean --force
    npm install
)
(
    cd ../backend/updater.service
    rm -rf dist
    rm -rf logs
    rm -rf node_modules
    rm -f package-lock.json
    npm cache clean --force
    npm install
)

echo Cleanup complete. Press any key to continue...
read
