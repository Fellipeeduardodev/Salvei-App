import React from 'react';
import {
  Inbox,
  Layers,
  Tag,
  SlidersHorizontal,
  Bookmark,
  Compass,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { NavigationDestination, Project, Collection } from '../../types/reference';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../types/database';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  currentDestination: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  referenceCount: number;
  tagCount: number;
  projectCount?: number;
  collectionCount?: number;
  projects?: Project[];
  collections?: Collection[];
  onSelectProject?: (projectId: string) => void;
  onSelectCollection?: (collectionId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onQuickFilterTag?: (tag: string) => void;
  onOpenAuthModal?: (mode?: 'login' | 'signup') => void;
  profile?: UserProfile | null;
  onOpenProfile?: () => void;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDestination,
  onNavigate,
  referenceCount,
  tagCount,
  projectCount: _projectCount = 0,
  collectionCount = 0,
  projects: _projects = [],
  collections = [],
  onSelectProject: _onSelectProject,
  onSelectCollection,
  profile,
  onOpenProfile,
  onOpenAuthModal,
  isGuestMode = false,
  onExitGuestMode,
}) => {
  const { user, signOut } = useAuth();

  const primaryNavItems: {
    id: NavigationDestination;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'inbox',
      label: 'Caixa de entrada',
      icon: <Inbox size={18} strokeWidth={1.8} />,
      count: referenceCount,
    },
    {
      id: 'collections',
      label: 'Coleções',
      icon: <Layers size={18} strokeWidth={1.8} />,
      count: collectionCount,
    },
    {
      id: 'tags',
      label: 'Etiquetas',
      icon: <Tag size={18} strokeWidth={1.8} />,
      count: tagCount,
    },
  ];

  const handleItemClick = (id: NavigationDestination) => {
    onNavigate(id);
  };

  const handleCollectionClick = (collectionId: string) => {
    onNavigate('collections');
    onSelectCollection?.(collectionId);
  };

  return (
    <aside
      className="hidden md:flex fixed top-0 bottom-0 left-0 z-30 md:w-16 lg:w-60 bg-white dark:bg-[#191B20] border-r border-[#E7E7E5] dark:border-[#2D3139] flex-col justify-between transition-all duration-200 select-none"
      role="navigation"
      aria-label="Navegação lateral do workspace"
    >
      {/* Top: Brand Header & Main Nav */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div data-tour="brand-header" className="h-14 px-3 lg:px-5 flex items-center justify-center lg:justify-between border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
          <div className="flex items-center">
            {/* Tablet/Mobile collapsed: symbol only */}
            <div className="lg:hidden">
              <Logo variant="symbol" size={24} />
            </div>
            {/* Desktop expanded: full lockup */}
            <div className="hidden lg:block">
              <Logo size={22} badge="v0.3" />
            </div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav data-tour="nav-organization" aria-label="Navegação primária" className="p-2 lg:p-3 flex flex-col gap-1">
          <span className="hidden lg:block px-2 pt-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A8A8A6] dark:text-[#6B7280]">
            Acervo
          </span>

          {primaryNavItems.map((item) => {
            const isActive = currentDestination === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-between p-2 lg:px-2.5 lg:py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
                  isActive
                    ? 'bg-[#EDEDEA] dark:bg-[#2A303C] text-[#171717] dark:text-[#F3F4F6] font-semibold'
                    : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`transition-colors shrink-0 ${
                      isActive ? 'text-[#4355DB] dark:text-[#6375F1]' : 'text-[#737373] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden lg:inline truncate">{item.label}</span>
                </div>

                {typeof item.count === 'number' && (
                  <span
                    className={`hidden lg:inline font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded transition-colors ${
                      isActive
                        ? 'bg-white/80 dark:bg-[#191B20]/80 text-[#171717] dark:text-[#F3F4F6] font-semibold'
                        : 'text-[#A8A8A6] dark:text-[#6B7280]'
                    }`}
                  >
                    {String(item.count).padStart(2, '0')}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop-only: Curated Collections Quick Access */}
        <div className="hidden lg:flex px-3 pt-3 flex-col gap-1">
          <span className="px-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A8A8A6] dark:text-[#6B7280]">
            Coleções
          </span>
          {collections.slice(0, 6).map((col) => (
            <button
              key={col.id}
              onClick={() => handleCollectionClick(col.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            >
              <Bookmark size={13} className="text-[#A8A8A6] dark:text-[#6B7280] shrink-0" />
              <span className="truncate">{col.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: Settings & Auth / Cloud Status */}
      <div className="p-2 lg:p-3 border-t border-[#E7E7E5]/70 dark:border-[#2D3139]/70 flex flex-col gap-2">
        <button
          onClick={() => handleItemClick('settings')}
          title="Configurações do workspace"
          className={`w-full flex items-center justify-center lg:justify-between p-2 lg:px-2.5 lg:py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            currentDestination === 'settings'
              ? 'bg-[#EDEDEA] dark:bg-[#2A303C] text-[#171717] dark:text-[#F3F4F6] font-semibold'
              : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A]'
          }`}
          aria-current={currentDestination === 'settings' ? 'page' : undefined}
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal
              size={17}
              className={currentDestination === 'settings' ? 'text-[#4355DB] dark:text-[#6375F1]' : 'text-[#737373] dark:text-[#9CA3AF]'}
            />
            <span className="hidden lg:inline">Configurações</span>
          </div>
        </button>

        {/* User Account / Cloud Section */}
        {user && (
          <div className="p-1 lg:p-2 rounded-md bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex flex-col gap-1.5">
            {/* Tablet view: simple avatar with logout */}
            <div className="flex lg:hidden flex-col items-center gap-1.5 py-1">
              <button
                type="button"
                onClick={onOpenProfile}
                title={profile?.full_name || user.email || 'Meu perfil'}
                className="w-7 h-7 rounded-full overflow-hidden bg-[#171717] dark:bg-[#4355DB] text-white flex items-center justify-center text-xs font-bold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </button>
              <button
                type="button"
                onClick={signOut}
                title="Encerrar sessão"
                className="p-1 rounded text-[#737373] dark:text-[#9CA3AF] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#E7E7E5]/60 dark:hover:bg-[#282C35] transition-colors cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>

            {/* Desktop view: full account badge with Neon pulse */}
            <div className="hidden lg:flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#4355DB] rounded"
                  title="Abrir meu perfil"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#171717] dark:bg-[#4355DB] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#171717] dark:text-[#F3F4F6] truncate leading-tight">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-[#737373] dark:text-[#9CA3AF] truncate leading-tight" title={user.email || undefined}>
                      {user.email}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  title="Encerrar sessão"
                  className="p-1 rounded text-[#737373] dark:text-[#9CA3AF] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#E7E7E5]/60 dark:hover:bg-[#282C35] transition-colors cursor-pointer shrink-0"
                >
                  <LogOut size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#737373] dark:text-[#9CA3AF] font-mono pt-1.5 border-t border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="font-semibold text-[#171717] dark:text-[#F3F4F6] uppercase text-[9px] tracking-wider">Cofre Conectado</span>
                </span>
                <span className="uppercase text-[9px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
                  Nuvem
                </span>
              </div>
            </div>
          </div>
        )}
        {/* Guest Mode Section in Sidebar */}
        {!user && isGuestMode && (
          <div className="p-2 rounded-md bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 dark:border-amber-700/40 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden lg:inline">MODO LOCAL</span>
              </span>
              <span className="hidden lg:inline uppercase text-[9px] font-semibold tracking-wider text-amber-600 dark:text-amber-400">
                OFFLINE
              </span>
            </div>
            <p className="hidden lg:block text-[10px] text-[#737373] dark:text-[#9CA3AF] leading-tight">
              Seus dados estão salvos na memória deste navegador.
            </p>
            <div className="flex flex-col gap-1 mt-1">
              <button
                type="button"
                onClick={() => (onOpenAuthModal ? onOpenAuthModal() : undefined)}
                className="w-full py-1.5 px-2 rounded-md bg-[#171717] hover:bg-black dark:bg-[#4355DB] dark:hover:bg-[#3646B8] text-white text-[11px] font-semibold transition-colors cursor-pointer text-center shadow-xs"
              >
                <span className="hidden lg:inline">Sincronizar na Nuvem</span>
                <span className="lg:hidden">Salvar</span>
              </button>
              {onExitGuestMode && (
                <button
                  type="button"
                  onClick={onExitGuestMode}
                  className="w-full py-1 px-2 text-[10px] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer text-center"
                >
                  Voltar à Apresentação
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

