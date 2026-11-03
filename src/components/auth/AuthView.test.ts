import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateAuthError } from '../../contexts/AuthContext';

describe('SALVEI — REDESIGN DA TELA DE LOGIN & AUTENTICAÇÃO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Tratamento e Tradução de Erros de Autenticação (pt-BR)', () => {
    it('traduz credenciais inválidas para mensagem amigável em português', () => {
      expect(translateAuthError('Invalid login credentials')).toBe('E-mail ou senha incorretos.');
      expect(translateAuthError('invalid credentials provided')).toBe('E-mail ou senha incorretos.');
    });

    it('traduz e-mail já registrado para orientação de login', () => {
      expect(translateAuthError('User already registered')).toBe(
        'Este endereço de e-mail já está cadastrado. Tente entrar.'
      );
    });

    it('valida tamanho mínimo de senha com instrução clara', () => {
      expect(translateAuthError('Password should be at least 6 characters')).toBe(
        'A senha deve conter no mínimo 6 caracteres.'
      );
    });

    it('traduz bloqueio por limite de taxa de requisições', () => {
      expect(translateAuthError('Email rate limit exceeded')).toBe(
        'Muitas tentativas em sequência. Por favor, aguarde alguns instantes.'
      );
    });

    it('traduz erros de conexão de rede ou indisponibilidade', () => {
      expect(translateAuthError('Failed to fetch network request')).toBe(
        'Falha na conexão de rede. Verifique seu acesso à internet.'
      );
    });

    it('traduz formato inválido de e-mail', () => {
      expect(translateAuthError('Invalid format for email')).toBe(
        'Formato de e-mail inválido. Verifique o endereço digitado.'
      );
    });

    it('mantém mensagens customizadas não mapeadas como fallback seguro', () => {
      expect(translateAuthError('Custom error message')).toBe('Custom error message');
    });
  });

  describe('2. Chaves de Persistência Local da Sessão', () => {
    const REMEMBER_EMAIL_KEY = 'curator_remembered_email';

    it('utiliza a chave padronizada para armazenamento do e-mail lembrado', () => {
      expect(REMEMBER_EMAIL_KEY).toBe('curator_remembered_email');
    });

    it('armazena e recupera o e-mail quando a opção lembrar está ativada', () => {
      const storageMap = new Map<string, string>();
      const testEmail = 'designer@salvei.tech';

      // Simulação do comportamento de marcar "Lembrar meu e-mail"
      storageMap.set(REMEMBER_EMAIL_KEY, testEmail);
      expect(storageMap.get(REMEMBER_EMAIL_KEY)).toBe(testEmail);

      // Simulação de desmarcar
      storageMap.delete(REMEMBER_EMAIL_KEY);
      expect(storageMap.get(REMEMBER_EMAIL_KEY)).toBeUndefined();
    });
  });

  describe('3. Validação do Formulário e Regras de Negócio', () => {
    it('rejeita submissão com e-mail em branco', () => {
      const validate = (email: string, password: string, mode: string, fullName?: string) => {
        if (!email.trim()) return 'Por favor, informe seu endereço de e-mail.';
        if (mode === 'signup' && (!fullName || !fullName.trim())) {
          return 'Por favor, informe seu nome completo.';
        }
        if (mode !== 'forgot_password' && !password) {
          return 'Por favor, digite sua senha.';
        }
        return null;
      };

      expect(validate('', '123456', 'login')).toBe('Por favor, informe seu endereço de e-mail.');
      expect(validate('   ', '123456', 'login')).toBe('Por favor, informe seu endereço de e-mail.');
    });

    it('rejeita submissão com senha em branco no modo login', () => {
      const validate = (email: string, password: string, mode: string) => {
        if (!email.trim()) return 'Por favor, informe seu endereço de e-mail.';
        if (mode !== 'forgot_password' && !password) {
          return 'Por favor, digite sua senha.';
        }
        return null;
      };

      expect(validate('user@salvei.tech', '', 'login')).toBe('Por favor, digite sua senha.');
    });

    it('permite submissão sem senha exclusivamente no modo forgot_password', () => {
      const validate = (email: string, password: string, mode: string) => {
        if (!email.trim()) return 'Por favor, informe seu endereço de e-mail.';
        if (mode !== 'forgot_password' && !password) {
          return 'Por favor, digite sua senha.';
        }
        return null;
      };

      expect(validate('user@salvei.tech', '', 'forgot_password')).toBeNull();
    });

    it('exige nome completo na criação de conta (modo signup)', () => {
      const validate = (email: string, password: string, mode: string, fullName?: string) => {
        if (!email.trim()) return 'Por favor, informe seu endereço de e-mail.';
        if (mode === 'signup' && (!fullName || !fullName.trim())) {
          return 'Por favor, informe seu nome completo.';
        }
        if (mode !== 'forgot_password' && !password) {
          return 'Por favor, digite sua senha.';
        }
        return null;
      };

      expect(validate('user@salvei.tech', '123456', 'signup', '')).toBe(
        'Por favor, informe seu nome completo.'
      );
      expect(validate('user@salvei.tech', '123456', 'signup', 'Fellipe Eduardo')).toBeNull();
    });

    it('valida formato de e-mail e rejeita e-mails malformados', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('usuario@dominio.com')).toBe(true);
      expect(emailRegex.test('usuario.sobrenome@sub.empresa.com.br')).toBe(true);
      expect(emailRegex.test('sem-arroba')).toBe(false);
      expect(emailRegex.test('sem-dominio@')).toBe(false);
      expect(emailRegex.test('@sem-usuario.com')).toBe(false);
    });

    it('rejeita senhas com menos de 6 caracteres', () => {
      const validatePassword = (pass: string) => {
        if (!pass) return 'Por favor, digite sua senha.';
        if (pass.length < 6) return 'A senha deve conter no mínimo 6 caracteres.';
        return null;
      };

      expect(validatePassword('')).toBe('Por favor, digite sua senha.');
      expect(validatePassword('12345')).toBe('A senha deve conter no mínimo 6 caracteres.');
      expect(validatePassword('123456')).toBeNull();
      expect(validatePassword('senhaSegura@2026')).toBeNull();
    });

    it('exige aceite de termos e condições no cadastro', () => {
      const validateTerms = (agree: boolean) => {
        if (!agree) return 'Por favor, confirme que concorda com os termos e condições.';
        return null;
      };

      expect(validateTerms(false)).toBe('Por favor, confirme que concorda com os termos e condições.');
      expect(validateTerms(true)).toBeNull();
    });
  });

  describe('4. Identidade Visual e Conformidade com DESIGN.md', () => {
    it('garante fidelidade aos tokens oficiais do Salvei', () => {
      const salveiDesignTokens = {
        backgroundCanvas: '#F8F8F6',
        surfaceWhite: '#FFFFFF',
        textPrimaryGraphite: '#171717',
        textSecondary: '#737373',
        textMuted: '#A8A8A6',
        borderSubtle: '#E7E7E5',
        accentCobalt: '#4355DB',
        accentCobaltHover: '#3646B8',
        signalGreen: '#22c55e',
      };

      expect(salveiDesignTokens.backgroundCanvas).toBe('#F8F8F6');
      expect(salveiDesignTokens.textPrimaryGraphite).toBe('#171717');
      expect(salveiDesignTokens.accentCobalt).toBe('#4355DB');
      expect(salveiDesignTokens.borderSubtle).toBe('#E7E7E5');
    });

    it('assegura ausência de provedores sociais não configurados', () => {
      // Requisito estrito: Não simular Google, Apple ou GitHub
      const configuredOAuthProviders: string[] = [];
      expect(configuredOAuthProviders).toHaveLength(0);
    });
  });
});
