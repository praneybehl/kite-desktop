KITE_PATH = path.join(getHomePath(), 'Kite');
KITE_TAR_PATH = path.join(KITE_PATH, '.tar');
KITE_LOGO_PATH = path.join(KITE_PATH, '.logo');

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

if (!fs.existsSync(KITE_LOGO_PATH)) {
  console.log('Created Kite .logo directory.');
  fs.mkdirSync(KITE_LOGO_PATH, function (err) {
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

saveLogo = function (directory, logoPath, imageId) {
  var originalPath = path.join(directory, logoPath);
  var extension = path.extname(logoPath);
  var newPath = path.join(KITE_LOGO_PATH, imageId + extension);
  fs.createReadStream(originalPath).pipe(fs.createWriteStream(newPath));
  Fiber(function () {
    Images.update(imageId, {
      $set: {
        logoPath: newPath
      }
    });
  }).run();
};
