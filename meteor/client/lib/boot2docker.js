var exec = require('exec');
var path = require('path');
var async = require('async');

boot2dockerexec = function (command, callback) {
  exec(path.join(getBinDir(), 'boot2docker-1.1.2') + ' ' + command, function(err, stdout) {
    callback(err, stdout);
  });
};

getBoot2DockerState = function (callback) {
  boot2dockerexec('--vm=boot2docker-kite-vm info', function (err, stdout) {
    if (err) { callback(err, null); }
    try {
      var info = JSON.parse(stdout);
      callback(null, info.State);
    } catch (e) {
      callback(e, null);
    }
  });
};

getBoot2DockerDiskUsage = function (callback) {
  boot2dockerexec('--vm=boot2docker-kite-vm ssh "df"', function (err, stdout) {
    if (err) { callback(err, null); }
    try {
      var lines = stdout.split('\n');
      var dataline = _.find(lines, function (line) {
        return line.indexOf('/dev/sda1') !== -1;
      });
      var tokens = dataline.split(' ');
      tokens = tokens.filter(function (token) {
        return token !== '';
      });
      var usedGb = parseInt(tokens[2], 10) / 1000000;
      var totalGb = parseInt(tokens[3], 10) / 1000000;
      var percent = parseInt(tokens[4].replace('%', ''), 10);
      callback(null, {
        used_gb: usedGb.toFixed(2),
        total_gb: totalGb.toFixed(2),
        percent: percent
      });
    } catch (error) {
      callback(err, null);
    }
  });
};

getBoot2DockerMemoryUsage = function (callback) {
  boot2dockerexec('--vm=boot2docker-kite-vm ssh "free -m"', function (err, stdout) {
    if (err) { callback(err, null); }
    try {
      var lines = stdout.split('\n');
      var dataline = _.find(lines, function (line) {
        return line.indexOf('-/+ buffers') !== -1;
      });
      var tokens = dataline.split(' ');
      tokens = tokens.filter(function(token) {
        return token !== '';
      });
      var usedGb = parseInt(tokens[2], 10) / 1000;
      var freeGb = parseInt(tokens[3], 10) / 1000;
      var totalGb = usedGb + freeGb;
      var percent = Math.round(usedGb / totalGb * 100);
      callback(null, {
        used_gb: usedGb.toFixed(2),
        total_gb: totalGb.toFixed(2),
        free_gb: freeGb.toFixed(2),
        percent: percent
      });
    } catch (error) {
      callback(error, null);
    }
  });
};

getBoot2DockerInfo = function (callback) {
  getBoot2DockerState(function (err, state) {
    if (err) {
      callback(err, null);
      return;
    }
    if (state === 'poweroff') {
      callback(null, {state: state});
    } else {
      getBoot2DockerMemoryUsage(function (err, mem) {
        if (err) { callback(null, {state: state}); }
        getBoot2DockerDiskUsage(function (err, disk) {
          if (err) { callback(null, {state: state}); }
          callback(null, {
            state: state,
            memory: mem,
            disk: disk
          });
        });
      });
    }
  });
};

boot2DockerVMExists = function (callback) {
  boot2dockerexec('--vm=boot2docker-kite-vm info', function (err, stdout) {
    if (err) { callback(err, false); }
    callback(null, true);
  });
};

initBoot2Docker = function (callback) {
  var isoPath = path.join(getBinDir(), 'boot2docker-kite-0.0.1.iso');
  isVirtualBoxInstalled(function (installed) {
    if (installed) {
      boot2DockerVMExists(function (err, exists) {
        if (!exists) {
          boot2dockerexec('--vm=boot2docker-kite-vm --iso="' + isoPath + '" init', function (err, stdout) {
            callback();
          });
        }
      });
    } else {
      callback(new Error('initBoot2Docker called but VirtualBox isn\'t installed.'));
    }
  });
}

startBoot2Docker = function (callback) {
  isVirtualBoxInstalled(function (installed) {
    if (installed) {
      boot2DockerVMExists(function (err, exists) {
        if (exists) {
          boot2dockerexec('--vm=boot2docker-kite-vm up', function (err, stdout) {
            if (err) {
              callback(err, null);
            }
            callback(null, stdout);
          });
        } else {
          callback(new Error('startBoot2Docker called but boot2docker-kite-vm doesn\'t exist.'));
        }
      });
    } else {
      callback(new Error('startBoot2Docker called but VirtualBox isn\'t installed.'));
    }
  });
};

stopBoot2Docker = function (callback) {
  boot2dockerexec('--vm=boot2docker-kite-vm down', function (err, stdout) {
    if (err) { callback(err, null); }
    callback(null, stdout);
  });
};

updateBoot2DockerInfo = function () {
  getBoot2DockerInfo(function (err, info) {
    if (err) {
      return;
    }
    Session.set('boot2dockerState', info.state);
    if (info.state !== 'poweroff' && info.memory && info.disk) {
      Session.set('boot2dockerMemoryUsage', info.memory);
      Session.set('boot2dockerDiskUsage', info.disk);
    }
  });
};
