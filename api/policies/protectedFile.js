/**
* Protect resources to only be accessed by admins and the owning user
*/
module.exports = function protectedFile (req, res, next) {
  // Admins can do anything
  if (req.user && req.user[0].permissions.admin) { return next(); }
  // Posts don't require an id
  if (req.user && (req.route.method == 'post')) { return next(); }
  // Id must be specified; can't execute findAll or find with no parameters
  if (!req.params.id) { return res.send(403, {message: "You are not permitted to perform this action. 1"}); }
  // File must be owned by the user
  File.findOneById(req.params.id, function (err, f) {
    // XXX TODO: This is a hack until the following issue is resolved
    // should only retrieve the id, userId, and isPrivate fields
    // https://github.com/balderdashy/waterline/issues/73
    if (err || !f) return res.send(403, {message: "You are not permitted to perform this action. 2"});
    // GET is allowed on public files
    if ((req.route.method == 'get') && (!f.isPrivate)) { return next(); }
    // Everything else must be the user who owns it
    if (!req.user || (f.userId != req.user[0].id)) { return res.send(403, {message: "You are not permitted to perform this action. 3"}) }
    // Otherwise, the user must own the item.
    return next();
  });
};
