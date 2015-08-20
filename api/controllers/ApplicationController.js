
var _ = require("underscore");
var async = require("async");


/**
 * ApplyController
 *
 * @module      :: Application Controller
 * @description :: Contains logic for handling application requests.
 */

module.exports = {

  create: function (req, res) {

    //these files are submitted along with the application to ensure atomicity    
    if(req.body.files === undefined) return res.send(400, { message: "No files were submitted with this application" });
    if(req.body.rate  === undefined) return res.send(400, { message: "Application is missing the rate" });
    if(req.body.task  === undefined) return res.send(400, { message: "Application is missing the task ID" });
    if(req.body.rate <= 0)           return res.send(400, { message: "Application must have a positive rate" });


    var application_data = {
      task: req.body.task,
      rate: req.body.rate,
      user: req.user[0].id,
      state: "pending",
    };

    Application.create(application_data, function(err, a) {
      if(err || !a) return res.send(400, { message: "Failed to create application" });

      //now that we have an application ID to attach files to, attach the requested files
      //TODO:check for bad file IDs
      var attachments = _.map(req.body.files, function(fileId) {
        return {
          file: fileId,
          applicationId: a.id,
        };
      });

      Attachment.create(attachments, function(err) {
        if(err)
        {
          //unroll by deleting the application that was just created
          Application.destroy(a.id, function(err) {
            if(err) res.send(400, { message: "Failed to delete application after file attachment error. Your application may contain errors, please contact the administrator" });
            return res.send(400, { message: "Failed to attach files to application" });
          });
        }
        res.send(a);
      });
    });
  },

  //lookup all applicants for the given task ID
  findApplicantsForTask: function(req, res) {

    //find the applications for this task
    Application.find({ task : req.params.id})
               .populate("user")
               .exec(function(err, applications) {
      if(err) return res.send(400, { message: "Error looking up applications" });

      //populate the user's vets and submitted files
      function populate_vets_and_files(application, callback) {

        //populate vets
        Vet.find({ user: application.user.id })
           .populate("project")
           .exec(function(err, vets) {

            if(err) return callback("Error looking up vets for applicant", undefined);
            application.vets = vets;

            //populate files
            Attachment.find({ applicationId: application.id })
                      .populate("file")
                      .exec(function(err, files) {
              if(err) return callback("Error looking up files for applicant", undefined);

              application.files = files;
              return callback(null, application);
            });
        });
      }

      //use async to populate all missing fields on each applicant
      async.map(applications, populate_vets_and_files, function(err, applications){
        if(err) return res.send(400, { message: err });
        res.send(applications); //all done
      });

    });
  },

};
