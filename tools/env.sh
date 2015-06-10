#!/bin/bash

# This is a helper script that provides default env variables
# for shell scripts connecting to Node or PostgreSQL

# to include main environment variables
# source $(dirname "$(realpath "$0")")/..path..to../env.sh

# Node.JS
if [ -z "$NODE_ENV"  ]; then
	NODE_ENV="development"
fi

if [ -z "$NODE_IP"   ]; then
	NODE_IP="localhost"
fi

if [ -z "$NODE_PORT" ]; then
	NODE_PORT=1337
fi


# PostgreSQL
if [ -z "$POSTGRESQL_IP"       ]; then
	POSTGRESQL_IP="localhost" 
fi

if [ -z "$POSTGRESQL_HOST"     ]; then
	POSTGRESQL_PORT=5432        
fi

if [ -z "$POSTGRESQL_DATABASE" ]; then
	POSTGRESQL_DATABASE="midas"
fi

if [ -z "$POSTGRESQL_USERNAME" ]; then
	POSTGRESQL_USERNAME="midas"
fi

if [ -z "$POSTGRESQL_PASSWORD" ]; then
	POSTGRESQL_PASSWORD="midas"
fi
