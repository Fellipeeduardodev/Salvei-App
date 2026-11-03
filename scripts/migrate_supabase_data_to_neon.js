import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';

const supabaseUrl = 'https://dnldulbmdmvscypvfjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubGR1bGJtZG12c2N5cHZmanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1NDE4MzQsImV4cCI6MjEwODExNzgzNH0.DUsvuWdm3R4GW1L2I8PWZ8VNNQXPQziJHvdA4OoS20I';
const supabase = createClient(supabaseUrl, supabaseKey);

const databaseUrl = 'postgresql://neondb_owner:npg_Ae5UkguPb9xq@ep-snowy-glade-b6yep62k.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

async function main() {
  console.log('Iniciando migração de dados do Supabase para o Neon...\n');

  // 1. Users & Profiles
  // Fellipe Eduardo
  const fellipeUser = {
    id: 'e8af1a62-23ab-4a5a-b262-8480fe38200e',
    email: 'fellipeeduardo1611@gmail.com',
    full_name: 'Fellipe Eduardo'
  };
  await sql.query(
    `INSERT INTO users (id, email, full_name) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name`,
    [fellipeUser.id, fellipeUser.email, fellipeUser.full_name]
  );
  console.log('✓ Usuário Fellipe inserido em users');

  // Profiles
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*');
  if (profErr) console.warn('Erro ao ler profiles:', profErr.message);
  else if (profiles) {
    for (const p of profiles) {
      await sql.query(
        `INSERT INTO profiles (id, email, full_name, avatar_url, onboarding_completed, preferences)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET 
           email = EXCLUDED.email, 
           full_name = EXCLUDED.full_name,
           avatar_url = EXCLUDED.avatar_url,
           onboarding_completed = EXCLUDED.onboarding_completed,
           preferences = EXCLUDED.preferences`,
        [p.id, p.email, p.full_name, p.avatar_url, p.onboarding_completed || true, JSON.stringify(p.preferences || {})]
      );
    }
    console.log(`✓ ${profiles.length} perfis migrados`);
  }

  // 2. References
  const { data: refs, error: refsErr } = await supabase.from('references').select('*');
  if (refsErr) console.warn('Erro ao ler references:', refsErr.message);
  else if (refs) {
    for (const r of refs) {
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
          r.id, r.user_id, r.title, r.url, r.domain, r.screenshot_url, r.image_storage_path,
          r.screenshot_status, r.source_type, r.original_file_name, r.notes_markdown,
          r.is_favorite || false, r.created_at, r.updated_at
        ]
      );
    }
    console.log(`✓ ${refs.length} referências migradas`);
  }

  // 3. Tags
  const { data: tags, error: tagsErr } = await supabase.from('tags').select('*');
  if (tagsErr) console.warn('Erro ao ler tags:', tagsErr.message);
  else if (tags) {
    for (const t of tags) {
      await sql.query(
        `INSERT INTO tags (id, user_id, name, slug, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.user_id, t.name, t.slug, t.created_at]
      );
    }
    console.log(`✓ ${tags.length} tags migradas`);
  }

  // 4. Reference Tags
  const { data: refTags, error: rtErr } = await supabase.from('reference_tags').select('*');
  if (rtErr) console.warn('Erro ao ler reference_tags:', rtErr.message);
  else if (refTags) {
    for (const rt of refTags) {
      await sql.query(
        `INSERT INTO reference_tags (reference_id, tag_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [rt.reference_id, rt.tag_id, rt.created_at]
      );
    }
    console.log(`✓ ${refTags.length} vínculos de tags migrados`);
  }

  // 5. Projects
  const { data: projs, error: projsErr } = await supabase.from('projects').select('*');
  if (projsErr) console.warn('Erro ao ler projects:', projsErr.message);
  else if (projs) {
    for (const pr of projs) {
      await sql.query(
        `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [pr.id, pr.user_id, pr.name, pr.description, pr.created_at, pr.updated_at]
      );
    }
    console.log(`✓ ${projs.length} projetos migrados`);
  }

  // 6. Project References
  const { data: projRefs, error: prErr } = await supabase.from('project_references').select('*');
  if (prErr) console.warn('Erro ao ler project_references:', prErr.message);
  else if (projRefs) {
    for (const pr of projRefs) {
      await sql.query(
        `INSERT INTO project_references (project_id, reference_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [pr.project_id, pr.reference_id, pr.created_at]
      );
    }
    console.log(`✓ ${projRefs.length} vínculos de projetos migrados`);
  }

  // 7. Collections
  const { data: cols, error: colsErr } = await supabase.from('collections').select('*');
  if (colsErr) console.warn('Erro ao ler collections:', colsErr.message);
  else if (cols) {
    for (const c of cols) {
      await sql.query(
        `INSERT INTO collections (id, user_id, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [c.id, c.user_id, c.name, c.description, c.created_at, c.updated_at]
      );
    }
    console.log(`✓ ${cols.length} coleções migradas`);
  }

  // 8. Collection References
  const { data: colRefs, error: crErr } = await supabase.from('collection_references').select('*');
  if (crErr) console.warn('Erro ao ler collection_references:', crErr.message);
  else if (colRefs) {
    for (const cr of colRefs) {
      await sql.query(
        `INSERT INTO collection_references (collection_id, reference_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [cr.collection_id, cr.reference_id, cr.created_at]
      );
    }
    console.log(`✓ ${colRefs.length} vínculos de coleções migrados`);
  }

  console.log('\nMigração de dados do Supabase para o Neon concluída com sucesso!');
}

main().catch(err => {
  console.error('Falha na migração:', err);
  process.exit(1);
});
