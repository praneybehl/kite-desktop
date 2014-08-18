var async = require('async');
var path = require('path');
var Docker = require('dockerode');

if (process.env.DOCKER_HOST && process.env.DOCKER_PORT) {
  docker = new Docker({host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT});
}

// Install steps. A step is a function that accepts a function (err) callback and returns once that step is complete.
var steps = [

  // Step 0, set up VirtualBox
  {
    install: function (callback) {
      isVirtualBoxInstalled(function (virtualBoxInstalled) {
        isResolverSetup(function (err, resolverSetup) {
          if (virtualBoxInstalled && resolverSetup) {
            callback();
          } else {
            setupVirtualBoxAndResolver(function (err) {
              callback(err);
            }, virtualBoxInstalled, resolverSetup);
          }
        });
      });
    },
    pastMessage: 'Installed VirtualBox',
    message: 'Installing VirtualBox (sudo required)...',
    imperativeMessage: 'Install VirtualBox if necessary (sudo required)'
  },

  // Step 1: Set up the VM for running Kitematic apps
  {
    install: function (callback) {
      boot2DockerVMExists(function (err, exists) {
        if (!exists) {
          initBoot2Docker(function (err) {
            callback(err);
          });
        } else {
          callback();
        }
      });
    },
    pastMessage: 'Set up the Kitematic VM',
    message: 'Setting up the Kitematic VM...',
    imperativeMessage: 'Set up the Kitematic VM'
  },

  // Step 2: Set up shared folders for the Kitematic
  {
    install: function (callback) {
      setupVirtualBoxSharedFolder(function (err) {
        callback(err);
      });
    },
    pastMessage: 'Set up Kitematic shared folder',
    message: 'Setting up the Kitematic shared folder...',
    imperativeMessage: 'Set up Kitematic shared folder'
  },

  // Step 3: Start the Kitematic VM
  {
    install: function (callback) {
      startBoot2Docker(function (err) {
        callback(err);
      });
    },
    pastMessage: 'Started the Kitematic VM',
    message: 'Starting the Kitematic VM...',
    imperativeMessage: 'Start the Kitematic VM'
  },

  // Step 4: Set up the default Kitematic images
  {
    install: function (callback) {
      var images = [
        docker.getImage('kite-dns'),
        docker.getImage('kite-proxy')
      ];
      async.eachSeries(images, function (image, innerCallback) {
        image.inspect(function (err, data) {
          if (err) {
            if (err.reason === 'no such image') {
              docker.loadImage(path.join(getBinDir(), 'base-images-0.0.1.tar.gz'), {}, function (err, data) {
                if (err) {
                  innerCallback(err);
                }
                innerCallback();
              });
            }
          } else {
            innerCallback()
          }
        });
      }, function (err) {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    },
    pastMessage: 'Started the Kitematic VM',
    message: 'Setting up the default Kitematic images...',
    imperativeMessage: 'Set up the default Kitematic images'
  }
];

runSetup = function (callback) {
  // Run through the Kitematic installation, skipping steps if required.
  var currentStep = 0;
  Session.set('currentInstallStep', currentStep);
  Session.set('numberOfInstallSteps', steps.length);
  async.eachSeries(steps, function (step, callback) {
    console.log('Performing step ' + currentStep);
    step.install(function (err) {
      if (err) {
        callback(err);
      } else{
        currentStep += 1;
        Session.set('currentInstallStep', currentStep);
        callback();
      }
    });
  }, function (err) {
    if (err) {
      // if any of the steps fail
      console.log('Kitematic setup failed at step' + currentStep);
      console.log(err);
      callback(err);
    } else {
      // Setup Finished
      callback();
    }
  });
};

Template.setup_install.events({

});

Template.setup_install.steps = function () {
  return steps.map(function (step, index) {
    step.index = index;
    return step;
  });
};

Template.setup_install.helpers({
  currentInstallStep: function () {
    return Session.get('currentInstallStep');
  }
});

Template.setup_install.helpers({
  installComplete: function () {
    return Session.get('currentInstallStep') === steps.length;
  }
});