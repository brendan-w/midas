/**
 * VetEntity
 *
 * @module      :: Model
 * @description :: Stores each of the requested for an applicant
 *                 to be vetted for a single project (group)
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
    project: {
      model: 'Project',
      required: true,
    },

    //whether this request is pending, accepted, or rejected
    state: {
      type: 'STRING',
      defaultsTo: 'pending',
      enum: ["pending", "accepted", "rejected"],
    },

  },

  beforeCreate: function(model, done) {
    //prevent multiple vets for the same person/project
    Vet.count({ user: model.user, project: model.project }).exec(function(err, vetCount) {
      if(vetCount != 0)
        return done("User is already vetted for this group");
      done();
    });
  },

};
