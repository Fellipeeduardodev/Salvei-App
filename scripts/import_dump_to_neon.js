import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Ae5UkguPb9xq@ep-snowy-glade-b6yep62k.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

async function main() {
  console.log('Lendo dados exportados do Supabase...');
  const raw = fs.readFileSync('C:/Users/HondG/.gemini/antigravity-cli/brain/c8e162fa-c2e8-4816-a15a-98a4dde1efca/.system_generated/steps/689/output.txt', 'utf8');
  
  const outer = JSON.parse(raw);
  const match = outer.result.match(/<untrusted-data-[^>]+>\s*(\[\{.*?\}\])\s*<\/untrusted-data-/s);
  if (!match) throw new Error('Não foi possível extrair os dados do dump');
  
  const parsed = JSON.parse(match[1]);
  const dump = parsed[0].dump;

  console.log(`Dados encontrados no dump:`);
  console.log(`- Perfis: ${dump.profiles.length}`);
  console.log(`- Referências: ${dump.references.length}`);
  console.log(`- Tags: ${dump.tags.length}`);
  console.log(`- Projetos: ${dump.projects.length}`);
  console.log(`- Coleções: ${dump.collections.length}`);

  // 1. Users
  for (const p of dump.profiles) {
    await sql.query(
      `INSERT INTO users (id, email, full_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name`,
      [p.id, p.email, p.full_name, p.created_at, p.updated_at]
    );
  }
  console.log('✓ Usuários sincronizados');

  // 2. Profiles
  for (const p of dump.profiles) {
    await sql.query(
      `INSERT INTO profiles (id, email, full_name, avatar_url, onboarding_completed, preferences, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         avatar_url = EXCLUDED.avatar_url,
         onboarding_completed = EXCLUDED.onboarding_completed,
         preferences = EXCLUDED.preferences`,
      [
        p.id,
        p.email,
        p.full_name,
        p.avatar_url,
        p.onboarding_completed ?? true,
        JSON.stringify(p.preferences || {}),
        p.created_at,
        p.updated_at
      ]
    );
  }
  console.log('✓ Perfis sincronizados');

  // 3. References
  for (const r of dump.references) {
    await sql.query(
      `INSERT INTO "references" (id, user_id, title, url, domain, screenshot_url, image_storage_path, screenshot_status, source_type, original_file_name, notes_markdown, is_favorite, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         url = EXCLUDED.url,
         domain = EXCLUDED.domain,
         screenshot_url = EXCLUDED.screenshot_url,
         notes_markdown = EXCLUDED.notes_markdown,
         is_favorite = EXCLUDED.is_favorite`,
      [
        r.id,
        r.user_id,
        r.title,
        r.url,
        r.domain,
        r.screenshot_url,
        r.image_storage_path,
        r.screenshot_status,
        r.source_type,
        r.original_file_name,
        r.notes_markdown,
        r.is_favorite || false,
        r.created_at,
        r.updated_at
      ]
    );
  }
  console.log('✓ Referências sincronizadas');

  // 4. Tags
  for (const t of dump.tags) {
    await sql.query(
      `INSERT INTO tags (id, user_id, name, slug, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug`,
      [t.id, t.user_id, t.name, t.slug, t.created_at]
    );
  }
  console.log('✓ Tags sincronizadas');

  // 5. Reference Tags
  for (const rt of dump.reference_tags) {
    await sql.query(
      `INSERT INTO reference_tags (reference_id, tag_id, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (reference_id, tag_id) DO NOTHING`,
      [rt.reference_id, rt.tag_id, rt.created_at]
    );
  }
  console.log('✓ Vínculos de Tags sincronizados');

  // 6. Projects
  for (const pr of dump.projects) {
    await sql.query(
      `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [pr.id, pr.user_id, pr.name, pr.description, pr.created_at, pr.updated_at]
    );
  }
  console.log('✓ Projetos sincronizados');

  // 7. Project References
  for (const pref of dump.project_references) {
    await sql.query(
      `INSERT INTO project_references (project_id, reference_id, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, reference_id) DO NOTHING`,
      [pref.project_id, pref.reference_id, pref.created_at]
    );
  }
  console.log('✓ Vínculos de Projetos sincronizados');

  // 8. Collections
  for (const c of dump.collections) {
    await sql.query(
      `INSERT INTO collections (id, user_id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [c.id, c.user_id, c.name, c.description, c.created_at, c.updated_at]
    );
  }
  console.log('✓ Coleções sincronizadas');

  // 9. Collection References
  for (const cref of dump.collection_references) {
    await sql.query(
      `INSERT INTO collection_references (collection_id, reference_id, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (collection_id, reference_id) DO NOTHING`,
      [cref.collection_id, cref.reference_id, cref.created_at]
    );
  }
  console.log('✓ Vínculos de Coleções sincronizados');

  console.log('\nTODOS OS DADOS FORAM IMPORTADOS COM SUCESSO PARA O NEON!');
}

main().catch(err => {
  console.error('Falha na importação:', err);
  process.exit(1);
});
