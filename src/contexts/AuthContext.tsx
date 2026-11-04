import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export interface User {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
  created_at?: string;
}

export interface Session {
  access_token: string;
  user: User;
  expires_at?: number;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NEON_USER_KEY = 'salvei_neon_user';
const NEON_SESSION_KEY = 'salvei_neon_session';

export function translateAuthError(errorMessage: string): string {
  const lower = errorMessage.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials') || lower.includes('não encontrado')) {
    return 'E-mail ou senha incorretos.';
  }
  if (lower.includes('already registered') || lower.includes('user already exists') || lower.includes('já cadastrado')) {
    return 'Este endereço de e-mail já está cadastrado. Tente entrar.';
  }
  if (lower.includes('at least 6 characters') || lower.includes('password should be at least')) {
    return 'A senha deve conter no mínimo 6 caracteres.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Muitas tentativas em sequência. Por favor, aguarde alguns instantes.';
  }
  if (lower.includes('invalid format') || lower.includes('valid email')) {
    return 'Formato de e-mail inválido. Verifique o endereço digitado.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Falha na conexão de rede. Verifique seu acesso à internet.';
  }
  if (
    lower.includes('unexpected token') ||
    lower.includes('is not valid json') ||
    lower.includes('the page could not be found')
  ) {
    return 'Serviço temporariamente indisponível. Tente novamente em instantes.';
  }
  return errorMessage;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = true;

  // 1. Initial session load from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(NEON_USER_KEY);
      const storedSession = localStorage.getItem(NEON_SESSION_KEY);

      if (storedUser && storedSession) {
        setUser(JSON.parse(storedUser));
        setSession(JSON.parse(storedSession));
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      } else {
        return {
          error: res.status === 404
            ? 'Serviço de autenticação temporariamente indisponível (404).'
            : 'Servidor temporariamente indisponível. Tente novamente em instantes.',
        };
      }

      if (!res.ok) {
        return { error: translateAuthError(data.error || 'Credenciais inválidas.') };
      }

      const activeUser = data.user as User;
      const activeSession = data.session as Session;

      localStorage.setItem(NEON_USER_KEY, JSON.stringify(activeUser));
      localStorage.setItem(NEON_SESSION_KEY, JSON.stringify(activeSession));

      setUser(activeUser);
      setSession(activeSession);
      return {};
    } catch (err: any) {
      return { error: translateAuthError(err.message || 'Erro inesperado na autenticação.') };
    }
  };

  const signUpWithPassword = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      } else {
        return {
          error: res.status === 404
            ? 'Serviço de autenticação temporariamente indisponível (404).'
            : 'Servidor temporariamente indisponível. Tente novamente em instantes.',
        };
      }

      if (!res.ok) {
        return { error: translateAuthError(data.error || 'Erro ao cadastrar usuário.') };
      }

      const activeUser = data.user as User;
      const activeSession = data.session as Session;

      localStorage.setItem(NEON_USER_KEY, JSON.stringify(activeUser));
      localStorage.setItem(NEON_SESSION_KEY, JSON.stringify(activeSession));

      setUser(activeUser);
      setSession(activeSession);
      return {};
    } catch (err: any) {
      return { error: translateAuthError(err.message || 'Erro inesperado ao cadastrar.') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(NEON_USER_KEY);
    localStorage.removeItem(NEON_SESSION_KEY);
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      }

      if (!res.ok) {
        return { error: translateAuthError(data.error || 'Erro ao enviar e-mail de recuperação.') };
      }

      return {};
    } catch (err: any) {
      return { error: translateAuthError(err.message || 'Erro inesperado ao solicitar recuperação.') };
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      }

      if (!res.ok) {
        return { error: translateAuthError(data.error || 'Erro ao redefinir senha.') };
      }

      return {};
    } catch (err: any) {
      return { error: translateAuthError(err.message || 'Erro inesperado ao redefinir senha.') };
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isConfigured,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      resetPassword,
      confirmPasswordReset,
    }),
    [user, session, loading, isConfigured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
