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
  let from = getEnvValue('RESEND_FROM_EMAIL');
  // Se estiver com o 'ola@' antigo ou em branco, padroniza para contato@salvei.tech
  if (!from || from.includes('ola@')) {
    from = 'contato@salvei.tech';
  }
  // Garante o nome de exibição oficial "Salvei" no cabeçalho do cliente de e-mail (Gmail/Outlook)
  if (!from.includes('<')) {
    return `Salvei <${from}>`;
  }
  return from;
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
 * Base email layout wrapper with Salvei official visual identity (Cobalt / Indigo Dark)
 */
function wrapHtmlTemplate(content: string, previewText: string = ''): string {
  const appUrl = getAppBaseUrl();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salvei</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: -apple-system, Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0A0B10; color: #F1F4FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0B10; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #12141D; border-radius: 18px; border: 1px solid #1E2130; overflow: hidden; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);">
          <!-- Top Gradient Accent Bar -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #4A4CFF 0%, #7678FF 50%, #3032D6 100%); line-height: 3px; font-size: 1px;">&nbsp;</td>
          </tr>

          <!-- Header with Official Logo -->
          <tr>
            <td style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #1A1D2B;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <a href="${appUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${appUrl}/brand/icon-192.png" width="36" height="36" alt="Salvei" style="display: block; width: 36px; height: 36px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08);" />
                    </a>
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.04em; color: #FFFFFF; display: block; line-height: 1;">salvei</span>
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9C9EFF; background-color: rgba(74, 76, 255, 0.14); border: 1px solid rgba(74, 76, 255, 0.32); border-radius: 6px; line-height: 1;">Ateliê Visual</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 32px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0D0E15; border-top: 1px solid #1A1D2B; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 500; color: #7B849D;">
                Salvei · Ateliê Visual & Curadoria Inteligente
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #4E556C;">
                Enviado com segurança a partir de <a href="${appUrl}" style="color: #6C6EFF; text-decoration: none; font-weight: 500;">salvei.tech</a>. Se não solicitou, basta ignorar.
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
    <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.025em; line-height: 1.3;">
      Boas-vindas ao Salvei, ${firstName}! ✨
    </h1>
    <p style="margin: 0 0 22px 0; font-size: 15px; line-height: 1.65; color: #9AA3BB;">
      Sua conta está criada e pronta. O Salvei é seu espaço dedicado para guardar, curar e conectar referências visuais com inteligência e velocidade.
    </p>

    <!-- Checklist / Features Box -->
    <div style="background-color: #171924; border: 1px solid #23273A; border-radius: 12px; padding: 20px; margin: 0 0 28px 0;">
      <p style="margin: 0 0 14px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7678FF;">
        Primeiros passos no ateliê:
      </p>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; line-height: 1.5; color: #CBD3E3;">
            <strong style="color: #FFFFFF;">• Capture Inspirações:</strong> Arraste imagens ou cole URLs para extração automática de paleta de cores.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; line-height: 1.5; color: #CBD3E3;">
            <strong style="color: #FFFFFF;">• Organize com Foco:</strong> Separe suas referências por Projetos e Coleções temáticas.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; line-height: 1.5; color: #CBD3E3;">
            <strong style="color: #FFFFFF;">• Navegação Pro:</strong> Pressione <code style="background-color: #0F1017; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #9C9EFF;">G</code> para grade e <code style="background-color: #0F1017; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #9C9EFF;">F</code> para filtros rápidos.
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #4A4CFF 0%, #3032D6 100%);">
          <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 16px rgba(74, 76, 255, 0.35); letter-spacing: -0.01em;">
            Acessar Meu Ateliê &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #6E7690;">
      Dúvidas ou sugestões? Basta responder a esta mensagem a qualquer momento.
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
    <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.025em; line-height: 1.3;">
      Recuperação de Senha
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #9AA3BB;">
      Olá${nameGreeting}! Recebemos uma solicitação para redefinir a senha de acesso à sua conta no Salvei.
    </p>
    <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: #9AA3BB;">
      Clique no botão abaixo para definir sua nova senha com segurança:
    </p>

    <!-- CTA Button -->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
      <tr>
        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #4A4CFF 0%, #3032D6 100%);">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 18px rgba(74, 76, 255, 0.38); letter-spacing: -0.01em;">
            Redefinir Minha Senha &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Security Notice Card -->
    <div style="background-color: #171924; border: 1px solid #23273A; border-left: 3px solid #4A4CFF; border-radius: 10px; padding: 16px; margin: 0 0 24px 0;">
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #CBD3E3;">
        <strong style="color: #FFFFFF;">Validade de 1 hora:</strong> Este link foi gerado de forma segura e expira automaticamente em 60 minutos. Se você não fez essa solicitação, nenhuma ação é necessária e sua senha atual permanece protegida.
      </p>
    </div>

    <!-- Direct URL Fallback -->
    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #6E7690;">
      Se o botão acima não abrir, copie e cole este link seguro no navegador:<br>
      <a href="${resetUrl}" style="color: #6C6EFF; text-decoration: underline; word-break: break-all;">${resetUrl}</a>
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
    <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.025em; line-height: 1.3;">
      E-mail do Salvei Configurado! ✨
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.65; color: #9AA3BB;">
      Este é um e-mail oficial de teste enviado com o novo design do <strong>Salvei</strong> através do domínio <strong>salvei.tech</strong>.
    </p>

    <div style="background-color: #171924; border: 1px solid #23273A; border-radius: 12px; padding: 18px; margin: 0 0 24px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #CBD3E3;">
        <tr>
          <td style="color: #6E7690; width: 120px;">Domínio:</td>
          <td style="font-weight: 600; color: #FFFFFF;">salvei.tech</td>
        </tr>
        <tr>
          <td style="color: #6E7690;">Remetente:</td>
          <td style="font-family: monospace; color: #9C9EFF;">${from}</td>
        </tr>
        <tr>
          <td style="color: #6E7690;">Identidade:</td>
          <td style="color: #4A4CFF; font-weight: 600;">Doop Design System 2.0 (Cobalt)</td>
        </tr>
        <tr>
          <td style="color: #6E7690;">Status:</td>
          <td style="color: #10B981; font-weight: 600;">✓ Autenticado via Resend</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #6E7690;">
      Seu sistema de e-mails transacionais está pronto para operar em produção!
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
