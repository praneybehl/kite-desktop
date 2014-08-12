Template.dashboard_apps_layout.rendered = function () {
  Meteor.setInterval(function () {
    $('.mac-window-header-options-right a').tooltip();
  }, 1000);
};

Template.dashboard_apps_layout.events({
  'click .btn-view': function (e) {
    try {
      var open = require('open');
      e.preventDefault();
      e.stopPropagation();
      var $btn = $(e.currentTarget);
      var url = $btn.attr('href');
      open(url);
    } catch (exception) {
      console.log(exception);
    }
  },
  'click .btn-logs': function () {
    Meteor.call('getAppLogs', this._id, function (err) {
      if (err) { throw err; }
    });
  },
  'click .btn-ssh': function () {
    Meteor.call('prepareSSH', this._id, function (err) {
      if (err) { throw err; }
    });
  },
  'click .btn-restart': function () {
    Meteor.call('restartApp', this._id, function (err) {
      if (err) { throw err; }
    });
  },
  'click .btn-folder': function () {
    gui.Shell.showItemInFolder(this.path);
  }
});
