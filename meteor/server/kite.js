KITE_PATH = path.join(getHomePath(), 'Kite');
KITE_TAR_PATH = path.join(KITE_PATH, '.tar');
KITE_IMAGES_PATH = path.join(KITE_PATH, '.images');

if (!fs.existsSync(KITE_PATH)) {
  console.log('Created Kite directory.');
  fs.mkdirSync(KITE_PATH, function (err) {
    if (err) { throw err; }
  });
}

if (!fs.existsSync(KITE_TAR_PATH)) {
  console.log('Created Kite .tar directory.');
  fs.mkdirSync(KITE_TAR_PATH, function (err) {
    if (err) { throw err; }
  });
}

if (!fs.existsSync(KITE_IMAGES_PATH)) {
  console.log('Created Kite .images directory.');
  fs.mkdirSync(KITE_IMAGES_PATH, function (err) {
    if (err) { throw err; }
  });
}

getKiteJSON = function (directory) {
  var KITE_JSON_PATH = path.join(directory, 'kite.json');
  if (fs.existsSync(KITE_JSON_PATH)) {
    var data = fs.readFileSync(KITE_JSON_PATH, 'utf8');
    return JSON.parse(data);
  } else {
    return null;
  }
};

loadKiteVolumes = function (directory, appName) {
  var KITE_VOLUMES_PATH = path.join(directory, 'volumes');
  if (fs.existsSync(KITE_VOLUMES_PATH)) {
    var destinationPath = path.join(KITE_PATH, appName);
    ncp(KITE_VOLUMES_PATH, destinationPath, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('Copied volumes for: ' + appName);
    });
  }
};

saveImageFolder = function (directory, imageId) {
  var destinationPath = path.join(KITE_IMAGES_PATH, imageId);
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, function (err) {
      if (err) { throw err; }
    });
    ncp(directory, destinationPath, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('Copied image folder for: ' + imageId);
    });
  }
};
