OpenShift Installation
======================

First, create an OpenShift account, and setup the `rhc` command line tool. Create a Node.js 0.10.0 application, and install the PostgreSQL 9.2+ cartridge. Add the git URL as a remote in your local git repo.

Set which branch you'd like OpenShift to deploy. For devel server, use the `devel` branch

```shell
rhc app-configure --deployment-branch devel
```

Then, push

```
git push openshift devel
```

#### NOTE:

If using an OpenShift free tier gear, this will fail due to the inode limit, and OpenShift's excessive copying of dependencies (node_modules). A crude way to get around this is to delete the cached modules in `~/app-root/dependencies/.npm/`, and continue the installation.

```shell
rhc ssh -a <gear_name>

$ quota -s # look up your quota usage:
$ rm -rf ~/app-root/dependencies/.npm/*
$ cd ~/app-root/repo
$ npm install # finish the installation
$ gear deploy # finish the deployment
```

Most of the environment variables are provided by OpenShift, and handled in the `pre_start_nodejs` action hook. However, there are a couple left to set: (see the `config/` README for more details))

```
# if applicable, set:
rhc env set GM_USE_IMAGEMAGICK=<true> -a <gear_name>
rhc env set SMTP_SERVICE=<email_service> -a <gear_name>
rhc env set SMTP_USERNAME=<email_username> -a <gear_name>
rhc env set SMTP_PASSWORD=<email_password> -a <gear_name>
```

Before you can start using midas, the database must be initialized:

```
rhc ssh -a <gear_name>

$ gear stop
$ postgres &
$ cd ~/app-root/repo
$ npm run migrate # installs the schema
$ npm run init    # populates with initial data
$ gear stop       # quick way to close the background postgres instance
$ gear start      # restart the app
```
