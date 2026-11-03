import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_Ae5UkguPb9xq@ep-snowy-glade-b6yep62k.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function main() {
  console.log('Limpando todas as tabelas do banco Neon...');

  await sql`
    TRUNCATE TABLE 
      reference_attachments,
      reference_code_snippets,
      reference_tags,
      project_references,
      collection_references,
      "references",
      tags,
      projects,
      collections,
      profiles,
      users
    CASCADE;
  `;

  console.log('✓ Todas as tabelas no Neon foram esvaziadas (TRUNCATE CASCADE)');

  // Clean public/uploads
  const uploadDir = path.resolve('public/uploads');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const f of files) {
      if (f !== '.gitkeep') {
        fs.unlinkSync(path.join(uploadDir, f));
      }
    }
    console.log(`✓ Pasta public/uploads limpa (${files.length} arquivos removidos)`);
  }

  // Verify counts
  const res = await sql`
    SELECT 
      (SELECT count(*) FROM users) as users_count,
      (SELECT count(*) FROM profiles) as profiles_count,
      (SELECT count(*) FROM "references") as refs_count,
      (SELECT count(*) FROM tags) as tags_count,
      (SELECT count(*) FROM projects) as projects_count,
      (SELECT count(*) FROM collections) as collections_count;
  `;

  console.log('STATUS FINAL DO BANCO NEON:', res[0]);
}

main().catch(err => {
  console.error('Falha ao limpar banco:', err);
  process.exit(1);
});
