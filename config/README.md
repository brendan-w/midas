Notes on Environment Variables
------------------------------

### Node.js

```shell
NODE_ENV = "development"
         = "production"

NODE_IP = "127.9.1.1"
        = "localhost"

NODE_PORT = 1337

# publically accessible hostname
# used in email templates for links
PUBLIC_HOSTNAME = "midas-deployment.com"
```

### PostgreSQL

```shell
POSTGRESQL_IP = "127.9.1.1"
              = "localhost"

POSTGRESQL_PORT = 5432

POSTGRESQL_DATABASE = "midas"

POSTGRESQL_USERNAME = "midas"

POSTGRESQL_PASSWORD = "midas"
```

### Other

```shell
# the NPM "gm" package defaults to using graphicsmagick,
# but openshift currently only has imageMagick installed
# see api/controllers/FileController.js
GM_USE_IMAGEMAGICK = "true"

# these are options for nodemailer:
# https://github.com/andris9/Nodemailer
SMTP_SERVICE = ""

SMTP_USERNAME = ""

SMTP_PASSWORD = ""
```
