Docker = Meteor.require('dockerode');

var docker = new Docker({socketPath: '/var/run/docker.sock'});
if (process.env.DOCKER_HOST && process.env.DOCKER_PORT) {
  docker = new Docker({host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT});
}

hasDockerfile = function (directory) {
  return fs.existsSync(path.join(directory, 'Dockerfile'));
};

deleteApp = function (app, callback) {
  if (!app.docker) {
    callback(null, {});
    return;
  }
  var container = docker.getContainer(app.docker.Id);
  container.kill(function (err) {
    if (err) { callback(err, null); }
    container.remove({v:1}, function (err) {
      if (err) { callback(err, null); }
      console.log('Deleted app container.');
      callback(null, {});
    });
  });
};

inspectContainer = function (containerId, callback) {
  var container = docker.getContainer(containerId);
  container.inspect(function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
};

restartApp = function (app, callback) {
  if (app.docker && app.docker.Id) {
    var container = docker.getContainer(app.docker.Id);
    container.restart(function (err) {
      if (err) {
        callback(err, null);
      } else {
        container.inspect(function (err, data) {
          if (err) {
            callback(err, null);
          } else {
            console.log('Restarted app: ' + app.name);
            Fiber(function () {
              Apps.update(app._id, {$set: {
                status: 'READY',
                docker: data
              }});
            }).run();
            callback(null, {});
          }
        });
      }
    });
  }
};

getAppLogs = function (app) {
  if (app.docker && app.docker.Id) {
    var container = docker.getContainer(app.docker.Id);
    container.logs({follow: false, stdout: true, stderr: true, timestamps: true, tail: 300}, function (err, response) {
      if (err) { throw err; }
      Fiber(function () {
        Apps.update(app._id, {
          $set: {
            logs: []
          }
        });
      }).run();
      var logs = [];
      response.setEncoding('utf8');
      response.on('data', function (line) {
        logs.push(line.slice(8));
        Fiber(function () {
          Apps.update(app._id, {
            $set: {
              logs: logs
            }
          });
        }).run();
      });
      response.on('end', function () {});
    });
  }
};

runApp = function (app, callback) {
  var envParam = [];
  _.each(_.keys(app.config), function (key) {
    var builtStr = key + '=' + app.config[key];
    envParam.push(builtStr);
  });
  console.log(envParam);
  var image = Images.findOne({_id: app.imageId});

  docker.createContainer({
    Image: image.docker.Id,
    Tty: false,
    Env: envParam,
    Hostname: app.name
  }, function (err, container) {
    if (err) { callback(err, null); }
    console.log('Container created.');
    console.log(container);

    var binds = [];
    if (image.docker.Config.Volumes) {
      _.each(_.keys(image.docker.Config.Volumes), function (vol) {
        binds.push('/Users/' + app.name + vol + ':' + vol);
      });
    }

    // Start the container
    container.start({
      PublishAllPorts: true,
      Binds: binds
    }, function (err, data) {
      if (err) { callback(err, null); }
      console.log('Container started.');
      console.log(data);
      container.inspect(function (err, data) {
        if (err) { callback(err, null); }
        var oldContainerId = null;
        if (app.docker && app.docker.Id) {
          oldContainerId = app.docker.Id;
        }
        if (oldContainerId) {
          var oldContainer = docker.getContainer(oldContainerId);
          oldContainer.kill(function (err) {
            if (err) { callback(err, null); }
            oldContainer.remove({v:1}, function (err) {
              if (err) { callback(err, null); }
              console.log('Deleted old app container.');
              callback(null, data);
            });
          });
        } else {
          callback(null, data);
        }
      });
    });
  });
};

buildImage = function (image, callback) {
  var TAR_PATH = path.join(KITE_TAR_PATH, image._id + '.tar');
  console.log('tar czf ' + TAR_PATH + ' -C ' + image.path + ' .');
  exec('tar czf ' + TAR_PATH + ' -C ' + image.path + ' .', function (err) {
    if (err) { throw err; }
    console.log('Compressed extracted folder.');
    var oldImageId = null;
    if (image.docker && image.docker.Id) {
      oldImageId = image.docker.Id;
    }
    docker.buildImage(TAR_PATH, {t: image._id}, function (err, response) {
      if (err) { throw err; }
      console.log('Building Docker image...');
      Fiber(function () {
        Images.update(image._id, {
          $set: {
            buildLogs: []
          }
        });
      }).run();
      var logs = [];
      response.setEncoding('utf8');
      response.on('data', function (data) {
        try {
          var line = JSON.parse(data).stream;
          logs.push(line);
          Fiber(function () {
            Images.update(image._id, {
              $set: {
                buildLogs: logs
              }
            });
          }).run();
        } catch (e) {
          console.log(e);
        }
      });
      response.on('end', function () {
        console.log('Finished building Docker image.');
        fs.unlinkSync(TAR_PATH);
        console.log('Cleaned up tar file.');
        var dockerImage = docker.getImage(image._id);
        dockerImage.inspect(function (err, data) {
          if (err) { callback(err, null); }
          if (oldImageId) {
            var oldImage = docker.getImage(oldImageId);
            oldImage.remove(function (err) {
              if (err) { callback(err, null); }
              console.log('Deleted old image.');
              callback(null, data);
            });
          } else {
            callback(null, data);
          }
        });
      });
    });
  });
};

deleteImage = function (image, callback) {
  if (!image.docker) {
    callback(null, {});
    return;
  }
  var dockerImage = docker.getImage(image.docker.Id);
  dockerImage.remove({force: true}, function (err, data) {
    if (err) { callback(err, null); }
    console.log('Deleted image.');
    callback(null, data);
  });
};

watchKiteProxy = function () {
  var kiteProxyContainer = docker.getContainer('kite-proxy');
  if (kiteProxyContainer) {
    kiteProxyContainer.inspect(function (err, data) {
      if (err) { console.log(err); }
      if (data && !data.State.Running) {
        kiteProxyContainer.start(function (err) {
          if (err) { console.log(err); }
          console.log('Restarted Kite proxy.');
        });
      }
    });
  }
};

watchKiteDNS = function () {
  var kiteDNSContainer = docker.getContainer('kite-dns');
  if (kiteDNSContainer) {
    kiteDNSContainer.inspect(function (err, data) {
      if (err) { console.log(err); }
      if (data && !data.State.Running) {
        kiteDNSContainer.start(function (err) {
          if (err) { console.log(err); }
          console.log('Restarted Kite DNS.');
        });
      }
    });
  }
};

Meteor.methods({
  watchKiteProxy: function () {
    watchKiteProxy();
  },
  watchKiteDNS: function () {
    watchKiteDNS();
  },
  getDockerHost: function () {
    return process.env.DOCKER_HOST;
  }
});
