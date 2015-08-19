
Welcome to a remix of the [Midas](https://github.com/18F/midas) project.

Everything in this `/doc` directory is meant for developers.


The basics
----------

- Backend is Node.JS (Express with the Sails.js API Framework)
  - PostgreSQL database
  - Auth is done with Passport.js
- Frontend is a Backbone single page app
  - Bootstrap
  - Files are compiled using Browserify

The lay of the land
-------------------

```
.
├── api/                  Main Sails.js backend directory
│   ├── adapters/
│   ├── controllers/
│   ├── models/
│   ├── notifications/
│   ├── policies/         Sails.js' take on middleware
│   ├── responses/        custom handlers on `res` 
│   └── services/         Passport.js and utils
├── app.js*
├── assets/               Sails.js static files directory (frontend)
│   ├── data/
│   ├── fonts/
│   ├── images/
│   ├── js/            Main backbone app lives here
│   ├── locales/       internationalization dictionaries live here
│   ├── styles/
│   ├── uploads/
│   └── users/
├── config/            Sails.js app configs
├── docs/              You are here
├── test/
│   ├── api/
│   ├── browser/
│   ├── data/
│   └── demo/
├── tools/
│   ├── env.sh*        When sourced, this will set some env vars to sane defaults
│   ├── init.sh*       Main setup script. Use `npm run init` to execute
│   ├── permtool/
│   ├── postgres/      Database schema and migration scripts live here
│   └── tagtool/
└── views/             The lone HTML view that serves as the base for the single page app
    ├── layout.ejs
    └── main/
        └── index.ejs
```