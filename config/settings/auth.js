console.log('Loading... ', __filename);

// import login configuration
var config = require(process.cwd() + '/assets/js/backbone/config/login.json');
module.exports = {
  // AUTHENTICATION SETTINGS
  // Set your client ids private keys for each of your services
  auth: {
    local : {
      // number of attempts before locking out the user
      passwordAttempts : 5,
      // expire password reset tokens after this many milliseconds
      tokenExpiration  : 60*60*1000
    },
    linkedin : {
      overwrite   : false
    },
    myusa : {
      overwrite   : false
    },
    sspi : {
      contentUrl  : 'http://localhost:1337/api/main/test',
      emailDomain : 'state.gov',
      header      : 'x_remote_user',
      globalPass  : 'AbAbAb12!@',
      // re-authenticate on hard reload after this many milliseconds
      sessionExpiration : 60*60*1000,
      // overwrite existing profile fields
      overwrite   : true,
      enabled     : false
    }
  },
  // Pass the login.json config object to sails
  config: config
};
