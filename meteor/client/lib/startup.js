Meteor.startup(function () {
  console.log('Kite started.');
  startBoot2Docker(function (err) {
    if (err) {
      console.log(err);
    }
  });
});
