#!/bin/bash
set -e # Auto exit on error

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/colors.sh

BASE=$DIR/..
pushd $BASE/meteor

if ! type "npm" > /dev/null 2>&1; then
  cecho "Node v0.10.29 not found, install using nvm. It can be found at: https://github.com/creationix/nvm" $red
  exit 1
fi

if ! type "mrt" > /dev/null 2>&1; then
  cecho "meteorite not found, install using npm install -g meteorite" $red
  exit 1
fi

if ! type "demeteorizer" > /dev/null 2>&1; then
  cecho "Demeteorizer not found, install using npm install demeteorizer -g" $red
  exit 1
fi

rm -rf ../bundle

cecho "-----> Building bundle from Meteor app, this may take a few minutes..." $blue
demeteorizer -o ../bundle

cecho "-----> Installing bundle npm packages." $blue
cd ../bundle && npm install

cecho "Bundle created." $blue

popd