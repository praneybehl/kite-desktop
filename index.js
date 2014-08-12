var child_process = require('child_process');
var net = require('net');
var os = require('os');
var fs = require('fs');
var path = require('path');

var freeport = function (callback) {
  var server = net.createServer();
  var port = 0;
  server.on('listening', function() {
    port = server.address().port;
    server.close();
  });
  server.on('close', function() {
    callback(null, port);
  });
  server.listen(0, '127.0.0.1');
};

var start = function (callback) {
  // If in development, start the meteor server
  if (process.env.NODE_ENV === 'development') {
    var gui = require('nw.gui');
    var mainWindow = gui.Window.get();
    mainWindow.window.location = 'http://localhost:3000';
    mainWindow.on('loaded', function () {
      mainWindow.show();
    });
    mainWindow.on('close', function (type) {
      this.hide();
      if (type === 'quit') {
        this.close(false);
      }
      console.log('Window Closed.');
    });
    gui.App.on('reopen', function () {
      mainWindow.show();
    });
  } else {
    process.stdout.write('Starting production server\n');
    // Create Application Support Directory
    if (os.platform() === 'darwin') {
      var kitePath = path.join(process.env.HOME, 'Library/Application Support/Kite/');
      var dataPath = path.join(kitePath, 'data');
      var bundlePath = path.join(kitePath, 'bundle');
      if (!fs.existsSync(kitePath)) {
        fs.mkdirSync(kitePath);
      }
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
      }
      if (!fs.existsSync(bundlePath)) {
        fs.mkdirSync(bundlePath);
      }
    }

    freeport(function (err, port) {
      console.log('Found free port: ' + port);
      console.log('Running production server on port:' + port);
      process.stdout.write(process.cwd());
      var rootUrl = 'http://localhost:' + port;
      var mongoChild = child_process.spawn('./mongod/mongod', ['--dbpath', dataPath, '--unixSocketPrefix', dataPath, '--bind_ip', '127.0.0.1'], {
        cwd: './bundle'
      });
      var user_env = process.env;
      user_env.NODE_PATH = './node_modules';
      user_env.MONGO_URL = 'mongodb://' + path.join(dataPath, 'mongodb-27017.sock');
      user_env.ROOT_URL = rootUrl;
      user_env.PORT = port;
      user_env.BIND_IP = '127.0.0.1';
      var child = child_process.spawn('./node/node', ['main.js'], {
        env: user_env,
        cwd: './bundle'
      });
      callback(rootUrl, child, mongoChild);
    });
  }
};

start(function (url, child, mongoChild) {
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  var windowCreated = false;

  var killChildren = function () {
    console.log('Killing meteor & mongodb processes.');
    if (child) {
      child.kill();
    }
    if (mongoChild) {
      mongoChild.kill();
    }
  };

  process.on('exit', killChildren);
  process.on('uncaughtException', killChildren);
  process.on('SIGINT', killChildren);
  process.on('SIGTERM', killChildren);

  child.stdout.on('data', function (data) {
    process.stdout.write(data);
    if (!windowCreated && data.indexOf('Kite started.') > -1) {
      windowCreated = true;
      var gui = require('nw.gui');
      var mainWindow = gui.Window.get();
      gui.App.on('reopen', function () {
        mainWindow.show();
      });
      mainWindow.window.location = url;
      mainWindow.on('loaded', function () {
        mainWindow.show();
      });
      mainWindow.on('close', function (type) {
        this.hide();
        if (type === 'quit') {
          killChildren();
          this.close(false);
        }
        console.log('Window Closed.');
      });
    }
  });

  child.stderr.on('data', function (data) {
    process.stdout.write(data);
  });

  child.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
});
