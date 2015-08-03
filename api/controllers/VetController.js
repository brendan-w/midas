/**
 * VetController
 *
 * @module      :: Controller
 * @description :: Handles admin vetting actions and applicant vet requests
 */
var _ = require('underscore');


module.exports = {

  //returns the all of the vet requests with a state of "pending"
  findAllPending: function (req, res) {
    Vet.findByState("pending").exec(function(err, vets) {
      if (err) return res.send(400, { message: "Failed to lookup vet status"})
      return res.send(vets);
    });
  },

};
