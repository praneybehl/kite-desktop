#!/bin/bash
set -e # Auto exit on error

BASE_IMAGE_FILE=base-images-0.0.1.tar.gz
BOOT2DOCKER_ISO_FILE=boot2docker-kite-0.0.1.iso
VIRTUALBOX_FILE=virtualbox-4.3.12.pkg
BOOT2DOCKER_CLI_VERSION=1.1.2
BOOT2DOCKER_CLI_FILE=boot2docker-$BOOT2DOCKER_CLI_VERSION
MONGODB_VERSION=mongodb-osx-x86_64-2.6.3
MONGODB_FILE=$MONGODB_VERSION.tgz
NODE_JS_VERSION=node-v0.10.29-darwin-x64
NODEJS_FILE=$NODE_JS_VERSION.tar.gz

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/colors.sh

BASE=$DIR/..
pushd $BASE

if [ ! -d bundle ]; then
  cecho "No bundle, run script/bundle.sh first." $red
  exit 1
fi

rm -rf dist/osx/Kitematic.app
rm -rf dist/osx/Kitematic.zip
mkdir -p dist/osx/

cecho "-----> Creating Kitematic.app..." $blue
cp -R node-webkit/node-webkit.app dist/osx/
mv dist/osx/node-webkit.app dist/osx/Kitematic.app
mkdir -p dist/osx/Kitematic.app/Contents/Resources/app.nw

cecho "-----> Copying meteor bundle into Kitematic.app..." $blue
cp -R bundle dist/osx/Kitematic.app/Contents/Resources/app.nw/

cecho "-----> Copying node-webkit app into Kitematic.app..." $blue
cp index.html dist/osx/Kitematic.app/Contents/Resources/app.nw/
cp index.js dist/osx/Kitematic.app/Contents/Resources/app.nw/
cp package.json dist/osx/Kitematic.app/Contents/Resources/app.nw/
cp -R node_modules dist/osx/Kitematic.app/Contents/Resources/app.nw/
cp -R resources/* dist/osx/Kitematic.app/Contents/Resources/

mkdir -p bin

pushd bin

if [ ! -f $BASE_IMAGE_FILE ]; then
  cecho "-----> Downloading Kitematic base images..." $purple
  curl -L --progress-bar -o $BASE_IMAGE_FILE https://s3.amazonaws.com/kite-installer/$BASE_IMAGE_FILE
fi

if [ ! -f $BOOT2DOCKER_ISO_FILE ]; then
  cecho "-----> Downloading base iso..." $purple
  curl -L --progress-bar -o $BOOT2DOCKER_ISO_FILE https://s3.amazonaws.com/kite-installer/$BOOT2DOCKER_ISO_FILE
fi

if [ ! -f $VIRTUALBOX_FILE ]; then
  cecho "-----> Downloading virtualbox installer..." $purple
  curl -L --progress-bar -o $VIRTUALBOX_FILE https://s3.amazonaws.com/kite-installer/$VIRTUALBOX_FILE
fi

if [ ! -f $BOOT2DOCKER_CLI_FILE ]; then
  cecho "-----> Downloading Boot2docker CLI..." $purple
  curl -L -o $BOOT2DOCKER_CLI_FILE https://github.com/boot2docker/boot2docker-cli/releases/download/v${BOOT2DOCKER_CLI_VERSION}/boot2docker-v${BOOT2DOCKER_CLI_VERSION}-darwin-amd64
fi

if [ ! -f $NODEJS_FILE ]; then
  cecho "-----> Downloading Nodejs distribution..." $purple
  curl -L -o $NODEJS_FILE http://nodejs.org/dist/v0.10.29/node-v0.10.29-darwin-x64.tar.gz
fi

if [ ! -f $MONGODB_FILE ]; then
  cecho "-----> Downloading MongoDB distribution..." $purple
  curl -L -o $MONGODB_FILE http://downloads.mongodb.org/osx/mongodb-osx-x86_64-2.6.3.tgz
fi

popd

cecho "-----> Copying downloads to Kitematic.app" $blue
mkdir -p dist/osx/Kitematic.app/Contents/Resources/app.nw/bin
cp bin/$BASE_IMAGE_FILE dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/
cp bin/$BOOT2DOCKER_ISO_FILE dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/
cp bin/$VIRTUALBOX_FILE dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/
cp bin/$BOOT2DOCKER_ISO_FILE dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/
cp bin/$BOOT2DOCKER_CLI_FILE dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/
chmod +x bin/$BOOT2DOCKER_CLI_FILE dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/$BOOT2DOCKER_CLI_FILE

pushd bin
cecho "-----> Extracting node binary into Kitematic.app" $blue
tar -zxf $NODEJS_FILE
mv $NODE_JS_VERSION/bin/node $BASE/dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/
rm -rf $NODE_JS_VERSION

cecho "-----> Extracting mongodb binary into Kitematic.app" $blue
tar -zxf $MONGODB_FILE
mv $MONGODB_VERSION/bin/mongod $BASE/dist/osx/Kitematic.app/Contents/Resources/app.nw/bin/
rm -rf $MONGODB_VERSION
popd

pushd dist/osx
cecho "-----> Creating disributable zip file...." $blue
zip -rq --display-dots Kitematic.zip Kitematic.app
popd

cecho "Done." $green
cecho "Kitematic app available at dist/osx/Kitematic.app" $green
cecho "Kitematic zip distribution available at dist/osx/Kitematic.zip" $green

popd
