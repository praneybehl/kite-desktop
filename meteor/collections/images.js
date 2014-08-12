Images = new Meteor.Collection('images');

schemaImages = new SimpleSchema({
  path: {
    type: String,
    label: "Path to the image directory",
    optional: true
  },
  logoPath: {
    type: String,
    label: "Path to the image logo",
    optional: true
  },
  meta: {
    type: Object,
    label: "Meta data for the image",
    blackbox: true,
    optional: true
  },
  docker: {
    type: Object,
    label: "Docker image data",
    blackbox: true,
    optional: true
  },
  status: {
    type: String,
    allowedValues: ['BUILDING', 'READY', 'ERROR'],
    label: "Image build current status",
    max: 200
  },
  buildLogs: {
    type: [String],
    label: "Build logs"
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      var now = moment().utc().toDate();
      if (this.isInsert) {
        return now;
      } else if (this.isUpsert) {
        return {$setOnInsert: now};
      } else {
        this.unset();
      }
    },
    denyUpdate: true
  }
});

Images.attachSchema(schemaImages);
