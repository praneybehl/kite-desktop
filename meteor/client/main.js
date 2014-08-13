try {
  moment = require('moment');
  gui = require('nw.gui');
  gui.App.clearCache();
  win = gui.Window.get();
  var nativeMenuBar = new gui.Menu({ type: "menubar" });
  nativeMenuBar.createMacBuiltin("Kite");
  win.menu = nativeMenuBar;
} catch (e) {
  console.log(e);
}

Handlebars.registerHelper('arrayify', function (obj) {
  var result = [];
  if (obj) {
    _.each(Object.keys(obj), function (key) {
      result.push({name: key, value: obj[key]});
    });
  }
  return result;
});

Handlebars.registerHelper('setTitle', function (title) {
  if (title) {
    document.title = title + ' | Kite';
  } else {
    document.title = 'Kite';
  }
});

Handlebars.registerHelper('cleanUrl', function (url) {
  var tokens = url.split('/');
  return tokens[2];
});

Handlebars.registerHelper('hasItem', function (array) {
  if (typeof array.fetch === 'function') {
    return array.fetch().length > 0;
  } else {
    return array.length > 0;
  }
});

Handlebars.registerHelper('currentYear', function () {
  return moment().format('YYYY');
});

Handlebars.registerHelper('formatDate', function () {
  return moment().format('MM/DD/YYYY - h:mm:ssA');
});

Handlebars.registerHelper('timeSince', function (date) {
  return moment(date).fromNow();
});


Handlebars.registerHelper('buildRefDisplay', function (ref) {
  if (ref) {
    var tokens = ref.split('/');
    if (tokens[1] === 'heads' || tokens[1] === 'tags') {
      return tokens[2];
    } else if (tokens[1] === 'pull') {
      return '#' + tokens[2];
    } else {
      return ref;
    }
  } else {
    return '';
  }
});

Handlebars.registerHelper('getRefType', function (ref) {
  if (ref) {
    var tokens = ref.split('/');
    if (tokens[1] === 'heads') {
      return 'branch';
    } else if (tokens[1] === 'tags') {
      return 'tag';
    }
    else if (tokens[1] === 'pull') {
      return 'pull request';
    } else {
      return 'commit';
    }
  } else {
    return '';
  }
});

Meteor.call('getDockerHost', function (err, host) {
  if (err) { throw err; }
  Session.set('dockerHost', host);
});

Meteor.setInterval(function () {
  Meteor.call('watchKiteProxy');
  Meteor.call('watchKiteDNS');
  Meteor.call('watchApps');
  Meteor.call('restartApps');
}, 5000);

Meteor.setInterval(updateBoot2DockerInfo, 5000);
