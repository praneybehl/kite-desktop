Template.dashboard_settings.events({
  'click .btn-start-boot2docker': function (e) {
    var $btn = $(e.currentTarget);
    $btn.html('Starting Boot2Docker...');
    $btn.attr("disabled", "disabled");
    startBoot2Docker(function (err) {
      if (err) { console.log(err); }
    });
  },
  'click .btn-stop-boot2docker': function (e) {
    var $btn = $(e.currentTarget);
    $btn.html('Stopping Boot2Docker...');
    $btn.attr("disabled", "disabled");
    stopBoot2Docker(function (err) {
      if (err) { console.log(err); }
    });
  }
});

Template.dashboard_settings.memory = function () {
  return Session.get('boot2dockerMemoryUsage');
};

Template.dashboard_settings.disk = function () {
  return Session.get('boot2dockerDiskUsage');
};
