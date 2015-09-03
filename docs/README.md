
Welcome to a remix of the [Midas](https://github.com/18F/midas) project
-----------------------------------------------------------------------

Everything in this `/doc` directory is meant for developers (or adventerous folks).


The basics
----------

- Backend is Node.JS (Express with the Sails.js API Framework)
  - PostgreSQL database
  - Auth is done with Passport.js
- Frontend is a Backbone single page app
  - Files are compiled using Browserify
  - Bootstrap for styles


Repo Branches
-------------

- `devel` kept up-to-date with 18F's development branch
- `master` kept up-to-date with 18F's release branch
- `unicef-devel` This fork's development branch
- `unicef-master` This fork's release branch


The lay of the land
-------------------

The Backend:

```
.
├── api/                  Main Sails.js backend directory
│   ├── controllers/
│   ├── models/
│   ├── notifications/
│   ├── policies/         Sails.js' take on middleware
│   ├── responses/        custom handlers on `res`
│   └── services/         Passport.js and utils
├── app.js*               Entry point for the Sails.
├── assets/               Sails.js static files directory (frontend)
│   ├── data/
│   ├── fonts/
│   ├── images/
│   ├── js/            Main backbone app lives here
│   ├── locales/       internationalization dictionaries live here
│   ├── styles/
│   ├── uploads/
│   └── users/
├── config/            Sails.js server/app configs
├── docs/              You are here
├── test/              Mocha test scripts
├── tools/
│   ├── env.sh*        When sourced, this will set some env vars to sane defaults
│   ├── init.sh*       Main setup script. Use `npm run init` to execute
│   ├── permtool/      Tool for loading user permissions into the database
│   ├── postgres/      Database schema and migration scripts live here
│   └── tagtool/       Tool for loading tags into the database
└── views/             The lone HTML view that serves as the base for the single page app
    ├── layout.ejs
    └── main/
        └── index.ejs
```

The Frontend:

```
.
└── assets/
    └── js
        ├── backbone
        │   ├── apps                Each subdirectory here is a different page or component of the Backbone app
        │   │   ├── admin
        │   │   ├── application
        │   │   ├── attachment
        │   │   ├── browse
        │   │   ├── comments
        │   │   ├── events
        │   │   ├── footer
        │   │   ├── home
        │   │   ├── languages
        │   │   ├── links
        │   │   ├── login
        │   │   ├── nav
        │   │   ├── profiles
        │   │   ├── project
        │   │   ├── projectowner
        │   │   ├── register
        │   │   ├── static
        │   │   ├── tag
        │   │   ├── talent
        │   │   ├── tasks
        │   │   └── vet
        │   ├── base              Base Backbone view classes, to be inherited from, by the views above
        │   ├── components        Common views, used site-wide, such as Modals, Markdown editors, and the Tag Factory
        │   ├── config            Global config JSON
        │   ├── entities          Backbone models
        │   └── mixins            More utilities, including the global `utilities.js` file 
        └── vendor
```

The frontend begins its execution in

assets/js/backbone/app.js
assets/js/backbone/app-run.js
assets/js/backbone/apps/apps_router.js
assets/js/backbone/apps/browse/browse_app.js

`browse_app.js` is the main page switcher. From there, executaion fans out to whichever



Deviations from Midas
---------------------

The Backend is largely intact. The major differences are the addition of a user permissions table (rather than the simple `isAdmin` flag on the users table). Because of this, there are a few more Sails.js `.populate("permissions")` statements. The backend also has a few extra tables for storing links and language information. Nothing radically intensive. Most merge conflicts will occur in `api/models/User.js`, with the functions `validate_permissions`, and the Sails.js hook `beforeCreate`. 

The Frontend has seen some major changes. Whole templates and views had to be overhauled. There are a number of unused files left around from this overhaul. For instance, some of the "normal" and "edit" templates were merged into the same file (for ease, and consistency of development). In some places (where it was not intrusive), we simply commented out original midas functionality, rather than delete it entirely. Do not be surprised if you see a bunch of code that never get's used.


Terminology
-----------

- `Jobs` are referred to as `tasks` in the code. Files and paths such as `TaskController.js` and `/api/task/1` simply refer to Jobs.
- `Areas` are collections of jobs. Internally, they are called `projects`. Each `Job` can be associated to an `Area`, or be orphaned.



The Tagging System
------------------

One of the core ways Midas stores information is in "tags". These are objects with name and type strings as attributes. Almost every dropdown in Midas is simply viewing/editting tags of a certain type. All tags are stored in the `tagentity` table, are referenced by ID in other tables. The default set of tags is specified in `tools/tagtool/unicef.tags` and will be loaded into the database upon the `npm run init`

The frontend uses "select2" for rendering dropdown controls. To help connect select2 with the tagging system, you will find a series of wrapper functions in `assets/js/backbone/components/tag_factory.js`. These will help transact tags of a given type, and will setup things like auto-completion for you.

Since the same sets/options of tag dropdown are used in multiple places, there is Backbone view (`assets/js/backbone/apps/tag/show/views/tag_show_view.js`) containing some default tag instantiations.


Defaults and User Roles
-----------------------

This site has a permissions system, with settings for a few of the site's basic functions. Each row in the `permissions` table is identified by a string as a primary key. The default permissions can be found in `tools/permtool/unicef.perms`. This JS file is simply loaded using Sails upon `npm run init`. Also in the `tools/` directory, you will find the default tags in `tools/tagtool/unicef.tags`. Both of these files can be loaded into the database using their respective JS cli's in the same directories. These CLI scripts will create tags that are NOT already present in the database. It will skip existing entries, and will never delete.


Misc. things of note
-------------------

- Not all entities in the frontend have proper backbone models, so don't be suprised if you start seeing a bunch of json being transacted with jQuery ajax calls.
- There are files marked "Controllers" in the frontend. These are actually Backbone views (since Backbone doesn't have anything called controllers). See issue #40
- Some models sent from the API have extra fields added to them by the controllers. For instance, some will carry an `.isOwner` flag, for convenience.
