#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..
pushd $BASE

rm -rf dist/osx/Kite.app
mkdir -p dist/osx/
cp -R bin/node-webkit/node-webkit.app dist/osx/
mv dist/osx/node-webkit.app dist/osx/Kite.app
mkdir -p dist/osx/Kite.app/Contents/Resources/app.nw

cp -R bundle dist/osx/Kite.app/Contents/Resources/app.nw/
cp index.html dist/osx/Kite.app/Contents/Resources/app.nw/
cp index.js dist/osx/Kite.app/Contents/Resources/app.nw/
cp package.json dist/osx/Kite.app/Contents/Resources/app.nw/
cp -R node_modules dist/osx/Kite.app/Contents/Resources/app.nw/
cp -R resources/* dist/osx/Kite.app/Contents/Resources/

popd
