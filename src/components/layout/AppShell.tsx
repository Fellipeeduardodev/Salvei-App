import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavBar } from './MobileNavBar';
import { MobileMenuSheet } from './MobileMenuSheet';
import { NavigationDestination, Project, Collection } from '../../types/reference';
import { UserProfile } from '../../types/database';

interface AppShellProps {
  children: React.ReactNode;
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: (mode?: 'image' | 'url') => void;
  onQuickFilterTag?: (tag: string) => void;
  onOpenAuthModal?: (mode?: 'login' | 'signup') => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsModal?: () => void;
  isSelectionModeActive?: boolean;
  isFavoritesFilterActive?: boolean;
  onToggleFavoritesFilter?: () => void;
  profile?: UserProfile | null;
  userEmail?: string;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenTutorial?: () => void;
  onSignOut?: () => void;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
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
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenCommandPalette,
  onOpenShortcutsModal,
  isSelectionModeActive = false,
  isFavoritesFilterActive = false,
  onToggleFavoritesFilter,
  profile,
  userEmail,
  onOpenProfile,
  onOpenSettings,
  onOpenTutorial,
  onSignOut,
  onOpenAuthModal,
  isGuestMode = false,
  onExitGuestMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenSearch = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full bg-[#F8F8F6] dark:bg-[#111214] text-[#171717] dark:text-[#F3F4F6] flex flex-col font-sans selection:bg-[#171717] selection:text-white dark:selection:bg-[#F3F4F6] dark:selection:text-[#111214] box-border transition-colors duration-150">
      {/* Skip to Content for WCAG 2.2 AA Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#171717] focus:text-white dark:focus:bg-[#F3F4F6] dark:focus:text-[#111214] focus:rounded focus:outline-none focus:ring-2 focus:ring-[#4355DB] font-sans text-xs font-semibold shadow-xl"
      >
        Pular para o conteúdo principal
      </a>

      {/* Desktop & Tablet Sidebar (Compact on md 64px, Expanded on lg 240px, Hidden on mobile) */}
      <Sidebar
        currentDestination={currentDestination}
        onNavigate={onNavigate}
        referenceCount={referenceCount}
        tagCount={tagCount}
        projectCount={projectCount}
        collectionCount={collectionCount}
        projects={projects}
        collections={collections}
        onSelectProject={onSelectProject}
        onSelectCollection={onSelectCollection}
        profile={profile}
        onOpenProfile={onOpenProfile}
        onOpenAuthModal={onOpenAuthModal}
        isGuestMode={isGuestMode}
        onExitGuestMode={onExitGuestMode}
      />

      {/* Main Content Area (Offset: pl-0 on mobile, md:pl-16 on tablet, lg:pl-60 on desktop) */}
      <div className="flex-1 flex flex-col w-full min-w-0 max-w-full pl-0 md:pl-16 lg:pl-60 transition-[padding] duration-200 box-border">
        {/* Guest Mode Informational Banner */}
        {isGuestMode && (
          <div className="w-full bg-amber-500/10 dark:bg-amber-950/20 border-b border-amber-500/20 px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs">
                <strong>Modo Local (Teste)</strong> — Suas alterações estão salvas neste computador.
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signup')}
                  className="px-2.5 py-1 rounded bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-semibold text-[11px] hover:opacity-90 transition-opacity cursor-pointer shadow-xs min-h-[28px]"
                >
                  Sincronizar na Nuvem
                </button>
              )}
              {onExitGuestMode && (
                <button
                  type="button"
                  onClick={onExitGuestMode}
                  className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-[11px] underline cursor-pointer p-1"
                >
                  Voltar à Apresentação
                </button>
              )}
            </div>
          </div>
        )}

        {/* Topbar */}
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenAddModal={onOpenAddModal}
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenShortcutsModal={onOpenShortcutsModal}
          profile={profile}
          userEmail={userEmail}
          onOpenProfile={onOpenProfile}
          onOpenSettings={onOpenSettings}
          onOpenTutorial={onOpenTutorial}
          onSignOut={onSignOut}
        />

        {/* Content Viewport with mobile bottom safe area padding */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full min-w-0 max-w-[1800px] mx-auto p-3 sm:p-5 md:p-8 pb-24 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 outline-none box-border"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <MobileNavBar
        currentDestination={currentDestination}
        onNavigate={onNavigate}
        onOpenSearch={handleOpenSearch}
        onOpenAddModal={onOpenAddModal}
        onOpenMenuSheet={() => setMobileMenuOpen(true)}
        isMenuSheetOpen={mobileMenuOpen}
        isSelectionModeActive={isSelectionModeActive}
        isFavoritesFilterActive={isFavoritesFilterActive}
      />

      {/* Mobile Bottom Navigation Sheet (< md) */}
      <MobileMenuSheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentDestination={currentDestination}
        onNavigate={onNavigate}
        onOpenShortcutsModal={onOpenShortcutsModal}
        onToggleFavorites={onToggleFavoritesFilter}
        isFavoritesFilterActive={isFavoritesFilterActive}
        projectCount={projectCount}
        collectionCount={collectionCount}
        tagCount={tagCount}
        referenceCount={referenceCount}
        profile={profile}
        onOpenProfile={onOpenProfile}
        onOpenTutorial={onOpenTutorial}
        onSafeLogout={onSignOut}
      />
    </div>
  );
};