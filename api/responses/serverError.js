/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, 'some/specific/error/view');
 *
 * @param {*}      err           -  the internal error. This will be logged, and WON'T be sent to the client
 * @param {String} pretty_error  -  The user-friendly error to be displayed on the client.
 *
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */

module.exports = function serverError (err, pretty_error) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  // Set status code
  res.status(500);

  // Log error to console
  if (err !== undefined) sails.log.error('Sending 500 ("Server Error") response: ' + pretty_error + '\n', err);
  else                   sails.log.error('Sending empty 500 ("Server Error") response');

  if(pretty_error)
  {
    // If the user-agent wants JSON, always respond with JSON
    if (req.wantsJSON) return res.jsonx({ message : pretty_error });
    else               return res.send(pretty_error);
  }
  else
  {
    return res.send(res.status());
  }
};
