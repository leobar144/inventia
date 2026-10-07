-- 041: el espacio del niño.
--
-- POR QUÉ EXISTE
--
-- Todo el portal está escrito para el acudiente: "su hijo", "usted recibe",
-- "inscribir en un nuevo curso". El niño no tiene dónde entrar, así que no
-- vuelve solo — y un niño que no vuelve solo se desengancha del curso.
--
-- Además, desde el 7/10/2026 la clase de prueba es individual, de 15 minutos,
-- y la promesa incluye que el niño ENTRE a la plataforma y haga algo. Sin esto
-- no hay a dónde entrar.
--
-- POR QUÉ UN CÓDIGO Y NO UNA CUENTA
--
-- Crear usuarios para menores significa pedirles correo y contraseña, y
-- guardar credenciales de un menor de edad. No hace falta: el acudiente ya
-- tiene cuenta y ya dio su consentimiento. El niño entra con un código corto
-- que su papá le pasa, y la vista no muestra ni correos, ni teléfonos, ni
-- apellidos, ni pagos: solo su nombre de pila, su progreso y su misión.
-- Si el código se filtra, lo que se ve es eso.
--
-- El código se puede regenerar desde el portal del acudiente, igual que se
-- cambia una clave.

alter table public.children
  -- Corto y legible EN VOZ ALTA: el instructor se lo dicta al niño en la
  -- clase de prueba. Sin O/0 ni I/1/L, que es donde los niños se equivocan.
  add column if not exists access_code text unique,

  -- Pasos de la primera misión que el niño ya completó. Es un arreglo de ids
  -- (ver MISION_BIENVENIDA en lib/espacio.ts). Va como jsonb y no como tabla
  -- aparte porque son tres pasos que solo le importan a este niño y nunca se
  -- consultan de forma agregada.
  add column if not exists space_steps jsonb not null default '[]'::jsonb,

  -- Cuándo entró por última vez. Es la métrica que dice si el espacio sirve:
  -- si los niños no vuelven, hay que arreglarlo, no seguir agregándole cosas.
  add column if not exists space_last_seen_at timestamptz,

  -- Qué quiere crear el niño, dicho por él en su primera misión. Va en columna
  -- propia y no dentro de space_steps porque es el dato comercial más útil que
  -- produce la clase de prueba: dice qué curso recomendarle, y agregado dice
  -- qué cursos abrir. Son opciones cerradas (ver MISION_BIENVENIDA), nunca
  -- texto libre de un menor.
  add column if not exists space_dream text;

comment on column public.children.access_code is
  'Codigo corto que el nino escribe en /mi-espacio. No es una credencial: la vista que abre no expone datos sensibles. Se regenera desde el portal del acudiente.';

comment on column public.children.space_steps is
  'Ids de los pasos de la mision de bienvenida ya completados por el nino.';

comment on column public.children.space_last_seen_at is
  'Ultima vez que el nino entro a su espacio. Mide si vuelve solo.';

-- La búsqueda por código ocurre en cada intento de entrada, incluidos los
-- fallidos: sin índice, un ataque de fuerza bruta sería además un escaneo
-- secuencial de la tabla.
create index if not exists children_access_code_idx
  on public.children (access_code)
  where access_code is not null;
