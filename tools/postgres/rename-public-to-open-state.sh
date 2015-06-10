#!/bin/bash

# include main environment variables
source $(dirname "$(realpath "$0")")/../env.sh

# changes any public tasks or project to open, should only need to be done once
psql -U $POSTGRESQL_USERNAME -c "update task set state='open' where state='public';" $POSTGRESQL_DATABASE
psql -U $POSTGRESQL_USERNAME -c "update project set state='open' where state='public';" $POSTGRESQL_DATABASE
