import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Cloud,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Compass,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const REMEMBER_EMAIL_KEY = 'curator_remembered_email';

export const AuthView: React.FC = () => {
  const { signInWithPassword, signUpWithPassword, resetPassword, isConfigured } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberEmail, setRememberEmail] = useState(() => {
    try {
      return Boolean(localStorage.getItem(REMEMBER_EMAIL_KEY));
    } catch {
      return false;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isConfigured) {
      setErrorMessage(
        'As variáveis de conexão do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY) não estão configuradas no ambiente.'
      );
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu endereço de e-mail.');
      return;
    }

    if (mode !== 'forgot_password' && !password) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (rememberEmail) {
          try {
            localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
          } catch {
            // ignore
          }
        } else {
          try {
            localStorage.removeItem(REMEMBER_EMAIL_KEY);
          } catch {
            // ignore
          }
        }

        const { error } = await signInWithPassword(email.trim(), password);
        if (error) {
          setErrorMessage(error);
        }
      } else if (mode === 'signup') {
        const { error } = await signUpWithPassword(email.trim(), password, fullName.trim());
        if (error) {
          setErrorMessage(error);
        } else {
          setSuccessMessage(
            'Conta criada com sucesso! Você está autenticado no Salvei.'
          );
        }
      } else if (mode === 'forgot_password') {
        const { error } = await resetPassword(email.trim());
        if (error) {
          setErrorMessage(error);
        } else {
          setSuccessMessage(
            'Enviamos as instruções de redefinição de senha para o e-mail informado.'
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0F10] text-white flex flex-col items-center justify-center p-4 selection:bg-[#4355DB] selection:text-white relative overflow-hidden font-sans">
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#4355DB]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] flex flex-col gap-6 z-10 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1A1A1D] border border-[#2C2C30] flex items-center justify-center text-white shadow-xl shadow-black/40">
            <Compass size={24} strokeWidth={2.2} className="text-[#818cf8]" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-display font-bold text-2xl tracking-tight text-[#F5F5F7]">
              Salvei
            </h1>
            <p className="font-sans text-xs text-[#8E8E93]">
              Biblioteca visual online com persistência em nuvem
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Mode Selector Tabs */}
          {mode !== 'forgot_password' ? (
            <div className="flex border-b border-[#27272A] bg-[#121214]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-3 text-xs font-semibold text-center transition-colors cursor-pointer border-b-2 ${
                  mode === 'login'
                    ? 'border-[#4355DB] text-white bg-[#18181B]'
                    : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-3 text-xs font-semibold text-center transition-colors cursor-pointer border-b-2 ${
                  mode === 'signup'
                    ? 'border-[#4355DB] text-white bg-[#18181B]'
                    : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                Criar Conta
              </button>
            </div>
          ) : (
            <div className="px-6 pt-5 pb-3 border-b border-[#27272A] bg-[#121214] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={15} className="text-[#818cf8]" />
                <span className="text-xs font-semibold text-white">Recuperar Senha</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[11px] text-[#818cf8] hover:underline cursor-pointer"
              >
                Voltar ao login
              </button>
            </div>
          )}

          {/* Alerts Area */}
          <div className="px-6 pt-4 flex flex-col gap-2">
            {!isConfigured && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Supabase não configurado</span>
                  <span className="text-[11px] text-amber-300/80 leading-relaxed">
                    Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local.
                  </span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs animate-in fade-in">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs animate-in fade-in">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-fullname" className="text-[11px] font-medium text-[#A1A1AA]">
                  Nome completo
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#71717A]" aria-hidden="true">
                    <UserIcon size={14} />
                  </span>
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#27272A] border border-[#3F3F46] rounded-lg text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#4355DB] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-email" className="text-[11px] font-medium text-[#A1A1AA]">E-mail</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[#71717A]" aria-hidden="true">
                  <Mail size={14} />
                </span>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#27272A] border border-[#3F3F46] rounded-lg text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#4355DB] transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="auth-password" className="text-[11px] font-medium text-[#A1A1AA]">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[10px] text-[#818cf8] hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#71717A]" aria-hidden="true">
                    <Lock size={14} />
                  </span>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#27272A] border border-[#3F3F46] rounded-lg text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#4355DB] transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-0.5">
                <label htmlFor="auth-remember" className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#A1A1AA] hover:text-[#D1D1D6] transition-colors">
                  <input
                    id="auth-remember"
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setRememberEmail(checked);
                      if (!checked) {
                        try {
                          localStorage.removeItem(REMEMBER_EMAIL_KEY);
                        } catch {
                          // ignore
                        }
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-[#3F3F46] bg-[#27272A] text-[#4355DB] focus:ring-[#4355DB]/20 accent-[#4355DB] cursor-pointer"
                  />
                  <span>Lembrar meu e-mail</span>
                </label>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !isConfigured}
                className="w-full py-2.5 px-4 bg-[#4355DB] hover:bg-[#3847BF] active:bg-[#2F3CA8] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Entrar na Aplicação'}
                      {mode === 'signup' && 'Criar Conta e Acessar'}
                      {mode === 'forgot_password' && 'Enviar link de recuperação'}
                    </span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {mode === 'forgot_password' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full py-2 text-xs text-[#71717A] hover:text-white transition-colors cursor-pointer"
                >
                  Voltar para o login
                </button>
              )}
            </div>
          </form>

          {/* Footer Card */}
          <div className="px-6 py-3.5 bg-[#121214] border-t border-[#27272A] flex items-center justify-between text-[11px] text-[#71717A]">
            <span className="flex items-center gap-1.5">
              <Cloud size={13} className="text-[#818cf8]" />
              <span>Persistência em PostgreSQL</span>
            </span>
            <span className="font-mono text-[10px] text-[#A1A1AA]">RLS ATIVO</span>
          </div>
        </div>

        {/* Security / System Footer Note */}
        <p className="text-center text-[11px] text-[#71717A] leading-relaxed">
          Autenticação obrigatória. Seus dados e referências são protegidos individualmente no banco de dados.
        </p>
      </div>
    </div>
  );
};
