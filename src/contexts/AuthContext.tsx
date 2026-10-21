import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function translateAuthError(errorMessage: string): string {
  const lower = errorMessage.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return 'Este endereço de e-mail já está cadastrado. Tente entrar.';
  }
  if (lower.includes('at least 6 characters') || lower.includes('password should be at least')) {
    return 'A senha deve conter no mínimo 6 caracteres.';
  }
  if (lower.includes('rate limit')) {
    return 'Muitas tentativas em sequência. Por favor, aguarde alguns instantes.';
  }
  if (lower.includes('invalid format') || lower.includes('valid email')) {
    return 'Formato de e-mail inválido. Verifique o endereço digitado.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Falha na conexão de rede. Verifique seu acesso à internet.';
  }
  return errorMessage;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // 1. Get initial session from Supabase client
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Erro ao obter sessão inicial do Supabase:', err);
        setLoading(false);
      });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithPassword = async (email: string, password: string) => {
    if (!configured) {
      return { error: 'O Supabase não está configurado no ambiente.' };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
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
    if (!configured) {
      return { error: 'O Supabase não está configurado no ambiente.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        return { error: translateAuthError(error.message) };
      }

      // If user created, create profile row if not existing
      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email || null,
            full_name: fullName || '',
            updated_at: new Date().toISOString(),
          } as any);
        } catch {
          // ignore profile sync error
        }
      }

      return {};
    } catch (err: any) {
      return { error: translateAuthError(err.message || 'Erro inesperado no cadastro.') };
    }
  };

  const signOut = async () => {
    if (!configured) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Erro ao encerrar sessão:', err);
    }
  };

  const resetPassword = async (email: string) => {
    if (!configured) {
      return { error: 'O Supabase não está configurado no ambiente.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
      return {};
    } catch (err: any) {
      return { error: translateAuthError(err.message || 'Erro ao solicitar redefinição de senha.') };
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isConfigured: configured,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      resetPassword,
    }),
    [user, session, loading, configured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      session: null,
      loading: false,
      isConfigured: false,
      signInWithPassword: async () => ({ error: 'AuthProvider ausente' }),
      signUpWithPassword: async () => ({ error: 'AuthProvider ausente' }),
      signOut: async () => {},
      resetPassword: async () => ({ error: 'AuthProvider ausente' }),
    };
  }
  return context;
};
