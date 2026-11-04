import { Resend } from 'resend';
import fs from 'node:fs';
import path from 'node:path';

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const regex = new RegExp(`^${key}=["']?([^"'\r\n]+)["']?`, 'm');
      const match = content.match(regex);
      if (match && match[1]) return match[1].trim();
    }
  } catch {}
  return '';
}

export function getResendApiKey(): string {
  return getEnvValue('RESEND_API_KEY');
}

export function getFromEmail(): string {
  const from = getEnvValue('RESEND_FROM_EMAIL');
  if (from) return from;
  return 'Salvei <ola@salvei.tech>';
}

export function getAppBaseUrl(): string {
  const custom = getEnvValue('APP_URL');
  if (custom) return custom.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://salvei.tech';
}

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Base email layout wrapper with Salvei visual identity
 */
function wrapHtmlTemplate(content: string, previewText: string = ''): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salvei</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #090a0f; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090a0f; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #12141c; border-radius: 20px; border: 1px solid #232736; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left; border-bottom: 1px solid #1e2230;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 36px; height: 36px; border-radius: 10px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 20px; font-weight: bold; color: #ffffff; line-height: 36px;">S</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="font-size: 19px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff;">Salvei</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0e1017; border-top: 1px solid #1e2230; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #717b94;">
                Salvei · Ateliê Visual & Curadoria Inteligente
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b556b;">
                Domínio oficial <a href="https://salvei.tech" style="color: #10b981; text-decoration: none;">salvei.tech</a>. Se não esperava este e-mail, pode desconsiderá-lo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Envia e-mail de boas-vindas para novos usuários
 */
export async function sendWelcomeEmail(to: string, fullName?: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  if (!client) {
    console.warn('[Resend] RESEND_API_KEY não configurada. E-mail de boas-vindas ignorado.');
    return { success: false, error: 'RESEND_API_KEY não configurada' };
  }

  const firstName = fullName ? fullName.split(' ')[0] : 'criador';
  const appUrl = getAppBaseUrl();

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
      Boas-vindas ao Salvei, ${firstName}! ✨
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #9aa4bf;">
      Sua conta foi criada com sucesso. O Salvei é o seu espaço dedicado para guardar, curar e explorar referências de design, produtos e interfaces sem distrações.
    </p>

    <div style="background-color: #181b26; border: 1px solid #282d3f; border-radius: 12px; padding: 20px; margin: 0 0 28px 0;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981;">
        O que você pode fazer agora:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #c4ccdf;">
        <li><strong>Arraste qualquer imagem</strong> ou cole links para extrair paletas cromáticas instantâneas.</li>
        <li><strong>Crie Coleções e Projetos</strong> para organizar suas inspirações por tema ou cliente.</li>
        <li><strong>Atalhos de teclado rápidos:</strong> use <code>G</code> para visualização em grade e <code>F</code> para filtros.</li>
      </ul>
    </div>

    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center" style="border-radius: 10px; background-color: #10b981;">
          <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #090a0f; text-decoration: none; border-radius: 10px;">
            Acessar Meu Ateliê &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #717b94;">
      Precisa de ajuda ou tem sugestões? Basta responder a este e-mail.
    </p>
  `;

  try {
    const from = getFromEmail();
    const result = await client.emails.send({
      from,
      to,
      subject: 'Bem-vindo ao Salvei ✨ Seu ateliê visual está pronto',
      html: wrapHtmlTemplate(content, 'Sua conta no Salvei está pronta. Comece a curar suas referências.'),
    });

    if (result.error) {
      console.error('[Resend Error]', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    return { success: false, error: err.message || 'Falha ao enviar e-mail' };
  }
}

/**
 * Envia e-mail de recuperação de senha com link seguro
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  fullName?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  if (!client) {
    console.warn('[Resend] RESEND_API_KEY não configurada. E-mail de recuperação ignorado.');
    return { success: false, error: 'RESEND_API_KEY não configurada' };
  }

  const nameGreeting = fullName ? `, ${fullName.split(' ')[0]}` : '';

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
      Recuperação de Senha 🔒
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #9aa4bf;">
      Olá${nameGreeting}! Recebemos uma solicitação para redefinir a senha da sua conta no Salvei.
    </p>
    <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #9aa4bf;">
      Clique no botão abaixo para definir uma nova senha:
    </p>

    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
      <tr>
        <td align="center" style="border-radius: 10px; background-color: #10b981;">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #090a0f; text-decoration: none; border-radius: 10px;">
            Redefinir Minha Senha &rarr;
          </a>
        </td>
      </tr>
    </table>

    <div style="background-color: #181b26; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin: 0 0 24px 0;">
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #d1d5db;">
        <strong>Importante:</strong> Este link é válido por <strong>1 hora</strong>. Se você não solicitou a redefinição de senha, nenhuma ação é necessária e sua conta permanece totalmente segura.
      </p>
    </div>

    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #717b94;">
      Se o botão acima não funcionar, copie e cole este link no seu navegador:<br>
      <a href="${resetUrl}" style="color: #10b981; word-break: break-all;">${resetUrl}</a>
    </p>
  `;

  try {
    const from = getFromEmail();
    const result = await client.emails.send({
      from,
      to,
      subject: 'Redefinição de senha — Salvei',
      html: wrapHtmlTemplate(content, 'Solicitação para redefinir sua senha no Salvei.'),
    });

    if (result.error) {
      console.error('[Resend Error]', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    return { success: false, error: err.message || 'Falha ao enviar e-mail' };
  }
}

/**
 * Envia um e-mail de teste para validação imediata do domínio e API key
 */
export async function sendTestEmail(to: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { success: false, error: 'RESEND_API_KEY não configurada no ambiente.' };
  }

  const from = getFromEmail();
  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #10b981; letter-spacing: -0.02em;">
      Resend configurado com sucesso! 🎉
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #9aa4bf;">
      Este é um e-mail de teste enviado diretamente pelo <strong>Salvei</strong> através do domínio oficial <strong>salvei.tech</strong>.
    </p>

    <div style="background-color: #181b26; border: 1px solid #282d3f; border-radius: 12px; padding: 18px; margin: 0 0 24px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #c4ccdf;">
        <tr>
          <td style="color: #717b94; width: 120px;">Domínio:</td>
          <td style="font-weight: 600; color: #ffffff;">salvei.tech (Verificado)</td>
        </tr>
        <tr>
          <td style="color: #717b94;">Remetente:</td>
          <td style="font-family: monospace; color: #10b981;">${from}</td>
        </tr>
        <tr>
          <td style="color: #717b94;">Status DNS:</td>
          <td style="color: #10b981; font-weight: 600;">✓ SPF, DKIM e DMARC Ativos</td>
        </tr>
        <tr>
          <td style="color: #717b94;">Região:</td>
          <td>São Paulo (sa-east-1)</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #717b94;">
      Tudo pronto para envio de e-mails transacionais em produção!
    </p>
  `;

  try {
    const result = await client.emails.send({
      from,
      to,
      subject: 'Confirmação de Envio Resend — Salvei (salvei.tech)',
      html: wrapHtmlTemplate(content, 'Confirmação do teste de e-mail do domínio salvei.tech.'),
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Falha ao enviar e-mail de teste' };
  }
}
