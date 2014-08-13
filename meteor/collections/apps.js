Apps = new Meteor.Collection('apps');

schemaApps = new SimpleSchema({
  imageId: {
    type: Meteor.ObjectID,
    label: "ID of the image used by the app",
    max: 200
  },
  docker: {
    type: Object,
    label: "Docker container data",
    blackbox: true,
    optional: true
  },
  status: {
    type: String,
    allowedValues: ['STARTING', 'READY', 'ERROR'],
    label: "App current status",
    max: 200
  },
  config: {
    type: Object,
    label: "App environment variables",
    blackbox: true
  },
  name: {
    type: String,
    label: "App name",
    max: 200
  },
  logs: {
    type: [String],
    label: "Logs"
  },
  path: {
    type: String,
    label: "Path to the app directory",
    optional: true
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

Apps.helpers({
  image: function () {
    return Images.findOne(this.imageId);
  },
  url: function () {
    return 'http://' + this.config.VIRTUAL_HOST;
  },
  sshUrl: function () {
    if (this.docker.NetworkSettings.Ports['22/tcp']) {
      var dockerHost = Session.get('dockerHost', null);
      if (dockerHost) {
        dockerHost = dockerHost.replace('http://', '');
      }
      return 'ssh://kite@' + dockerHost + ':' + this.docker.NetworkSettings.Ports['22/tcp'][0].HostPort;
    } else {
      return null;
    }
  },
  sshPort: function () {
    if (this.docker.NetworkSettings.Ports['22/tcp']) {
      return this.docker.NetworkSettings.Ports['22/tcp'][0].HostPort;
    } else {
      return null;
    }
  }
});

Apps.attachSchema(schemaApps);
