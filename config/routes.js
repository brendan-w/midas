console.log('Loading... ', __filename);

/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */



/**
 * (1) Core middleware
 *
 * Middleware included with `app.use` is run first, before the router
 */


/**
 * (2) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 * For convenience, you can also connect routes directly to views or external URLs.
 *
 */

module.exports.routes = {

  // By default, your root route (aka home page) points to a view
  // located at `views/home/index.ejs`
  //
  // (This would also work if you had a file at: `/views/home.ejs`)
  '/': {
    controller: 'main',
    action: 'index'
  },

  // These routes are for backbone push state to work
  '/projects': {
    controller: 'main',
    action: 'index'
  },
  '/projects/:unknownRoute': {
    controller: 'main',
    action: 'index'
  },
  '/projects/:id/:unknownRoute': {
    controller: 'main',
    action: 'index'
  },
  '/tasks': {
    controller: 'main',
    action: 'index'
  },
  '/tasks/:unknownRoute': {
    controller: 'main',
    action: 'index'
  },
  '/tasks/:id/:unknownRoute': {
    controller: 'main',
    action: 'index'
  },
  '/profile': {
    controller: 'main',
    action: 'index'
  },
  '/profile/:id/:unknownRoute': {
    controller: 'main',
    action: 'index'
  },
  '/profile/:unknownRoute': {
    controller: 'main',
    action: 'index'
  },
  '/profiles': {
    controller: 'main',
    action: 'index'
  },
  '/admin': {
    controller: 'main',
    action: 'index'
  },
  '/admin/:unknownRoute': {
    controller: 'main',
    action: 'index'
  },

  '/index.html': '/',

  // Authentication routes
  'get /api/auth/logout': 'AuthController.logout',

  'post /api/auth/local': 'AuthController.callback',
  'post /api/auth/local/:action': 'AuthController.callback',

  'post /api/auth/disconnect/:provider': 'AuthController.disconnect',

  'get /api/auth/checkToken/:token': 'AuthController.checkToken',

  'get /api/auth/:provider': 'AuthController.provider',
  'get /api/auth/callback/:provider': 'AuthController.callback',
  'get /api/auth/:provider/:action': 'AuthController.callback'

};
