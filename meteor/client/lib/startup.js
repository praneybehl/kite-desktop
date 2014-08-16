Meteor.startup(function () {
  startBoot2Docker(function (err) {
    if (err) {
      console.log(err);
    }
  });
});
