console.log('Loading... ', __filename);

/**
 * Policies are simply Express middleware functions which run before your controllers.
 * You can apply one or more policies for a given controller or action.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */


module.exports.policies = {

  // default require authentication
  // see api/policies/authenticated.js
  '*': ['authenticated', 'addUserId'],

  // Main rendering controller
  // Passes sspi policy through for auto-login systems
  MainController : {
    '*': ['sspi']
  },

  // Only admins can access the AdminController API
  AdminController : {
    '*': ['authenticated', 'admin']
  },

  // Auth controller can be accessed by anyone
  AuthController : {
    '*': true,
    'register': ['register']
  },

  UserAuthController: {
    '*': ['authenticated', 'hasIdParam', 'userAuthIdMatch']
  },

  // Limit user controller view to just the /user endpoint
  UserController : {
    '*': false,
    'profile':       ['authenticated'],
    'photo':         ['authenticated', 'hasIdParam'],
    'info':          ['authenticated', 'hasIdParam'],
    'update':        ['authenticated', 'hasIdParam', 'user', 'protectAdmin'],
    'username':      [],
    'find':          ['authenticated'],
    'all':           ['authenticated'],
    'findOne':       ['authenticated'],
    'activities':    ['authenticated'],
    'disable':       ['authenticated', 'hasIdParam'],
    'enable':        ['authenticated', 'hasIdParam', 'admin'],
    'resetPassword': ['authenticated'],
    'emailCount':    ['test'],
    'export':        ['authenticated', 'admin']
  },

  UserEmailController : {
    '*':               ['authenticated'],
    'find':            ['authenticated', 'hasIdParam', 'userEmailIdMatch'],
    'findOne':         ['authenticated', 'hasIdParam', 'userEmailIdMatch'],
    'findAllByUserId': ['authenticated', 'hasIdParam', 'user'],
    'create':          ['authenticated', 'addUserId'],
    'update':          ['authenticated', 'hasIdParam', 'userEmailIdMatch'],
    'destroy':         ['authenticated', 'hasIdParam', 'userEmailIdMatch'],
  },

  UserSettingController : {
    '*':       ['authenticated', 'addUserId'],
    'find':    ['authenticated', 'addUserId'],
    'findOne': ['authenticated', 'addUserId'],
    'destroy': ['authenticated', 'hasIdParam','userSettingIdMatch']
  },

  // Disable the index blueprints for FileController due to security concerns
  FileController : {
    'index':      false,
    'findAll':    ['admin'],

    // for testing
    'test':       true,
    'testupload': true,

    // everything else is protected
    '*':          ['protectedFile']
  },

  ProjectController : {
    '*':       ['authenticated', 'addUserId', 'project'],
    'find':    ['authenticated', 'hasIdParam', 'project'],
    'findOne': ['authenticated', 'hasIdParam', 'project'],
    'update':  ['authenticated', 'hasIdParam', 'project', 'ownerOrAdmin'],
    'destroy': ['authenticated', 'hasIdParam', 'project', 'ownerOrAdmin']
  },

  ProjectOwnerController : {
    '*':       false,
    'create':  ['authenticated', 'projectId'],
    'destroy': ['authenticated', 'hasIdParam']
  },

  LikeController : {
    '*':       ['authenticated', 'addUserId'],
    'count':   ['authenticated', 'hasIdParam', 'project'],
    'countt':  ['authenticated', 'hasIdParam', 'task'],
    'countu':  ['authenticated', 'hasIdParam'],
    'like':    ['authenticated', 'addUserId', 'hasIdParam'],
    'liket':   ['authenticated', 'addUserId', 'hasIdParam'],
    'likeu':   ['authenticated', 'addUserId', 'hasIdParam'],
    'unlike':  ['authenticated', 'addUserId', 'hasIdParam'],
    'unliket': ['authenticated', 'addUserId', 'hasIdParam'],
    'unlikeu': ['authenticated', 'addUserId', 'hasIdParam'],
    'create':  ['authenticated', 'addUserId'],
    'destroy': false,
    'update':  false
  },

  VolunteerController : {
    '*': false,
    'create':  ['authenticated', 'addUserId'],
    'destroy': ['authenticated', 'hasIdParam', 'volunteer', 'ownerOrAdmin'],
  },

  EventController : {
    '*': false,
    'find':               ['authenticated'],
    'findOne':            ['authenticated'],
    'create':             ['authenticated', 'addUserId', 'projectId', 'eventUuid'],
    'update':             ['authenticated', 'projectId'],
    'findAllByProjectId': ['authenticated', 'addUserId', 'hasIdParam', 'project'],
    'attend':             ['authenticated', 'addUserId', 'hasIdParam'],
    'cancel':             ['authenticated', 'addUserId', 'hasIdParam'],
    'rsvp':               ['authenticated', 'addUserId'],
    'ical':               ['authenticated', 'addUserId', 'project'],
    'destroy':            ['authenticated', 'hasIdParam', 'admin']
  },

  CommentController : {
    'find':               false,
    'findOne':            false,
    'create':             ['authenticated', 'addUserId', 'projectId', 'taskId'],
    'update':             ['authenticated', 'projectId', 'taskId', 'comment', 'ownerOrAdmin'],
    'destroy':            ['authenticated', 'hasIdParam', 'admin'],
    'findAllByProjectId': ['authenticated', 'hasIdParam', 'project'],
    'findAllByTaskId':    ['authenticated', 'hasIdParam', 'task']
  },

  TagEntityController : {
    // Purely for administrative functions
    '*':       ['authenticated'],
    'update':  ['authenticated', 'admin'],
    'destroy': ['authenticated', 'admin']
  },

  TaskController : {
    'find':               ['authenticated', 'task'],
    'findOne':            ['authenticated', 'task'],
    'findAllByProjectId': ['authenticated', 'hasIdParam', 'project'],
    'copy':               ['authenticated', 'addUserId'],
    'create':             ['authenticated', 'addUserId'],
    'update':             ['authenticated', 'hasIdParam', 'projectId', 'task', 'ownerOrAdmin'],
    'destroy':            ['authenticated', 'hasIdParam', 'task', 'ownerOrAdmin'],
    'export':             ['authenticated', 'admin']
  },

  AttachmentController: {
    'find':               ['authenticated', 'hasIdParam'],
    'findOne':            ['authenticated', 'hasIdParam'],
    'findAllByProjectId': ['authenticated', 'hasIdParam', 'project'],
    'findAllByTaskId':    ['authenticated', 'hasIdParam', 'task'],
    'create':             ['authenticated', 'addUserId'],
    'update':             false,
    'destroy':            ['authenticated']
  },

  SearchController : {
    '*': true
  }

  /*
  // Here's an example of adding some policies to a controller
  RabbitController: {

    // Apply the `false` policy as the default for all of RabbitController's actions
    // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
    '*': false,

    // For the action `nurture`, apply the 'isRabbitMother' policy
    // (this overrides `false` above)
    nurture : 'isRabbitMother',

    // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
    // before letting any users feed our rabbits
    feed : ['isNiceToAnimals', 'hasRabbitFood']
  }
  */
};


/**
 * Here's what the `isNiceToAnimals` policy from above might look like:
 * (this file would be located at `policies/isNiceToAnimals.js`)
 *
 * We'll make some educated guesses about whether our system will
 * consider this user someone who is nice to animals.
 *
 * Besides protecting rabbits (while a noble cause, no doubt),
 * here are a few other example use cases for policies:
 *
 *  + cookie-based authentication
 *  + role-based access control
 *  + limiting file uploads based on MB quotas
 *  + OAuth
 *  + BasicAuth
 *  + or any other kind of authentication scheme you can imagine
 *
 */

/*
module.exports = function isNiceToAnimals (req, res, next) {

  // `req.session` contains a set of data specific to the user making this request.
  // It's kind of like our app's "memory" of the current user.

  // If our user has a history of animal cruelty, not only will we
  // prevent her from going even one step further (`return`),
  // we'll go ahead and redirect her to PETA (`res.redirect`).
  if ( req.session.user.hasHistoryOfAnimalCruelty ) {
    return res.redirect('http://PETA.org');
  }

  // If the user has been seen frowning at puppies, we have to assume that
  // they might end up being mean to them, so we'll
  if ( req.session.user.frownsAtPuppies ) {
    return res.redirect('http://www.dailypuppy.com/');
  }

  // Finally, if the user has a clean record, we'll call the `next()` function
  // to let them through to the next policy or our controller
  next();
};
*/
