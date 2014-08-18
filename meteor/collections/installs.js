Installs = new Meteor.Collection('installs');

schemaInstalls = new SimpleSchema({
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

Installs.attachSchema(schemaInstalls);
