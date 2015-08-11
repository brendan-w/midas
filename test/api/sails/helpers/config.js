module.exports = {
  // used if no other user is specified
  'defaultUser': {
    'name': 'Default User',
    'username': 'tester1@midascrowd.com',
    'password': 'TestTest123#'
  },
  // for the user.test.js suite
  'testUser': {
    'name': 'Midas User',
    'username': 'testuser@midascrowd.com',
    'password': 'MidasTestM4$'
  },
  // for the attachment suite
  'attachmentUser': {
    'name': 'Attachment User',
    'username': 'attachmentuser@midascrowd.com',
    'password': 'MidasTestM4$'
  },
  // for the admin test suite
  'adminUser': {
    'name': 'Admin User',
    'username': 'admin@midascrowd.com',
    'password': 'Adm1nTest123$#',
  },
  'testPasswordResetUser': {
    'name': 'Password Reset User',
    'username': 'testreset@midascrowd.com',
    'password': 'Test123$',
    'newpassword': 'FooBar123#'
  },
  'DomainBlockedUser': {
    'name': 'Domain Blocked User',
    'username': 'testerblocked@midascrowd.com',
    'password': 'TestTest1234#'
  },
  'DomainAllowedUser': {
    'name': 'Domain Allowed User',
    'username': 'hhttillykolvpcqgxgop@gsa.gov',
    'password': 'TestTest1234#'
  },
  'LocationRequiredUser': {
    'name': 'Location Required User',
    'username': 'locationlocationlocation@gsa.gov',
    'password': 'TestTest1234#',
    'location': { 'id': 1 }
  },
  'AgencyRequiredUser': {
    'name': 'Agency Required User',
    'username': 'theplaceyouwork@gsa.gov',
    'password': 'TestTest1234#',
    'agency': { 'id': 2 }
  },
  'url': 'http://localhost:1337/api',
  'sails': {
      log: {
        level: 'error'
      },
      adapters: {
        'default': 'disk'
      }
    },
  'project': {
    'title': 'Project Title',
    'description': 'Project Description'
  },
  'tasks': [
    {
      'title': 'task1',
      'description': 'description1',
      'creatorId': 1
    },
    {
      'title': 'task2',
      'description': 'description2',
      'creatorId': 1
    }
  ],
  'tags': [
    {
      'type': 'skill',
      'name': 'Tag1'
    },
    {
      'type': 'skill',
      'name': 'Tag2'
    },
    {
      'type': 'office',
      'name': 'Tag3'
    }
  ]
};
