getSSHKey = function () {
  var generateKeyPair = function (callback) {
    var homePath = getHomePath();
    var sshPath = path.join(homePath, '.ssh');
    var privateKeyPath = path.join(sshPath, 'id_rsa');
    var publicKeyPath = path.join(sshPath, 'id_rsa.pub');
    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      console.log('Used existing key pair.');
      callback(null, fs.readFileSync(publicKeyPath, 'utf8'));
    } else {
      console.log('Generated key pair.');
      keygen({
        location: privateKeyPath
      }, function (err, data) {
        if (err) { callback(err, null); }
        fs.writeFile(privateKeyPath, data.key, function (err) {
          if (err) { throw err; }
          fs.writeFile(publicKeyPath, data.pubKey, function (err) {
            if (err) { throw err; }
            callback(null, data.pubKey);
          });
        });
      });
    }
  };
  var generateKeyPairSync = Meteor._wrapAsync(generateKeyPair);
  return generateKeyPairSync();
};

Meteor.methods({
  restartApps: function () {
    this.unblock();
    var apps = Apps.find({}).fetch();
    _.each(apps, function (app) {
      if (app.docker && app.status === 'STARTING' && app.docker.State.ExitCode !== -1 && !app.docker.State.Running) {
        restartApp(app, function (err) {
          if (err) { console.log(err); }
        });
      }
    });
  },
  watchApps: function () {
    this.unblock();
    var apps = Apps.find({}).fetch();
    _.each(apps, function (app) {
      if (!app.docker && app.status !== 'STARTING') {
        Apps.update(app._id, {
          $set: {
            status: 'ERROR'
          }
        });
      } else if (app.docker && app.status !== 'STARTING') {
        if (!app.docker.Id) {
          Fiber(function () {
            Apps.update(app._id, {
              $set: {
                status: 'ERROR'
              }
            });
          }).run();
        } else {
          inspectContainer(app.docker.Id, function (err, data) {
            if (err) {
              console.log(err);
              Fiber(function () {
                Apps.update(app._id, {
                  $set: {
                    status: 'ERROR'
                  }
                });
              }).run();
            } else {
              if (data.State.ExitCode === -1) {
                Fiber(function () {
                  Apps.update(app._id, {
                    $set: {
                      status: 'ERROR'
                    }
                  });
                }).run();
              } else {
                if (!data.State.Running) {
                  Fiber(function () {
                    Apps.update(app._id, {
                      $set: {
                        status: 'STARTING'
                      }
                    });
                  }).run();
                } else {
                  Fiber(function () {
                    Apps.update(app._id, {
                      $set: {
                        status: 'READY'
                      }
                    });
                  }).run();
                }
                Fiber(function () {
                  Apps.update(app._id, {
                    $set: {
                      docker: data
                    }
                  });
                }).run();
              }
            }
          });
        }
      }
    });
  },
  configVar: function (appId, configVars) {
    this.unblock();
    Apps.update(appId, {$set: {
      config: configVars,
      status: 'STARTING'
    }});
    var app = Apps.findOne({_id: appId});
    runApp(app, function (err, data) {
      if (err) { console.log(err); }
      Fiber(function () {
        Apps.update(appId, {$set: {
          docker: data,
          status: 'READY'
        }});
      }).run();
    });
  },
  deleteApp: function (appId) {
    this.unblock();
    var app = Apps.findOne(appId);
    if (!app) {
      throw new Meteor.Error(403, 'No app found with this ID');
    }
    deleteApp(app, function (err) {
      if (err) { console.log(err); }
      var appPath = path.join(KITE_PATH, app.name);
      deleteFolder(appPath);
      console.log('Deleted Kite ' + app.name + ' directory.');
      Fiber(function () {
        Apps.remove({_id: app._id});
      }).run();
    });
  },
  createApp: function (formData) {
    var validationResult = formValidate(formData, FormSchema.formCreateApp);
    if (validationResult.errors) {
      throw new Meteor.Error(400, 'Validation Failed.', validationResult.errors);
    } else {
      var cleaned = validationResult.cleaned;
      var appObj = {
        name: cleaned.name,
        imageId: cleaned.imageId,
        status: 'STARTING',
        config: {},
        logs: []
      };
      var appId = Apps.insert(appObj);
      var sshKey = getSSHKey();
      var appPath = path.join(KITE_PATH, appObj.name);
      if (!fs.existsSync(appPath)) {
        console.log('Created Kite ' + appObj.name + ' directory.');
        fs.mkdirSync(appPath, function (err) {
          if (err) { throw err; }
        });
      }
      Apps.update(appId, {
        $set: {
          'config.APP_ID': appId,
          'config.SSH_KEY': sshKey,
          'config.VIRTUAL_HOST': appObj.name + '.local',
          path: appPath
        }
      });
      var image = Images.findOne(appObj.imageId);
      if (image && image.meta.app && image.meta.app.webPort) {
        Apps.update(appId, {
          $set: {
            'config.VIRTUAL_PORT': image.meta.app.webPort
          }
        });
      }
      var app = Apps.findOne(appId);
      runApp(app, function (err, data) {
        if (err) { throw err; }
        Fiber(function () {
          Meteor.setTimeout(function () {
            Apps.update(appId, {
              $set: {
                docker: data,
                status: 'READY'
              }
            });
          }, 2000);
        }).run();
      });
    }
  },
  getAppLogs: function (appId) {
    this.unblock();
    var app = Apps.findOne(appId);
    if (app) {
      getAppLogs(app, function (err) {
        if (err) { throw err; }
      });
    }
  },
  prepareSSH: function (appId) {
    this.unblock();
    var app = Apps.findOne(appId);
    if (app) {
      var port = app.sshPort();
      purgeKnownHosts(port);
    }
  },
  restartApp: function (appId) {
    this.unblock();
    var app = Apps.findOne(appId);
    if (app && app.docker) {
      Apps.update(app._id, {$set: {
        status: 'STARTING'
      }});
      restartApp(app, function (err) {
        if (err) { console.log(err); }
      });
    }
  }
});
