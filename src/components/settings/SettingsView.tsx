import React, { useState } from 'react';
import {
  User as UserIcon,
  SlidersHorizontal,
  BookOpen,
  ShieldCheck,
  RotateCcw,
  LogOut,
  Check,
  HelpCircle,
  Database,
  LayoutGrid,
  Keyboard,
  Sun,
  Moon,
  Monitor,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { UserProfile, UserPreferences } from '../../types/database';
import { saveUserPreferences } from '../../services/supabaseService';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsViewProps {
  profile: UserProfile | null;
  userEmail?: string;
  onOpenProfileModal: () => void;
  onOpenTutorial: () => void;
  onOpenShortcuts: () => void;
  onReloadCloudData: () => Promise<void>;
  isCloudLoading: boolean;
  onSignOut: () => void;
  showToast: (message: string) => void;
  onPreferencesUpdated: (prefs: UserPreferences) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  userEmail,
  onOpenProfileModal,
  onOpenTutorial,
  onOpenShortcuts,
  onReloadCloudData,
  isCloudLoading,
  onSignOut,
  showToast,
  onPreferencesUpdated,
}) => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'tutorial' | 'account'>('profile');

  // Preferences local state
  const [preferences, setPreferences] = useState<UserPreferences>(() => ({
    theme: profile?.preferences?.theme || theme || 'system',
    shortcuts_enabled: profile?.preferences?.shortcuts_enabled ?? true,
    default_view: profile?.preferences?.default_view || 'inbox',
    compact_cards: profile?.preferences?.compact_cards ?? false,
  }));
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const emailDisplay = profile?.email || userEmail || 'Sem e-mail';
  const nameDisplay = profile?.full_name || emailDisplay.split('@')[0] || 'Usuário';
  const initialLetter = nameDisplay.charAt(0).toUpperCase();

  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setPreferences((prev) => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
  };

  const handleSavePreferences = async () => {
    if (!profile) return;
    try {
      setIsSavingPrefs(true);
      const saved = await saveUserPreferences(profile.id, preferences);
      if (saved.theme) {
        setTheme(saved.theme);
      }
      onPreferencesUpdated(saved);
      showToast('Preferências salvas com sucesso!');
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar preferências.');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full min-w-0">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] dark:text-[#F3F4F6] tracking-tight">
          Configurações
        </h1>
        <p className="font-sans text-xs md:text-sm text-[#737373] dark:text-[#9CA3AF]">
          Personalize seu perfil, preferências de interface e opções de conta no Salvei.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 p-1 bg-[#EDEDEA] dark:bg-[#111214] rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] shadow-xs'
              : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <UserIcon size={14} />
          <span>Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            activeTab === 'appearance'
              ? 'bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] shadow-xs'
              : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Aparência & Comportamento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tutorial')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            activeTab === 'tutorial'
              ? 'bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] shadow-xs'
              : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <BookOpen size={14} />
          <span>Tutorial & Atalhos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            activeTab === 'account'
              ? 'bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] shadow-xs'
              : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Conta & Sessão</span>
        </button>
      </div>

      {/* TAB 1: PERFIL */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={nameDisplay}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-[#2D3139] shadow-md bg-white dark:bg-[#111214] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#171717] dark:bg-[#2A303C] text-white dark:text-[#F3F4F6] flex items-center justify-center font-display font-bold text-xl shadow-md border-2 border-white dark:border-[#2D3139] shrink-0">
                  {initialLetter}
                </div>
              )}

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1 min-w-0">
                <h3 className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6]">
                  {nameDisplay}
                </h3>
                <span className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF]">
                  {emailDisplay}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full mt-1">
                  <ShieldCheck size={11} />
                  <span>Conta Ativa no Salvei</span>
                </span>
              </div>

              <div className="sm:ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenProfileModal}
                  iconLeft={<UserIcon size={13} />}
                >
                  Editar Perfil & Foto
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#F8F8F6] dark:bg-[#111214] border border-[#E7E7E5] dark:border-[#2D3139] flex flex-col gap-2.5 text-xs text-[#737373] dark:text-[#9CA3AF]">
              <div className="flex items-center justify-between">
                <span>Nome de exibição:</span>
                <strong className="text-[#171717] dark:text-[#F3F4F6] font-medium">{profile?.full_name || 'Não informado'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>E-mail autenticado:</span>
                <strong className="text-[#171717] dark:text-[#F3F4F6] font-medium">{emailDisplay}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Foto de perfil:</span>
                <span className="font-mono text-[11px] text-[#171717] dark:text-[#F3F4F6]">
                  {profile?.avatar_url ? 'Foto personalizada' : 'Avatar padrão (monograma)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APARÊNCIA & COMPORTAMENTO */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-xl p-6 flex flex-col gap-6 shadow-xs">
            {/* Tema Visual (Claro / Escuro / Sistema) */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2">
                <Sun size={15} className="text-amber-500" />
                <span>Tema e Aparência da Aplicação</span>
              </label>
              <p className="text-xs text-[#737373] dark:text-[#9CA3AF]">
                Selecione o modo de cor do Salvei ou acompanhe automaticamente as preferências do seu sistema.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { id: 'light', label: 'Claro', icon: Sun, desc: 'Ateliê visual' },
                  { id: 'dark', label: 'Escuro', icon: Moon, desc: 'Foco e contraste' },
                  { id: 'system', label: 'Sistema', icon: Monitor, desc: 'Automático do SO' },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = preferences.theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectTheme(opt.id as any)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
                        isSelected
                          ? 'border-[#4355DB] bg-[#4355DB]/10 text-[#4355DB] dark:text-[#7B8BFA] font-bold shadow-xs ring-1 ring-[#4355DB]'
                          : 'border-[#E7E7E5] dark:border-[#2D3139] bg-[#F8F8F6] dark:bg-[#111214] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#242832]'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isSelected ? 'text-[#4355DB] dark:text-[#7B8BFA]' : 'text-[#737373] dark:text-[#9CA3AF]'}
                      />
                      <span className="text-xs">{opt.label}</span>
                      <span className="text-[10px] text-[#A8A8A6] dark:text-[#6B7280] font-normal">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visão padrão */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[#E7E7E5] dark:border-[#2D3139]">
              <label className="text-xs font-bold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2">
                <LayoutGrid size={15} className="text-[#4355DB]" />
                <span>Página Inicial ao Abrir o Salvei</span>
              </label>
              <p className="text-xs text-[#737373] dark:text-[#9CA3AF]">
                Escolha qual seção da biblioteca é carregada por padrão ao entrar.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { id: 'inbox', label: 'Caixa de Entrada' },
                  { id: 'favorites', label: 'Favoritos' },
                  { id: 'projects', label: 'Projetos' },
                  { id: 'collections', label: 'Coleções' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        default_view: opt.id as any,
                      }))
                    }
                    className={`p-3 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
                      preferences.default_view === opt.id
                        ? 'border-[#4355DB] bg-[#4355DB]/10 text-[#4355DB] dark:text-[#7B8BFA] font-bold shadow-2xs'
                        : 'border-[#E7E7E5] dark:border-[#2D3139] bg-[#F8F8F6] dark:bg-[#111214] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Atalhos de teclado */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#E7E7E5] dark:border-[#2D3139]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-1.5">
                  <Keyboard size={15} className="text-[#4355DB]" />
                  <span>Navegação Rápida por Atalhos de Teclado</span>
                </span>
                <span className="text-xs text-[#737373] dark:text-[#9CA3AF]">
                  Habilita teclas de acesso rápido como /, N, J, K, Espaço e F.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    shortcuts_enabled: !prev.shortcuts_enabled,
                  }))
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] shrink-0 ${
                  preferences.shortcuts_enabled ? 'bg-[#4355DB]' : 'bg-[#E7E7E5] dark:bg-[#2D3139]'
                }`}
                role="switch"
                aria-checked={preferences.shortcuts_enabled}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    preferences.shortcuts_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePreferences}
                disabled={isSavingPrefs}
                iconLeft={
                  isSavingPrefs ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )
                }
              >
                {isSavingPrefs ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TUTORIAL & ATALHOS */}
      {activeTab === 'tutorial' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4355DB]/10 text-[#4355DB] flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#171717] dark:text-[#F3F4F6]">
                    Tutorial de Primeiro Acesso
                  </h3>
                  <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF]">
                    Inicie o tour guiado interativo sobre captura, taxonomia e atalhos na interface real.
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenTutorial}
                iconLeft={<BookOpen size={13} />}
              >
                Iniciar Tour Guiado
              </Button>
            </div>

            <div className="pt-4 border-t border-[#E7E7E5] dark:border-[#2D3139] flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F8F6] dark:bg-[#111214] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#171717] dark:text-[#F3F4F6]">
                    Guia de Atalhos de Teclado
                  </h3>
                  <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF]">
                    Consulte todas as combinações de teclas para operar o Salvei com rapidez.
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenShortcuts}
                iconLeft={<HelpCircle size={13} />}
              >
                Ver Atalhos (?)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONTA & SESSÃO */}
      {activeTab === 'account' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#171717] dark:bg-[#2A303C] text-white flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#171717] dark:text-[#F3F4F6]">
                    Persistência e Segurança em Nuvem
                  </h3>
                  <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF]">
                    Supabase PostgreSQL com Row Level Security (RLS) ativo por usuário
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-medium font-mono shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CONECTADO
              </span>
            </div>

            <div className="p-3.5 bg-[#F8F8F6] dark:bg-[#111214] rounded-lg border border-[#E7E7E5] dark:border-[#2D3139] flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-[#737373] dark:text-[#9CA3AF]">
                <span>E-mail autenticado:</span>
                <strong className="text-[#171717] dark:text-[#F3F4F6] font-medium font-mono text-[11px]">
                  {emailDisplay}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[#737373] dark:text-[#9CA3AF]">
                <span>Identificador (UUID):</span>
                <span className="font-mono text-[10px] text-[#737373] dark:text-[#9CA3AF]">
                  {profile?.id || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#737373] dark:text-[#9CA3AF]">
                <span>Segurança de Dados:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <ShieldCheck size={13} /> Isolamento estrito por usuário (RLS)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E7E7E5] dark:border-[#2D3139]">
              <Button
                variant="primary"
                size="sm"
                onClick={onReloadCloudData}
                disabled={isCloudLoading}
                iconLeft={
                  isCloudLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RotateCcw size={13} />
                  )
                }
              >
                {isCloudLoading ? 'Sincronizando...' : 'Sincronizar acervo com a nuvem'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onSignOut}
                iconLeft={<LogOut size={13} className="text-rose-600 dark:text-rose-400" />}
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700"
              >
                Encerrar sessão
              </Button>
            </div>

            {/* Non-destructive notice */}
            <div className="p-3 rounded-lg bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
              <strong>Proteção da conta:</strong> Para sua segurança e conformidade arquitetural, a exclusão permanente de contas e remoção destrutiva em massa estão desabilitadas nesta versão.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
