getHomePath = function () {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

purgeKnownHosts = function (port) {
  var homePath = getHomePath();
  var sshPath = path.join(homePath, '.ssh');
  var knownHostsPath = path.join(sshPath, 'known_hosts');
  var knownHosts = fs.readFileSync(knownHostsPath, 'utf8');
  var dockerHost = (process.env.DOCKER_HOST).replace('http://', '').replace('https://', '');
  var patternString = "(\\[" + dockerHost + "\\]:" + port + ")(.*)";
  var regex = new RegExp(patternString, "g");
  knownHosts = knownHosts.replace(regex, "");
  fs.writeFile(knownHostsPath, knownHosts);
};

deleteFolder = function (directory) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach(function (file) {
      var curDirectory = directory + '/' + file;
      if (fs.lstatSync(curDirectory).isDirectory()) {
        // Recurse
        deleteFolder(curDirectory);
      } else {
        // Delete File
        fs.unlinkSync(curDirectory);
      }
    });
    fs.rmdirSync(directory);
  }
};
