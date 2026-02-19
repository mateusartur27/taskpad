-- Dashboard quick notepad per user
create table public.user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  content text not null default '',
  updated_at timestamptz default now() not null
);

create index idx_user_notes_user_id on public.user_notes(user_id);

alter table public.user_notes enable row level security;

create policy "Users can view own notes"
  on public.user_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.user_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.user_notes for update
  using (auth.uid() = user_id);

create trigger on_user_notes_updated
  before update on public.user_notes
  for each row execute function public.handle_updated_at();

-- Create default note entry when user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.tabs (user_id, name, position)
  values (new.id, 'Minhas Tarefas', 0);
  insert into public.user_notes (user_id, content)
  values (new.id, '');
  return new;
end;
$$ language plpgsql security definer;
