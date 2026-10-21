-- ==============================================================================
-- CURATOR — ESQUEMA RELACIONAL INICIAL COM ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. Tabela de Perfis de Usuário
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabela de Referências
create table if not exists public."references" (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text,
  domain text,
  screenshot_url text,
  image_storage_path text,
  screenshot_status text not null default 'none' check (screenshot_status in ('none', 'pending', 'ready', 'failed')),
  source_type text not null default 'url' check (source_type in ('url', 'image', 'both')),
  original_file_name text,
  notes_markdown text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para buscas rápidas de referências por usuário
create index if not exists idx_references_user_id on public."references"(user_id);
create index if not exists idx_references_created_at on public."references"(created_at desc);
create index if not exists idx_references_domain on public."references"(domain);

-- 3. Tabela de Etiquetas (Tags)
create table if not exists public.tags (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint uq_tags_user_slug unique (user_id, slug)
);

create index if not exists idx_tags_user_id on public.tags(user_id);

-- Associação N:N entre Referências e Etiquetas
create table if not exists public.reference_tags (
  reference_id text not null references public."references"(id) on delete cascade,
  tag_id text not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reference_id, tag_id)
);

create index if not exists idx_ref_tags_ref_id on public.reference_tags(reference_id);
create index if not exists idx_ref_tags_tag_id on public.reference_tags(tag_id);

-- 4. Tabela de Projetos
create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id);

-- Associação N:N entre Projetos e Referências
create table if not exists public.project_references (
  project_id text not null references public.projects(id) on delete cascade,
  reference_id text not null references public."references"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, reference_id)
);

create index if not exists idx_proj_ref_proj_id on public.project_references(project_id);
create index if not exists idx_proj_ref_ref_id on public.project_references(reference_id);

-- 5. Tabela de Coleções
create table if not exists public.collections (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_collections_user_id on public.collections(user_id);

-- Associação N:N entre Coleções e Referências
create table if not exists public.collection_references (
  collection_id text not null references public.collections(id) on delete cascade,
  reference_id text not null references public."references"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, reference_id)
);

create index if not exists idx_col_ref_col_id on public.collection_references(collection_id);
create index if not exists idx_col_ref_ref_id on public.collection_references(reference_id);

-- 6. Tabela de Snippets de Código
create table if not exists public.reference_code_snippets (
  id text primary key,
  reference_id text not null references public."references"(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  language text not null default 'tailwind',
  code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_snippets_ref_id on public.reference_code_snippets(reference_id);
create index if not exists idx_snippets_user_id on public.reference_code_snippets(user_id);

-- 7. Tabela de Arquivos Complementares (Anexos)
create table if not exists public.reference_attachments (
  id text primary key,
  reference_id text not null references public."references"(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size text,
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_attachments_ref_id on public.reference_attachments(reference_id);
create index if not exists idx_attachments_user_id on public.reference_attachments(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public."references" enable row level security;
alter table public.tags enable row level security;
alter table public.reference_tags enable row level security;
alter table public.projects enable row level security;
alter table public.project_references enable row level security;
alter table public.collections enable row level security;
alter table public.collection_references enable row level security;
alter table public.reference_code_snippets enable row level security;
alter table public.reference_attachments enable row level security;

-- Policies: Profiles
create policy "Usuários podem visualizar o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policies: References
create policy "Usuários podem visualizar apenas suas referências"
  on public."references" for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir referências para si mesmos"
  on public."references" for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar apenas suas próprias referências"
  on public."references" for update
  using (auth.uid() = user_id);

create policy "Usuários podem excluir apenas suas próprias referências"
  on public."references" for delete
  using (auth.uid() = user_id);

-- Policies: Tags
create policy "Usuários podem gerenciar suas próprias tags"
  on public.tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: Reference Tags (Join)
create policy "Usuários podem visualizar associações de tags de suas referências"
  on public.reference_tags for select
  using (exists (select 1 from public."references" r where r.id = reference_tags.reference_id and r.user_id = auth.uid()));

create policy "Usuários podem associar tags a suas referências"
  on public.reference_tags for insert
  with check (
    exists (select 1 from public."references" r where r.id = reference_tags.reference_id and r.user_id = auth.uid()) and
    exists (select 1 from public.tags t where t.id = reference_tags.tag_id and t.user_id = auth.uid())
  );

create policy "Usuários podem desassociar tags de suas referências"
  on public.reference_tags for delete
  using (exists (select 1 from public."references" r where r.id = reference_tags.reference_id and r.user_id = auth.uid()));

-- Policies: Projects
create policy "Usuários podem gerenciar seus próprios projetos"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: Project References (Join)
create policy "Usuários podem visualizar associações de seus projetos"
  on public.project_references for select
  using (exists (select 1 from public.projects p where p.id = project_references.project_id and p.user_id = auth.uid()));

create policy "Usuários podem associar referências a seus projetos"
  on public.project_references for insert
  with check (
    exists (select 1 from public.projects p where p.id = project_references.project_id and p.user_id = auth.uid()) and
    exists (select 1 from public."references" r where r.id = project_references.reference_id and r.user_id = auth.uid())
  );

create policy "Usuários podem desassociar referências de seus projetos"
  on public.project_references for delete
  using (exists (select 1 from public.projects p where p.id = project_references.project_id and p.user_id = auth.uid()));

-- Policies: Collections
create policy "Usuários podem gerenciar suas próprias coleções"
  on public.collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: Collection References (Join)
create policy "Usuários podem visualizar associações de suas coleções"
  on public.collection_references for select
  using (exists (select 1 from public.collections c where c.id = collection_references.collection_id and c.user_id = auth.uid()));

create policy "Usuários podem associar referências a suas coleções"
  on public.collection_references for insert
  with check (
    exists (select 1 from public.collections c where c.id = collection_references.collection_id and c.user_id = auth.uid()) and
    exists (select 1 from public."references" r where r.id = collection_references.reference_id and r.user_id = auth.uid())
  );

create policy "Usuários podem desassociar referências de suas coleções"
  on public.collection_references for delete
  using (exists (select 1 from public.collections c where c.id = collection_references.collection_id and c.user_id = auth.uid()));

-- Policies: Code Snippets
create policy "Usuários podem gerenciar trechos de código de suas referências"
  on public.reference_code_snippets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: Attachments
create policy "Usuários podem gerenciar anexos de suas referências"
  on public.reference_attachments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER PARA SINCRONIZAÇÃO DE PERFIL AUTOMÁTICA
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- BUCKET DE ARMAZENAMENTO PRIVADO (STORAGE)
-- ==============================================================================

-- Criar bucket se não existir
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'curator-media',
  'curator-media',
  false,
  15728640, -- 15MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml', 'application/pdf', 'application/json', 'text/css']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 15728640;

-- Storage RLS Policies
create policy "Usuários autenticados podem ver seus próprios arquivos"
  on storage.objects for select
  using (
    bucket_id = 'curator-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuários autenticados podem fazer upload de seus arquivos"
  on storage.objects for insert
  with check (
    bucket_id = 'curator-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuários autenticados podem atualizar seus próprios arquivos"
  on storage.objects for update
  using (
    bucket_id = 'curator-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuários autenticados podem excluir seus próprios arquivos"
  on storage.objects for delete
  using (
    bucket_id = 'curator-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
