import React, { useEffect } from 'react';
import {
  Briefcase,
  Layers,
  Tag,
  SlidersHorizontal,
  Star,
  HelpCircle,
  LogOut,
  X,
  Compass,
  ChevronRight,
  User as UserIcon,
  BookOpen,
} from 'lucide-react';
import { NavigationDestination } from '../../types/reference';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types/database';

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentDestination: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  onOpenShortcutsModal?: () => void;
  onToggleFavorites?: () => void;
  isFavoritesFilterActive?: boolean;
  projectCount?: number;
  collectionCount?: number;
  tagCount?: number;
  referenceCount?: number;
  profile?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenTutorial?: () => void;
  onSafeLogout?: () => void;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  isOpen,
  onClose,
  currentDestination,
  onNavigate,
  onOpenShortcutsModal,
  onToggleFavorites,
  isFavoritesFilterActive = false,
  projectCount = 0,
  collectionCount = 0,
  tagCount = 0,
  referenceCount = 0,
  profile,
  onOpenProfile,
  onOpenTutorial,
  onSafeLogout,
}) => {
  const { user, signOut } = useAuth();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectDestination = (dest: NavigationDestination) => {
    onNavigate(dest);
    onClose();
  };

  const handleSelectFavorites = () => {
    onToggleFavorites?.();
    onClose();
  };

  const handleSelectShortcuts = () => {
    onClose();
    onOpenShortcutsModal?.();
  };

  const handleLogout = () => {
    onClose();
    if (onSafeLogout) {
      onSafeLogout();
    } else {
      signOut();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
      className="fixed inset-0 z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-150"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F0F0F]/55 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Sheet Content Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-h-[85vh] bg-white dark:bg-[#191B20] border-t border-[#E7E7E5] dark:border-[#2D3139] rounded-t-2xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200 overflow-hidden"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Pull Indicator Bar */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-10 h-1.5 rounded-full bg-[#D4D4D0] dark:bg-[#3E434D]" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#171717] dark:bg-[#4355DB] flex items-center justify-center text-white">
              <Compass size={14} strokeWidth={2.2} />
            </div>
            <h2 id="mobile-menu-title" className="font-display font-bold text-sm tracking-tight text-[#171717] dark:text-[#F3F4F6]">
              Salvei <span className="font-mono text-[10px] text-[#A8A8A6] dark:text-[#6B7280] font-normal uppercase">Menu</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            aria-label="Fechar menu"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Navigation Options */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
          {/* Projetos */}
          <button
            type="button"
            onClick={() => handleSelectDestination('projects')}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
              currentDestination === 'projects'
                ? 'bg-[#EDEDEA] dark:bg-[#2A303C] text-[#171717] dark:text-[#F3F4F6] font-semibold'
                : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentDestination === 'projects'
                    ? 'bg-[#4355DB] text-white'
                    : 'bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF]'
                }`}
              >
                <Briefcase size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">Projetos</span>
                <span className="text-[11px] text-[#737373] dark:text-[#9CA3AF]">Sprints, produtos e entregáveis</span>
              </div>
            </div>
            <span className="font-mono text-xs text-[#737373] dark:text-[#9CA3AF] bg-white dark:bg-[#20232A] px-2 py-0.5 rounded border border-[#E7E7E5] dark:border-[#2D3139]">
              {projectCount}
            </span>
          </button>

          {/* Coleções */}
          <button
            type="button"
            onClick={() => handleSelectDestination('collections')}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
              currentDestination === 'collections'
                ? 'bg-[#EDEDEA] dark:bg-[#2A303C] text-[#171717] dark:text-[#F3F4F6] font-semibold'
                : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentDestination === 'collections'
                    ? 'bg-[#4355DB] text-white'
                    : 'bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF]'
                }`}
              >
                <Layers size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">Coleções</span>
                <span className="text-[11px] text-[#737373] dark:text-[#9CA3AF]">Curadorias temáticas de design</span>
              </div>
            </div>
            <span className="font-mono text-xs text-[#737373] dark:text-[#9CA3AF] bg-white dark:bg-[#20232A] px-2 py-0.5 rounded border border-[#E7E7E5] dark:border-[#2D3139]">
              {collectionCount}
            </span>
          </button>

          {/* Favoritos (Quick Filter) */}
          <button
            type="button"
            onClick={handleSelectFavorites}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
              isFavoritesFilterActive
                ? 'bg-[#FFFBEB] dark:bg-[#2D2412] border border-[#FDE68A] dark:border-[#78350F] text-[#92400E] dark:text-[#FDE68A] font-semibold'
                : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
                <Star size={16} className="fill-[#D97706] dark:fill-[#FBBF24]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">Favoritos</span>
                <span className="text-[11px] text-[#737373] dark:text-[#9CA3AF]">Filtrar apenas itens favoritados</span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-[#B45309] dark:text-[#FBBF24] font-semibold uppercase tracking-wider">
              {isFavoritesFilterActive ? 'ATIVADO' : 'VER TODOS'}
            </span>
          </button>

          {/* Etiquetas */}
          <button
            type="button"
            onClick={() => handleSelectDestination('tags')}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
              currentDestination === 'tags'
                ? 'bg-[#EDEDEA] dark:bg-[#2A303C] text-[#171717] dark:text-[#F3F4F6] font-semibold'
                : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentDestination === 'tags'
                    ? 'bg-[#4355DB] text-white'
                    : 'bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF]'
                }`}
              >
                <Tag size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">Etiquetas</span>
                <span className="text-[11px] text-[#737373] dark:text-[#9CA3AF]">Gerenciamento de taxonomia</span>
              </div>
            </div>
            <span className="font-mono text-xs text-[#737373] dark:text-[#9CA3AF] bg-white dark:bg-[#20232A] px-2 py-0.5 rounded border border-[#E7E7E5] dark:border-[#2D3139]">
              {tagCount}
            </span>
          </button>

          {/* Guia de Atalhos de Teclado */}
          {onOpenShortcutsModal && (
            <button
              type="button"
              onClick={handleSelectShortcuts}
              className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] flex items-center justify-center">
                  <HelpCircle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">Atalhos de teclado</span>
                  <span className="text-[11px] text-[#737373] dark:text-[#9CA3AF]">Guia completo de atalhos (?)</span>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#A8A8A6] dark:text-[#6B7280]" />
            </button>
          )}

          {/* Configurações */}
          <button
            type="button"
            onClick={() => handleSelectDestination('settings')}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
              currentDestination === 'settings'
                ? 'bg-[#EDEDEA] dark:bg-[#2A303C] text-[#171717] dark:text-[#F3F4F6] font-semibold'
                : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentDestination === 'settings'
                    ? 'bg-[#4355DB] text-white'
                    : 'bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF]'
                }`}
              >
                <SlidersHorizontal size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">Configurações</span>
                <span className="text-[11px] text-[#737373] dark:text-[#9CA3AF]">Preferências do workspace</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-[#A8A8A6] dark:text-[#6B7280]" />
          </button>
        </div>

        {/* User Account & Profile Access Card */}
        {user && (
          <div className="mx-4 mt-2 p-3 rounded-xl bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile?.();
                }}
                className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity flex-1 cursor-pointer outline-none"
                title="Abrir perfil"
              >
                <div className="w-9 h-9 rounded-full bg-[#171717] dark:bg-[#4355DB] text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-[#E7E7E5] dark:border-[#2D3139]">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || user.email || 'Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {profile?.full_name?.charAt(0).toUpperCase() ||
                        user.email?.charAt(0).toUpperCase() ||
                        'U'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] truncate">
                    {profile?.full_name || user.email?.split('@')[0] || 'Usuário'}
                  </span>
                  <span className="text-[11px] text-[#737373] dark:text-[#9CA3AF] truncate">
                    {user.email}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Encerrar sessão"
                className="p-2 rounded-lg text-[#737373] dark:text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer shrink-0"
                aria-label="Encerrar sessão"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Quick actions for Profile & Tutorial */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile?.();
                }}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
              >
                <UserIcon size={13} className="text-[#737373] dark:text-[#9CA3AF]" />
                <span>Meu perfil</span>
              </button>
              {onOpenTutorial && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTutorial();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
                >
                  <BookOpen size={13} className="text-[#4355DB] dark:text-[#6375F1]" />
                  <span>Tutorial</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};