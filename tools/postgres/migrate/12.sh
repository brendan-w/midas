#!/bin/bash

# Make the Vet table
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "

--
-- Name: language; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--

CREATE TABLE language (
    \"id\" integer NOT NULL,
    \"user\" integer,
    \"language\" text,
    \"writtenProficiency\" integer,
    \"spokenProficiency\" integer,
    \"createdAt\" timestamp with time zone,
    \"updatedAt\" timestamp with time zone,
    \"deletedAt\" timestamp with time zone
);


ALTER TABLE language OWNER TO midas;

--
-- Name: language_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--

CREATE SEQUENCE language_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE language_id_seq OWNER TO midas;

--
-- Name: language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--

ALTER SEQUENCE language_id_seq OWNED BY language.id;




--
-- Name: id; Type: DEFAULT; Schema: public; Owner: midas
--

ALTER TABLE ONLY language ALTER COLUMN id SET DEFAULT nextval('language_id_seq'::regclass);

--
-- Name: language_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--

ALTER TABLE ONLY language
    ADD CONSTRAINT language_pkey PRIMARY KEY (id);

"


# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 12 WHERE schema = 'current';"
