console.log('Loading... ', __filename);

/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can be (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you from inadvertently pushing sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://links.sailsjs.org/docs/config/connections
 */

module.exports.connections = {

  memory: {
    adapter: 'sails-disk',
    inMemory: true
  },

  disk: {
    adapter: 'sails-disk'
  },

  // POSTGRES
  // Set your postgres database settings here, including the username, password
  // and database name
  postgresql: {
    adapter     : 'sails-postgresql',
    host        : process.env.POSTGRESQL_IP || 'localhost',
    port        : process.env.POSTGRESQL_PORT || 5432,
    user        : process.env.POSTGRESQL_USERNAME || 'midas',
    password    : process.env.POSTGRESQL_PASSWORD || 'midas',
    database    : process.env.POSTGRESQL_DATABASE || 'midas',
    softDelete  : true
  }

};
