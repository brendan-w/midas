console.log('Loading... ', __filename);

var fs = require('fs');

module.exports = {

  // Email dispatch protocol (i.e. SMTP  or SES)
  emailProtocol: 'SMTP',

  // SMTP Mail settings -- uses Nodemailer
  // See for more config options: https://github.com/andris9/Nodemailer#setting-up-smtp
  smtp: {
    // Specify to use a supported service; leave blank for SMTP
    // See: https://github.com/andris9/Nodemailer#well-known-services-for-smtp
    service             : process.env.SMTP_SERVICE || '',
    // remote SMTP host
    host                : '',
    // true to use SSL connections
    secureConnection    : true,
    // 25 (non-secure) or 465 (secure)
    port                : 465,
    // username and password settings for secure connections
    auth                : {
      user              : process.env.SMTP_USERNAME || '',
      pass              : process.env.SMTP_PASSWORD || ''
    },
    // ignore server support for STARTTLS (defaults to false)
    ignoreTLS           : false,
    // output client and server messages to console
    debug               : false,
    // how many connections to keep in the pool (defaults to 5)
    maxConnections      : 5
    // limit the count of messages to send through a single connection (no limit by default)
    // maxMessages         :
  },

  // SES Mail settings -- uses Nodemailer
  ses: {
    // AWSAccessKeyID: 'AWSACCESSKEY',
    // AWSSecretKey: 'AWS/Secret/key',
    // ServiceUrl: 'https://email.us-east-1.amazonaws.com'
  },

  // is DKIM signing enabled for Nodemailer transport?
  dkimEnabled: false,

  // DKIM signing options for Nodemailer transport
  dkim: {
    // domainName: "kreata.ee",
    // keySelector: "dkim",
    // privateKey: fs.readFileSync("private_key.pem"),
    // headerFieldNames: ''
  },

  // system email address (from address)
  systemEmail: 'test@example.com'

};
