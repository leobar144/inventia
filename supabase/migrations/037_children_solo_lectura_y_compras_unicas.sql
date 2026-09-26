-- 037: el padre ya no edita a su hijo desde el navegador, y una compra
-- pendiente no se puede duplicar.
--
-- 1. children
--    La politica anterior era `for all`, asi que un padre autenticado podia
--    escribir CUALQUIER columna de la fila de su hijo desde el cliente con la
--    llave anon: incluidas `classes_completed` (las insignias) e `is_public`
--    (el perfil compartible). Las ediciones legitimas ya pasan por rutas del
--    servidor con service role: /api/portal/child-visibility y
--    /api/portal/photo-consent. Desde el navegador solo hace falta leer y
--    agregar (app/portal/hijos/nuevo).
--
-- 2. Compras pendientes
--    Las rutas de checkout reutilizan la inscripcion o la mensualidad
--    pendiente, pero dos peticiones simultaneas no se ven entre si y ambas
--    pueden crear una. El indice unico lo impide en la base, que es el unico
--    lugar donde la carrera se puede resolver de verdad.
--
-- 3. Creditos de referido
--    Wompi reintenta los webhooks. Un indice unico por pago hace que acreditar
--    el referido sea idempotente: el reintento no regala un segundo credito.

-- 1. children ---------------------------------------------------------------

drop policy if exists "children: parent manages own children" on children;

drop policy if exists "children: parent reads own children" on children;
create policy "children: parent reads own children" on children
  for select using (auth.uid() = parent_id);

drop policy if exists "children: parent adds own children" on children;
create policy "children: parent adds own children" on children
  for insert with check (auth.uid() = parent_id);

-- Sin policy de update ni de delete a proposito: con RLS activo, lo que no
-- tiene policy queda prohibido para la llave anon.

-- 2. Una sola compra pendiente por producto ---------------------------------

create unique index if not exists enrollments_una_pendiente_por_curso
  on enrollments (student_id, course_id)
  where status = 'pending_payment';

create unique index if not exists tutoring_memberships_una_pendiente_por_nino
  on tutoring_memberships (child_id)
  where status = 'pending_payment';

-- 3. Un credito de referido por pago ----------------------------------------

create unique index if not exists referral_credits_uno_por_pago
  on referral_credits (source_payment_id)
  where source_payment_id is not null;
