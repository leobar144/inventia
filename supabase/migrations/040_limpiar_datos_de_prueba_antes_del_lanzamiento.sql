-- 040: se borran los datos inventados de desarrollo. La web abre al publico el
-- lunes 5 de octubre de 2026.
--
-- QUE SE BORRA
--   - Los 6 padres de prueba y sus 6 ninos (incluidos "Nino de Prueba" y
--     "Ana Prueba", dos de los cuales tenian PERFIL PUBLICO activo).
--   - Las 4 inscripciones y los 4 pagos: todos de sandbox de Wompi, con la
--     tarjeta de pruebas 4242, sumaban $1.240.000 falsos en el libro de caja.
--   - Las 14 clases de agosto, sus 2 asistencias y la nota de clase con foto.
--   - Las 6 reservas de clase de prueba inventadas y el jardin falso.
--   - Los 7 profesores de prueba (alias leobar144+profesorN).
--
-- La foto de la nota de clase se borra aparte, con la Storage API: Supabase
-- prohibe borrar de storage.objects por SQL para no dejar archivos huerfanos.
--
-- QUE SE CONSERVA, Y POR QUE
--   - El admin (leobar144@gmail.com) y Tatiana (instructora). Decision del
--     usuario el 3/10/2026.
--   - Las 2 reservas de Ana Maria Villadiego (am.villadiego24@gmail.com, hija
--     de 4 anos, 26 y 28 de agosto): es el UNICO contacto real que existe en la
--     base, llego sola por la web y dio su consentimiento de datos. Borrarla
--     seria botar el primer lead de verdad.
--   - Los 5 cursos del catalogo, los planes y la disponibilidad de clases de
--     prueba: son configuracion, no datos de prueba.
--
-- Todo lo borrado esta copiado en el esquema backup_prelanzamiento (migracion
-- 039), de donde se puede restaurar.

-- ---------------------------------------------------------------------------
-- 1. Los cursos quedan sin profesor de prueba
--
-- Los 5 cursos apuntaban al instructor "Monica" que en realidad era el alias
-- leobar144+profesor5000. Sin esto, el borrado falla por llave foranea.

update public.courses
set instructor_id = 'd537b90e-eb49-4c26-9971-4246aaa78049', -- Tatiana
    updated_at = now()
where instructor_id = 'f10376e7-5eca-420c-9e2e-73d4fd1a90d0';

-- ---------------------------------------------------------------------------
-- 2. Lo que cuelga de los ninos y de las clases
--
-- En orden de llaves foraneas: primero lo que apunta, despues lo apuntado.

delete from public.class_notes;
delete from public.class_attendance;
delete from public.class_sessions;
delete from public.makeup_bookings;
delete from public.child_projects;
delete from public.referral_credits;
delete from public.payments;
delete from public.enrollments;
delete from public.children;

-- ---------------------------------------------------------------------------
-- 3. Reservas de clase de prueba: se borran las inventadas, se queda la real

delete from public.trial_bookings
where parent_email is distinct from 'am.villadiego24@gmail.com';

-- El jardin "Los Pinos" tambien era una prueba (correo leobar144+jardin).
delete from public.school_leads
where email like 'leobar144+%';

-- ---------------------------------------------------------------------------
-- 4. Los perfiles de prueba
--
-- Se nombran los dos que se quedan en vez de listar los trece que se van: si
-- manana aparece otro perfil de prueba, esta consulta tambien lo limpia.

delete from public.profiles
where id not in (
  '762d5b00-b1b4-4035-bf64-cea665f7dec6', -- admin
  'd537b90e-eb49-4c26-9971-4246aaa78049'  -- Tatiana, instructora
);

-- Y sus usuarios de autenticacion, o quedarian cuentas que pueden iniciar
-- sesion sin perfil.
delete from auth.users
where id not in (
  '762d5b00-b1b4-4035-bf64-cea665f7dec6',
  'd537b90e-eb49-4c26-9971-4246aaa78049'
);

-- ---------------------------------------------------------------------------
-- 5. El admin deja de llamarse como una persona que no es
--
-- Ese nombre sale en los correos automaticos que recibe la familia.

update public.profiles
set full_name = 'INVENTIA', updated_at = now()
where id = '762d5b00-b1b4-4035-bf64-cea665f7dec6';
