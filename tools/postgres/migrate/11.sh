#!/bin/bash

# Make the Vet table
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "

--
-- Name: vet; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--

CREATE TABLE vet (
    \"id\" integer NOT NULL,
    \"user\" integer,
    \"project\" integer,
    \"state\" text,
    \"createdAt\" timestamp with time zone,
    \"updatedAt\" timestamp with time zone,
    \"deletedAt\" timestamp with time zone
);


ALTER TABLE vet OWNER TO midas;

--
-- Name: vet_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--

CREATE SEQUENCE vet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE vet_id_seq OWNER TO midas;

--
-- Name: vet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--

ALTER SEQUENCE vet_id_seq OWNED BY vet.id;




--
-- Name: id; Type: DEFAULT; Schema: public; Owner: midas
--

ALTER TABLE ONLY vet ALTER COLUMN id SET DEFAULT nextval('vet_id_seq'::regclass);

--
-- Name: vet_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--

ALTER TABLE ONLY vet
    ADD CONSTRAINT vet_pkey PRIMARY KEY (id);

"


# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 11 WHERE schema = 'current';"
