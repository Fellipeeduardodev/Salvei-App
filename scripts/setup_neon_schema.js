import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Ae5UkguPb9xq@ep-snowy-glade-b6yep62k.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

async function run(query, label) {
  await sql.query(query);
  if (label) console.log(`✓ ${label}`);
}

async function main() {
  console.log('Criando tabelas e esquemas no Neon (São Paulo)...');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      full_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Tabela users');

  await run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email TEXT,
      full_name TEXT,
      avatar_url TEXT,
      onboarding_completed BOOLEAN DEFAULT false,
      preferences JSONB DEFAULT '{"theme": "light", "shortcuts_enabled": true, "default_view": "inbox", "compact_cards": false}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Tabela profiles');

  await run(`
    CREATE TABLE IF NOT EXISTS "references" (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      url TEXT,
      domain TEXT,
      screenshot_url TEXT,
      image_storage_path TEXT,
      screenshot_status TEXT NOT NULL DEFAULT 'none' CHECK (screenshot_status IN ('none', 'pending', 'ready', 'failed')),
      source_type TEXT NOT NULL DEFAULT 'url' CHECK (source_type IN ('url', 'image', 'both')),
      original_file_name TEXT,
      notes_markdown TEXT NOT NULL DEFAULT '',
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Tabela references');

  await run('CREATE INDEX IF NOT EXISTS idx_references_user_id ON "references"(user_id);');
  await run('CREATE INDEX IF NOT EXISTS idx_references_created_at ON "references"(created_at desc);');
  await run('CREATE INDEX IF NOT EXISTS idx_references_domain ON "references"(domain);');
  await run('CREATE INDEX IF NOT EXISTS idx_references_is_favorite ON "references"(user_id, is_favorite);', 'Índices references');

  await run(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT uq_tags_user_slug UNIQUE (user_id, slug)
    );
  `, 'Tabela tags');

  await run('CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);', 'Índices tags');

  await run(`
    CREATE TABLE IF NOT EXISTS reference_tags (
      reference_id TEXT NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (reference_id, tag_id)
    );
  `, 'Tabela reference_tags');

  await run('CREATE INDEX IF NOT EXISTS idx_ref_tags_ref_id ON reference_tags(reference_id);');
  await run('CREATE INDEX IF NOT EXISTS idx_ref_tags_tag_id ON reference_tags(tag_id);', 'Índices reference_tags');

  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Tabela projects');

  await run('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);', 'Índices projects');

  await run(`
    CREATE TABLE IF NOT EXISTS project_references (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      reference_id TEXT NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (project_id, reference_id)
    );
  `, 'Tabela project_references');

  await run('CREATE INDEX IF NOT EXISTS idx_proj_ref_proj_id ON project_references(project_id);');
  await run('CREATE INDEX IF NOT EXISTS idx_proj_ref_ref_id ON project_references(reference_id);', 'Índices project_references');

  await run(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Tabela collections');

  await run('CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);', 'Índices collections');

  await run(`
    CREATE TABLE IF NOT EXISTS collection_references (
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      reference_id TEXT NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (collection_id, reference_id)
    );
  `, 'Tabela collection_references');

  await run('CREATE INDEX IF NOT EXISTS idx_col_ref_col_id ON collection_references(collection_id);');
  await run('CREATE INDEX IF NOT EXISTS idx_col_ref_ref_id ON collection_references(reference_id);', 'Índices collection_references');

  await run(`
    CREATE TABLE IF NOT EXISTS reference_code_snippets (
      id TEXT PRIMARY KEY,
      reference_id TEXT NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'tailwind',
      code TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Tabela reference_code_snippets');

  await run(`
    CREATE TABLE IF NOT EXISTS reference_attachments (
      id TEXT PRIMARY KEY,
      reference_id TEXT NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size TEXT,
      storage_path TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Tabela reference_attachments');

  console.log('\nEsquema completo criado com sucesso no Neon!');
}

main().catch(err => {
  console.error('Falha ao criar esquema:', err);
  process.exit(1);
});
