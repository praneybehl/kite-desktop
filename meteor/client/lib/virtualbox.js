var exec = require('exec');
var open = require('open');
var path = require('path');

isVirtualBoxInstalled = function (callback) {
  exec('VBoxManage', function (err, stdout) {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

openVirtualBoxInstaller = function () {
  var installerPath = path.join(getBinDir(), 'virtualbox-4.3.12.pkg');
  open(installerPath);
};
