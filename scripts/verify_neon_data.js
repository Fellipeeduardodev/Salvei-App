import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Ae5UkguPb9xq@ep-snowy-glade-b6yep62k.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

async function main() {
  const counts = await sql`
    SELECT 
      (SELECT count(*) FROM users) as users_count,
      (SELECT count(*) FROM profiles) as profiles_count,
      (SELECT count(*) FROM "references") as references_count,
      (SELECT count(*) FROM tags) as tags_count,
      (SELECT count(*) FROM reference_tags) as ref_tags_count,
      (SELECT count(*) FROM projects) as projects_count,
      (SELECT count(*) FROM collections) as collections_count;
  `;
  console.log('CONTAGEM NO NEON:', counts[0]);

  const refs = await sql`SELECT id, title, domain, is_favorite FROM "references" LIMIT 5;`;
  console.log('EXEMPLOS DE REFERÊNCIAS NO NEON:', refs);
}

main().catch(err => console.error(err));
