Template.dashboard_single_image.rendered = function () {
  Meteor.setInterval(function () {
    $('.btn-icon').tooltip();
  }, 1000);
};

Template.dashboard_single_image.events({
  'click .btn-create-app': function () {
    $('#modal-create-app').modal('show');
    $('#form-create-app').find('input[name="imageId"]').val(this._id);
  },
  'click .btn-folder': function () {
    gui.Shell.showItemInFolder(this.path);
  }
});
