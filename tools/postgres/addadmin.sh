#!/bin/bash

# include main environment variables
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../env.sh

# Makes the user with the given ID an administrator
psql -U $POSTGRESQL_USERNAME -c "UPDATE \"midas_user\" SET \"isAdmin\"=TRUE WHERE \"id\"= $1;" $POSTGRESQL_DATABASE
