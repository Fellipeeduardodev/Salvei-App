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
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { UserProfile, UserPreferences } from '../../types/database';
import { saveUserPreferences } from '../../services/supabaseService';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'tutorial' | 'account'>('profile');

  // Preferences local state
  const [preferences, setPreferences] = useState<UserPreferences>(() => ({
    theme: profile?.preferences?.theme || 'light',
    shortcuts_enabled: profile?.preferences?.shortcuts_enabled ?? true,
    default_view: profile?.preferences?.default_view || 'inbox',
    compact_cards: profile?.preferences?.compact_cards ?? false,
  }));
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const emailDisplay = profile?.email || userEmail || 'Sem e-mail';
  const nameDisplay = profile?.full_name || emailDisplay.split('@')[0] || 'Usuário';
  const initialLetter = nameDisplay.charAt(0).toUpperCase();

  const handleSavePreferences = async () => {
    if (!profile) return;
    try {
      setIsSavingPrefs(true);
      const saved = await saveUserPreferences(profile.id, preferences);
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
        <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] tracking-tight">
          Configurações
        </h1>
        <p className="font-sans text-xs md:text-sm text-[#737373]">
          Personalize seu perfil, preferências de interface e opções de conta no Salvei.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 p-1 bg-[#EDEDEA] rounded-xl border border-[#E7E7E5] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            activeTab === 'profile'
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
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
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
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
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
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
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Conta & Sessão</span>
        </button>
      </div>

      {/* TAB 1: PERFIL */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7E7E5] rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={nameDisplay}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md bg-white shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#171717] text-white flex items-center justify-center font-display font-bold text-xl shadow-md border-2 border-white shrink-0">
                  {initialLetter}
                </div>
              )}

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1 min-w-0">
                <h3 className="font-sans font-bold text-base text-[#171717]">
                  {nameDisplay}
                </h3>
                <span className="font-sans text-xs text-[#737373]">
                  {emailDisplay}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
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

            <div className="p-4 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-2.5 text-xs text-[#737373]">
              <div className="flex items-center justify-between">
                <span>Nome de exibição:</span>
                <strong className="text-[#171717] font-medium">{profile?.full_name || 'Não informado'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>E-mail autenticado:</span>
                <strong className="text-[#171717] font-medium">{emailDisplay}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Foto de perfil:</span>
                <span className="font-mono text-[11px] text-[#171717]">
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
          <div className="bg-white border border-[#E7E7E5] rounded-xl p-6 flex flex-col gap-6 shadow-xs">
            {/* Visão padrão */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#171717] flex items-center gap-2">
                <LayoutGrid size={15} className="text-[#4355DB]" />
                <span>Página Inicial ao Abrir o Salvei</span>
              </label>
              <p className="text-xs text-[#737373]">
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
                        ? 'border-[#4355DB] bg-[#4355DB]/5 text-[#4355DB] font-bold shadow-2xs'
                        : 'border-[#E7E7E5] bg-[#F8F8F6] text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Atalhos de teclado */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#E7E7E5]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                  <Keyboard size={15} className="text-[#4355DB]" />
                  <span>Navegação Rápida por Atalhos de Teclado</span>
                </span>
                <span className="text-xs text-[#737373]">
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
                  preferences.shortcuts_enabled ? 'bg-[#4355DB]' : 'bg-[#E7E7E5]'
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

            {/* Tema Visual */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[#E7E7E5]">
              <label className="text-xs font-bold text-[#171717] flex items-center gap-2">
                <Sun size={15} className="text-amber-500" />
                <span>Tema Editorial do Salvei</span>
              </label>
              <div className="p-3.5 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] text-xs text-[#737373] flex flex-col gap-1.5">
                <span className="font-semibold text-[#171717]">Tema Claro Editorial (Padrão Calibrado)</span>
                <p className="leading-relaxed">
                  O Salvei foi concebido com uma estética de ateliê de arte e design (fundo #F8F8F6, texto #171717 e acento azul #4355DB), garantindo contraste WCAG AA+ e precisão cromática fiel para as capturas dos seus projetos.
                </p>
              </div>
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
          <div className="bg-white border border-[#E7E7E5] rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4355DB]/10 text-[#4355DB] flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#171717]">
                    Tutorial de Primeiro Acesso
                  </h3>
                  <p className="font-sans text-xs text-[#737373]">
                    Reveja as etapas explicativas sobre captura, taxonomia e fluxo de trabalho.
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenTutorial}
                iconLeft={<BookOpen size={13} />}
              >
                Reabrir Tutorial
              </Button>
            </div>

            <div className="pt-4 border-t border-[#E7E7E5] flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F8F6] border border-[#E7E7E5] text-[#171717] flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#171717]">
                    Guia de Atalhos de Teclado
                  </h3>
                  <p className="font-sans text-xs text-[#737373]">
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
          <div className="bg-white border border-[#E7E7E5] rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#171717]">
                    Persistência e Segurança em Nuvem
                  </h3>
                  <p className="font-sans text-xs text-[#737373]">
                    Supabase PostgreSQL com Row Level Security (RLS) ativo por usuário
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium font-mono shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CONECTADO
              </span>
            </div>

            <div className="p-3.5 bg-[#F8F8F6] rounded-lg border border-[#E7E7E5] flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-[#737373]">
                <span>E-mail autenticado:</span>
                <strong className="text-[#171717] font-medium font-mono text-[11px]">
                  {emailDisplay}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Identificador (UUID):</span>
                <span className="font-mono text-[10px] text-[#737373]">
                  {profile?.id || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Segurança de Dados:</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                  <ShieldCheck size={13} /> Isolamento estrito por usuário (RLS)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E7E7E5]">
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
                iconLeft={<LogOut size={13} className="text-rose-600" />}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                Encerrar sessão
              </Button>
            </div>

            {/* Non-destructive notice */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] leading-relaxed">
              <strong>Proteção da conta:</strong> Para sua segurança e conformidade arquitetural, a exclusão permanente de contas e remoção destrutiva em massa estão desabilitadas nesta versão.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
