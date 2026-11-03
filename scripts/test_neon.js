import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Ae5UkguPb9xq@ep-snowy-glade-b6yep62k.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

async function main() {
  const result = await sql`SELECT version(), now() as current_time`;
  console.log('SUCCESS_NEON_QUERY:', result[0]);
}

main().catch(err => {
  console.error('NEON_ERROR:', err);
  process.exit(1);
});
