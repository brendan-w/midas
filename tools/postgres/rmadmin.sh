#!/bin/bash

# include main environment variables
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../env.sh

# Revoke admin priviledges from the user with the given ID
psql -U $POSTGRESQL_USERNAME -c "UPDATE \"midas_user\" SET \"isAdmin\"=FALSE WHERE \"id\"= $1;" $POSTGRESQL_DATABASE
