#!/bin/bash

cd $(dirname $0)
git fetch
git reset --hard origin/main
cd ui
npm i
npm run build
cd ../server
npm i