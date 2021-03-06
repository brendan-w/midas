
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

    //file IDs are submitted along with the application to ensure atomicity

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
  //these may pe applicants in any state (accepted/rejected/pending)
  findApplicantsForTask: function(req, res) {

    var where = {
      task  : req.params.id,
    };

    //find the applications for this task
    Application.find(where)
               .populate("user")
               .exec(function(err, applications) {
      if(err) return res.serverError(err, "Error looking up applications.");

      //populate the user's vets and submitted files
      function populate_vets_and_files(application, callback) {

        //populate vets
        Vet.find({ user: application.user.id })
           .populate("project")
           .exec(function(err, vets) {

            if(err) return callback(err, undefined);
            application.vets = vets;

            //populate files
            Attachment.find({ applicationId: application.id })
                      .populate("file")
                      .exec(function(err, attachments) {
              if(err) return callback(err, undefined);

              application.files = [];

              //remove the data
              attachments.forEach(function(attachment) {
                delete attachment.file['data'];
                application.files.push(attachment.file);
              });

              return callback(null, application);
            });
        });
      }

      //use async to populate all missing fields on each applicant
      async.map(applications, populate_vets_and_files, function(err, applications){
        if(err) return res.serverError(err, "Error looking up application details.");

        if(req.task.state == "assigned")
        {
          //applicants have already been selected, so "sort" them based on application state
          var groups = _(applications).groupBy(function(app) { return app.state });
          groups.accepted = groups.accepted || []; //make sure they all exist, even as empty arrays
          groups.rejected = groups.rejected || [];
          groups.pending  = groups.pending  || [];

          //re-assemble the list, placing accepted applicants at the top
          applications = [].concat(groups.accepted, groups.rejected, groups.pending);
          console.log(applications);
        }
        else
        {
          //applicants haven't been selected yet
          if(req.task.projectId)
          {
            //if this job was associated with a project,
            //sort the applicants based on vet status for this group
            applications.sort(function(a, b) {
              //determine if the applicants are vetted for this group
              var a_vetted = _.findWhere(a.vets, { project : req.task.projectId }).length != undefined;
              var b_vetted = _.findWhere(b.vets, { project : req.task.projectId }).length != undefined;

              if(a && b)       return 0;
              else if(!a && b) return -1;
              else if(a && !b) return 1;
              else             return 0;
            });
          }
          else
          {
            //if this job is orphaned,
            //sort based on number of vets
            applications.sort(function(a, b) {
              return b.vets.length - a.vets.length; //descending number of vets
            });
          }
        }

        res.send(applications); //all done
      });

    });
  },

  acceptApplicantsForTask: function(req, res) {

    var accepted_application_ids = req.body; //array of application ID's to accept
    var where = {
      task  : req.params.id,
      state : "pending",
    };

    //find the applications for this task
    Application.find(where).exec(function(err, applications) {

      //accepts or rejects a single applicant
      function accept_or_reject(application, callback)
      {
        var accepted = _(accepted_application_ids).contains(application.id);
        var update = {};
        update.state = accepted ? "accepted" : "rejected";

        //updated the record in the database
        Application.update({ id: application.id }, update, function(err, application) {
          if(err) return callback(err,  null);
          else    return callback(null, application);
        });
      }

      async.map(applications, accept_or_reject, function(err, applications){
        if(err) return res.serverError(err, "Error accepting applications.");

        //mark this task as assigned
        Task.update({ id: req.params.id }, { state: "assigned" }, function(err, task) {
          if(err) return res.serverError(err, "Error marking task as \"assigned\"");
          return res.send(200);
        });
      });
    });
  },

};
