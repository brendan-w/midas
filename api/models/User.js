/**
 * User
 *
 * @module      :: Model
 * @description :: User representation
 *
 */

var exportUtils = require('../services/utils/export');

module.exports = {
  tableName: 'midas_user',
  attributes: {
    // Login information
    username: 'STRING',

    // Core attributes about a user
    name: 'STRING',

    // Professional Title
    title: 'STRING',

    // Biography
    bio: 'STRING',

    // User's profile photo
    // If photoId is not null, the URL to the file is /file/get/:id
    photoId: 'INTEGER',
    // If photoUrl is not null, then an external provider gave us the photo
    // Use the URL directly as the resource identifier for the photo.
    photoUrl: 'STRING',

    //reference to the users permision group
    permissions: {
      model: 'Permissions'
    },

    // User metadata for service delivery
    isAdmin: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // is the user's login disabled
    disabled: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // Store the number of invalid password attempts
    passwordAttempts: {
      type: 'INTEGER',
      defaultsTo: 0
    },

    // Tag association
    tags: {
      collection: 'tagEntity',
      via: 'users',
      dominant: true
    }
  },

  // TODO: add more fields, likely driven off subqueries
  exportFormat: {
    'user_id': 'id',
    'name': {field: 'name', filter: exportUtils.nullToEmptyString},
    'username': {field: 'username', filter: exportUtils.nullToEmptyString},
    'title': {field: 'title', filter: exportUtils.nullToEmptyString},

    // The two below fields are not directly on the user model
    // They are populated from tags by UserController.export
    'agency': {field: 'agency', filter: exportUtils.nullToEmptyString},
    'location': {field: 'location', filter: exportUtils.nullToEmptyString},

    'bio': {field: 'bio', filter: exportUtils.nullToEmptyString},
    'admin': 'isAdmin',
    'disabled': 'disabled'
  },

  beforeCreate: function(model, done) {
    //same handling as updates
    this.beforeUpdate(model, done);
  },

  beforeUpdate: function(model, done) {

    //if no permissions are defined, pass it through with no errors
    if(!model.permissions)
      return done();

    //ensure that permissions are ONLY referenced by name
    //sails should never update the actuall permissions model, only the foreign key
    if(typeof(model.permissions) !== "string")
      return done("User permissions may only be updated by string name");

    //make sure that this is an existing permissions name
    Permissions.findOneByName(model.permissions).exec(function (err, p) {
      if (err || !p)
        return done("Invalid permissions name: " + model.permissions);
      else
        return done();
    });
  },

  afterCreate: function(model, done) {
    Notification.create({
      action: 'user.create.welcome',
      model: model
    }, done);
  },

};
