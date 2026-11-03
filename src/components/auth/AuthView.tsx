import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';

const REMEMBER_EMAIL_KEY = 'curator_remembered_email';

export interface AuthViewProps {
  initialMode?: 'login' | 'signup' | 'forgot_password';
  onSuccess?: () => void;
  onBackToLanding?: () => void;
  onEnterGuestMode?: () => void;
}

const CAROUSEL_SLIDES = [
  {
    tag: '[ ATELIÊ DIGITAL • 2026 ]',
    title: 'Biblioteca Visual Curada',
    subtitle: 'Guarde capturas em alta resolução de sites, tipografias suíças e paletas em um só lugar.',
    image: '/brand/auth-salvei-showcase-1.jpg',
  },
  {
    tag: '[ WORKSPACE PRIVADO ]',
    title: 'Design de Alta Precisão',
    subtitle: 'Inspirado no rigor editorial suíço e na velocidade do Linear para o seu fluxo criativo.',
    image: '/brand/auth-salvei-showcase-2.jpg',
  },
  {
    tag: '[ FLUXO DE 1 CLIQUE ]',
    title: 'Capture Agora. Encontre Depois.',
    subtitle: 'Extraia automaticamente cores hexadecimais, anotações de layout e trechos de código.',
    image: '/brand/auth-salvei-showcase-3.jpg',
  },
];

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signup',
  onSuccess,
  onBackToLanding,
  onEnterGuestMode,
}) => {
  const { signInWithPassword, signUpWithPassword, resetPassword, isConfigured } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberEmail, setRememberEmail] = useState(() => {
    try {
      return Boolean(localStorage.getItem(REMEMBER_EMAIL_KEY));
    } catch {
      return false;
    }
  });

  const [slideIndex, setSlideIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Sync mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode]);

  // Auto-advance slides periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot_password') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
  };

  const handleSocialAuth = (provider: 'google' | 'facebook') => {
    const providerName = provider === 'google' ? 'Google' : 'Facebook';
    setErrorMessage(`O login via ${providerName} estará disponível na próxima atualização. Crie sua conta com e-mail e senha abaixo.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isConfigured) {
      setErrorMessage(
        'As variáveis de conexão do banco de dados não estão configuradas no ambiente.'
      );
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu endereço de e-mail.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    if (mode !== 'forgot_password') {
      if (!password) {
        setErrorMessage('Por favor, digite sua senha.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
    }

    if (mode === 'signup' && !agreeTerms) {
      setErrorMessage('Por favor, confirme que concorda com os termos e condições.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (rememberEmail) {
          try {
            localStorage.setItem(REMEMBER_EMAIL_KEY, cleanEmail);
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

        const { error } = await signInWithPassword(cleanEmail, password);
        if (error) {
          setErrorMessage(error);
        } else {
          onSuccess?.();
        }
      } else if (mode === 'signup') {
        const { error } = await signUpWithPassword(cleanEmail, password, fullName.trim());
        if (error) {
          setErrorMessage(error);
        } else {
          setSuccessMessage('Conta criada com sucesso! Entrando no ateliê...');
          setTimeout(() => {
            onSuccess?.();
          }, 350);
        }
      } else if (mode === 'forgot_password') {
        const { error } = await resetPassword(cleanEmail);
        if (error) {
          setErrorMessage(error);
        } else {
          setSuccessMessage('Instruções enviadas! Verifique sua caixa de entrada para redefinir sua senha.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090A0D] text-[#171717] flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-[#4355DB] selection:text-white font-sans antialiased">
      {/* ========================================================= */}
      {/* AMBIENT BACKGROUND: Salvei Studio Lighting & Atmosphere   */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <img
          src="/brand/auth-salvei-showcase-1.jpg"
          alt=""
          className="w-full h-full object-cover opacity-20 filter blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-radial from-transparent via-[#090A0D]/85 to-[#090A0D]" />
      </div>

      {/* ========================================================= */}
      {/* FLOATING CARD: High-End Minimalist Split Card             */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-[1060px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_30px_90px_rgba(0,0,0,0.75)] flex flex-col lg:flex-row p-3 sm:p-4 lg:p-4 border border-neutral-200/50">
        
        {/* ------------------------------------------------------- */}
        {/* LEFT COLUMN: Clean Form Interface                       */}
        {/* ------------------------------------------------------- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-5 sm:p-8 lg:p-10 xl:p-12">
          
          {/* Top Bar: Back Action & Salvei Dual S-Tag Lockup */}
          <div className="flex items-center justify-between h-9 mb-4">
            {onBackToLanding ? (
              <button
                type="button"
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-900 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] rounded-md px-1.5 py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-neutral-500" />
                <span>Voltar ao início</span>
              </button>
            ) : (
              <div />
            )}

            {/* Official Salvei Brand Emblem & Wordmark (Doop Design System) */}
            <Logo size={24} theme="light" />
          </div>

          {/* Form Content Wrapper */}
          <div className="w-full max-w-[390px] mx-auto my-auto py-2 sm:py-4 flex flex-col">
            
            {/* Header Titles */}
            <div className="flex flex-col mb-5">
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-neutral-900">
                {mode === 'signup' && 'Crie seu ateliê'}
                {mode === 'login' && 'Bem-vindo de volta'}
                {mode === 'forgot_password' && 'Recuperar senha'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">
                {mode === 'signup' && 'Sua biblioteca visual privada para guardar, organizar e redescobrir referências.'}
                {mode === 'login' && 'Entre com seu e-mail e senha para acessar seu workspace privado.'}
                {mode === 'forgot_password' && 'Informe seu e-mail para receber as instruções de recuperação de senha.'}
              </p>
            </div>

            {/* Social Logins (Google & Facebook) */}
            {mode !== 'forgot_password' && (
              <div className="flex flex-col mb-4">
                <span className="text-[11px] font-medium text-neutral-400 text-center mb-2.5">
                  {mode === 'signup' ? 'Cadastre-se com' : 'Entre com'}
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    className="h-11 sm:h-12 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-semibold text-neutral-700 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Facebook Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('facebook')}
                    className="h-11 sm:h-12 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-semibold text-neutral-700 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Or Divider */}
                <div className="relative flex items-center justify-center my-3.5">
                  <div className="w-full border-t border-neutral-100" />
                  <span className="absolute bg-white px-3 text-[11px] text-neutral-400 font-medium">
                    ou continue com seu e-mail
                  </span>
                </div>
              </div>
            )}

            {/* Error & Feedback Messages */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-3.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mb-3.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              
              {/* Full Name (Signup mode) */}
              {mode === 'signup' && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="auth-fullname" className="text-xs font-semibold text-neutral-600">
                    Nome completo
                  </label>
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Seu nome ou estúdio criativo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 sm:h-12 px-4 rounded-2xl border border-neutral-200 bg-[#FAFAFA] text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:bg-white focus:border-[#4355DB] focus:ring-4 focus:ring-[#4355DB]/10 focus:outline-none transition-all"
                  />
                </div>
              )}

              {/* Email Address */}
              <div className="flex flex-col gap-1">
                <label htmlFor="auth-email" className="text-xs font-semibold text-neutral-600">
                  E-mail
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 sm:h-12 px-4 rounded-2xl border border-neutral-200 bg-[#FAFAFA] text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:bg-white focus:border-[#4355DB] focus:ring-4 focus:ring-[#4355DB]/10 focus:outline-none transition-all"
                />
              </div>

              {/* Password */}
              {mode !== 'forgot_password' && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="auth-password" className="text-xs font-semibold text-neutral-600">
                    Senha
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 sm:h-12 pl-4 pr-11 rounded-2xl border border-neutral-200 bg-[#FAFAFA] text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:bg-white focus:border-[#4355DB] focus:ring-4 focus:ring-[#4355DB]/10 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer p-1 rounded-md"
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Forgot Password Link (Login mode) */}
                  {mode === 'login' && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot_password')}
                        className="text-xs font-medium text-neutral-500 hover:text-[#4355DB] transition-colors cursor-pointer"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Checkbox Options */}
              {mode === 'signup' && (
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      agreeTerms
                        ? 'bg-[#171717] border-[#171717] text-white'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                    aria-checked={agreeTerms}
                    role="checkbox"
                  >
                    {agreeTerms && <Check size={11} strokeWidth={3} />}
                  </button>
                  <label
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className="text-xs text-neutral-600 select-none cursor-pointer"
                  >
                    Concordo com os{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                      className="underline font-medium hover:text-[#4355DB]"
                    >
                      termos e condições
                    </button>
                  </label>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center gap-2.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !rememberEmail;
                      setRememberEmail(next);
                      if (!next) {
                        try {
                          localStorage.removeItem(REMEMBER_EMAIL_KEY);
                        } catch {
                          // ignore
                        }
                      }
                    }}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      rememberEmail
                        ? 'bg-[#171717] border-[#171717] text-white'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                    aria-checked={rememberEmail}
                    role="checkbox"
                  >
                    {rememberEmail && <Check size={11} strokeWidth={3} />}
                  </button>
                  <span
                    onClick={() => {
                      const next = !rememberEmail;
                      setRememberEmail(next);
                      if (!next) {
                        try {
                          localStorage.removeItem(REMEMBER_EMAIL_KEY);
                        } catch {
                          // ignore
                        }
                      }
                    }}
                    className="text-xs text-neutral-600 select-none cursor-pointer"
                  >
                    Lembrar meu e-mail
                  </span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isConfigured}
                className="w-full h-11 sm:h-12 mt-2 rounded-full bg-[#171717] hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>
                      {mode === 'signup' && 'Criando ateliê...'}
                      {mode === 'login' && 'Entrando no Salvei...'}
                      {mode === 'forgot_password' && 'Enviando...'}
                    </span>
                  </>
                ) : (
                  <span>
                    {mode === 'signup' && 'Criar conta'}
                    {mode === 'login' && 'Entrar no Salvei'}
                    {mode === 'forgot_password' && 'Enviar link de recuperação'}
                  </span>
                )}
              </button>

              {/* Return to Login from Forgot Password */}
              {mode === 'forgot_password' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-2 text-xs font-semibold text-neutral-500 hover:text-[#171717] transition-colors cursor-pointer text-center"
                >
                  Voltar para o login
                </button>
              )}
            </form>

            {/* Mode Switcher Footer */}
            {mode !== 'forgot_password' && (
              <div className="pt-4 text-center text-xs text-neutral-500">
                {mode === 'signup' ? (
                  <p>
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-neutral-900 hover:underline cursor-pointer"
                    >
                      Entrar
                    </button>
                  </p>
                ) : (
                  <p>
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-semibold text-neutral-900 hover:underline cursor-pointer"
                    >
                      Criar ateliê
                    </button>
                  </p>
                )}
              </div>
            )}

            {/* Enter Guest Mode Alternative */}
            {onEnterGuestMode && (
              <div className="pt-3.5 mt-2 border-t border-neutral-100 flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={onEnterGuestMode}
                  className="text-xs font-semibold text-[#4355DB] hover:text-[#3646B8] hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-[#4355DB]" />
                  <span>Quer apenas testar? Experimentar sem cadastro &rarr;</span>
                </button>
                <span className="text-[10px] text-neutral-400 mt-1">
                  Seu acervo fica salvo neste navegador e pode ser sincronizado depois.
                </span>
              </div>
            )}

          </div>

          {/* Micro Footer Notice: Authentic Salvei Baseline */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4355DB]" />
              <span>ATELIÊ DIGITAL SALVEI</span>
            </span>
            <span className="hidden sm:inline">PERSISTÊNCIA PRIVADA</span>
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* RIGHT COLUMN: Salvei Bespoke Visual Showcase Card       */}
        {/* ------------------------------------------------------- */}
        <div className="hidden lg:flex lg:w-1/2 rounded-[28px] bg-[#0B0C0E] overflow-hidden relative flex-col justify-between p-7 select-none border border-neutral-900 shadow-inner min-h-[580px]">
          
          {/* Background Image: Authentic Salvei Atelier Visual */}
          <div className="absolute inset-0 z-0">
            <img
              src={CAROUSEL_SLIDES[slideIndex].image}
              alt=""
              key={slideIndex}
              className="w-full h-full object-cover object-center filter contrast-105 brightness-95 animate-in fade-in duration-700"
            />
            {/* Dark Studio Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
          </div>

          {/* Top Row: Navigation Chevrons < > & Editorial Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevSlide}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 active:bg-black/80 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md border border-white/10"
                aria-label="Slide anterior"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 active:bg-black/80 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md border border-white/10"
                aria-label="Próximo slide"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <span className="font-mono text-[10px] text-white/70 tracking-widest uppercase px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/10">
              {CAROUSEL_SLIDES[slideIndex].tag}
            </span>
          </div>

          {/* Bottom Area: Dynamic Slogan & Indicator Dashes */}
          <div className="relative z-10 flex flex-col items-center text-center pb-2">
            <h2
              key={`title-${slideIndex}`}
              className="font-display font-semibold text-xl xl:text-2xl text-white tracking-tight drop-shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {CAROUSEL_SLIDES[slideIndex].title}
            </h2>
            <p
              key={`sub-${slideIndex}`}
              className="text-xs text-white/75 max-w-sm mt-1.5 leading-relaxed drop-shadow-sm animate-in fade-in duration-500"
            >
              {CAROUSEL_SLIDES[slideIndex].subtitle}
            </p>

            {/* Pagination Dashes: — — — */}
            <div className="flex items-center justify-center gap-2 pt-5">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    slideIndex === idx
                      ? 'w-8 bg-white'
                      : 'w-5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* TERMS & CONDITIONS MODAL                                  */}
      {/* ========================================================= */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#171717] flex items-center justify-center text-white">
                  <svg viewBox="0 0 128 128" className="w-3.5 h-3.5" fill="none">
                    <circle cx="64" cy="64" r="28" fill="#4355DB" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-lg text-neutral-900">
                  Termos &amp; Condições do Salvei
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="text-xs text-neutral-600 space-y-3 max-h-[320px] overflow-y-auto pr-1">
              <p>
                <strong>1. Workspace Privado:</strong> Suas referências salvas, capturas de tela, anotações de layout e trechos de código são de acesso estritamente individual. O Salvei não comercializa nem expõe seu repertório criativo em feeds públicos.
              </p>
              <p>
                <strong>2. Segurança &amp; Persistência:</strong> Suas coleções são criptografadas e mantidas de forma isolada via políticas de Row-Level Security (RLS) e persistência em banco relacional.
              </p>
              <p>
                <strong>3. Direitos Autorais e Curadoria:</strong> Você mantém a propriedade irrestrita sobre anotações, coleções e projetos catalogados no seu ateliê para fins de estudo, benchmarking e pesquisa técnica.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="w-full h-11 bg-[#171717] hover:bg-black text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer shadow-sm"
            >
              Compreendi e concordo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
