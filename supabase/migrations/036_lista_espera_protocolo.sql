-- 036 — Lista de espera de la guía gratuita "Protocolo de IA honesta" y del
-- curso en video para padres.
--
-- POR QUÉ EXISTE
--
-- Las estadísticas de @inventiacol (30 días al 12/09/2026) mostraron que la
-- cuenta casi no tiene alcance: 91 personas vieron algo, 2 interacciones.
-- Vender la preventa del curso "IA y tareas en casa" por Instagram no va a
-- funcionar todavía. Hace falta una lista propia de familias interesadas, a las
-- que se les pueda escribir por WhatsApp — que es el canal que sí funciona.
--
-- La guía en PDF es el intercambio: la familia la descarga gratis y deja su
-- WhatsApp con autorización expresa para recibir novedades.
--
-- MINIMIZACIÓN DE DATOS
--
-- Solo se pide lo que se va a usar: nombre, WhatsApp, correo opcional y un
-- RANGO de edad de los hijos, también opcional. Nunca el nombre del niño ni su
-- fecha de nacimiento: para segmentar el curso por edades basta el rango, y un
-- dato de un menor que no se pide es un dato que no se puede filtrar.

create table if not exists public.digital_waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text not null,
  email text,
  child_age_band text,
  wants_course boolean not null default false,
  source text,
  consent_version text not null,
  consent_at timestamptz not null default now(),
  contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un número = una familia. Si vuelve a llenar el formulario se actualiza su
  -- registro en vez de duplicarlo y escribirle dos veces.
  constraint digital_waitlist_whatsapp_unique unique (whatsapp),
  constraint digital_waitlist_age_band_check check (
    child_age_band is null or child_age_band in ('4-6', '7-10', '11-13', '14-16', 'varias')
  )
);

comment on table public.digital_waitlist is
  'Familias que descargaron la guia gratuita y/o pidieron aviso de la preventa del curso para padres. Canal de venta por WhatsApp.';

comment on column public.digital_waitlist.whatsapp is
  'Solo digitos, con indicativo de pais (57 + 10 digitos en Colombia). Normalizado en lib/protocolo.ts.';

comment on column public.digital_waitlist.wants_course is
  'Pidio que le avisaran de la preventa. Nunca pasa de true a false por volver a llenar el formulario.';

comment on column public.digital_waitlist.source is
  'De donde llego: parametro ?origen= del enlace (instagram, whatsapp, campamento...). Sirve para saber que canal trae familias de verdad.';

comment on column public.digital_waitlist.consent_version is
  'Version de la politica de datos aceptada (CONSENT_VERSION en lib/legal.ts).';

-- Mismo patrón de las tablas sensibles: RLS activado y SIN políticas. Solo se
-- lee y escribe con service role desde rutas de servidor que ya validaron quién
-- llama. Una política de lectura pública expondría el WhatsApp de cada familia.
alter table public.digital_waitlist enable row level security;

create index if not exists digital_waitlist_created_idx
  on public.digital_waitlist (created_at desc);

create index if not exists digital_waitlist_pendientes_idx
  on public.digital_waitlist (wants_course)
  where contacted_at is null;
