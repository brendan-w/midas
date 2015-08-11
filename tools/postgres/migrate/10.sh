#!/bin/bash

# Add a model column for the users permissions ID
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE midas_user ADD COLUMN permissions text;"

# old administrators should stay administrators (NOTE: need double quotes around case-sensitive column names)
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE midas_user SET permissions='admin' WHERE \"isAdmin\"=TRUE;"
# non-admins become applicants by default
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE midas_user SET permissions='applicant' WHERE \"isAdmin\"=FALSE;"

# remove the isAdmin column
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE midas_user DROP COLUMN \"isAdmin\";"

# Make the permissions table
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--

CREATE TABLE permissions (
    \"name\" text NOT NULL,
    \"registration_option\" boolean,
    \"admin\" boolean,
    \"apply\" boolean,
    \"project_create\" boolean,
    \"task_create\" boolean,
    \"moderate\" boolean,
    \"vet\" boolean,

    \"createdAt\" timestamp with time zone,
    \"updatedAt\" timestamp with time zone,
    \"deletedAt\" timestamp with time zone
);


ALTER TABLE permissions OWNER TO midas;

--
-- Name: permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--

ALTER TABLE ONLY permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (name);
"


# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 10 WHERE schema = 'current';"
