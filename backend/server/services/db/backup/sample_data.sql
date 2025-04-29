--
-- PostgreSQL database cluster dump
--

--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	4d91ce40-8b13-46d7-a5bd-e0fb0c8af174	authenticated	authenticated	test@example.com	$2a$10$dxH2xjflChFmATZL0yo96OZIn.OXyTgq1a0lgQmQSU8NlKRO2BnRO	2025-03-19 19:44:00.450731+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-03-19 19:44:00.43216+00	2025-03-19 19:44:00.451592+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3d0545c0-c581-4933-b1f8-3694326b9cd6	authenticated	authenticated	ocooke@ualberta.ca	\N	2025-03-17 20:35:16.503039+00	\N		\N		\N			\N	2025-04-10 19:59:24.616089+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "102536345302670098876", "name": "Owen Cooke", "email": "ocooke@ualberta.ca", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLrLJ34zHMVhNacQzrxxax-vrS8zRberAyIaw4-T2rq1ZN8Ntc3=s96-c", "full_name": "Owen Cooke", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLrLJ34zHMVhNacQzrxxax-vrS8zRberAyIaw4-T2rq1ZN8Ntc3=s96-c", "provider_id": "102536345302670098876", "custom_claims": {"hd": "ualberta.ca"}, "email_verified": true, "phone_verified": false}	\N	2025-03-17 20:35:16.478687+00	2025-04-10 22:56:28.324762+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f39c090a-4c38-4b49-b3b7-788712443208	authenticated	authenticated	e2e-test@example.com	$2a$10$md.9xc9qidOqmpDcTooCJOJtctvi/5jY6orTNNCCXaU7Tcvjf.0E2	2025-03-23 20:08:04.384479+00	\N		\N		\N			\N	2025-04-09 21:49:50.818206+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-03-23 20:08:04.372318+00	2025-04-10 19:53:49.895655+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8837d731-daeb-48b4-aa36-76b7bb519f59	authenticated	authenticated	owencooke15@gmail.com	\N	2025-03-19 21:17:42.294503+00	\N		\N		\N			\N	2025-04-02 19:34:32.459828+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "109956057247866864331", "name": "Owen Cooke", "email": "owencooke15@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLPcId2Rk9lpic6SRu4Nr8gFIoHnx0DTwXMnoCDdPRS2pC4KA=s96-c", "full_name": "Owen Cooke", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLPcId2Rk9lpic6SRu4Nr8gFIoHnx0DTwXMnoCDdPRS2pC4KA=s96-c", "provider_id": "109956057247866864331", "email_verified": true, "phone_verified": false}	\N	2025-03-19 21:17:42.282824+00	2025-04-02 19:34:32.466084+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	46ae04ad-0c29-46db-b321-c42a291fc582	authenticated	authenticated	llthomas@ualberta.ca	\N	2025-03-18 14:54:50.559706+00	\N		\N		\N			\N	2025-04-03 04:22:10.878696+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "111782627490135320213", "name": "Levi Thomas", "email": "llthomas@ualberta.ca", "picture": "https://lh3.googleusercontent.com/a/ACg8ocIeJzQGy5jNGV5HgCBVuXP1mjTTyY-XA1S6cvFi2LDeZGe_Yw=s96-c", "full_name": "Levi Thomas", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIeJzQGy5jNGV5HgCBVuXP1mjTTyY-XA1S6cvFi2LDeZGe_Yw=s96-c", "provider_id": "111782627490135320213", "custom_claims": {"hd": "ualberta.ca"}, "email_verified": true, "phone_verified": false}	\N	2025-03-18 14:54:50.544237+00	2025-04-09 01:46:54.84605+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7f863125-6d62-406a-99ef-d440760cdefb	authenticated	authenticated	mahmudjamal014@gmail.com	\N	2025-03-23 22:38:29.547165+00	\N		\N		\N			\N	2025-04-06 17:18:55.826545+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "104762316271209893866", "name": "Mahmud Jamal", "email": "mahmudjamal014@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocIjb8kYrPBwMXj7erY_FLHl1j3muq4a3dpuAvmh1l4Hj2XsaUc=s96-c", "full_name": "Mahmud Jamal", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIjb8kYrPBwMXj7erY_FLHl1j3muq4a3dpuAvmh1l4Hj2XsaUc=s96-c", "provider_id": "104762316271209893866", "email_verified": true, "phone_verified": false}	\N	2025-03-23 22:38:29.530998+00	2025-04-06 17:18:55.834357+00	\N	\N			\N		0	\N		\N	f	\N	f
\.

--
-- Data for Name: collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collection (id, user_id, title, caption, date, coordinates, location) FROM stdin;
41	46ae04ad-0c29-46db-b321-c42a291fc582	Collection made by Maestro	Collection made by Maestro	2025-04-03	0101000020E6100000704FA10447CD51C05B7DD00E13684740	Québec, QC, Canada
45	f39c090a-4c38-4b49-b3b7-788712443208	Bulk Created Collection	Maestro created this collection via bulk create	\N	\N	\N
49	3d0545c0-c581-4933-b1f8-3694326b9cd6	Hawaii Trip	Surfing trip with my buddies 	2024-06-12	0101000020E61000005C1C3AE275BB63C08D093197544F3540	Honolulu, HI, USA
54	3d0545c0-c581-4933-b1f8-3694326b9cd6	Birthday cards		2025-03-18	0101000020E6100000940A7437995F5CC05A73918CE6C54A40	Edmonton, AB, Canada
26	7f863125-6d62-406a-99ef-d440760cdefb	Test collection		2025-03-31	0101000020E6100000C86E79BFE4615CC02EB5CBA473C34A40	\N
\.


--
-- Data for Name: has_memento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.has_memento (collection_id, memento_id) FROM stdin;
54	84
54	85
54	153
54	167
41	144
45	151
49	161
26	68
26	112
\.


--
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.image (id, memento_id, filename, date, detected_text, image_label, coordinates, order_index, mime_type) FROM stdin;
230	161	bec73879-db20-4eff-a687-c3c4420bfbf1	\N		starfish	\N	0	image/jpeg
131	84	664f1946-5934-439a-9dc6-bf8f6634db1c	2025-03-31		envelope	\N	0	image/jpeg
169	112	540fa835-6044-4508-a450-ca9b505e85fa	2025-03-31		running_shoe	0101000000C86E79BFE4615CC02EB5CBA473C34A40	0	image/jpeg
134	85	220b4b12-aedc-42e0-9a49-6ec5ff0e4111	2025-03-31		packet	\N	1	image/jpeg
133	85	3c2141c0-c8da-4be5-a2de-7264efbc1184	2025-03-31	\N	packet	\N	0	image/jpeg
236	167	80972816-1588-4c4d-9066-76774ee5aa73	2025-04-10	y\n\nWaarsver\n\ni\n\n	packet	\N	0	image/jpeg
132	84	f6a47aa4-8e50-4d4a-a08e-9c647967a495	2025-03-31	Make a wish!	card	0101000000AD86C43D96615CC05F66C55DAAC34A40	1	image/jpeg
87	68	6232bfd4-8a0a-4819-ba6f-a33f2d168263	2025-03-28		packet	\N	0	image/jpeg
219	152	7ac0397d-529c-481f-8150-a38f695c91b0	2025-04-09	Pa\neet\n\nPts\n\n2 i = 4\n\nfe\noie 7\n\nu\n\nae rr\n: R\n\n= o\n\n=\nen a]\n\nie\n\ns\n\n| e | i an -- m4\nn if / .\nMi, = st ae\ntas 1\nan i :\n\n= ;\niter\n\nai . .\n; ' an We :\n\nSl\n\nAu\n\n[=a\n\n‘i\nDae it\n1\n\na 7 7 : 5 el . - - He\n\nJs\n\n	monitor	\N	0	image/jpeg
220	152	a1c7d4d1-48e6-4fe7-81eb-b33fb625e3b2	2025-04-03		sock	0101000000AAF1D24D628052C05E4BC8073D5B4440	1	image/jpeg
221	151	744ac26b-4d24-4cd5-889d-61edcd33f19d	2025-04-09	ae ai\n\nTe\nae\n\nei\neen\n\nBin,\n\n	monitor	\N	0	image/jpeg
209	144	bdac247c-aa80-449d-8910-9dbf1e020154	2025-04-03	\N	envelope	010100000000000000000000000000000000000000	0	image/jpeg
210	145	8a5c080c-3198-4249-b826-60334a9ac921	2025-04-03	Hello detected text surfer	\N	010100000000000000000000000000000000000000	0	image/jpeg
222	153	4d037b7e-3ffb-4b5f-b517-ff463200a198	2025-03-31		menu	010100000000000000000000000000000000000000	0	image/jpeg
\.


--
-- Data for Name: memento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.memento (id, user_id, caption, date, location, coordinates) FROM stdin;
112	7f863125-6d62-406a-99ef-d440760cdefb	Red bull car	2025-03-31	\N	0101000020E6100000C86E79BFE4615CC02EB5CBA473C34A40
144	46ae04ad-0c29-46db-b321-c42a291fc582	Hello caption surfer	2025-04-03	Edmonton, AB, Canada	0101000020E6100000940A7437995F5CC05A73918CE6C54A40
145	46ae04ad-0c29-46db-b321-c42a291fc582	Lorem	2025-04-05	Toronto, ON, Canada	0101000020E6100000CD35711786D853C0CD72D9E89CD34540
152	f39c090a-4c38-4b49-b3b7-788712443208	Single made by Maestro	2025-04-01	Edmonton, AB, Canada	0101000020E6100000940A7437995F5CC05A73918CE6C54A40
84	3d0545c0-c581-4933-b1f8-3694326b9cd6	From my grandparents	2025-03-18	St. Albert, AB, Canada	0101000020E610000071F618F645685CC0E01DCF1DB3D34A40
85	3d0545c0-c581-4933-b1f8-3694326b9cd6	From my cousin’s	2025-03-18	Edmonton, AB, Canada	0101000020E6100000940A7437995F5CC05A73918CE6C54A40
151	f39c090a-4c38-4b49-b3b7-788712443208	Edited caption	2025-04-01	Edithvale VIC, Australia	0101000020E61000006187D62F7D236240622B0DA1EF0443C0
153	3d0545c0-c581-4933-b1f8-3694326b9cd6	Make a wish!	2025-03-31	Sherwood Park, AB, Canada	0101000020E6100000A4969CC9ED525CC02250FD8348C54A40
161	3d0545c0-c581-4933-b1f8-3694326b9cd6	Some seashells I found in Hawaii	2024-06-12	Honolulu, HI, USA	0101000020E61000005C1C3AE275BB63C08D093197544F3540
167	3d0545c0-c581-4933-b1f8-3694326b9cd6		2025-04-10	Edmonton, AB, Canada	0101000020E6100000940A7437995F5CC05A73918CE6C54A40
68	7f863125-6d62-406a-99ef-d440760cdefb		2025-03-28	\N	\N
\.


--
-- Data for Name: rejected_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rejected_recommendations (user_id, memento_ids, id) FROM stdin;
46ae04ad-0c29-46db-b321-c42a291fc582	{40,83,82,75}	1
3d0545c0-c581-4933-b1f8-3694326b9cd6	{111,84,85}	9
7f863125-6d62-406a-99ef-d440760cdefb	{67,112,62}	10
46ae04ad-0c29-46db-b321-c42a291fc582	{113}	11
46ae04ad-0c29-46db-b321-c42a291fc582	{113,114}	12
46ae04ad-0c29-46db-b321-c42a291fc582	{115,117,118,119}	13
46ae04ad-0c29-46db-b321-c42a291fc582	{122,123,124,125}	14
f39c090a-4c38-4b49-b3b7-788712443208	{}	15
46ae04ad-0c29-46db-b321-c42a291fc582	{123,128}	16
f39c090a-4c38-4b49-b3b7-788712443208	{129}	17
46ae04ad-0c29-46db-b321-c42a291fc582	{123,128,130}	18
f39c090a-4c38-4b49-b3b7-788712443208	{129,131}	19
f39c090a-4c38-4b49-b3b7-788712443208	{132}	20
f39c090a-4c38-4b49-b3b7-788712443208	{132,133}	21
f39c090a-4c38-4b49-b3b7-788712443208	{132,133,134,135}	22
f39c090a-4c38-4b49-b3b7-788712443208	{132,133,136,137}	23
f39c090a-4c38-4b49-b3b7-788712443208	{133,136,137,138}	24
46ae04ad-0c29-46db-b321-c42a291fc582	{144,145,123}	25
f39c090a-4c38-4b49-b3b7-788712443208	{142,143,146}	26
f39c090a-4c38-4b49-b3b7-788712443208	{143,146,147,148}	27
f39c090a-4c38-4b49-b3b7-788712443208	{142,143,148,149}	28
f39c090a-4c38-4b49-b3b7-788712443208	{150,151,152}	29
3d0545c0-c581-4933-b1f8-3694326b9cd6	{111,84,85,153}	30
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,154}	31
3d0545c0-c581-4933-b1f8-3694326b9cd6	{85,153,155}	32
3d0545c0-c581-4933-b1f8-3694326b9cd6	{85,153,156}	33
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,157}	34
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,158}	35
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,159}	36
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,160}	37
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,161}	38
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,162}	39
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,163}	40
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,164}	41
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,165}	42
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,166}	43
3d0545c0-c581-4933-b1f8-3694326b9cd6	{84,85,153,167}	44
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_info (id, birthday) FROM stdin;
7f863125-6d62-406a-99ef-d440760cdefb	2002-10-11
3d0545c0-c581-4933-b1f8-3694326b9cd6	2025-04-01
46ae04ad-0c29-46db-b321-c42a291fc582	2025-04-01
f39c090a-4c38-4b49-b3b7-788712443208	2025-04-08
\.

