#!/bin/bash

# Add a model column for the users permissions ID
psql -U midas -d midas -c "ALTER TABLE midas_user ADD COLUMN permissions integer;"

# Make the permissions table
psql -U midas -d midas -c "

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--

CREATE TABLE permissions (
    id integer NOT NULL,
    \"name\" text,
    \"registration_option\" boolean,
    \"admin_pages\" boolean,
    \"apply\" boolean,
    \"project_create\" boolean,
    \"task_create\" boolean,
    \"moderate\" boolean,

    \"createdAt\" timestamp with time zone,
    \"updatedAt\" timestamp with time zone,
    \"deletedAt\" timestamp with time zone
);


ALTER TABLE permissions OWNER TO midas;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--

CREATE SEQUENCE permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE permissions_id_seq OWNER TO midas;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--

ALTER SEQUENCE permissions_id_seq OWNED BY permissions.id;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: midas
--

ALTER TABLE ONLY permissions ALTER COLUMN id SET DEFAULT nextval('permissions_id_seq'::regclass);

--
-- Name: permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--

ALTER TABLE ONLY permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
"


# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 8 WHERE schema = 'current';"
