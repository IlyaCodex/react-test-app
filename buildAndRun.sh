#!/bin/bash

cd $(dirname $0)
cd ui
npm i
npm run build
cd ../server
npm i
pm2 src/index.js --watch --restart-delay 10000 --time --name triton-backend