Meteor.methods({
  buildImage: function (directory) {
    this.unblock();
    var imageObj = {
      status: 'BUILDING',
      buildLogs: []
    };
    var kiteJSON = getKiteJSON(directory);
    if (kiteJSON) {
      imageObj.meta = kiteJSON;
      if (!imageObj.meta.name) {
        imageObj.meta.name = _.last(directory.split(path.sep));
      }
    } else {
      imageObj.meta = {
        name: _.last(directory.split(path.sep))
      };
    }
    var imageId = Images.insert(imageObj);
    saveImageFolder(directory, imageId);
    var imagePath = path.join(KITE_IMAGES_PATH, imageId);
    Images.update(imageId, {
      $set: {
        path: imagePath
      }
    });
    if (imageObj.meta.logo) {
      Images.update(imageId, {
        $set: {
          logoPath: path.join(imagePath, imageObj.meta.logo)
        }
      });
    }
    var image = Images.findOne(imageId);
    buildImage(image, function (err, data) {
      if (err) { console.log(err); }
      Fiber(function () {
        Images.update(imageId, {
          $set: {
            docker: data,
            status: 'READY'
          }
        });
      }).run();
    });
  },
  validateDirectory: function (directory) {
    if (!hasDockerfile(directory)) {
      throw new Meteor.Error(400, "Only directories with Dockerfiles are supported now.");
    }
  },
  deleteImage: function (imageId) {
    this.unblock();
    var image = Images.findOne(imageId);
    if (!image) {
      throw new Meteor.Error(403, "No image found with this ID.");
    }
    var app = Apps.findOne({imageId: imageId});
    if (!app) {
      deleteImage(image, function (err) {
        if (err) { console.log(err); }
        deleteFolder(image.path);
        Fiber(function () {
          Images.remove({_id: image._id});
        }).run();
      });
    } else {
      throw new Meteor.Error(400, 'This image is currently being used by <a href="/apps/' + app.name + '">' + app.name + "</a>.");
    }
  }
});
