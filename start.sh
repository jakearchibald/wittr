#!/bin/bash

set -eo pipefail;

# If node_modules folder doesn't exist
if [ ! -d node_modules ] ; then
  # Run npm install
  npm install
else
  echo "Run 'npm rebuild node-sass --force' or clean your node_modules folder and restart in case you faced issues with node-sass"
fi

# Run serve
npm run serve