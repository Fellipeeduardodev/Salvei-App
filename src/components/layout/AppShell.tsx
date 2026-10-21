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
  onOpenAuthModal?: () => void;
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
    <div className="min-h-screen w-full min-w-0 max-w-full bg-[#F8F8F6] text-[#171717] flex flex-col font-sans selection:bg-[#171717] selection:text-white box-border">
      {/* Skip to Content for WCAG 2.2 AA Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#171717] focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-[#4355DB] font-sans text-xs font-semibold shadow-xl"
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
      />

      {/* Main Content Area (Offset: pl-0 on mobile, md:pl-16 on tablet, lg:pl-60 on desktop) */}
      <div className="flex-1 flex flex-col w-full min-w-0 max-w-full pl-0 md:pl-16 lg:pl-60 transition-[padding] duration-200 box-border">
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