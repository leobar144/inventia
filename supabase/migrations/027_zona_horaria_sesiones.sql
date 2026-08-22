-- 027 — Corregir la zona horaria de las clases.
--
-- BUG ENCONTRADO PROBANDO: el administrador programaba una clase a las 4:00 p.m.
-- y el profesor (y el padre) la veían a las 9:00 p.m. Cinco horas tarde, que es
-- exactamente el desfase de Colombia con UTC.
--
-- Causa: `scheduled_at` era `timestamp without time zone`. Todas las escrituras
-- guardaban correctamente el instante UTC (vía .toISOString()), pero al leerlo
-- Postgres devolvía "2026-08-25T21:00:00" SIN marca de zona, y `new Date(...)`
-- en el navegador interpreta eso como hora LOCAL. El valor guardado era
-- correcto; la lectura era la que mentía.
--
-- No era un bug del generador en lote: el formulario de sesión individual tiene
-- el mismo comportamiento, así que el problema existía desde que se creó la
-- tabla. El generador solo lo hizo evidente al crear varias clases de una.
--
-- El arreglo convierte la columna declarando explícitamente que lo almacenado
-- era UTC. Con eso las filas existentes quedan correctas y el navegador recibe
-- el instante con zona, así que muestra la hora real de Bogotá.

alter table public.class_sessions
  alter column scheduled_at type timestamptz
  using scheduled_at at time zone 'UTC';

comment on column public.class_sessions.scheduled_at is
  'Instante de la clase, CON zona horaria. Antes era timestamp sin zona: el valor guardado era UTC pero el navegador lo leía como hora local, mostrando las clases 5 horas tarde.';
