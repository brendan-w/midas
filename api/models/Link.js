/**
 * Language
 *
 * @module      :: Model
 * @description :: Stores each of the users languages, as well as
 *                 tags for their written and spoken proficiency.
 *
 */
module.exports = {

  attributes: {

    //the ID of an owning user
    user: {
      model: 'User',
    },

    //the ID of an owning project
    project: {
      model: 'Project',
    },

    //the ID of an owning task
    task: {
      model: 'Task',
    },

    //the url itself
    url: {
      type: 'STRING',
      required: true,
    },

  },

};
