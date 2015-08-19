Installation
=====

## Step by Step Installation
The following installation steps for Mac, Linux, and Windows can be used for setting up a development or production environment manually.

### Mac OSX
The instructions have been tested on 10.9.2, but earlier versions likely work.  Also, to follow these steps you will need:
* the popular [brew](http://brew.sh/) package manager
* XCode (free via Mac AppStore)

In the Terminal:

    brew install postgresql
    brew install graphicsmagick

When Homebrew is done installing Postgres, follow the instructions at the end to start Postgres.

Next, create the `midas` database:

    initdb /usr/local/var/postgresql

Once you're done installing you'll see two options:
    Success. You can now start the database server using:

    postgres -D /usr/local/var/postgresql
    or
    pg_ctl -D /usr/local/var/postgresql -l logfile start

When you run either of these commands it will start running the server. It's best to choose the first choice (postgres -D /usr/local/var/postgresql) so if you work on a different tab in your terminal the server will keep running. Next in the Terminal:

    createdb midas

Start the postgres console acting on the midas database with: `psql midas`

    CREATE USER midas WITH PASSWORD 'midas';
    GRANT ALL PRIVILEGES ON DATABASE midas to midas;
    ALTER SCHEMA public OWNER TO midas;
    \q

Install node.js. As of Feb 2015 Node.js has moved to 0.12 for its stable version. But many dependencies, especially native compiled packages, don't work with 0.12 yet. So consider running Node.js 0.10.  Consider using [nvm](https://github.com/creationix/nvm) to manage Node versions. Once installed and sourced into your environment nvm can handle manage versions. 

So back to the command line. We assume that nvm is installed and set up
(added to `.bashrc` or equivalent).
    
    nvm install 0.10
    nvm alias default 0.10
    nvm version             # should be something like v0.10.38

Then follow platform-independent steps below starting at [clone the git repository](#clone-the-git-repository).

### Linux (Ubuntu 12.04 LTS)

#### Set your system's timezone to UTC

     sudo echo "UTC" | sudo tee /etc/timezone
     sudo dpkg-reconfigure --frontend noninteractive tzdata

#### Get prerequisite packages

     sudo apt-get install -y python-software-properties python g++ make git

#### Install Postgres 9.2+ and remove any Ubuntu installed earlier version

     sudo add-apt-repository -y ppa:pitti/postgresql
     sudo apt-get update
     sudo apt-get remove postgresql
     sudo apt-get remove postgresql-9.1
     sudo apt-get remove postgresql-client-9.1
     sudo apt-get remove postgresql-doc-9.1
     sudo rm -rf /etc/postgresql/9.1
     sudo apt-get install -y --force-yes postgresql-9.2
     sudo apt-get install -y --force-yes postgresql-server-dev-9.2

After installing postgres, you may want to modify the configuration settings so that local applications can make connections to the database server.

Modify `pg_hba.conf` in `/etc/postgresql/*/main` (`-` is for lines to be removed and `+` is for lines to be added, like a diff):

     # "local" is for Unix domain socket connections only
     -local   all             all                                     peer
     +local   all             all                                     md5

For connections outside `localhost`, modify `postgresql.conf`:

     -#listen_addresses = 'localhost'
     +listen_addresses = '*'

AND modify `pg_hba.conf`:

     # IPv4 local connections:
     -host    all             all             127.0.0.1/32            md5
     +hostssl    all             all             0.0.0.0/0               md5

#### Create the database

     sudo -u postgres createdb midas
     sudo -u postgres psql -c "CREATE USER midas WITH PASSWORD 'midas';"
     sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE midas to midas;"
     sudo -u postgres psql -c "ALTER SCHEMA public OWNER TO midas;" midas

#### Install node.js

     sudo add-apt-repository -y ppa:chris-lea/node.js
     sudo apt-get update
     sudo apt-get install nodejs

#### Install GraphicsMagick

     sudo apt-get install graphicsmagick

#### Clone the git repository.

     git clone https://github.com/18F/midas.git
     cd midas

#### Install midas node packages (from the midas git folder)

Then run the normal npm package installer

     npm install

#### Optional: Edit the configuration files

It is not necessary to edit any config files to run the demo locally.  You may optionally edit the config files that you made copies of above, or the front-end configuration (from the root directory):

     cd assets/js/backbone/config
     vi tag.js
     vi login.json

`tag.js` specifies the tags that the frontend understands and stores in the backend.

`login.json` specifies the login options available on the frontend, and must have a corresponding backend component or configuration enabled (see `config/settings/auth.ex.js`).

#### Setup the database

From the root of the midas directory, initialize the database:

     npm run migrate
     npm run init
     
Please note, run `npm run init` once per database, otherwise you'll see an error. If you get an error you can skip that step.

If you'd like to include a sample project and users, also run:

     npm run demo

This also creates a handful of initial users. By default all those users are disabled, and none are admin.
It's usually helpful to have at least one admin user (we picked "Alan Barret") so these commands are
helpful:

     psql midas
     update midas_user set disabled='f';
     update midas_user set "isAdmin"='t' where username='alan@test.gov';

Note the quotes around "isAdmin". Postgres by default lowercases all non-keywords, which includes column names.
This doesn't play nicely with our schema.


Now you are ready to rock!

---------------------------------------

## For development

Run the tests (all should pass)

    npm test

Run the server

    npm start


Go to [http://localhost:1337](http://localhost:1337) to see the app

Check out the [Contributor's Guide](CONTRIBUTING.md) for next steps

#### Troubleshooting

On Mac OSX, you may receive a stream of

    Error: EMFILE, too many open files

messages after running `npm start`. This is an issue with OSX and Grunt; there are directions to fix the issue [here](https://github.com/gruntjs/grunt-contrib-copy/issues/21) or [here](http://unix.stackexchange.com/questions/108174/how-to-persist-ulimit-settings-in-osx-mavericks).

## For production

#### Compile production JS and CSS (from the midas git folder)

     npm run build

#### Initialize the database

The database needs to be populated with the tag defaults for your application's configuration.

Edit the configuration file at `test/init/init/config.js` to match your tags in `assets/js/backbone/components/tag.js`

### Start the forever server (from the midas git folder)

Install forever with from npm:

     sudo npm install -g forever

This will run the application server on port 1337

     forever start app.js --prod

You can now access the server at `http://localhost:1337`

#### Optional: install nginx

     sudo add-apt-repository -y ppa:nginx/stable
     sudo apt-get update
     sudo apt-get install nginx

Configure nginx with the files in the tools folder.  Use the SSL config file if you want to enable SSL, but be sure to set your SSL key.

     cd tools/nginx
     sudo cp sites-enabled.default /etc/nginx/sites-enabled/default
     sudo service nginx restart

With the application server running and nginx running, you should now be able to access the application at `http://localhost`

### Windows (Windows 2008 Server)

#### Install Visual C++ 2008 x64 or x86 Redistributable Package

[Runtime 64](http://www.microsoft.com/en-us/download/details.aspx?id=15336)
     or
[Runtime 32](http://www.microsoft.com/en-us/download/details.aspx?id=29)

Reboot server once finished

#### Install/Configure Postgres 9.2+ via windows msi installer

[PostgreSQL](http://www.postgresql.org/download/windows/`)

Establish admin user account during the wizard and verify that PostgreSQL is running as a service

Open pgAdmin

     Create database 'midas', user account 'midas' with password 'midas', and assign user 'midas' full rights to administer DB 'midas'

#### Install Node.js via Windows MSI, select all available add-ons
**_Note that currently Midas has a dependency on nodejs version .10+ and is not tested to work with .11 or .12, do not attempt to install a version higher than node ver .10.38_**

[Node.js](http://nodejs.org/dist/v0.10.38/)

#### Install GraphicsMagick

[GraphicsMagick](ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/windows/`)

Select Q8 version along with latest corresponding to 32 bit vs. 64 bit OS

#### Set System Path Variables

Go to Control Panel -> System -> Advanced System Settings -> Environment Variables
Find "Path" Variable in System Variables table and double click to edit it. Make sure it contains all of the following parts (in 	addition to anything else) separated by a semi-colon.

	DRIVE:\program files\graphicsmagick-1.3.18-q8;
	(or similar, depending on your graphicsmagick version)
	DRIVE:\Program Files\nodejs\;

Save.

### Host and Configure Application

#### If hosting on an on-line server

Follow instructions as above in Linux Install Guide to retrieve necessary files from GitHub.

Install NPM Modules as directed above.

#### If hosting on an off-line server

Retrieve Midas from GitHub as above on an online pc. Install NPM modules as directed. Copy to offline server your local npm_modules directory (in project home) as well as the contents of the directory found in Users/YOUR_USER_NAME/AppData/Roaming/npm to corresponding locations on offline-server.

#### Starting Midas

Navigate to Midas directory via windows cmd.exe prompt

Enter the following commands

	npm install

Start Midas with

     npm start

You can now access the server at `http://localhost:1337`


## Vagrant

You can install Midas natively on Mac, Linux or Windows, or you can use a Vagrant virtual machine for development.

Using vagrant is a quick and easy way to get a local midas instance up and running on a virtual machine. We use [Chef](http://www.getchef.com/chef/) for automated deployment, which can also be used for deploying to cloud servers.

Install:
* [Vagrant](https://www.vagrantup.com/downloads)
* [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
* [Chef Development Kit](http://downloads.getchef.com/chef-dk)

Clone the git repository:

     git clone https://github.com/18F/midas.git
     cd midas

Additonal plugins:

     vagrant plugin install vagrant-berkshelf
     vagrant plugin install vagrant-omnibus

Startup the virtual machine:

     vagrant up

If you are modifying vagrant or chef setup, then you can configure to pull from your own repo by overriding attributes in your local `chef/nodes/localhost.json` adding:
```
  "midas": {
    "git_repo": "https://github.com/myrepo/midas.git",
    "git_revision": "devel-mybranch"
  }
```

Go to [http://localhost:8080/](http://localhost:8080/) to see Midas running on your local virtual machine
