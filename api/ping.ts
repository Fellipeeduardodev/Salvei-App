export default function handler(req: any, res: any) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    ok: true,
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    node: process.version,
  }));
}
