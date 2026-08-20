-- 020 — Perfil público compartible del niño.
--
-- Permite que un acudiente comparta los logros de su hijo (proyectos, insignia,
-- clases completadas) con un enlace, típicamente por WhatsApp.
--
-- Decisiones de privacidad, alineadas con lo que promete la política publicada
-- en /privacidad ("nunca publicamos ni compartimos públicamente los datos del
-- menor sin una autorización específica y adicional del acudiente"):
--
--   1. APAGADO POR DEFECTO. Ningún niño queda expuesto sin una acción explícita
--      del acudiente.
--   2. El enlace usa un token aleatorio, NO el id del niño. Publicar el uuid
--      permitiría cruzarlo con otras tablas y además haría adivinables los
--      enlaces vecinos.
--   3. El token solo se genera cuando el acudiente activa el permiso.
--   4. Se guarda cuándo se activó, como prueba de la autorización.
--   5. NO se agrega ninguna policy de lectura pública sobre `children`: una
--      policy a nivel de fila expondría también fecha de nacimiento, parent_id
--      y demás columnas a cualquiera con la llave anónima. La página pública
--      lee con service role desde el servidor y devuelve solo los campos
--      elegidos a mano.

alter table public.children
  add column if not exists public_slug text unique,
  add column if not exists is_public boolean not null default false,
  add column if not exists public_enabled_at timestamptz;

comment on column public.children.public_slug is
  'Token aleatorio del enlace público. Nunca es el id del niño. Se genera solo al activar.';

comment on column public.children.is_public is
  'Autorización explícita del acudiente para mostrar el perfil. Apagado por defecto.';

-- Búsqueda por token en la página pública.
create index if not exists children_public_slug_idx
  on public.children (public_slug)
  where public_slug is not null;
