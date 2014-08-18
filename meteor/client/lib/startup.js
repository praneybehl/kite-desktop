var Docker = require('dockerode');
var path = require('path');

var LOADED = false;

if (process.env.DOCKER_HOST && process.env.DOCKER_PORT) {
  docker = new Docker({host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT});
}

Meteor.startup(function () {
  console.log('Kitematic started.');
});
