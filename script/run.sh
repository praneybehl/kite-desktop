#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..

export ROOT_URL=https://localhost:3000
export DOCKER_HOST=http://192.168.59.103
export DOCKER_PORT=2375

cd $BASE/meteor
exec 3< <(mrt)
sed '/App running at/q' <&3 ; cat <&3 &
NODE_ENV=development $BASE/bin/node-webkit/node-webkit.app/Contents/MacOS/node-webkit $BASE
