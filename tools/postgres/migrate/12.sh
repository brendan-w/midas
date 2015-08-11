#!/bin/bash

# Make the Vet table
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "

--
-- Name: link; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--

CREATE TABLE link (
    \"id\" integer NOT NULL,
    \"user\" integer,
    \"project\" integer,
    \"task\" integer,
    \"url\" text,
    \"createdAt\" timestamp with time zone,
    \"updatedAt\" timestamp with time zone,
    \"deletedAt\" timestamp with time zone
);


ALTER TABLE link OWNER TO midas;

--
-- Name: link_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--

CREATE SEQUENCE link_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE link_id_seq OWNER TO midas;

--
-- Name: link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--

ALTER SEQUENCE link_id_seq OWNED BY link.id;




--
-- Name: id; Type: DEFAULT; Schema: public; Owner: midas
--

ALTER TABLE ONLY link ALTER COLUMN id SET DEFAULT nextval('link_id_seq'::regclass);

--
-- Name: link_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--

ALTER TABLE ONLY link
    ADD CONSTRAINT link_pkey PRIMARY KEY (id);

"


# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 12 WHERE schema = 'current';"
