# create association join tables
psql -U $POSTGRESQL_USERNAME -c "
--
-- Name: project_tags__tagentity_projects; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--
CREATE TABLE project_tags__tagentity_projects (
    id integer NOT NULL,
    project_tags integer,
    tagentity_projects integer,
    \"deletedAt\" timestamp with time zone
);
ALTER TABLE project_tags__tagentity_projects OWNER TO midas;

--
-- Name: project_tags__tagentity_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--
CREATE SEQUENCE project_tags__tagentity_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE project_tags__tagentity_projects_id_seq OWNER TO midas;

--
-- Name: project_tags__tagentity_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--
ALTER SEQUENCE project_tags__tagentity_projects_id_seq OWNED BY project_tags__tagentity_projects.id;

--
-- Name: tagentity_tasks__task_tags; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--
CREATE TABLE tagentity_tasks__task_tags (
    id integer NOT NULL,
    tagentity_tasks integer,
    task_tags integer,
    \"deletedAt\" timestamp with time zone
);

ALTER TABLE tagentity_tasks__task_tags OWNER TO midas;

--
-- Name: tagentity_tasks__task_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--
CREATE SEQUENCE tagentity_tasks__task_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE tagentity_tasks__task_tags_id_seq OWNER TO midas;

--
-- Name: tagentity_tasks__task_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--
ALTER SEQUENCE tagentity_tasks__task_tags_id_seq OWNED BY tagentity_tasks__task_tags.id;

--
-- Name: tagentity_users__user_tags; Type: TABLE; Schema: public; Owner: midas; Tablespace:
--
CREATE TABLE tagentity_users__user_tags (
    id integer NOT NULL,
    tagentity_users integer,
    user_tags integer,
    \"deletedAt\" timestamp with time zone
);

ALTER TABLE tagentity_users__user_tags OWNER TO midas;

--
-- Name: tagentity_users__user_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: midas
--
CREATE SEQUENCE tagentity_users__user_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE tagentity_users__user_tags_id_seq OWNER TO midas;

--
-- Name: tagentity_users__user_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: midas
--
ALTER SEQUENCE tagentity_users__user_tags_id_seq OWNED BY tagentity_users__user_tags.id;

ALTER TABLE ONLY project_tags__tagentity_projects ALTER COLUMN id SET DEFAULT nextval('project_tags__tagentity_projects_id_seq'::regclass);
ALTER TABLE ONLY tagentity_tasks__task_tags ALTER COLUMN id SET DEFAULT nextval('tagentity_tasks__task_tags_id_seq'::regclass);
ALTER TABLE ONLY tagentity_users__user_tags ALTER COLUMN id SET DEFAULT nextval('tagentity_users__user_tags_id_seq'::regclass);

--
-- Name: project_tags__tagentity_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--
ALTER TABLE ONLY project_tags__tagentity_projects
    ADD CONSTRAINT project_tags__tagentity_projects_pkey PRIMARY KEY (id);

--
-- Name: tagentity_tasks__task_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--
ALTER TABLE ONLY tagentity_tasks__task_tags
    ADD CONSTRAINT tagentity_tasks__task_tags_pkey PRIMARY KEY (id);

--
-- Name: tagentity_users__user_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: midas; Tablespace:
--
ALTER TABLE ONLY tagentity_users__user_tags
    ADD CONSTRAINT tagentity_users__user_tags_pkey PRIMARY KEY (id);
"

# move data from tag table to association tables
psql -U $POSTGRESQL_USERNAME -c "INSERT INTO tagentity_users__user_tags (tagentity_users, user_tags)
SELECT \"tagId\" as tagentity_users, \"userId\" as user_tags FROM tag
WHERE \"userId\" is not null;"

psql -U $POSTGRESQL_USERNAME -c "INSERT INTO tagentity_tasks__task_tags (tagentity_tasks, task_tags)
SELECT \"tagId\" as tagentity_tasks, \"taskId\" as task_tags FROM tag
WHERE \"taskId\" is not null;"

psql -U $POSTGRESQL_USERNAME -c "INSERT INTO project_tags__tagentity_projects (tagentity_projects, project_tags)
SELECT \"tagId\" as tagentity_projects, \"projectId\" as project_tags FROM tag
WHERE \"projectId\" is not null;"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 5 WHERE schema = 'current';"
