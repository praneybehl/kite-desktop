Template.setup_intro.events({
  'click .continue-button': function (e) {
    Router.go('setup_install');
    runSetup(function (err) {
      if (err) {
        console.log('Setup failed.');
        console.log(err);
      } else {
        Installs.insert({});
      }
    });
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});