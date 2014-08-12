#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..
pushd $BASE/meteor

rm -rf ../bundle
demeteorizer -o ../bundle
cp -R ../bin/node ../bundle
cp -R ../bin/mongod ../bundle
cd ../bundle && npm install

popd
