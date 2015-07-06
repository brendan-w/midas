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

  attributes: {

    /*
      General settings for this permission group
    */

    // name of the permission group
    // used for human display purposes
    name: {
      type: 'STRING',
      unique: true
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
    admin_pages: {
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

  }
};
