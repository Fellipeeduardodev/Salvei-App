export default function handler(req: any, res: any) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    ok: true,
    version: '1.0.1',
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    resendFrom: process.env.RESEND_FROM_EMAIL || 'Salvei <ola@salvei.tech>',
    appUrl: process.env.APP_URL || 'https://salvei.tech',
    node: process.version,
    timestamp: new Date().toISOString(),
  }));
}

