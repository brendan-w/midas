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
      model: 'User'
    },

    //the project ID that this vet request pertains to (populated)
    project: {
      model: 'Project'
    },

    //whether this request is pending, accepted, or rejected
    state: 'STRING',

    //the user that made the vetting descision (populated)
    decidingUser: {
      model: 'User'
    }

  }

};
