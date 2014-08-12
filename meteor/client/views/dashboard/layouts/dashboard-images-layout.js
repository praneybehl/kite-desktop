Template.dashboard_images_layout.rendered = function () {
  Meteor.setInterval(function () {
    $('.mac-window-header-options-right a').tooltip();
  }, 1000);
};

Template.dashboard_images_layout.events({
  'click .btn-create-app': function () {
    $('#modal-create-app').modal('show');
    $('#form-create-app').find('input[name="imageId"]').val(this._id);
  },
  'click .btn-folder': function () {
    gui.Shell.showItemInFolder(this.path);
  }
});
