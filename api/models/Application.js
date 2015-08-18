/**
 * Job Application
 *
 * @module      :: Model
 * @description :: Stores each of the requested applications
 *
 */
module.exports = {

  attributes: {

    //the ID of the user requesting to be vetted (populated)
    user: {
      model: 'User',
      required: true,
    },

    //the project ID that this vet request pertains to (populated)
    task: {
      model: 'Task',
      required: true,
    },

    //whether this application is pending, accepted, or rejected
    state: {
      type: 'STRING',
      defaultsTo: 'pending',
      enum: ["pending", "accepted", "rejected"],
    },

    //the user's chosen daily rate
    rate: {
      type: 'INTEGER',
      required: true,
    },
  },
};
