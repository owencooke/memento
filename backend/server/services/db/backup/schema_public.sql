--
-- PostgreSQL database cluster dump
--

--
-- Name: memento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.memento (
    id bigint NOT NULL,
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    caption text,
    date date,
    location text,
    coordinates extensions.geography
);


ALTER TABLE public.memento OWNER TO postgres;

--
-- Name: COLUMN memento.location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.memento.location IS 'Human-readable location string';


--
-- Name: COLUMN memento.coordinates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.memento.coordinates IS 'PostGIS geography point for lat/long';


--
-- Name: memento_searchable_content(public.memento); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.memento_searchable_content(memento_row public.memento) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
  SELECT memento_row.caption || ' ' || COALESCE(string_agg(i.detected_text, ' '), '')
  FROM image i
  WHERE i.memento_id = memento_row.id
  GROUP BY memento_row.id;
$$;


ALTER FUNCTION public.memento_searchable_content(memento_row public.memento) OWNER TO postgres;

--
-- Name: image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image (
    id bigint NOT NULL,
    memento_id bigint NOT NULL,
    filename text NOT NULL,
    date date,
    detected_text text,
    image_label text,
    coordinates extensions.geometry,
    order_index smallint NOT NULL,
    mime_type text NOT NULL
);


ALTER TABLE public.image OWNER TO postgres;

--
-- Name: TABLE image; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.image IS 'Storage URL and metadata for a memento''s image';


--
-- Name: COLUMN image.coordinates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image.coordinates IS 'PostGIS point coordinate for lat/long';


--
-- Name: COLUMN image.order_index; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image.order_index IS 'Relative order of photos within memento (i.e. thumbnail = 0)';


--
-- Name: COLUMN image.mime_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image.mime_type IS 'Metadata for the type of file uploaded';


--
-- Name: mementos_with_images; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.mementos_with_images WITH (security_invoker='on') AS
 SELECT m.id,
    m.user_id,
    m.caption,
    m.date,
    m.location,
    m.coordinates,
    i.detected_text
   FROM (public.memento m
     LEFT JOIN public.image i ON ((m.id = i.memento_id)));


ALTER TABLE public.mementos_with_images OWNER TO postgres;

--
-- Name: memento_searchable_content(public.mementos_with_images); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.memento_searchable_content(public.mementos_with_images) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $_$
  SELECT $1.caption || ' ' || COALESCE($1.detected_text, '');
$_$;


ALTER FUNCTION public.memento_searchable_content(public.mementos_with_images) OWNER TO postgres;

--
-- Name: mementos_in_bounds(double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mementos_in_bounds(min_lat double precision, min_long double precision, max_lat double precision, max_long double precision) RETURNS TABLE(id bigint, lat double precision, long double precision)
    LANGUAGE sql
    AS $$
    select 
        id, 
        ST_Y(coordinates::geometry) as lat, 
        ST_X(coordinates::geometry) as long
    from public.memento
    where coordinates && ST_SetSRID(
        ST_MakeBox2D(
            ST_Point(min_long, min_lat), 
            ST_Point(max_long, max_lat)
        ), 
        4326
    )
$$;


ALTER FUNCTION public.mementos_in_bounds(min_lat double precision, min_long double precision, max_lat double precision, max_long double precision) OWNER TO postgres;

--
-- Name: collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collection (
    id bigint NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    title character varying NOT NULL,
    caption text,
    date date,
    coordinates extensions.geography,
    location text
);


ALTER TABLE public.collection OWNER TO postgres;

--
-- Name: TABLE collection; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.collection IS 'User Collections';


--
-- Name: COLUMN collection.date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.collection.date IS 'Date associated with Collection';


--
-- Name: COLUMN collection.coordinates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.collection.coordinates IS 'Coordinates associated with collection';


--
-- Name: COLUMN collection.location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.collection.location IS 'plaintext location for collection';


--
-- Name: collections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.collection ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.collections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: has_memento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.has_memento (
    collection_id bigint NOT NULL,
    memento_id bigint NOT NULL
);


ALTER TABLE public.has_memento OWNER TO postgres;

--
-- Name: TABLE has_memento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.has_memento IS 'Associates Mementos with Collections';


--
-- Name: image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.image ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: image_memento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.image ALTER COLUMN memento_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.image_memento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mementos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.memento ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mementos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rejected_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rejected_recommendations (
    user_id uuid NOT NULL,
    memento_ids bigint[] NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.rejected_recommendations OWNER TO postgres;

--
-- Name: rejected_recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.rejected_recommendations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rejected_recommendations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    birthday date NOT NULL
);


ALTER TABLE public.user_info OWNER TO postgres;

--
-- Name: TABLE user_info; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_info IS 'Additional user info not provided by Auth provider.';

--
-- Name: collection collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: has_memento has_memento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.has_memento
    ADD CONSTRAINT has_memento_pkey PRIMARY KEY (collection_id, memento_id);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id, memento_id);


--
-- Name: memento mementos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memento
    ADD CONSTRAINT mementos_pkey PRIMARY KEY (id);


--
-- Name: rejected_recommendations rejected_recommendations_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rejected_recommendations
    ADD CONSTRAINT rejected_recommendations_id_key UNIQUE (id);


--
-- Name: rejected_recommendations rejected_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rejected_recommendations
    ADD CONSTRAINT rejected_recommendations_pkey PRIMARY KEY (id);


--
-- Name: user_info user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_pkey PRIMARY KEY (id);

--
-- Name: memento_search_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX memento_search_idx ON public.memento USING gin (to_tsvector('english'::regconfig, public.memento_searchable_content(memento.*)));


--
-- Name: collection collection_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT collection_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: has_memento has_memento_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.has_memento
    ADD CONSTRAINT has_memento_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: has_memento has_memento_memento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.has_memento
    ADD CONSTRAINT has_memento_memento_id_fkey FOREIGN KEY (memento_id) REFERENCES public.memento(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: image image_memento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_memento_id_fkey FOREIGN KEY (memento_id) REFERENCES public.memento(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memento mementos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memento
    ADD CONSTRAINT mementos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rejected_recommendations rejected_recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rejected_recommendations
    ADD CONSTRAINT rejected_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_info user_info_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: user_info Enable users to view their own data only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable users to view their own data only" ON public.user_info FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = id));

--
-- Name: collection; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.collection ENABLE ROW LEVEL SECURITY;

--
-- Name: has_memento; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.has_memento ENABLE ROW LEVEL SECURITY;

--
-- Name: image; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.image ENABLE ROW LEVEL SECURITY;

--
-- Name: memento; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.memento ENABLE ROW LEVEL SECURITY;

--
-- Name: rejected_recommendations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.rejected_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: user_info; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE memento; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.memento TO anon;
GRANT ALL ON TABLE public.memento TO authenticated;
GRANT ALL ON TABLE public.memento TO service_role;


--
-- Name: FUNCTION memento_searchable_content(memento_row public.memento); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.memento_searchable_content(memento_row public.memento) TO anon;
GRANT ALL ON FUNCTION public.memento_searchable_content(memento_row public.memento) TO authenticated;
GRANT ALL ON FUNCTION public.memento_searchable_content(memento_row public.memento) TO service_role;


--
-- Name: TABLE image; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.image TO anon;
GRANT ALL ON TABLE public.image TO authenticated;
GRANT ALL ON TABLE public.image TO service_role;


--
-- Name: TABLE mementos_with_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.mementos_with_images TO anon;
GRANT ALL ON TABLE public.mementos_with_images TO authenticated;
GRANT ALL ON TABLE public.mementos_with_images TO service_role;


--
-- Name: FUNCTION memento_searchable_content(public.mementos_with_images); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.memento_searchable_content(public.mementos_with_images) TO anon;
GRANT ALL ON FUNCTION public.memento_searchable_content(public.mementos_with_images) TO authenticated;
GRANT ALL ON FUNCTION public.memento_searchable_content(public.mementos_with_images) TO service_role;


--
-- Name: FUNCTION mementos_in_bounds(min_lat double precision, min_long double precision, max_lat double precision, max_long double precision); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mementos_in_bounds(min_lat double precision, min_long double precision, max_lat double precision, max_long double precision) TO anon;
GRANT ALL ON FUNCTION public.mementos_in_bounds(min_lat double precision, min_long double precision, max_lat double precision, max_long double precision) TO authenticated;
GRANT ALL ON FUNCTION public.mementos_in_bounds(min_lat double precision, min_long double precision, max_lat double precision, max_long double precision) TO service_role;

--
-- Name: TABLE collection; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.collection TO anon;
GRANT ALL ON TABLE public.collection TO authenticated;
GRANT ALL ON TABLE public.collection TO service_role;


--
-- Name: SEQUENCE collections_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.collections_id_seq TO anon;
GRANT ALL ON SEQUENCE public.collections_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.collections_id_seq TO service_role;


--
-- Name: TABLE has_memento; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.has_memento TO anon;
GRANT ALL ON TABLE public.has_memento TO authenticated;
GRANT ALL ON TABLE public.has_memento TO service_role;


--
-- Name: SEQUENCE image_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.image_id_seq TO anon;
GRANT ALL ON SEQUENCE public.image_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.image_id_seq TO service_role;


--
-- Name: SEQUENCE image_memento_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.image_memento_id_seq TO anon;
GRANT ALL ON SEQUENCE public.image_memento_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.image_memento_id_seq TO service_role;


--
-- Name: SEQUENCE mementos_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.mementos_id_seq TO anon;
GRANT ALL ON SEQUENCE public.mementos_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.mementos_id_seq TO service_role;


--
-- Name: TABLE rejected_recommendations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.rejected_recommendations TO anon;
GRANT ALL ON TABLE public.rejected_recommendations TO authenticated;
GRANT ALL ON TABLE public.rejected_recommendations TO service_role;


--
-- Name: SEQUENCE rejected_recommendations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.rejected_recommendations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.rejected_recommendations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.rejected_recommendations_id_seq TO service_role;


--
-- Name: TABLE user_info; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_info TO anon;
GRANT ALL ON TABLE public.user_info TO authenticated;
GRANT ALL ON TABLE public.user_info TO service_role;