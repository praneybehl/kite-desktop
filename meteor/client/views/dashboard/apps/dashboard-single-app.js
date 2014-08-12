Template.dashboard_single_app.rendered = function () {
  Meteor.setInterval(function () {
    $('.btn-icon').tooltip();
  }, 1000);
};

Template.dashboard_single_app.events({
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
