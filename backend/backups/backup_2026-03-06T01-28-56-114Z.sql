--
-- PostgreSQL database dump
--

\restrict YbrIwSkG7NflOUk2iuAsQsGHPfLoj9XttbnPHMo2ZX3mK4nFNt9AuUeNBD8PAeb

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
    telefono character varying(20)
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
    "actualizadoEn" timestamp without time zone DEFAULT now() NOT NULL
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
12	2	2026-03-05	19:11:14	\N	normal	retardo	671	2026-03-06 01:11:14.120872	\N	2026-03-06 01:11:14.120872
13	2	2026-03-05	19:11:14	\N	normal	retardo	671	2026-03-06 01:11:14.122843	\N	2026-03-06 01:11:14.122843
15	4	2026-03-05	19:15:09	\N	normal	retardo	675	2026-03-06 01:15:09.80026	\N	2026-03-06 01:15:09.80026
14	4	2026-03-05	19:15:09	19:15:55	normal	retardo	675	2026-03-06 01:15:09.797378	\N	2026-03-06 01:15:55.822513
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backups (id, "nombreArchivo", ruta, tamano, "usuarioId", comentario, "fechaCreacion") FROM stdin;
3	backup_2026-03-05T23-56-25-491Z.sql	C:\\Users\\Ariel\\Documents\\srap\\backend\\backups\\backup_2026-03-05T23-56-25-491Z.sql	32653	6		2026-03-05 23:56:25.809662
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
\.


--
-- Data for Name: dias_festivos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dias_festivos (id, fecha, descripcion, tipo, "creadoEn", "actualizadoEn") FROM stdin;
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (id, "numeroEmpleado", nombre, apellidos, puesto, area, "fechaIngreso", estatus, "creadoEn", "actualizadoEn", email, telefono) FROM stdin;
2	EMP-002	Juan	Pérez	Operario	Almacén	2025-01-02	activo	2026-02-21 00:45:54.359215	2026-02-21 00:45:54.359215	\N	\N
3	EMP-003	Ana	López	Ventas	Comercial	2025-01-05	activo	2026-02-21 00:45:54.359215	2026-02-21 00:45:54.359215	\N	\N
4	EMP-004	Pedro	Soto	Soporte	TI	2025-01-10	activo	2026-02-21 00:45:54.359215	2026-02-21 00:45:54.359215	\N	\N
5	EMP-005	Luis	Gómez	Junior	Logística	2026-02-21	activo	2026-02-21 00:45:54.359215	2026-02-21 00:45:54.359215	\N	\N
1	EMP-001	Admin	Root	Administrador	Sistemas	2025-01-01	activo	2026-02-21 00:45:54.359215	2026-03-05 22:20:42.467683	villa@gmail.com	4411238976
\.


--
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios (id, "empleadoId", "diaSemana", "horaEntrada", "horaSalida", "toleranciaMinutos", activo, "creadoEn", "fechaInicio", "fechaFin", "actualizadoEn") FROM stdin;
1	2	lunes	08:00:00	17:00:00	10	t	2026-02-21 00:45:54.359215	\N	\N	2026-02-21 01:05:41.059539
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
10	luis	supervisor	5	t	2026-02-21 01:05:50.500131	2026-03-03 06:23:05.662447	luis123
6	admin	administrador	1	t	2026-02-21 01:05:50.500131	2026-02-21 01:05:50.500131	$2b$10$hGgZyolyCgB65V6lq7CJmO71w6xrM76NXm.W4pgv/A1vJ1SNr9sfi
8	ana	empleado	3	t	2026-02-21 01:05:50.500131	2026-03-05 09:33:48.326379	$2b$10$VnlMnhWyxGtmISjnIrejruy4oSybkcVvpr7IjE6T8OpGzxDmYDcHO
\.


--
-- Data for Name: vacaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacaciones (id, "empleadoId", "fechaInicio", "fechaFin", "diasSolicitados", estado, observaciones, "creadoEn", "actualizadoEn") FROM stdin;
2	1	2026-02-20	2026-02-22	2	aprobada	nomas	2026-02-21 04:45:57.32002	2026-02-21 04:46:16.122141
3	1	2026-02-10	2026-02-27	1	pendiente	1	2026-02-27 21:33:29.593584	2026-02-27 21:33:29.593584
4	2	2026-02-26	2026-02-28	2	rechazada	2	2026-02-27 21:41:41.608173	2026-02-27 21:42:05.478534
5	2	2026-02-26	2026-02-28	2	aprobada	holi\n	2026-02-27 21:42:21.250511	2026-02-27 21:42:33.566271
6	2	2026-02-26	2026-02-27	1	aprobada	1	2026-02-27 21:45:17.693769	2026-02-27 21:45:35.648054
1	1	2026-02-20	2026-02-28	7	rechazada	Medico	2026-02-21 04:44:14.276485	2026-03-03 06:08:29.132962
7	3	2026-03-03	2026-03-06	4	pendiente	porfi acepte	2026-03-04 01:48:37.02585	2026-03-04 01:48:37.02585
8	3	2026-03-05	2026-03-06	1	rechazada	Semanda santa	2026-03-06 01:19:52.751851	2026-03-06 01:20:19.255299
\.


--
-- Name: asistencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_id_seq', 15, true);


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 3, true);


--
-- Name: bitacora_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bitacora_id_seq', 22, true);


--
-- Name: dias_festivos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dias_festivos_id_seq', 1, false);


--
-- Name: empleados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empleados_id_seq', 5, true);


--
-- Name: horarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_id_seq', 22, true);


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

\unrestrict YbrIwSkG7NflOUk2iuAsQsGHPfLoj9XttbnPHMo2ZX3mK4nFNt9AuUeNBD8PAeb

