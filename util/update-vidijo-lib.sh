#!/bin/bash

echo This script will update all vidijo-lib packages. Press any key to continue...
read

# Install all dependencies
(
    cd ../backend/api
    npm install https://github.com/NTNM-Bib/VidijoLib
)
(
    cd ../backend/external-data.service
    npm install https://github.com/NTNM-Bib/VidijoLib
)
(
    cd ../backend/updater.service
    npm install https://github.com/NTNM-Bib/VidijoLib
)

echo Updated vidijo-lib. Press any key to continue...
read
