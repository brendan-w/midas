/**
* Adds the current user's ID to the model before creating.
* Use this instead of addUserId, since the attribute is named differently
* (to denote that it will be populated with the corresponding user row)
*/
var _ = require('underscore');

module.exports = function vetCreate (req, res, next) {

  //check that this user has permission to apply to jobs
  if(req.user[0].permissions.apply)
  {
    console.log(req.body);
    if(!req.body.projectId)
      return res.send(400, { message: "Please specify a projectId" });

    var projectId = req.body.projectId;

    //lookup the project they are requesting to be vetted for
    Project.countById(projectId).exec(function(err, c) {
      if(c == 0) return res.send(400, { message: "You cannot be vetted for a non-existant project." });

      //toss the original object (helps strain out fields we don't want created) 
      req.body = {}
      req.body.user    = req.user[0].id;
      req.body.project = projectId;

      return next();
    });
  }
  else
  {
    res.send(403, { message: "You are not an applicant, you cannot request to become vetted" });
  }

};
