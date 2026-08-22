-- 028 — Gestión de las solicitudes de jardines y colegios.
--
-- Detectado probando: la página de jardines mostraba que la solicitud había
-- llegado y el número de WhatsApp, pero nada más. Faltaban dos cosas para que
-- el canal sirva de verdad:
--
--   1. Un aviso en el menú de administración. Sin él nadie entra a la sección,
--      y una solicitud que nadie ve es una solicitud perdida.
--   2. Una forma de actuar: marcar en qué va la conversación y de quién es la
--      responsabilidad de contestar.
--
-- En venta institucional el primero que responde suele ganar, así que el costo
-- de que un lead se quede sin ver es alto.

alter table public.school_leads
  add column if not exists assigned_to uuid references public.profiles(id),
  add column if not exists last_contacted_at timestamptz;

comment on column public.school_leads.assigned_to is
  'Quién del equipo es responsable de responderle a esta institución.';

comment on column public.school_leads.last_contacted_at is
  'Última vez que se marcó como contactada. Sirve para ver cuáles llevan días sin respuesta.';

-- Índice parcial: la consulta más frecuente es "cuántas van sin atender",
-- para el contador del menú.
create index if not exists school_leads_status_idx
  on public.school_leads (status) where status = 'nuevo';
