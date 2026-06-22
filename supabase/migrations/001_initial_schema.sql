-- =============================================
-- FASE 1: Modelo de datos + Seguridad RLS
-- =============================================

-- Tipos
create type public.user_role as enum ('admin', 'student');
create type public.enrollment_status as enum ('active', 'refunded');

-- Perfiles (extiende auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        public.user_role not null default 'student',
  created_at  timestamptz not null default now()
);

-- Cursos
create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text not null default '',
  price_cents    integer not null default 0,
  currency       text not null default 'eur',
  cover_url      text,
  is_published   boolean not null default false,
  lesson_count   integer not null default 0,
  created_at     timestamptz not null default now()
);

-- Lecciones
create table public.lessons (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid not null references public.courses(id) on delete cascade,
  title             text not null,
  description       text not null default '',
  youtube_video_id  text not null,
  position          integer not null,
  min_watch_seconds integer not null default 0,
  notes_pdf_path    text,
  created_at        timestamptz not null default now(),
  unique (course_id, position)
);

-- Matrículas
create table public.enrollments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  course_id          uuid not null references public.courses(id) on delete cascade,
  status             public.enrollment_status not null default 'active',
  amount_paid_cents  integer not null default 0,
  stripe_session_id  text unique,
  purchased_at       timestamptz not null default now(),
  unique (user_id, course_id)
);

-- Progreso por lección
create table public.lesson_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  lesson_id       uuid not null references public.lessons(id) on delete cascade,
  watched_seconds integer not null default 0,
  last_position   integer not null default 0,
  completed       boolean not null default false,
  updated_at      timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- Índices
create index on public.lessons (course_id, position);
create index on public.enrollments (user_id);
create index on public.lesson_progress (user_id, lesson_id);

-- =============================================
-- TRIGGERS Y FUNCIONES
-- =============================================

-- Crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'student');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: ¿es admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Helper: ¿está matriculado?
create or replace function public.is_enrolled(p_course uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.enrollments
    where user_id = auth.uid() and course_id = p_course and status = 'active'
  );
$$;

-- Impedir que un alumno se cambie el rol
-- Las conexiones directas (service_role/pg) tienen auth.uid() = NULL y se permiten
create or replace function public.prevent_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'No autorizado para cambiar el rol';
  end if;
  return new;
end; $$;

create trigger profiles_no_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Mantener lesson_count en courses
create or replace function public.refresh_lesson_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  cid := coalesce(new.course_id, old.course_id);
  update public.courses
     set lesson_count = (select count(*) from public.lessons where course_id = cid)
   where id = cid;
  return null;
end; $$;

create trigger lessons_count_trg
  after insert or update or delete on public.lessons
  for each row execute function public.refresh_lesson_count();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.lessons         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;

-- PROFILES
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- COURSES
create policy courses_select_published on public.courses
  for select using (is_published = true or public.is_admin());
create policy courses_admin_write on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- LESSONS
create policy lessons_select_enrolled on public.lessons
  for select using (public.is_admin() or public.is_enrolled(course_id));
create policy lessons_admin_write on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- ENROLLMENTS (inserción solo vía service_role desde webhook)
create policy enrollments_select_own on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());

-- LESSON_PROGRESS
create policy progress_select_own on public.lesson_progress
  for select using (user_id = auth.uid() or public.is_admin());
create policy progress_insert_own on public.lesson_progress
  for insert with check (
    user_id = auth.uid()
    and public.is_enrolled((select course_id from public.lessons where id = lesson_id))
  );
create policy progress_update_own on public.lesson_progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
