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
    var dockerHost = Session.get('dockerHost', null);
    var image = Images.findOne(this.imageId);
    if (image && image.meta.app && image.meta.app.webPort) {
      var port = this.docker.NetworkSettings.Ports[image.meta.app.webPort + '/tcp'];
      if (port) {
        if (dockerHost) {
          return dockerHost + ':' + port[0].HostPort;
        }
      }
    } else {
      // Picks the first port that is not SSH
      var keys = _.keys(this.docker.NetworkSettings.Ports);
      if (keys.length >= 1) {
        var firstPort = _.keys(this.docker.NetworkSettings.Ports)[0];
        if (firstPort === '22/tcp') {
          if (keys.length >= 2) {
            firstPort = _.keys(this.docker.NetworkSettings.Ports)[1];
          } else {
            return null;
          }
        }
        if (dockerHost) {
          return dockerHost + ':' + this.docker.NetworkSettings.Ports[firstPort][0].HostPort;
        }
      }
    }
  },
  sshUrl: function () {
    if (this.docker.NetworkSettings.Ports['22/tcp']) {
      var dockerHost = Session.get('dockerHost', null);
      if (dockerHost) {
        dockerHost = dockerHost.replace('https://', '').replace('http://', '');
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
