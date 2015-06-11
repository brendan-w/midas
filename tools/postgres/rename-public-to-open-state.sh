#!/bin/bash

# include main environment variables
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../env.sh

# changes any public tasks or project to open, should only need to be done once
psql -U $POSTGRESQL_USERNAME -c "update task set state='open' where state='public';" $POSTGRESQL_DATABASE
psql -U $POSTGRESQL_USERNAME -c "update project set state='open' where state='public';" $POSTGRESQL_DATABASE
