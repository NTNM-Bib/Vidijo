#!/bin/bash

echo Enter the new semver version number of Vidijo \(e.g. 1.0.0 or 1.5.4-beta\)...
read version

# Set the version in all services and in the client (in package.json)
(
    cd ../frontend/app
    npm version ${version}
)
(
    cd ../backend/api
    npm version ${version}
)
(
    cd ../backend/external-data.service
    npm version ${version}
)
(
    cd ../backend/updater.service
    npm version ${version}
)

echo Set version to ${version}. Press any key to continue...
read
