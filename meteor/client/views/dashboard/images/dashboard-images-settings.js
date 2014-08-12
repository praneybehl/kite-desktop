Template.dashboard_images_settings.events({
  'click .btn-delete-image': function () {
    var result = confirm("Are you sure you want to delete this image?");
    if (result === true) {
      Meteor.call('deleteImage', this._id, function (err) {
        if (err) {
          $('#error-delete-image').html('<small>' + err.reason + '</small>');
          $('#error-delete-image').fadeIn();
        } else {
          Router.go('dashboard_images');
        }
      });
    }
  }
});
