#!/usr/bin/bash

# update from git
git pull origin master

# update npm modules
npm install

# start node
node ./dist/App.js
