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
  '*': ['passport', 'authenticated', 'addUserId'],

  // Main rendering controller
  // Passes sspi policy through for auto-login systems
  MainController : {
    '*': ['sspi']
  },

  AcController : {
    '*': true,
  },

  // Only admins can access the AdminController API
  AdminController : {
    '*': ['passport', 'authenticated', 'admin']
  },

  ApplicationController: {
    '*':                       false,
    'create':                  ['passport', 'authenticated'],
    'update':                  ['passport', 'authenticated', 'canCreateTask'],
    'findApplicantsForTask':   ['passport', 'authenticated', 'hasIdParam', 'task', 'ownerOrAdmin'],
    'acceptApplicantsForTask': ['passport', 'authenticated', 'hasIdParam', 'task', 'ownerOrAdmin'],
  },

  // Auth controller can be accessed by anyone
  AuthController : {
    '*': true,
    'register': ['register']
  },

  AttachmentController: {
    'find':               ['passport', 'authenticated', 'hasIdParam'],
    'findOne':            ['passport', 'authenticated', 'hasIdParam'],
    'findAllByProjectId': [                             'hasIdParam', 'project'],
    'findAllByTaskId':    [                             'hasIdParam', 'task'],
    'findAllByUserId':    ['passport', 'authenticated', 'hasIdParam'],
    'create':             ['passport', 'authenticated', 'attachment'],
    'update':             false,
    'destroy':            ['passport', 'authenticated']
  },

  CommentController : {
    'find':               false,
    'findOne':            false,
    'create':             ['passport', 'authenticated', 'addUserId', 'projectId', 'taskId'],
    'update':             ['passport', 'authenticated', 'projectId', 'taskId', 'comment', 'ownerOrAdmin'],
    'destroy':            ['passport', 'authenticated', 'hasIdParam', 'admin'],
    'findAllByProjectId': ['passport', 'authenticated', 'hasIdParam', 'project'],
    'findAllByTaskId':    ['passport', 'authenticated', 'hasIdParam', 'task']
  },

  EventController : {
    '*': false,
    'find':               ['passport', 'authenticated'],
    'findOne':            ['passport', 'authenticated'],
    'create':             ['passport', 'authenticated', 'addUserId', 'projectId', 'eventUuid'],
    'update':             ['passport', 'authenticated', 'projectId'],
    'findAllByProjectId': ['passport', 'authenticated', 'addUserId', 'hasIdParam', 'project'],
    'attend':             ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'cancel':             ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'rsvp':               ['passport', 'authenticated', 'addUserId'],
    'ical':               ['passport', 'authenticated', 'addUserId', 'project'],
    'destroy':            ['passport', 'authenticated', 'hasIdParam', 'admin'],
  },

  // Disable the index blueprints for FileController due to security concerns
  FileController : {
    'index':      false,
    'findAll':    ['admin'],

    // for testing
    'test':       true,
    'testupload': true,

    // everything else is protected
    '*':          ['passport', 'authenticated', 'protectedFile'],
  },

  LikeController : {
    '*':       ['passport', 'authenticated', 'addUserId'],
    'count':   ['passport', 'authenticated', 'hasIdParam', 'project'],
    'countt':  ['passport', 'authenticated', 'hasIdParam', 'task'],
    'countu':  ['passport', 'authenticated', 'hasIdParam'],
    'like':    ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'liket':   ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'likeu':   ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'unlike':  ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'unliket': ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'unlikeu': ['passport', 'authenticated', 'addUserId', 'hasIdParam'],
    'create':  ['passport', 'authenticated', 'addUserId'],
    'destroy': false,
    'update':  false,
  },

  LocationController : {
    '*':       ['passport', 'authenticated'],
    'suggest': true,
  },

  ProjectController : {
    '*':       ['passport', 'authenticated', 'addUserId', 'project'],
    'find':    ['passport',                  'hasIdParam', 'project'],
    'findOne': ['passport',                  'hasIdParam', 'project'],
    'findAll': ['passport'],
    'create':  ['passport', 'authenticated', 'addUserId', 'canCreateProject'],
    'update':  ['passport', 'authenticated', 'hasIdParam', 'project', 'ownerOrAdmin'],
    'destroy': ['passport', 'authenticated', 'hasIdParam', 'project', 'ownerOrAdmin']
  },

  ProjectOwnerController : {
    '*':       false,
    'create':  ['passport', 'authenticated', 'projectId'],
    'destroy': ['passport', 'authenticated', 'hasIdParam']
  },

  SearchController : {
    '*': true
  },

  TagEntityController : {
    '*':       true,
    'create':  ['passport', 'authenticated'],
    // Purely for administrative functions
    'update':  ['passport', 'authenticated', 'admin'],
    'destroy': ['passport', 'authenticated', 'admin']
  },

  TaskController : {
    'find':               ['passport',                  'task'],
    'findOne':            ['passport',                  'task'],
    'findAllByProjectId': ['passport',                  'hasIdParam', 'project'],
    'copy':               ['passport', 'authenticated', 'addUserId'],
    'create':             ['passport', 'authenticated', 'addUserId', 'canCreateTask'],
    'update':             ['passport', 'authenticated', 'hasIdParam', 'projectId', 'task', 'ownerOrAdmin'],
    'destroy':            ['passport', 'authenticated', 'hasIdParam', 'task', 'ownerOrAdmin'],
    'export':             ['passport', 'authenticated', 'admin']
  },

  // Limit user controller view to just the /user endpoint
  UserController : {
    '*': false,
    'profile':       ['passport', 'authenticated'],
    'photo':         ['passport', 'authenticated', 'hasIdParam'],
    'info':          ['passport', 'authenticated', 'hasIdParam'],
    'update':        ['passport', 'authenticated', 'hasIdParam', 'user', 'userUpdate'],
    'username':      [],
    'find':          ['passport', 'authenticated'],
    'all':           ['passport', 'authenticated'],
    'findOne':       ['passport', 'authenticated'],
    'activities':    ['passport', 'authenticated'],
    'disable':       ['passport', 'authenticated', 'hasIdParam'],
    'enable':        ['passport', 'authenticated', 'hasIdParam', 'admin'],
    'resetPassword': ['passport', 'authenticated'],
    'canApply':      ['passport', 'authenticated'],
    'emailCount':    ['test'],
    'export':        ['passport', 'authenticated', 'admin']
  },

  UserSettingController : {
    '*':       ['passport', 'authenticated', 'addUserId'],
    'find':    ['passport', 'authenticated', 'addUserId'],
    'findOne': ['passport', 'authenticated', 'addUserId'],
    'destroy': ['passport', 'authenticated', 'hasIdParam','userSettingIdMatch']
  },

  VetController : {
    '*':              false,
    'create':         ['passport', 'authenticated', 'vetCreate'],
    'update':         ['passport', 'authenticated', 'canVet', 'vetUpdate'],
    'destroy':        ['passport', 'authenticated', 'canVet'],
    'findOne':        ['passport', 'authenticated', 'canVet'],
    'findAllPending': ['passport', 'authenticated', 'canVet'],
  },

  //not used
  VolunteerController : {
    '*': false,
    // 'create':  ['passport', 'authenticated', 'addUserId'],
    // 'destroy': ['passport', 'authenticated', 'hasIdParam', 'volunteer', 'ownerOrAdmin'],
  },
};
