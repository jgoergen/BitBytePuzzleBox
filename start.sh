#!/usr/bin/bash

# update from git
git pull origin master

# update npm modules
npm install

# compile typescript
tsc

# start node
node ./dist/App.js
