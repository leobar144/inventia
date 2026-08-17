-- ============================================================
-- FASE 2: cuentas familiares, pagos con Wompi
-- Ejecutar completo en Supabase SQL Editor
-- ============================================================

-- 1. Tabla de hijos (perfiles de estudiante, sin login propio)
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references profiles(id) on delete cascade not null,
  full_name text not null,
  birth_date date not null,
  avatar_url text,
  created_at timestamp default now()
);

-- 2. enrollments.student_id debe apuntar a children, no a profiles
--    (la tabla está vacía en producción, así que este cambio es seguro)
alter table enrollments drop constraint if exists enrollments_student_id_fkey;
alter table enrollments
  add constraint enrollments_student_id_fkey
  foreign key (student_id) references children(id) on delete cascade;

-- status ahora también admite 'pending_payment' (antes de que el webhook de Wompi confirme el pago)
alter table enrollments drop constraint if exists enrollments_status_check;
alter table enrollments
  add constraint enrollments_status_check
  check (status in ('pending_payment', 'active', 'completed', 'dropped'));

-- 3. Tabla de pagos (Wompi)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  parent_id uuid references profiles(id) not null,
  wompi_transaction_id text unique,
  reference text unique not null,
  amount_in_cents bigint not null,
  currency text default 'COP',
  status text check (status in ('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR')) default 'PENDING',
  raw_response jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 4. Trigger: crear automáticamente el perfil (role='parent') al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'parent'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 5. Row Level Security
alter table profiles enable row level security;
alter table children enable row level security;
alter table enrollments enable row level security;
alter table payments enable row level security;
alter table courses enable row level security;
alter table class_sessions enable row level security;

drop policy if exists "profiles: user sees own row" on profiles;
create policy "profiles: user sees own row" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: user updates own row" on profiles;
create policy "profiles: user updates own row" on profiles
  for update using (auth.uid() = id);

drop policy if exists "children: parent manages own children" on children;
create policy "children: parent manages own children" on children
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

drop policy if exists "enrollments: parent sees own children's enrollments" on enrollments;
create policy "enrollments: parent sees own children's enrollments" on enrollments
  for select using (
    student_id in (select id from children where parent_id = auth.uid())
  );

drop policy if exists "payments: parent sees own payments" on payments;
create policy "payments: parent sees own payments" on payments
  for select using (auth.uid() = parent_id);

drop policy if exists "courses: public read" on courses;
create policy "courses: public read" on courses
  for select using (true);

drop policy if exists "class_sessions: public read" on class_sessions;
create policy "class_sessions: public read" on class_sessions
  for select using (true);

-- Nota: los INSERT/UPDATE en enrollments y payments los hace el backend
-- (rutas /api/*) usando SUPABASE_SERVICE_ROLE_KEY, que ignora RLS.
-- Por eso no hay políticas de insert/update para el rol autenticado normal
-- en esas dos tablas — así el estado de pago siempre pasa por el servidor,
-- nunca lo puede escribir el navegador del padre directamente.
