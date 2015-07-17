#!/bin/bash

# Add new passport table and relations
psql -U midas -d midas -c "CREATE TABLE passport (
    protocol text,
    password text,
    \"accessToken\" text,
    provider text,
    identifier text,
    tokens json,
    \"user\" integer,
    id integer NOT NULL,
    \"createdAt\" timestamp with time zone,
    \"updatedAt\" timestamp with time zone,
    \"deletedAt\" timestamp with time zone
);

ALTER TABLE passport OWNER TO midas;

CREATE SEQUENCE passport_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE passport_id_seq OWNER TO midas;

ALTER SEQUENCE passport_id_seq OWNED BY passport.id;

ALTER TABLE ONLY passport ALTER COLUMN id SET DEFAULT nextval('passport_id_seq'::regclass);

ALTER TABLE ONLY midas_user
    ADD CONSTRAINT midas_user_username_key UNIQUE (username);

ALTER TABLE ONLY passport
    ADD CONSTRAINT passport_pkey PRIMARY KEY (id);"

# Migrate local users
psql -U midas -d midas -c "INSERT INTO passport (protocol, password, \"user\", \"createdAt\", \"updatedAt\", \"deletedAt\")
SELECT
  'local',
  \"password\",
  \"userId\",
  \"createdAt\",
  \"updatedAt\",
  \"deletedAt\"
FROM userpassword
WHERE \"userId\" is not null;"

# Migrate oauth users
psql -U midas -d midas -c "INSERT INTO passport (protocol, provider, identifier, tokens, \"user\", \"createdAt\", \"updatedAt\", \"deletedAt\")
SELECT
  'oauth2',
  \"provider\",
  \"providerId\",
  (select row_to_json(tokens) from (select \"accessToken\", \"refreshToken\") as tokens),
  \"userId\",
  \"createdAt\",
  \"updatedAt\",
  \"deletedAt\"
FROM userauth
WHERE \"userId\" is not null;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 8 WHERE schema = 'current';"
