Meteor.startup(function () {
  console.log('Kitematic started.');
  startBoot2Docker(function (err) {
    if (err) {
      console.log(err);
    }
  });
});
