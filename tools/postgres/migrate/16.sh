#!/bin/bash

psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE attachment ADD COLUMN \"applicationId\" integer"

# Make the Vet table
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "

--
-- Name: application; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--

CREATE TABLE application (
    \"id\" integer NOT NULL,
    \"state\" text,
    \"user\" integer,
    \"task\" integer,
    \"rate\" money,
    \"createdAt\" timestamp with time zone,
    \"updatedAt\" timestamp with time zone,
    \"deletedAt\" timestamp with time zone
);


ALTER TABLE application OWNER TO midas;

--
-- Name: application_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--

CREATE SEQUENCE application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE application_id_seq OWNER TO midas;

--
-- Name: application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--

ALTER SEQUENCE application_id_seq OWNED BY application.id;




--
-- Name: id; Type: DEFAULT; Schema: public; Owner: midas
--

ALTER TABLE ONLY application ALTER COLUMN id SET DEFAULT nextval('application_id_seq'::regclass);

--
-- Name: application_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--

ALTER TABLE ONLY application
    ADD CONSTRAINT application_pkey PRIMARY KEY (id);

"


# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 16 WHERE schema = 'current';"
