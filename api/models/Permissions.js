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

    // name of the permission group
    // used for human display purposes
    name: 'STRING',

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
