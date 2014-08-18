var exec = require('exec');
var open = require('open');
var path = require('path');
var fs = require('fs');

isVirtualBoxInstalled = function (callback) {
  exec('/usr/bin/VBoxManage', function (err, stdout) {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

isResolverSetup = function (callback) {
  var file = fs.readFile('/etc/resolver/dev', {
    encoding: 'utf8'
  }, function (err, data) {
    if (err) {
      callback(err, false);
    } else {
      if (data.indexOf('nameserver 192.168.59.103') !== -1) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  });
};

setupVirtualBoxAndResolver = function (callback, skipVirtualBox, skipResolver) {
  var installerPath = path.join(getBinDir(), 'virtualbox-4.3.12.pkg');
  var installCommand;

  if (skipVirtualBox && skipResolver) {
    callback();
  }

  var resolverCommand = 'echo \'nameserver 192.168.59.103\' > /etc/resolver/dev';
  var virtualBoxCommand = '`which installer` -pkg ./bin/virtualbox-4.3.12.pkg -target /';

  if (skipVirtualBox) {
    installCommand = resolverCommand;
  } else if (skipResolver) {
    installCommand = virtualBoxCommand;
  } else {
    installCommand = resolverCommand + ' && ' + virtualBoxCommand;
  }

  var execCommand = './bin/cocoasudo --prompt="Kitematic Setup wants to make changes. Type your password to allow this." sh -c "' + installCommand + '"';
  console.log('Running install command...');
  console.log(execCommand);
  exec(execCommand, function (err, stdout) {
    console.log(stdout);
    if (err) {
      callback(err);
      return;
    }
    console.log('Virtualbox Installation & Resolver config complete.');
    callback(null);
  })
};

setupVirtualBoxSharedFolder = function (callback) {
  isVirtualBoxInstalled(function (installed) {
    if (installed) {
      boot2DockerVMExists(function (err, exists) {
        if (!exists) {
          callback(new Error('Virtualbox must be installed before setting up shared folders.'));
        } else {
          stopBoot2Docker(function (err) {
            var sharedFolder = path.join(getHomePath(), 'Kitematic');
            exec('/usr/bin/VBoxManage sharedfolder remove boot2docker-kite-vm --name kitematic', function (err, stdout) {
              exec('/usr/bin/VBoxManage sharedfolder add boot2docker-kite-vm -name kitematic -hostpath '+ sharedFolder, function (err, stdout) {
                callback(err);
              });
            });
          });
        }
      });
    } else {
      callback(new Error('Virtualbox must be installed before setting up shared folders.'));
    }
  });
};