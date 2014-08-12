#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..

pushd $BASE/osx-installer

DOCKER_HOST=tcp://192.168.59.103:2375
rm -rf mpkg/Kite.app
cp -R ../dist/osx/Kite.app mpkg/
docker rm build-osx-installer;true
docker build -t osx-installer .
docker run --privileged -i -t --name build-osx-installer osx-installer
mkdir -p ../package
rm -rf ../package/Kite.pkg
docker cp build-osx-installer:/dmg/Kite.pkg ../package/Kite.pkg

popd
