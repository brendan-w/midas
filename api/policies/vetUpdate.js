/**
* Gaurds certain attributes on Vet models from being updated.
*/

module.exports = function vetUpdate (req, res, next) {

  //these properties should never be updated, only deleted
  //there's also a chance that these carry other populated() models,
  delete req.body.user;
  delete req.body.project;

  return next();
};
