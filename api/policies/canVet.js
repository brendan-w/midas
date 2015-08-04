/**
* Allow only those with vetting permissions.
*/
module.exports = function canVet (req, res, next) {
  if (req.user && req.user[0].permissions.vet) { return next(); }
  return res.send(403, { message: "You must be given vetting permissions to perform this action." });
};
