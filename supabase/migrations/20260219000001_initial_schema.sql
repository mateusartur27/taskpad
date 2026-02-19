-- ===========================================
-- Gerenciador de Tarefas - Schema Inicial
-- ===========================================

-- Tabela de guias (tabs)
create table public.tabs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Nova Guia',
  position integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tabela de tarefas
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  tab_id uuid references public.tabs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null default '',
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Índices para performance
create index idx_tabs_user_id on public.tabs(user_id);
create index idx_tabs_position on public.tabs(user_id, position);
create index idx_tasks_tab_id on public.tasks(tab_id);
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_position on public.tasks(tab_id, position);

-- RLS (Row Level Security)
alter table public.tabs enable row level security;
alter table public.tasks enable row level security;

-- Policies: cada usuário só vê/edita seus próprios dados
create policy "Users can view own tabs"
  on public.tabs for select
  using (auth.uid() = user_id);

create policy "Users can insert own tabs"
  on public.tabs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tabs"
  on public.tabs for update
  using (auth.uid() = user_id);

create policy "Users can delete own tabs"
  on public.tabs for delete
  using (auth.uid() = user_id);

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_tabs_updated
  before update on public.tabs
  for each row execute function public.handle_updated_at();

create trigger on_tasks_updated
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- Função para criar guia padrão quando novo usuário se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.tabs (user_id, name, position)
  values (new.id, 'Minhas Tarefas', 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
