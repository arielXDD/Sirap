--
-- PostgreSQL database dump
--

\restrict cslhVGUrADywnx57lLez5fJlkvx6Cc5cRQh0pcRhRX9blh40hZiwXWSKdsmMLy6

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: asistencias_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.asistencias_estado_enum AS ENUM (
    'puntual',
    'retardo',
    'falta',
    'justificada'
);


ALTER TYPE public.asistencias_estado_enum OWNER TO postgres;

--
-- Name: asistencias_tiporegistro_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.asistencias_tiporegistro_enum AS ENUM (
    'normal',
    'manual'
);


ALTER TYPE public.asistencias_tiporegistro_enum OWNER TO postgres;

--
-- Name: dias_festivos_tipo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.dias_festivos_tipo_enum AS ENUM (
    'no_laborable',
    'laborable_especial'
);


ALTER TYPE public.dias_festivos_tipo_enum OWNER TO postgres;

--
-- Name: empleados_estatus_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.empleados_estatus_enum AS ENUM (
    'activo',
    'inactivo',
    'suspendido'
);


ALTER TYPE public.empleados_estatus_enum OWNER TO postgres;

--
-- Name: horarios_diasemana_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.horarios_diasemana_enum AS ENUM (
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo'
);


ALTER TYPE public.horarios_diasemana_enum OWNER TO postgres;

--
-- Name: permisos_tipo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.permisos_tipo_enum AS ENUM (
    'medico',
    'personal',
    'familiar',
    'otro'
);


ALTER TYPE public.permisos_tipo_enum OWNER TO postgres;

--
-- Name: usuarios_rol_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.usuarios_rol_enum AS ENUM (
    'administrador',
    'supervisor',
    'empleado'
);


ALTER TYPE public.usuarios_rol_enum OWNER TO postgres;

--
-- Name: vacaciones_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vacaciones_estado_enum AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada'
);


ALTER TYPE public.vacaciones_estado_enum OWNER TO postgres;

--
-- Name: vacaciones_tipo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vacaciones_tipo_enum AS ENUM (
    'vacaciones',
    'quinquenio',
    'personal',
    'permiso_especial',
    'salud',
    'otro'
);


ALTER TYPE public.vacaciones_tipo_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asistencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencias (
    id integer NOT NULL,
    "empleadoId" integer NOT NULL,
    fecha date NOT NULL,
    "horaEntrada" time without time zone,
    "horaSalida" time without time zone,
    "tipoRegistro" public.asistencias_tiporegistro_enum DEFAULT 'normal'::public.asistencias_tiporegistro_enum NOT NULL,
    estado public.asistencias_estado_enum DEFAULT 'puntual'::public.asistencias_estado_enum NOT NULL,
    "minutosRetardo" integer,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    observaciones text,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.asistencias OWNER TO postgres;

--
-- Name: COLUMN asistencias."tipoRegistro"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asistencias."tipoRegistro" IS 'Normal = NFC, Manual = registrado por admin';


--
-- Name: COLUMN asistencias."minutosRetardo"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asistencias."minutosRetardo" IS 'Minutos de retardo';


--
-- Name: asistencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asistencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asistencias_id_seq OWNER TO postgres;

--
-- Name: asistencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asistencias_id_seq OWNED BY public.asistencias.id;


--
-- Name: backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backups (
    id integer NOT NULL,
    "nombreArchivo" character varying(255) NOT NULL,
    ruta character varying(255) NOT NULL,
    tamano bigint NOT NULL,
    "usuarioId" integer NOT NULL,
    comentario text,
    "fechaCreacion" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.backups OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backups_id_seq OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backups_id_seq OWNED BY public.backups.id;


--
-- Name: bitacora; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bitacora (
    id integer NOT NULL,
    "usuarioId" integer,
    accion character varying(100) NOT NULL,
    "tablaAfectada" character varying(100) NOT NULL,
    "registroId" integer,
    "datosAnteriores" json,
    "datosNuevos" json,
    motivo text,
    "ipAddress" character varying(45),
    "fechaHora" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bitacora OWNER TO postgres;

--
-- Name: bitacora_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bitacora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bitacora_id_seq OWNER TO postgres;

--
-- Name: bitacora_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bitacora_id_seq OWNED BY public.bitacora.id;


--
-- Name: dias_festivos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dias_festivos (
    id integer NOT NULL,
    fecha date NOT NULL,
    descripcion character varying(200) NOT NULL,
    tipo public.dias_festivos_tipo_enum DEFAULT 'no_laborable'::public.dias_festivos_tipo_enum NOT NULL,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dias_festivos OWNER TO postgres;

--
-- Name: dias_festivos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dias_festivos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dias_festivos_id_seq OWNER TO postgres;

--
-- Name: dias_festivos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dias_festivos_id_seq OWNED BY public.dias_festivos.id;


--
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id integer NOT NULL,
    "numeroEmpleado" character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    puesto character varying(100) NOT NULL,
    area character varying(100) NOT NULL,
    "fechaIngreso" date NOT NULL,
    estatus public.empleados_estatus_enum DEFAULT 'activo'::public.empleados_estatus_enum NOT NULL,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    email character varying(100),
    telefono character varying(20),
    "fotoUrl" character varying
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- Name: empleados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empleados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empleados_id_seq OWNER TO postgres;

--
-- Name: empleados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empleados_id_seq OWNED BY public.empleados.id;


--
-- Name: horarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horarios (
    id integer NOT NULL,
    "empleadoId" integer NOT NULL,
    "diaSemana" public.horarios_diasemana_enum NOT NULL,
    "horaEntrada" time without time zone NOT NULL,
    "horaSalida" time without time zone NOT NULL,
    "toleranciaMinutos" integer DEFAULT 10 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "fechaInicio" date,
    "fechaFin" date,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.horarios OWNER TO postgres;

--
-- Name: COLUMN horarios."toleranciaMinutos"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios."toleranciaMinutos" IS 'Tolerancia en minutos para retardos';


--
-- Name: COLUMN horarios."fechaInicio"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios."fechaInicio" IS 'Inicio de horario temporal';


--
-- Name: COLUMN horarios."fechaFin"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios."fechaFin" IS 'Fin de horario temporal';


--
-- Name: horarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horarios_id_seq OWNER TO postgres;

--
-- Name: horarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_id_seq OWNED BY public.horarios.id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    "tokenHash" character varying NOT NULL,
    "usuarioId" integer NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_id_seq OWNER TO postgres;

--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id integer NOT NULL,
    "empleadoId" integer NOT NULL,
    "fechaInicio" date NOT NULL,
    "fechaFin" date NOT NULL,
    tipo public.permisos_tipo_enum NOT NULL,
    motivo text NOT NULL,
    autorizado boolean DEFAULT false NOT NULL,
    "autorizadoPor" integer,
    observaciones text,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permisos_id_seq OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_id_seq OWNED BY public.permisos.id;


--
-- Name: tarjetas_nfc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarjetas_nfc (
    id integer NOT NULL,
    "codigoNfc" character varying(100) NOT NULL,
    "empleadoId" integer NOT NULL,
    "fechaAsignacion" date NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    "motivoBaja" text,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tarjetas_nfc OWNER TO postgres;

--
-- Name: COLUMN tarjetas_nfc."codigoNfc"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tarjetas_nfc."codigoNfc" IS 'Código UID de la tarjeta NFC';


--
-- Name: tarjetas_nfc_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tarjetas_nfc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarjetas_nfc_id_seq OWNER TO postgres;

--
-- Name: tarjetas_nfc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tarjetas_nfc_id_seq OWNED BY public.tarjetas_nfc.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    rol public.usuarios_rol_enum DEFAULT 'empleado'::public.usuarios_rol_enum NOT NULL,
    "empleadoId" integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "passwordHash" character varying NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: vacaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacaciones (
    id integer NOT NULL,
    "empleadoId" integer NOT NULL,
    "fechaInicio" date NOT NULL,
    "fechaFin" date NOT NULL,
    "diasSolicitados" integer NOT NULL,
    estado public.vacaciones_estado_enum DEFAULT 'pendiente'::public.vacaciones_estado_enum NOT NULL,
    observaciones text,
    "creadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL,
    tipo public.vacaciones_tipo_enum DEFAULT 'vacaciones'::public.vacaciones_tipo_enum NOT NULL
);


ALTER TABLE public.vacaciones OWNER TO postgres;

--
-- Name: COLUMN vacaciones."diasSolicitados"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vacaciones."diasSolicitados" IS 'Días de vacaciones solicitados';


--
-- Name: vacaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vacaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vacaciones_id_seq OWNER TO postgres;

--
-- Name: vacaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vacaciones_id_seq OWNED BY public.vacaciones.id;


--
-- Name: asistencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias ALTER COLUMN id SET DEFAULT nextval('public.asistencias_id_seq'::regclass);


--
-- Name: backups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups ALTER COLUMN id SET DEFAULT nextval('public.backups_id_seq'::regclass);


--
-- Name: bitacora id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora ALTER COLUMN id SET DEFAULT nextval('public.bitacora_id_seq'::regclass);


--
-- Name: dias_festivos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dias_festivos ALTER COLUMN id SET DEFAULT nextval('public.dias_festivos_id_seq'::regclass);


--
-- Name: empleados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.empleados_id_seq'::regclass);


--
-- Name: horarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios ALTER COLUMN id SET DEFAULT nextval('public.horarios_id_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: permisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id SET DEFAULT nextval('public.permisos_id_seq'::regclass);


--
-- Name: tarjetas_nfc id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_nfc ALTER COLUMN id SET DEFAULT nextval('public.tarjetas_nfc_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: vacaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacaciones ALTER COLUMN id SET DEFAULT nextval('public.vacaciones_id_seq'::regclass);


--
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias (id, "empleadoId", fecha, "horaEntrada", "horaSalida", "tipoRegistro", estado, "minutosRetardo", "creadoEn", observaciones, "actualizadoEn") FROM stdin;
1	2	2026-02-20	07:58:00	17:05:00	normal	puntual	\N	2026-02-21 00:45:54.359215	\N	2026-02-21 01:05:41.059539
2	3	2026-02-20	08:12:00	17:00:00	normal	retardo	\N	2026-02-21 00:45:54.359215	\N	2026-02-21 01:05:41.059539
3	4	2026-02-20	08:00:00	17:00:00	normal	puntual	\N	2026-02-21 00:45:54.359215	\N	2026-02-21 01:05:41.059539
4	5	2026-02-20	\N	\N	manual	falta	\N	2026-02-21 05:00:00.17782	Falta generada automáticamente	2026-02-21 05:00:00.17782
5	3	2026-03-02	23:31:49	23:32:02	normal	retardo	931	2026-03-03 05:31:49.110931	\N	2026-03-03 05:32:02.560708
6	1	2026-03-02	23:33:41	23:36:28	normal	puntual	\N	2026-03-03 05:33:41.637638	\N	2026-03-03 05:36:28.755304
7	5	2026-03-02	23:55:10	00:01:30	normal	retardo	2	2026-03-03 05:55:10.351523	\N	2026-03-03 06:01:30.447039
8	3	2026-03-03	19:47:14	\N	normal	retardo	707	2026-03-04 01:47:14.706935	\N	2026-03-04 01:47:14.706935
9	1	2026-03-04	23:53:00	\N	normal	puntual	\N	2026-03-05 05:53:00.259485	\N	2026-03-05 05:53:00.259485
10	2	2026-03-04	02:29:14	02:29:22	normal	puntual	0	2026-03-05 08:29:14.83362	\N	2026-03-05 08:29:22.509025
11	4	2026-03-04	02:34:08	02:34:08	normal	puntual	0	2026-03-05 08:34:08.349586	\N	2026-03-05 08:34:08.413998
14	4	2026-03-05	19:15:09	19:15:55	normal	retardo	675	2026-03-06 01:15:09.797378	\N	2026-03-06 01:15:55.822513
13	2	2026-03-05	19:11:14	19:46:47	normal	retardo	671	2026-03-06 01:11:14.122843	\N	2026-03-06 01:46:47.399194
12	2	2026-03-05	19:11:14	19:45:52	manual	justificada	671	2026-03-06 01:11:14.120872		2026-03-06 17:55:04.41228
15	4	2026-03-05	19:15:09	19:38:38	manual	falta	675	2026-03-06 01:15:09.80026		2026-03-06 17:56:21.673525
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backups (id, "nombreArchivo", ruta, tamano, "usuarioId", comentario, "fechaCreacion") FROM stdin;
3	backup_2026-03-05T23-56-25-491Z.sql	C:\\Users\\Ariel\\Documents\\srap\\backend\\backups\\backup_2026-03-05T23-56-25-491Z.sql	32653	6		2026-03-05 23:56:25.809662
4	backup_2026-03-06T01-28-56-114Z.sql	C:\\Users\\Ariel\\Documents\\srap\\backend\\backups\\backup_2026-03-06T01-28-56-114Z.sql	35554	6		2026-03-06 01:28:56.385184
\.


--
-- Data for Name: bitacora; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bitacora (id, "usuarioId", accion, "tablaAfectada", "registroId", "datosAnteriores", "datosNuevos", motivo, "ipAddress", "fechaHora") FROM stdin;
1	6	POST	backups	1	\N	{"comentario":""}	Cambio realizado desde el sistema	127.0.0.1	2026-03-05 23:48:24.993203
2	6	POST	backups	2	\N	{"comentario":""}	Cambio realizado desde el sistema	127.0.0.1	2026-03-05 23:49:00.338773
3	6	DELETE	backups	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-05 23:49:03.496024
4	6	DELETE	backups	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-05 23:56:24.203315
5	6	POST	backups	3	\N	{"comentario":""}	Cambio realizado desde el sistema	127.0.0.1	2026-03-05 23:56:25.816572
7	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:11:14.150194
6	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:11:14.148526
8	6	PATCH	tarjetas-nfc	4	\N	{"codigoNfc":"4"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:12:33.741868
9	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:14:53.313212
10	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:14:53.315188
11	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:15:01.124594
12	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:15:01.229843
13	\N	POST	nfc	\N	\N	{"codigoNfc":"D3A09E13"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:15:09.813842
14	\N	POST	nfc	\N	\N	{"codigoNfc":"D3A09E13"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:15:09.819645
15	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:15:47.666375
16	6	PATCH	tarjetas-nfc	4	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:15:50.814024
17	\N	POST	nfc	\N	\N	{"codigoNfc":"D3A09E13"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:15:55.83198
18	6	PATCH	tarjetas-nfc	2	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:16:08.042946
19	6	PATCH	tarjetas-nfc	4	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:16:09.123157
20	6	PATCH	tarjetas-nfc	4	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:16:09.839082
21	8	POST	vacaciones	8	\N	{"fechaInicio":"2026-03-05","fechaFin":"2026-03-06","diasSolicitados":1,"observaciones":"Semanda santa","empleadoId":3}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:19:52.762251
22	6	PATCH	vacaciones	8	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:20:19.262313
23	6	POST	backups	4	\N	{"comentario":""}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:28:56.391313
24	6	PATCH	usuarios	\N	\N	{"password":"12345"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:30:32.521354
25	6	PATCH	usuarios	\N	\N	{"password":"123456"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:32:22.780008
26	\N	POST	nfc	\N	\N	{"codigoNfc":"D3A09E13"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:38:38.109214
27	\N	POST	nfc	\N	\N	{"codigoNfc":"D3A09E13"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:38:38.111072
28	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:45:52.515089
29	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:45:52.518673
30	\N	POST	nfc	\N	\N	{"codigoNfc":"415416"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:46:21.685738
31	\N	POST	nfc	\N	\N	{"codigoNfc":"4154165"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:46:21.736545
32	\N	POST	nfc	\N	\N	{"codigoNfc":"41541656"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:46:21.805764
33	\N	POST	nfc	\N	\N	{"codigoNfc":"415416565"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:46:21.830197
34	\N	POST	nfc	\N	\N	{"codigoNfc":"4154165651"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 01:46:21.841589
35	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:46:47.403255
36	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:46:47.407197
37	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:46:51.451124
38	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:46:51.45285
39	\N	POST	nfc	\N	\N	{"codigoNfc":"D3A09E13"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:46:55.531156
40	\N	POST	nfc	\N	\N	{"codigoNfc":"D3A09E13"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:46:55.538721
41	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:00.447545
42	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:47:00.449535
43	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:47:12.586694
44	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:12.681059
45	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:39.001804
46	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:47:39.009403
47	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:40.57888
48	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:43.260366
49	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:47:43.261921
50	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:44.674109
51	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:49.506842
52	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:47:49.511405
53	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:54.419577
54	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:47:54.421392
55	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:56.187787
56	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.25	2026-03-06 01:47:59.944841
57	\N	POST	nfc	\N	\N	{"codigoNfc":"13152E02"}	Cambio realizado desde el sistema	10.251.228.21	2026-03-06 01:47:59.950814
63	6	PATCH	asistencias	12	\N	{"horaEntrada":"19:11:14","horaSalida":"19:45:52","estado":"justificada","observaciones":""}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 17:55:04.433253
64	6	PATCH	asistencias	15	\N	{"horaEntrada":"19:15:09","horaSalida":"19:38:38","estado":"falta","observaciones":""}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 17:56:21.679227
65	6	PATCH	horarios	1	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.484176
66	6	POST	horarios	23	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.553671
67	6	POST	horarios	24	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.568297
68	6	POST	horarios	25	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.581147
69	6	POST	horarios	26	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.59405
70	6	POST	horarios	27	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.607677
71	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.624208
72	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.642373
73	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.658407
74	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:16:02.67521
75	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:14.879592
76	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:14.952499
77	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:14.970202
78	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:14.988663
79	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.748946
80	6	PATCH	horarios	1	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.820786
81	6	POST	horarios	28	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"18:00","horaSalida":"22:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.83742
82	6	POST	horarios	29	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"23:00","horaSalida":"23:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.849387
83	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.866276
84	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.888735
85	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.903783
86	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:41.919183
87	6	PATCH	horarios	1	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:55.369888
88	6	POST	horarios	30	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"18:00","horaSalida":"22:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:55.43643
89	6	POST	horarios	31	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"23:00","horaSalida":"23:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:55.450576
90	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:55.467596
91	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:55.482947
92	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:55.501193
93	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:20:55.518774
94	6	PATCH	horarios	1	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:21:17.355867
95	6	POST	horarios	32	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"18:00","horaSalida":"22:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:21:17.417038
96	6	POST	horarios	33	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"23:00","horaSalida":"12:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:21:17.429268
97	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:21:17.447387
98	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:21:17.463227
99	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:21:17.478106
100	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:21:17.492487
101	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:09.183901
102	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:09.2559
103	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:21.944639
104	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.125039
105	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.144739
106	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.164796
107	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.184462
108	6	POST	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"13:00","horaSalida":"17:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.199817
109	6	POST	horarios	35	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"18:00","horaSalida":"22:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.213887
110	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.23411
111	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.251914
112	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.26875
113	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:22.286497
114	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"13:00:00","horaSalida":"17:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:34.956595
115	6	PATCH	horarios	35	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"18:00:00","horaSalida":"22:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:35.023045
116	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:35.044505
117	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:35.063302
118	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:35.08316
119	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:24:35.101057
120	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"01:00","horaSalida":"05:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.593805
121	6	PATCH	horarios	35	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"18:00:00","horaSalida":"22:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.663914
122	6	POST	horarios	36	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"23:00","horaSalida":"12:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.677243
123	6	POST	horarios	37	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"13:00","horaSalida":"17:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.689962
124	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.707133
125	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.723551
126	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.738285
127	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:25:15.753691
128	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.153328
129	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.330483
130	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"01:00:00","horaSalida":"05:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.36218
131	6	PATCH	horarios	37	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"13:00:00","horaSalida":"17:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.389271
132	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.413873
133	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.43492
134	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.455623
135	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:08.475378
136	6	DELETE	horarios	\N	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:17.926531
137	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"01:00:00","horaSalida":"05:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:17.950032
138	6	POST	horarios	38	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"06:00","horaSalida":"10:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:17.967871
139	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:17.986735
141	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:18.028057
140	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:18.005453
142	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:18.048098
143	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"01:00:00","horaSalida":"05:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:36.934918
144	6	PATCH	horarios	38	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"06:00:00","horaSalida":"10:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:37.003514
145	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:37.021521
146	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:37.041496
147	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:37.061834
148	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:37.081511
149	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"01:00:00","horaSalida":"05:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:42.962686
150	6	PATCH	horarios	38	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"06:00:00","horaSalida":"10:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:42.982883
151	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:43.002645
152	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:43.02077
153	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:43.036221
154	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:47:43.053881
155	6	POST	empleados	1	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:55:36.258384
156	6	POST	empleados	1	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:55:45.703668
157	6	POST	empleados	1	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:55:49.702513
158	6	POST	empleados	1	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:55:53.845817
159	6	POST	empleados	1	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 18:55:57.034548
160	6	POST	empleados	1	\N	\N	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:02:09.508595
161	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"01:00:00","horaSalida":"05:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:04:15.233765
162	6	PATCH	horarios	38	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"06:00:00","horaSalida":"10:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:04:15.307272
163	6	POST	horarios	39	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"11:00","horaSalida":"15:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:04:15.323902
164	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:04:15.343618
165	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:04:15.363645
166	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:04:15.382822
167	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:04:15.402407
168	6	POST	horarios	40	\N	{"empleadoId":1,"diaSemana":"lunes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:32:15.39856
169	6	POST	dias-festivos	1	\N	{"fecha":"2026-12-25","descripcion":"Navidad","tipo":"no_laborable"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-06 19:35:29.506564
170	6	PATCH	empleados	2	\N	{"id":2,"numeroEmpleado":"EMP-002","nombre":"Juan","apellidos":"Pérez","email":"ariel.xd.guevara.15@gmail.com","telefono":null,"fotoUrl":null,"puesto":"Operario","area":"Almacén","fechaIngreso":"2025-01-02","estatus":"activo","creadoEn":"2026-02-21T06:45:54.359Z","actualizadoEn":"2026-02-21T06:45:54.359Z","tarjetaNfc":{"id":4,"codigoNfc":"13152E02","empleadoId":2,"fechaAsignacion":"2026-03-05","activa":true,"motivoBaja":null,"creadoEn":"2026-03-05T14:29:07.236Z","actualizadoEn":"2026-03-06T07:16:09.834Z"},"usuario":{"id":7,"username":"juan","rol":"empleado","empleadoId":2,"activo":true,"creadoEn":"2026-02-21T07:05:50.500Z","actualizadoEn":"2026-02-21T07:05:50.500Z"}}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:04:42.081222
171	6	PATCH	horarios	34	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"01:00:00","horaSalida":"05:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:47.829742
172	6	PATCH	horarios	38	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"06:00:00","horaSalida":"10:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:48.0021
173	6	PATCH	horarios	39	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"11:00:00","horaSalida":"15:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:48.024968
174	6	POST	horarios	41	\N	{"empleadoId":2,"diaSemana":"lunes","horaEntrada":"16:00","horaSalida":"20:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:48.043411
175	6	PATCH	horarios	5	\N	{"empleadoId":2,"diaSemana":"martes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:48.063597
177	6	PATCH	horarios	13	\N	{"empleadoId":2,"diaSemana":"jueves","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:48.104088
176	6	PATCH	horarios	9	\N	{"empleadoId":2,"diaSemana":"miercoles","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:48.085792
178	6	PATCH	horarios	17	\N	{"empleadoId":2,"diaSemana":"viernes","horaEntrada":"08:00:00","horaSalida":"17:00:00","toleranciaMinutos":10,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-13 07:27:48.122522
179	6	PATCH	horarios	40	\N	{"empleadoId":1,"diaSemana":"lunes","horaEntrada":"09:00:00","horaSalida":"18:00:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:16:36.642828
180	6	POST	horarios	42	\N	{"empleadoId":1,"diaSemana":"martes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:16:36.71959
181	6	POST	horarios	43	\N	{"empleadoId":1,"diaSemana":"miercoles","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:16:36.73367
182	6	POST	horarios	44	\N	{"empleadoId":1,"diaSemana":"jueves","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:16:36.747992
183	6	POST	horarios	45	\N	{"empleadoId":1,"diaSemana":"viernes","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:16:36.762465
184	6	POST	horarios	46	\N	{"empleadoId":1,"diaSemana":"sabado","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:16:36.778314
185	6	POST	horarios	47	\N	{"empleadoId":1,"diaSemana":"domingo","horaEntrada":"09:00","horaSalida":"18:00","toleranciaMinutos":15,"activo":true}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:16:36.79149
186	6	POST	dias-festivos	2	\N	{"fecha":"2026-04-02","descripcion":"Suspención","tipo":"no_laborable"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:18:03.165977
187	6	POST	dias-festivos	3	\N	{"fecha":"2026-03-16","descripcion":"q","tipo":"laborable_especial"}	Cambio realizado desde el sistema	127.0.0.1	2026-03-17 00:18:13.609884
\.


--
-- Data for Name: dias_festivos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dias_festivos (id, fecha, descripcion, tipo, "creadoEn", "actualizadoEn") FROM stdin;
1	2026-12-25	Navidad	no_laborable	2026-03-06 19:35:29.49676	2026-03-06 19:35:29.49676
2	2026-04-02	Suspención	no_laborable	2026-03-17 00:18:03.155599	2026-03-17 00:18:03.155599
3	2026-03-16	q	laborable_especial	2026-03-17 00:18:13.603781	2026-03-17 00:18:13.603781
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (id, "numeroEmpleado", nombre, apellidos, puesto, area, "fechaIngreso", estatus, "creadoEn", "actualizadoEn", email, telefono, "fotoUrl") FROM stdin;
3	EMP-003	Ana	López	Ventas	Comercial	2025-01-05	activo	2026-02-21 00:45:54.359215	2026-02-21 00:45:54.359215	\N	\N	\N
4	EMP-004	Pedro	Soto	Soporte	TI	2025-01-10	activo	2026-02-21 00:45:54.359215	2026-02-21 00:45:54.359215	\N	\N	\N
5	EMP-005	Luis	Gómez	Junior	Logística	2026-02-21	activo	2026-02-21 00:45:54.359215	2026-02-21 00:45:54.359215	\N	\N	\N
1	EMP-001	Admin	Root	Administrador	Sistemas	2025-01-01	activo	2026-02-21 00:45:54.359215	2026-03-06 19:02:09.495365	villa@gmail.com	4411238976	/uploads/empleados/136d61106a43f0dbefd85ca9710a6ea3bd.jpg
2	EMP-002	Juan	Pérez	Operario	Almacén	2025-01-02	activo	2026-02-21 00:45:54.359215	2026-03-13 07:04:42.060493	ariel.xd.guevara.15@gmail.com	\N	\N
\.


--
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios (id, "empleadoId", "diaSemana", "horaEntrada", "horaSalida", "toleranciaMinutos", activo, "creadoEn", "fechaInicio", "fechaFin", "actualizadoEn") FROM stdin;
2	3	lunes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
3	4	lunes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
5	2	martes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
6	3	martes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
7	4	martes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
8	5	martes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
9	2	miercoles	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
10	3	miercoles	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
11	4	miercoles	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
12	5	miercoles	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
13	2	jueves	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
14	3	jueves	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
15	4	jueves	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
16	5	jueves	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
17	2	viernes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
18	3	viernes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
19	4	viernes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
20	5	viernes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
4	5	lunes	23:53:00	00:00:00	1	t	2026-02-21 00:45:54.359215	\N	\N	2026-03-03 05:53:51.399008
21	4	sabado	09:00:00	18:00:00	15	t	2026-03-03 06:39:11.933121	\N	\N	2026-03-03 06:39:11.933121
22	4	domingo	09:00:00	18:00:00	15	t	2026-03-03 06:39:11.968766	\N	\N	2026-03-03 06:39:11.968766
34	2	lunes	01:00:00	05:00:00	15	t	2026-03-06 18:24:22.195705	\N	\N	2026-03-06 18:25:15.586876
38	2	lunes	06:00:00	10:00:00	15	t	2026-03-06 18:47:17.963151	\N	\N	2026-03-06 18:47:17.963151
39	2	lunes	11:00:00	15:00:00	15	t	2026-03-06 19:04:15.31822	\N	\N	2026-03-06 19:04:15.31822
40	1	lunes	09:00:00	18:00:00	15	t	2026-03-06 19:32:15.382378	\N	\N	2026-03-06 19:32:15.382378
41	2	lunes	16:00:00	20:00:00	15	t	2026-03-13 07:27:48.036714	\N	\N	2026-03-13 07:27:48.036714
42	1	martes	09:00:00	18:00:00	15	t	2026-03-17 00:16:36.708322	\N	\N	2026-03-17 00:16:36.708322
43	1	miercoles	09:00:00	18:00:00	15	t	2026-03-17 00:16:36.72868	\N	\N	2026-03-17 00:16:36.72868
44	1	jueves	09:00:00	18:00:00	15	t	2026-03-17 00:16:36.743304	\N	\N	2026-03-17 00:16:36.743304
45	1	viernes	09:00:00	18:00:00	15	t	2026-03-17 00:16:36.757985	\N	\N	2026-03-17 00:16:36.757985
46	1	sabado	09:00:00	18:00:00	15	t	2026-03-17 00:16:36.772769	\N	\N	2026-03-17 00:16:36.772769
47	1	domingo	09:00:00	18:00:00	15	t	2026-03-17 00:16:36.786741	\N	\N	2026-03-17 00:16:36.786741
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (id, "tokenHash", "usuarioId", "expiresAt", used, "creadoEn") FROM stdin;
1	$2b$10$nIV81IM3r7bt/Tjjglr/rODrtSV40C7qRwqEK6sDbH8yWsrSUfSAy	7	2026-03-13 01:21:11.707	f	2026-03-13 07:06:11.710259
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (id, "empleadoId", "fechaInicio", "fechaFin", tipo, motivo, autorizado, "autorizadoPor", observaciones, "creadoEn", "actualizadoEn") FROM stdin;
\.


--
-- Data for Name: tarjetas_nfc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarjetas_nfc (id, "codigoNfc", "empleadoId", "fechaAsignacion", activa, "motivoBaja", "creadoEn", "actualizadoEn") FROM stdin;
5	D3A09E13	4	2026-03-05	t	\N	2026-03-05 08:34:02.667528	2026-03-05 08:34:02.667528
1	EMP-001	1	2026-03-02	t	\N	2026-03-03 05:30:57.198588	2026-03-05 08:48:44.921673
3	EMP-005	5	2026-03-02	t	\N	2026-03-03 05:31:17.263142	2026-03-05 22:21:37.213787
2	07CBCB01	3	2026-03-05	f	\N	2026-03-03 05:31:09.520301	2026-03-06 01:16:08.035877
4	13152E02	2	2026-03-05	t	\N	2026-03-05 08:29:07.23609	2026-03-06 01:16:09.834968
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, username, rol, "empleadoId", activo, "creadoEn", "actualizadoEn", "passwordHash") FROM stdin;
7	juan	empleado	2	t	2026-02-21 01:05:50.500131	2026-02-21 01:05:50.500131	password
9	pedro	empleado	4	t	2026-02-21 01:05:50.500131	2026-03-03 06:22:20.991687	password
6	admin	administrador	1	t	2026-02-21 01:05:50.500131	2026-02-21 01:05:50.500131	$2b$10$hGgZyolyCgB65V6lq7CJmO71w6xrM76NXm.W4pgv/A1vJ1SNr9sfi
8	ana	empleado	3	t	2026-02-21 01:05:50.500131	2026-03-05 09:33:48.326379	$2b$10$VnlMnhWyxGtmISjnIrejruy4oSybkcVvpr7IjE6T8OpGzxDmYDcHO
10	luis	supervisor	5	t	2026-02-21 01:05:50.500131	2026-03-06 01:32:22.766234	$2b$10$E8EnN1eAt0lDChB1.3qgHuY3BSaWTblQtgudsquOI1sv3ICpaudjm
\.


--
-- Data for Name: vacaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacaciones (id, "empleadoId", "fechaInicio", "fechaFin", "diasSolicitados", estado, observaciones, "creadoEn", "actualizadoEn", tipo) FROM stdin;
2	1	2026-02-20	2026-02-22	2	aprobada	nomas	2026-02-21 04:45:57.32002	2026-02-21 04:46:16.122141	vacaciones
3	1	2026-02-10	2026-02-27	1	pendiente	1	2026-02-27 21:33:29.593584	2026-02-27 21:33:29.593584	vacaciones
4	2	2026-02-26	2026-02-28	2	rechazada	2	2026-02-27 21:41:41.608173	2026-02-27 21:42:05.478534	vacaciones
5	2	2026-02-26	2026-02-28	2	aprobada	holi\n	2026-02-27 21:42:21.250511	2026-02-27 21:42:33.566271	vacaciones
6	2	2026-02-26	2026-02-27	1	aprobada	1	2026-02-27 21:45:17.693769	2026-02-27 21:45:35.648054	vacaciones
1	1	2026-02-20	2026-02-28	7	rechazada	Medico	2026-02-21 04:44:14.276485	2026-03-03 06:08:29.132962	vacaciones
7	3	2026-03-03	2026-03-06	4	pendiente	porfi acepte	2026-03-04 01:48:37.02585	2026-03-04 01:48:37.02585	vacaciones
8	3	2026-03-05	2026-03-06	1	rechazada	Semanda santa	2026-03-06 01:19:52.751851	2026-03-06 01:20:19.255299	vacaciones
\.


--
-- Name: asistencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_id_seq', 15, true);


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 4, true);


--
-- Name: bitacora_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bitacora_id_seq', 187, true);


--
-- Name: dias_festivos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dias_festivos_id_seq', 3, true);


--
-- Name: empleados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empleados_id_seq', 5, true);


--
-- Name: horarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_id_seq', 47, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, true);


--
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_id_seq', 1, false);


--
-- Name: tarjetas_nfc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tarjetas_nfc_id_seq', 5, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 10, true);


--
-- Name: vacaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vacaciones_id_seq', 8, true);


--
-- Name: permisos PK_3127bd9cfeb13ae76186d0d9b38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY (id);


--
-- Name: password_resets PK_4816377aa98211c1de34469e742; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT "PK_4816377aa98211c1de34469e742" PRIMARY KEY (id);


--
-- Name: vacaciones PK_7eaa7f073eb4e42da2114f5a0a6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacaciones
    ADD CONSTRAINT "PK_7eaa7f073eb4e42da2114f5a0a6" PRIMARY KEY (id);


--
-- Name: tarjetas_nfc PK_966f511de844ca2a8b830a1453d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_nfc
    ADD CONSTRAINT "PK_966f511de844ca2a8b830a1453d" PRIMARY KEY (id);


--
-- Name: backups PK_ca30ff369eddfc7dac3b35d0d3c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT "PK_ca30ff369eddfc7dac3b35d0d3c" PRIMARY KEY (id);


--
-- Name: dias_festivos PK_d63a248b7e9abddf8b802fe9194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dias_festivos
    ADD CONSTRAINT "PK_d63a248b7e9abddf8b802fe9194" PRIMARY KEY (id);


--
-- Name: bitacora PK_e08eb7c81388757d9e53d62246e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT "PK_e08eb7c81388757d9e53d62246e" PRIMARY KEY (id);


--
-- Name: tarjetas_nfc UQ_1cbe8cf5192b014ceb3061c94ad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_nfc
    ADD CONSTRAINT "UQ_1cbe8cf5192b014ceb3061c94ad" UNIQUE ("codigoNfc");


--
-- Name: tarjetas_nfc UQ_75b4771055a0c6fd01e9f86f48a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_nfc
    ADD CONSTRAINT "UQ_75b4771055a0c6fd01e9f86f48a" UNIQUE ("empleadoId");


--
-- Name: dias_festivos UQ_a79b2a9ce27c2cc2b6474620ace; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dias_festivos
    ADD CONSTRAINT "UQ_a79b2a9ce27c2cc2b6474620ace" UNIQUE (fecha);


--
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (id);


--
-- Name: empleados empleados_numeroEmpleado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT "empleados_numeroEmpleado_key" UNIQUE ("numeroEmpleado");


--
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);


--
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_empleadoId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "usuarios_empleadoId_key" UNIQUE ("empleadoId");


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- Name: vacaciones FK_13191c7662ac6b62cad2900a2b8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacaciones
    ADD CONSTRAINT "FK_13191c7662ac6b62cad2900a2b8" FOREIGN KEY ("empleadoId") REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: bitacora FK_4dbbbda3eab8739cb68268806ba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT "FK_4dbbbda3eab8739cb68268806ba" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: backups FK_600b86d0e39edeb64a635cd4b69; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT "FK_600b86d0e39edeb64a635cd4b69" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios(id);


--
-- Name: permisos FK_67c491efa007fddb18a1fc9256e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT "FK_67c491efa007fddb18a1fc9256e" FOREIGN KEY ("empleadoId") REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: tarjetas_nfc FK_75b4771055a0c6fd01e9f86f48a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_nfc
    ADD CONSTRAINT "FK_75b4771055a0c6fd01e9f86f48a" FOREIGN KEY ("empleadoId") REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: usuarios FK_8b6d5827bc678f4fffb97abe7aa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_8b6d5827bc678f4fffb97abe7aa" FOREIGN KEY ("empleadoId") REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: password_resets FK_a27b6a50b2b5ded5a18723e1c66; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT "FK_a27b6a50b2b5ded5a18723e1c66" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: horarios FK_d05269083df94be1178e6ee0aa9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT "FK_d05269083df94be1178e6ee0aa9" FOREIGN KEY ("empleadoId") REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: asistencias FK_f91f428c17a15dcef6baea46f49; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT "FK_f91f428c17a15dcef6baea46f49" FOREIGN KEY ("empleadoId") REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict cslhVGUrADywnx57lLez5fJlkvx6Cc5cRQh0pcRhRX9blh40hZiwXWSKdsmMLy6

