-- NOSSO LUGAR — banco inicial
-- Rode este arquivo no Supabase > SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar text default '',
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null default '',
  shared boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  added_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  author text default '',
  cover text default '',
  status text not null default 'want' check (status in ('read','reading','want')),
  rating integer check (rating between 0 and 5),
  created_at timestamptz default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  added_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  image_url text default '',
  memory_date date default current_date,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.notes enable row level security;
alter table public.books enable row level security;
alter table public.memories enable row level security;

-- Para um app privado entre vocês duas, a forma mais simples no começo
-- é permitir usuários autenticados. Depois podemos restringir por IDs.

create policy "authenticated profiles"
on public.profiles for all to authenticated
using (true) with check (true);

create policy "authenticated messages"
on public.messages for all to authenticated
using (true) with check (true);

create policy "authenticated notes"
on public.notes for all to authenticated
using (true) with check (true);

create policy "authenticated books"
on public.books for all to authenticated
using (true) with check (true);

create policy "authenticated memories"
on public.memories for all to authenticated
using (true) with check (true);

-- Cria automaticamente um perfil quando uma conta é criada.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Ative atualizações em tempo real para o chat.
alter publication supabase_realtime add table public.messages;
