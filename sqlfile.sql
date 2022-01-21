--
-- PostgreSQL database dump
--

-- Dumped from database version 14.0
-- Dumped by pg_dump version 14.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: denis
--

CREATE TABLE public.carts (
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.carts OWNER TO denis;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: denis
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.orders OWNER TO denis;

--
-- Name: orders_users; Type: TABLE; Schema: public; Owner: denis
--

CREATE TABLE public.orders_users (
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    shipped boolean DEFAULT false NOT NULL,
    transaction_id character varying(60) NOT NULL
);


ALTER TABLE public.orders_users OWNER TO denis;

--
-- Name: orders_users_order_id_seq; Type: SEQUENCE; Schema: public; Owner: denis
--

CREATE SEQUENCE public.orders_users_order_id_seq
    AS integer
    START WITH 100
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_users_order_id_seq OWNER TO denis;

--
-- Name: orders_users_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denis
--

ALTER SEQUENCE public.orders_users_order_id_seq OWNED BY public.orders_users.order_id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: denis
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(200) NOT NULL,
    price integer NOT NULL,
    category character varying(60) NOT NULL,
    preview character varying(1000) NOT NULL
);


ALTER TABLE public.products OWNER TO denis;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: denis
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_id_seq OWNER TO denis;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denis
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.products.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: denis
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    email character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    password character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO denis;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: denis
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO denis;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denis
--

ALTER SEQUENCE public.user_id_seq OWNED BY public.users.id;


--
-- Name: orders_users order_id; Type: DEFAULT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.orders_users ALTER COLUMN order_id SET DEFAULT nextval('public.orders_users_order_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: denis
--

COPY public.carts (user_id, product_id, quantity) FROM stdin;
3	3	10
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: denis
--

COPY public.orders (id, product_id, quantity) FROM stdin;
1	3	5
2	3	1
2	1	3
3	1	4
1462	1	1
1463	1	1
1464	1	1
\.


--
-- Data for Name: orders_users; Type: TABLE DATA; Schema: public; Owner: denis
--

COPY public.orders_users (order_id, user_id, shipped, transaction_id) FROM stdin;
1	3	f	10
2	1	f	100
3	1	t	1000
1462	1	f	pi_3KHo60I6OSqfLBcY1Yle3K4q
1463	1	f	pi_3KHo6mI6OSqfLBcY1n2A3xHS
1464	1	f	pi_3KHoAiI6OSqfLBcY1N6m7Q0u
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: denis
--

COPY public.products (id, name, description, price, category, preview) FROM stdin;
3	Oil	NoDelete	90	health	https://www.drmax.cz/_i/1079867443.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2Fe%2Fc%2Fec97776e7d8f5_hyaluron_serum_a.jpg&fit=contain&w=350&h=350&format=webp
13	Noname tabs	Open it and try to survive	10	other	https://www.drmax.cz/_i/-1455556915.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2F3%2F6%2F36dc12ae92bf5_essentiale-300mg-100tob-cz-front-view.jpg&fit=contain&w=350&h=350&format=webp
1	Cream	Clear your skin	100	health	https://www.drmax.cz/_i/-1008683360.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2Fr%2Fo%2Froseliane-creme-anti-rougeurs-riche-50ml-packpdt-ld.jpg&fit=contain&w=350&h=350&format=webp
12	Vichy	New liquid	200	health	https://www.drmax.cz/_i/1468165904.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2Fv%2Fi%2Fvichy-cream-ideal-soleil-self-tanning-milk-000-3337871310714-boxed.jpg&fit=contain&w=350&h=350&format=webp
10	HomeOffice	New energy pills for your productive life	250	energy	https://www.drmax.cz/_i/-1929538347.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2Fe%2F2%2Fe2e8260f62816_3d_r_cze_biopron_9_immunity_30_1990-box-1-cze-slo.jpg&fit=contain&w=350&h=350&format=webp
15	Blue tab	Self explaining name	100	health	https://www.drmax.cz/_i/1231656576.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2Ft%2Fa%2Ftablety_24_cz-front_2.jpg&fit=contain&w=350&h=350&format=webp
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: denis
--

COPY public.users (id, first_name, last_name, email, username, is_admin, password) FROM stdin;
3	Jonny	TestNoDelete	JonnyTest@gmail.com	jTest	t	anotherSecret
2071	Froggre	Chen	kim@kim.korea	kim	f	NewPass
2	Dave	Sinclair	\tdave.sin@yahoo.com	davy000	f	treasure
3064	Will	Yangescu	replacethisemail@example.com	106482475269039facebook	f	facebookSecret
1	Joe	Barbora	joe_barbora@gmail.com	jb	t	secret
\.


--
-- Name: orders_users_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denis
--

SELECT pg_catalog.setval('public.orders_users_order_id_seq', 1464, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denis
--

SELECT pg_catalog.setval('public.product_id_seq', 2000, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denis
--

SELECT pg_catalog.setval('public.user_id_seq', 3071, true);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (user_id, product_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id, product_id);


--
-- Name: orders_users orders_users_pkey; Type: CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.orders_users
    ADD CONSTRAINT orders_users_pkey PRIMARY KEY (order_id);


--
-- Name: orders_users orders_users_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.orders_users
    ADD CONSTRAINT orders_users_transaction_id_key UNIQUE (transaction_id);


--
-- Name: products product_pkey; Type: CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: users user_pkey; Type: CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: users user_username_key; Type: CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- Name: order_id_idx; Type: INDEX; Schema: public; Owner: denis
--

CREATE INDEX order_id_idx ON public.orders USING btree (id);


--
-- Name: orders_users_order_id_user_id_idx; Type: INDEX; Schema: public; Owner: denis
--

CREATE UNIQUE INDEX orders_users_order_id_user_id_idx ON public.orders_users USING btree (order_id, user_id);


--
-- Name: products_category_idx; Type: INDEX; Schema: public; Owner: denis
--

CREATE INDEX products_category_idx ON public.products USING btree (category);


--
-- Name: users_username_password_id_is_admin_idx; Type: INDEX; Schema: public; Owner: denis
--

CREATE UNIQUE INDEX users_username_password_id_is_admin_idx ON public.users USING btree (id, username, is_admin, password);


--
-- Name: carts carts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_id_fkey FOREIGN KEY (id) REFERENCES public.orders_users(order_id) ON DELETE CASCADE;


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders_users orders_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denis
--

ALTER TABLE ONLY public.orders_users
    ADD CONSTRAINT orders_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA public TO public_role;
GRANT USAGE ON SCHEMA public TO registered_role;


--
-- Name: TABLE carts; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON TABLE public.carts TO myuser;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON TABLE public.orders TO myuser;


--
-- Name: TABLE orders_users; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON TABLE public.orders_users TO myuser;


--
-- Name: SEQUENCE orders_users_order_id_seq; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON SEQUENCE public.orders_users_order_id_seq TO myuser;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON TABLE public.products TO myuser;


--
-- Name: SEQUENCE product_id_seq; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON SEQUENCE public.product_id_seq TO myuser;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON TABLE public.users TO myuser;


--
-- Name: SEQUENCE user_id_seq; Type: ACL; Schema: public; Owner: denis
--

GRANT ALL ON SEQUENCE public.user_id_seq TO myuser;


--
-- PostgreSQL database dump complete
--

