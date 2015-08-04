/**
 * Permissions
 *
 * @module      :: Model
 * @description :: Storage of a single permission groups.
 *                 sensitive settings, such as access to the
 *                 Admin pages, should be placed here.
 *
 */
module.exports = {

  //the primary key is the string name
  //force this to be set upon creation
  autoPK:false,

  attributes: {

    /*
      General settings for this permission group
    */

    // name of the permission group
    // used for human display purposes
    name: {
      type: 'STRING',
      primaryKey: true,
      required: true,
      unique: true,
    },

    // whether or not a user can register with these permissions
    // for instance, a user should NOT be allowed to freely register as an Admin
    registration_option: {
      type: 'BOOLEAN',
      defaultsTo: false
    },


    /*
      Individual Permissions
    */

    // access to the admin pages
    // also somewhat of a catch-all for operations outside of
    // the admin pages that should be restricted to superusers
    admin: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // permission to apply/volunteer for tasks
    apply: {
      type: 'BOOLEAN',
      defaultsTo: true
    },

    // permission to create projects
    project_create: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // permission to create tasks
    task_create: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // permission to edit any task, project, profile, or comment 
    moderate: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // permission to accept an applicant's vet request for a particular working group (project)
    vet: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

  }
};
