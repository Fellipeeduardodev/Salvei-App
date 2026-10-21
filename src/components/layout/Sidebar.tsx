import React from 'react';
import {
  Inbox,
  Briefcase,
  Layers,
  Tag,
  SlidersHorizontal,
  FolderGit2,
  Bookmark,
  Compass,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { NavigationDestination, Project, Collection } from '../../types/reference';
import { useAuth } from '../../contexts/AuthContext';

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
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDestination,
  onNavigate,
  referenceCount,
  tagCount,
  projectCount = 0,
  collectionCount = 0,
  projects = [],
  collections = [],
  onSelectProject,
  onSelectCollection,
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
      id: 'projects',
      label: 'Projetos',
      icon: <Briefcase size={18} strokeWidth={1.8} />,
      count: projectCount,
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

  const handleProjectClick = (projectId: string) => {
    onNavigate('projects');
    onSelectProject?.(projectId);
  };

  const handleCollectionClick = (collectionId: string) => {
    onNavigate('collections');
    onSelectCollection?.(collectionId);
  };

  return (
    <aside
      className="hidden md:flex fixed top-0 bottom-0 left-0 z-30 md:w-16 lg:w-60 bg-white border-r border-[#E7E7E5] flex-col justify-between transition-all duration-200 select-none"
      role="navigation"
      aria-label="Navegação lateral do workspace"
    >
      {/* Top: Brand Header & Main Nav */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-3 lg:px-5 flex items-center justify-center lg:justify-between border-b border-[#E7E7E5]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#171717] flex items-center justify-center text-white shrink-0">
              <Compass size={15} strokeWidth={2.2} />
            </div>
            <div className="hidden lg:flex items-baseline gap-1.5">
              <span className="font-display font-bold text-base tracking-tight text-[#171717]">
                Salvei
              </span>
              <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] tracking-wider uppercase">
                v0.3
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav aria-label="Navegação primária" className="p-2 lg:p-3 flex flex-col gap-1">
          <span className="hidden lg:block px-2 pt-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A8A8A6]">
            Workspace
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
                    ? 'bg-[#EDEDEA] text-[#171717] font-semibold'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`transition-colors shrink-0 ${
                      isActive ? 'text-[#4355DB]' : 'text-[#737373]'
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
                        ? 'bg-white/80 text-[#171717] font-semibold'
                        : 'text-[#A8A8A6]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop-only: Curated Collections Quick Access */}
        <div className="hidden lg:flex px-3 pt-3 flex-col gap-1">
          <span className="px-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A8A8A6]">
            Coleções Ativas
          </span>
          {collections.slice(0, 4).map((col) => (
            <button
              key={col.id}
              onClick={() => handleCollectionClick(col.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            >
              <Bookmark size={13} className="text-[#A8A8A6] shrink-0" />
              <span className="truncate">{col.name}</span>
            </button>
          ))}
        </div>

        {/* Desktop-only: Active Projects Quick Access */}
        <div className="hidden lg:flex px-3 pt-4 flex-col gap-1">
          <span className="px-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A8A8A6]">
            Projetos Recentes
          </span>
          {projects.slice(0, 4).map((p) => (
            <button
              key={p.id}
              onClick={() => handleProjectClick(p.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            >
              <FolderGit2 size={13} className="text-[#A8A8A6] shrink-0" />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: Settings & Auth / Cloud Status */}
      <div className="p-2 lg:p-3 border-t border-[#E7E7E5]/70 flex flex-col gap-2">
        <button
          onClick={() => handleItemClick('settings')}
          title="Configurações do workspace"
          className={`w-full flex items-center justify-center lg:justify-between p-2 lg:px-2.5 lg:py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            currentDestination === 'settings'
              ? 'bg-[#EDEDEA] text-[#171717] font-semibold'
              : 'text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF]'
          }`}
          aria-current={currentDestination === 'settings' ? 'page' : undefined}
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal
              size={17}
              className={currentDestination === 'settings' ? 'text-[#4355DB]' : 'text-[#737373]'}
            />
            <span className="hidden lg:inline">Configurações</span>
          </div>
        </button>

        {/* User Account / Cloud Section */}
        {user && (
          <div className="p-1 lg:p-2 rounded-md bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-1.5">
            {/* Tablet view: simple avatar with logout */}
            <div className="flex lg:hidden flex-col items-center gap-1.5 py-1">
              <div
                className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-bold"
                title={user.email}
              >
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                type="button"
                onClick={signOut}
                title="Encerrar sessão"
                className="p-1 rounded text-[#737373] hover:text-rose-600 hover:bg-[#E7E7E5]/60 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>

            {/* Desktop view: full account badge with Supabase pulse */}
            <div className="hidden lg:flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-[#171717] truncate" title={user.email}>
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  title="Encerrar sessão"
                  className="p-1 rounded text-[#737373] hover:text-rose-600 hover:bg-[#E7E7E5]/60 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#737373] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span>SUPABASE</span>
                </span>
                <span className="uppercase text-[9px] font-semibold tracking-wider text-emerald-600">
                  CONECTADO
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
