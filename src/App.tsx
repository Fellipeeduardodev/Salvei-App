import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { InboxView } from './features/library/InboxView';
import { ProjectsListView } from './features/projects/ProjectsListView';
import { ProjectDetailView } from './features/projects/ProjectDetailView';
import { CollectionsListView } from './features/collections/CollectionsListView';
import { CollectionDetailView } from './features/collections/CollectionDetailView';
import { TagsManagementView } from './features/tags/TagsManagementView';
import { AddReferenceModal } from './components/references/AddReferenceModal';
import { SidePanel } from './components/references/SidePanel';
import { ExpandedOverlay } from './components/references/ExpandedOverlay';
import { AuthView } from './components/auth/AuthView';
import { BulkActionBar } from './components/references/BulkActionBar';
import { BulkDeleteModal } from './components/references/BulkDeleteModal';
import { BulkAssociateModal } from './components/references/BulkAssociateModal';
import { BulkTagModal } from './components/references/BulkTagModal';
import { CommandPalette } from './components/ui/CommandPalette';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import {
  Reference,
  CodeSnippet,
  ReferenceFile,
  Project,
  Collection,
  NavigationDestination,
  SortOption,
  ContentTypeFilter,
} from './types/reference';
import {
  RotateCcw,
  CheckCircle2,
  UploadCloud,
  Database,
  ShieldCheck,
  Loader2,
  LogOut,
  AlertCircle,
  RefreshCw,
  HardDriveUpload,
  WifiOff,
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { filterAndSortReferences, normalizeTag } from './lib/searchAndFilter';
import { useAuth } from './contexts/AuthContext';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import * as supabaseService from './services/supabaseService';

// Known domain screenshots for realistic preview simulation
const DOMAIN_SCREENSHOTS: Record<string, string> = {
  'linear.app': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
  'stripe.com': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
  'raycast.com': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
  'apple.com': 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1200&auto=format&fit=crop&q=80',
  'cosmos.so': 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80',
  'vercel.com': 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80',
  'basement.studio': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
  'read.cv': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
  'framer.com': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
  'folk.app': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80',
  'pitch.com': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
  'freight.studio': 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=1200&auto=format&fit=crop&q=80',
};

export function App() {
  const { user, loading: authLoading, isConfigured, signOut } = useAuth();
  const isOnline = useOnlineStatus();

  // 1. Domain Entities State (Loaded exclusively from Supabase, transient in-memory)
  const [references, setReferences] = useState<Reference[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // 2. Cloud Loading and Communication States
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [isMigratingLegacy, setIsMigratingLegacy] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // 3. Load user data strictly from Supabase
  const loadUserCloudData = useCallback(async () => {
    if (!user) return;
    setIsCloudLoading(true);
    setCloudError(null);
    try {
      const cloudData = await supabaseService.fetchUserData(user.id);
      setReferences(cloudData.references);
      setProjects(cloudData.projects);
      setCollections(cloudData.collections);
    } catch (err: any) {
      console.error('Falha ao carregar dados do Supabase:', err);
      setCloudError(
        err.message ||
          'Não foi possível estabelecer conexão com o Supabase. Verifique sua conexão com a internet.'
      );
    } finally {
      setIsCloudLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserCloudData();
    } else {
      // Clear private state upon logout
      setReferences([]);
      setProjects([]);
      setCollections([]);
      setCloudError(null);
      setSelectedReferenceId(null);
      setActiveProjectId(null);
      setActiveCollectionId(null);
      setActiveTag(null);
    }
  }, [user, loadUserCloudData]);

  // 4. Navigation & Sub-routing State (URL-synchronized)
  const [currentDestination, setCurrentDestination] = useState<NavigationDestination>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') as NavigationDestination;
      if (['inbox', 'projects', 'collections', 'tags', 'settings'].includes(view)) {
        return view;
      }
    }
    return 'inbox';
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('project');
    }
    return null;
  });

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('collection');
    }
    return null;
  });

  const [activeTag, setActiveTag] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tag');
    }
    return null;
  });

  // 5. Advanced Combinable Filters State
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }
    return '';
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentTypeFilter[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // 6. Modal, SidePanel & Expanded View States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialMode, setAddModalInitialMode] = useState<'image' | 'url'>('image');
  const [isWindowDragging, setIsWindowDragging] = useState(false);

  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('ref');
    }
    return null;
  });
  const [isExpandedViewOpen, setIsExpandedViewOpen] = useState(false);

  // 7. Multi-selection & Batch Operations States (Fase 6)
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkCollectionModalOpen, setIsBulkCollectionModalOpen] = useState(false);
  const [isBulkProjectModalOpen, setIsBulkProjectModalOpen] = useState(false);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);

  // 8. Productivity Shortcuts & Command Menu States (Fase 6)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isKeyboardShortcutsModalOpen, setIsKeyboardShortcutsModalOpen] = useState(false);

  // Synchronize routing state with browser URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();

    if (currentDestination !== 'inbox') {
      params.set('view', currentDestination);
    }
    if (activeProjectId) {
      params.set('project', activeProjectId);
    }
    if (activeCollectionId) {
      params.set('collection', activeCollectionId);
    }
    if (activeTag) {
      params.set('tag', activeTag);
    }
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedReferenceId) {
      params.set('ref', selectedReferenceId);
    }

    const newSearch = params.toString();
    const newRelativePathQuery =
      window.location.pathname + (newSearch ? `?${newSearch}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [
    currentDestination,
    activeProjectId,
    activeCollectionId,
    activeTag,
    searchQuery,
    selectedReferenceId,
  ]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = (params.get('view') as NavigationDestination) || 'inbox';
      setCurrentDestination(view);
      setActiveProjectId(params.get('project'));
      setActiveCollectionId(params.get('collection'));
      setActiveTag(params.get('tag'));
      setSearchQuery(params.get('q') || '');
      setSelectedReferenceId(params.get('ref'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Drag & Drop Window Detection
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsWindowDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsWindowDragging(false);

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          if (file.type.startsWith('image/')) {
            imageFiles.push(file);
          }
        }

        if (imageFiles.length > 0) {
          setAddModalInitialMode('image');
          setIsAddModalOpen(true);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Global Clipboard Paste (Ctrl+V) handler for images and URLs
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            imageFiles.push(file);
          }
        }

        if (imageFiles.length > 0) {
          e.preventDefault();
          setAddModalInitialMode('image');
          setIsAddModalOpen(true);
          return;
        }
      }

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://'))) {
        e.preventDefault();
        setAddModalInitialMode('url');
        setIsAddModalOpen(true);
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, []);

  // Active inspected reference
  const selectedReference = useMemo(() => {
    if (!selectedReferenceId) return null;
    return references.find((r) => r.id === selectedReferenceId) || null;
  }, [references, selectedReferenceId]);

  // Extract all available unique tags dynamically
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    references.forEach((r) => r.tags?.forEach((t) => tagSet.add(normalizeTag(t))));
    return Array.from(tagSet).sort();
  }, [references]);

  // Filter & Search computation using dedicated lib
  const filteredReferences = useMemo(() => {
    return filterAndSortReferences(references, {
      searchQuery,
      selectedTags,
      selectedProjectIds,
      selectedCollectionIds,
      contentTypes,
      sortOption,
    });
  }, [
    references,
    searchQuery,
    selectedTags,
    selectedProjectIds,
    selectedCollectionIds,
    contentTypes,
    sortOption,
  ]);

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedTags.length > 0 ||
    selectedProjectIds.length > 0 ||
    selectedCollectionIds.length > 0 ||
    contentTypes.length > 0;

  // Filter Bar Toggles
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(collectionId) ? prev.filter((id) => id !== collectionId) : [...prev, collectionId]
    );
  };

  const handleToggleContentType = (type: ContentTypeFilter) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedProjectIds([]);
    setSelectedCollectionIds([]);
    setContentTypes([]);
  };

  // Reference update handler (Confirmed by Supabase)
  const handleUpdateReference = useCallback(
    async (id: string, updates: Partial<Reference>) => {
      if (!user) return;
      try {
        await supabaseService.updateReference(user.id, id, updates);
        setReferences((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          )
        );
        showToast('Referência atualizada com sucesso no Supabase.');
      } catch (err: any) {
        console.error('Erro ao atualizar referência no Supabase:', err);
        showToast(`Erro ao atualizar: ${err.message || 'Falha no banco.'}`);
      }
    },
    [user, showToast]
  );

  // Reference deletion handler (Confirmed by Supabase)
  const handleDeleteReference = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await supabaseService.deleteReference(user.id, id);
        setReferences((prev) => prev.filter((r) => r.id !== id));

        if (selectedReferenceId === id) {
          setSelectedReferenceId(null);
          setIsExpandedViewOpen(false);
        }

        showToast('Referência excluída do Supabase com sucesso.');
      } catch (err: any) {
        console.error('Erro ao excluir no Supabase:', err);
        showToast(`Erro ao excluir: ${err.message || 'Falha na comunicação com o banco.'}`);
      }
    },
    [user, selectedReferenceId, showToast]
  );

  // Quick Action: Favorite toggle (Confirmed by Supabase)
  const handleToggleFavorite = useCallback(
    async (id: string, nextFavorite: boolean) => {
      if (!user) return;
      try {
        await supabaseService.toggleFavorite(user.id, id, nextFavorite);
        setReferences((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, isFavorite: nextFavorite, updatedAt: new Date().toISOString() } : r
          )
        );
        showToast(
          nextFavorite
            ? 'Referência adicionada aos favoritos.'
            : 'Referência removida dos favoritos.'
        );
      } catch (err: any) {
        console.error('Erro ao alternar favorito:', err);
        showToast(`Erro ao favoritar: ${err.message || 'Falha no banco.'}`);
      }
    },
    [user, showToast]
  );

  // Active visible references in current view (Inbox, Project, Collection, or Tag)
  const currentViewReferences = useMemo(() => {
    if (currentDestination === 'inbox') {
      return filteredReferences;
    }
    if (currentDestination === 'projects' && activeProjectId) {
      return references.filter((r) => r.projectIds?.includes(activeProjectId));
    }
    if (currentDestination === 'collections' && activeCollectionId) {
      return references.filter((r) => r.collectionIds?.includes(activeCollectionId));
    }
    if (currentDestination === 'tags' && activeTag) {
      return references.filter((r) =>
        r.tags?.map(normalizeTag).includes(normalizeTag(activeTag))
      );
    }
    return filteredReferences;
  }, [
    currentDestination,
    activeProjectId,
    activeCollectionId,
    activeTag,
    filteredReferences,
    references,
  ]);

  // Multi-selection Handlers (Fase 6)
  const handleToggleBatchSelect = useCallback((refId: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(refId) ? prev.filter((id) => id !== refId) : [...prev, refId]
    );
  }, []);

  const handleSelectAllVisible = useCallback(() => {
    const visibleIds = currentViewReferences.map((r) => r.id);
    if (visibleIds.length === 0) return;
    setSelectedBatchIds(visibleIds);
    showToast(`${visibleIds.length} referências visíveis selecionadas.`);
  }, [currentViewReferences, showToast]);

  const handleClearBatchSelection = useCallback(() => {
    setSelectedBatchIds([]);
  }, []);

  // Global Productivity Keyboard Shortcuts (Fase 6)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable);

      // 1. Command Palette / Quick Search: Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // 2. Multi-Select All Visible: Ctrl+A / Cmd+A
      // Intercept only when multi-selection context is active (selectedBatchIds > 0)
      // and not inside an editable field and no text is selected
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        const textSelection = window.getSelection()?.toString();
        const hasTextSelection = textSelection && textSelection.trim().length > 0;
        if (!isInputFocused && !hasTextSelection && selectedBatchIds.length > 0) {
          e.preventDefault();
          handleSelectAllVisible();
          return;
        }
      }

      // 3. Global Search Focus: '/'
      if (e.key === '/' && !isInputFocused && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          setIsCommandPaletteOpen(true);
        }
        return;
      }

      // 4. Keyboard Shortcuts Help: '?' (Shift + /)
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        setIsKeyboardShortcutsModalOpen(true);
        return;
      }

      // 5. New Reference: 'N'
      if (e.key.toLowerCase() === 'n' && !isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setAddModalInitialMode('url');
        setIsAddModalOpen(true);
        return;
      }

      // 6. Delete Selected Items: Delete or Backspace (with protection against accidental triggers)
      const hasAnyModalOpen =
        isCommandPaletteOpen ||
        isKeyboardShortcutsModalOpen ||
        isBulkDeleteModalOpen ||
        isBulkCollectionModalOpen ||
        isBulkProjectModalOpen ||
        isBulkTagModalOpen ||
        isAddModalOpen;

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused && !hasAnyModalOpen) {
        if (selectedBatchIds.length > 0) {
          e.preventDefault();
          setIsBulkDeleteModalOpen(true);
          return;
        }
      }

      // 6. Escape hierarchy (closes top-most open surface or clears selection)
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          e.preventDefault();
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isKeyboardShortcutsModalOpen) {
          e.preventDefault();
          setIsKeyboardShortcutsModalOpen(false);
          return;
        }
        if (isBulkDeleteModalOpen) {
          e.preventDefault();
          setIsBulkDeleteModalOpen(false);
          return;
        }
        if (isBulkCollectionModalOpen) {
          e.preventDefault();
          setIsBulkCollectionModalOpen(false);
          return;
        }
        if (isBulkProjectModalOpen) {
          e.preventDefault();
          setIsBulkProjectModalOpen(false);
          return;
        }
        if (isBulkTagModalOpen) {
          e.preventDefault();
          setIsBulkTagModalOpen(false);
          return;
        }
        if (isAddModalOpen) {
          setIsAddModalOpen(false);
          return;
        }
        if (isExpandedViewOpen) {
          setIsExpandedViewOpen(false);
          return;
        }
        if (selectedReferenceId) {
          setSelectedReferenceId(null);
          return;
        }
        if (selectedBatchIds.length > 0) {
          e.preventDefault();
          setSelectedBatchIds([]);
          showToast('Seleção desmarcada.');
          return;
        }
        if (searchQuery) {
          e.preventDefault();
          setSearchQuery('');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isCommandPaletteOpen,
    isKeyboardShortcutsModalOpen,
    isBulkDeleteModalOpen,
    isBulkCollectionModalOpen,
    isBulkProjectModalOpen,
    isBulkTagModalOpen,
    isAddModalOpen,
    isExpandedViewOpen,
    selectedReferenceId,
    selectedBatchIds,
    searchQuery,
    handleSelectAllVisible,
    showToast,
  ]);

  // Batch Operations Handlers (Fase 6 - Persistência real no Supabase com tratamento de falhas)
  const handleBulkFavorite = useCallback(
    async (favorite: boolean) => {
      if (!user || selectedBatchIds.length === 0) return;
      setIsProcessingBatch(true);
      try {
        const result = await supabaseService.bulkUpdateFavorite(user.id, selectedBatchIds, favorite);
        if (result.successCount > 0) {
          const updatedSet = new Set(selectedBatchIds);
          setReferences((prev) =>
            prev.map((r) =>
              updatedSet.has(r.id)
                ? { ...r, isFavorite: favorite, updatedAt: new Date().toISOString() }
                : r
            )
          );
        }
        if (result.failedCount > 0) {
          showToast(
            `${result.successCount} atualizadas. ${result.failedCount} falharam: ${result.errors?.[0] || 'Erro'}`
          );
        } else {
          showToast(
            `${result.successCount} ${result.successCount === 1 ? 'referência' : 'referências'} ${
              favorite ? 'adicionada aos favoritos' : 'removida dos favoritos'
            }.`
          );
        }
      } catch (err: any) {
        showToast(`Falha na operação em lote: ${err.message || 'Erro inesperado'}`);
      } finally {
        setIsProcessingBatch(false);
      }
    },
    [user, selectedBatchIds, showToast]
  );

  const handleBulkAssociateCollection = useCallback(
    async (collectionId: string, action: 'add' | 'remove') => {
      if (!user || selectedBatchIds.length === 0) return;
      setIsProcessingBatch(true);
      try {
        const targetCollection = collections.find((c) => c.id === collectionId);
        const colName = targetCollection ? targetCollection.name : 'coleção';

        let result: supabaseService.BatchOperationResult;
        if (action === 'add') {
          result = await supabaseService.bulkAddCollection(user.id, selectedBatchIds, collectionId);
          if (result.successCount > 0) {
            const targetIds = new Set(selectedBatchIds);
            setReferences((prev) =>
              prev.map((r) => {
                if (targetIds.has(r.id)) {
                  const currentCols = r.collectionIds || [];
                  if (!currentCols.includes(collectionId)) {
                    return {
                      ...r,
                      collectionIds: [...currentCols, collectionId],
                      updatedAt: new Date().toISOString(),
                    };
                  }
                }
                return r;
              })
            );
          }
        } else {
          result = await supabaseService.bulkRemoveCollection(user.id, selectedBatchIds, collectionId);
          if (result.successCount > 0) {
            const targetIds = new Set(selectedBatchIds);
            setReferences((prev) =>
              prev.map((r) => {
                if (targetIds.has(r.id)) {
                  return {
                    ...r,
                    collectionIds: (r.collectionIds || []).filter((cId) => cId !== collectionId),
                    updatedAt: new Date().toISOString(),
                  };
                }
                return r;
              })
            );
          }
        }

        if (result.failedCount > 0) {
          showToast(
            `${result.successCount} atualizadas. ${result.failedCount} falharam: ${result.errors?.[0] || 'Erro'}`
          );
        } else {
          showToast(
            `${result.successCount} referências ${action === 'add' ? 'adicionadas à' : 'removidas da'} coleção "${colName}".`
          );
        }
      } catch (err: any) {
        showToast(`Falha na operação: ${err.message || 'Erro no banco'}`);
      } finally {
        setIsProcessingBatch(false);
      }
    },
    [user, selectedBatchIds, collections, showToast]
  );

  const handleBulkAssociateProject = useCallback(
    async (projectId: string, action: 'add' | 'remove') => {
      if (!user || selectedBatchIds.length === 0) return;
      setIsProcessingBatch(true);
      try {
        const targetProject = projects.find((p) => p.id === projectId);
        const projName = targetProject ? targetProject.name : 'projeto';

        let result: supabaseService.BatchOperationResult;
        if (action === 'add') {
          result = await supabaseService.bulkAddProject(user.id, selectedBatchIds, projectId);
          if (result.successCount > 0) {
            const targetIds = new Set(selectedBatchIds);
            setReferences((prev) =>
              prev.map((r) => {
                if (targetIds.has(r.id)) {
                  const currentProjs = r.projectIds || [];
                  if (!currentProjs.includes(projectId)) {
                    return {
                      ...r,
                      projectIds: [...currentProjs, projectId],
                      updatedAt: new Date().toISOString(),
                    };
                  }
                }
                return r;
              })
            );
          }
        } else {
          result = await supabaseService.bulkRemoveProject(user.id, selectedBatchIds, projectId);
          if (result.successCount > 0) {
            const targetIds = new Set(selectedBatchIds);
            setReferences((prev) =>
              prev.map((r) => {
                if (targetIds.has(r.id)) {
                  return {
                    ...r,
                    projectIds: (r.projectIds || []).filter((pId) => pId !== projectId),
                    updatedAt: new Date().toISOString(),
                  };
                }
                return r;
              })
            );
          }
        }

        if (result.failedCount > 0) {
          showToast(
            `${result.successCount} atualizadas. ${result.failedCount} falharam: ${result.errors?.[0] || 'Erro'}`
          );
        } else {
          showToast(
            `${result.successCount} referências ${action === 'add' ? 'associadas ao' : 'removidas do'} projeto "${projName}".`
          );
        }
      } catch (err: any) {
        showToast(`Falha na operação: ${err.message || 'Erro no banco'}`);
      } finally {
        setIsProcessingBatch(false);
      }
    },
    [user, selectedBatchIds, projects, showToast]
  );

  const handleBulkTags = useCallback(
    async (tags: string[], action: 'add' | 'remove') => {
      if (!user || selectedBatchIds.length === 0 || tags.length === 0) return;
      setIsProcessingBatch(true);
      try {
        let result: supabaseService.BatchOperationResult;
        const normTags = tags.map((t) => normalizeTag(t)).filter(Boolean);

        if (action === 'add') {
          result = await supabaseService.bulkAddTags(user.id, selectedBatchIds, normTags);
          if (result.successCount > 0) {
            const targetIds = new Set(selectedBatchIds);
            setReferences((prev) =>
              prev.map((r) => {
                if (targetIds.has(r.id)) {
                  const existingTags = new Set(r.tags || []);
                  normTags.forEach((t) => existingTags.add(t));
                  return {
                    ...r,
                    tags: Array.from(existingTags),
                    updatedAt: new Date().toISOString(),
                  };
                }
                return r;
              })
            );
          }
        } else {
          result = await supabaseService.bulkRemoveTags(user.id, selectedBatchIds, normTags);
          if (result.successCount > 0) {
            const targetIds = new Set(selectedBatchIds);
            const removeSet = new Set(normTags);
            setReferences((prev) =>
              prev.map((r) => {
                if (targetIds.has(r.id)) {
                  return {
                    ...r,
                    tags: (r.tags || []).filter((t) => !removeSet.has(normalizeTag(t))),
                    updatedAt: new Date().toISOString(),
                  };
                }
                return r;
              })
            );
          }
        }

        if (result.failedCount > 0) {
          showToast(
            `${result.successCount} atualizadas. ${result.failedCount} falharam: ${result.errors?.[0] || 'Erro'}`
          );
        } else {
          showToast(
            `Etiquetas ${action === 'add' ? 'adicionadas a' : 'removidas de'} ${result.successCount} referências.`
          );
        }
      } catch (err: any) {
        showToast(`Falha ao alterar etiquetas: ${err.message || 'Erro no banco'}`);
      } finally {
        setIsProcessingBatch(false);
      }
    },
    [user, selectedBatchIds, showToast]
  );

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!user || selectedBatchIds.length === 0) return;
    setIsProcessingBatch(true);
    try {
      const result = await supabaseService.bulkDeleteReferences(user.id, selectedBatchIds);
      if (result.successCount > 0) {
        const deletedSet = new Set(selectedBatchIds);
        setReferences((prev) => prev.filter((r) => !deletedSet.has(r.id)));
        if (selectedReferenceId && deletedSet.has(selectedReferenceId)) {
          setSelectedReferenceId(null);
          setIsExpandedViewOpen(false);
        }
        setSelectedBatchIds([]);
        setIsBulkDeleteModalOpen(false);
        showToast(`${result.successCount} referências excluídas permanentemente do Supabase.`);
      }
      if (result.failedCount > 0) {
        showToast(`Falha ao excluir ${result.failedCount} itens: ${result.errors?.[0] || 'Erro'}`);
      }
    } catch (err: any) {
      showToast(`Erro ao excluir em lote: ${err.message || 'Falha na comunicação'}`);
    } finally {
      setIsProcessingBatch(false);
    }
  }, [user, selectedBatchIds, selectedReferenceId, showToast]);

  // Project Management Handlers (Confirmed by Supabase)
  const handleCreateProject = async (name: string, description?: string) => {
    if (!user) return;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabaseService.saveProject(user.id, newProject);
      setProjects((prev) => [newProject, ...prev]);
      showToast(`Projeto "${name}" salvo no Supabase!`);
    } catch (err: any) {
      console.error('Erro ao salvar projeto no Supabase:', err);
      showToast(`Erro ao salvar projeto: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleEditProject = async (id: string, name: string, description?: string) => {
    if (!user) return;
    const existing = projects.find((p) => p.id === id);
    if (!existing) return;

    const updatedProject: Project = {
      ...existing,
      name,
      description,
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabaseService.saveProject(user.id, updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
      showToast('Projeto atualizado no Supabase.');
    } catch (err: any) {
      console.error('Erro ao atualizar projeto no Supabase:', err);
      showToast(`Erro ao atualizar projeto: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!user) return;
    try {
      await supabaseService.deleteProject(user.id, id);
      setProjects((prev) => prev.filter((p) => p.id !== id));

      // Remove project association from references in state without deleting the references
      setReferences((prev) =>
        prev.map((ref) => {
          if (ref.projectIds?.includes(id)) {
            return {
              ...ref,
              projectIds: ref.projectIds.filter((pId) => pId !== id),
              updatedAt: new Date().toISOString(),
            };
          }
          return ref;
        })
      );

      if (activeProjectId === id) {
        setActiveProjectId(null);
      }
      showToast('Projeto removido do Supabase. Referências preservadas.');
    } catch (err: any) {
      console.error('Erro ao excluir projeto no Supabase:', err);
      showToast(`Erro ao excluir projeto: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleSaveProjectAssociations = async (projectId: string, referenceIds: string[]) => {
    if (!user) return;
    try {
      await supabaseService.syncProjectReferences(projectId, referenceIds);
      const targetSet = new Set(referenceIds);
      setReferences((prev) =>
        prev.map((ref) => {
          const hasProject = ref.projectIds?.includes(projectId);
          const shouldHaveProject = targetSet.has(ref.id);

          if (shouldHaveProject && !hasProject) {
            return {
              ...ref,
              projectIds: [...(ref.projectIds || []), projectId],
              updatedAt: new Date().toISOString(),
            };
          } else if (!shouldHaveProject && hasProject) {
            return {
              ...ref,
              projectIds: (ref.projectIds || []).filter((pId) => pId !== projectId),
              updatedAt: new Date().toISOString(),
            };
          }
          return ref;
        })
      );
      showToast('Associações do projeto sincronizadas com o Supabase.');
    } catch (err: any) {
      console.error('Erro ao salvar associações do projeto:', err);
      showToast(`Erro ao salvar associações: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleRemoveReferenceFromProject = (projectId: string, referenceId: string) => {
    const existing = references.find((r) => r.id === referenceId);
    if (!existing) return;
    const updatedProjectIds = (existing.projectIds || []).filter((pId) => pId !== projectId);
    handleUpdateReference(referenceId, { projectIds: updatedProjectIds });
  };

  // Collection Management Handlers (Confirmed by Supabase)
  const handleCreateCollection = async (name: string, description?: string) => {
    if (!user) return;
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabaseService.saveCollection(user.id, newCol);
      setCollections((prev) => [newCol, ...prev]);
      showToast(`Coleção "${name}" salva no Supabase!`);
    } catch (err: any) {
      console.error('Erro ao salvar coleção no Supabase:', err);
      showToast(`Erro ao salvar coleção: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleEditCollection = async (id: string, name: string, description?: string) => {
    if (!user) return;
    const existing = collections.find((c) => c.id === id);
    if (!existing) return;

    const updatedCol: Collection = {
      ...existing,
      name,
      description,
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabaseService.saveCollection(user.id, updatedCol);
      setCollections((prev) => prev.map((c) => (c.id === id ? updatedCol : c)));
      showToast('Coleção atualizada no Supabase.');
    } catch (err: any) {
      console.error('Erro ao atualizar coleção no Supabase:', err);
      showToast(`Erro ao atualizar coleção: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!user) return;
    try {
      await supabaseService.deleteCollection(user.id, id);
      setCollections((prev) => prev.filter((c) => c.id !== id));

      // Remove association without deleting references
      setReferences((prev) =>
        prev.map((ref) => {
          if (ref.collectionIds?.includes(id)) {
            return {
              ...ref,
              collectionIds: ref.collectionIds.filter((cId) => cId !== id),
              updatedAt: new Date().toISOString(),
            };
          }
          return ref;
        })
      );

      if (activeCollectionId === id) {
        setActiveCollectionId(null);
      }
      showToast('Coleção removida do Supabase. Referências preservadas.');
    } catch (err: any) {
      console.error('Erro ao excluir coleção no Supabase:', err);
      showToast(`Erro ao excluir coleção: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleSaveCollectionAssociations = async (collectionId: string, referenceIds: string[]) => {
    if (!user) return;
    try {
      await supabaseService.syncCollectionReferences(collectionId, referenceIds);
      const targetSet = new Set(referenceIds);
      setReferences((prev) =>
        prev.map((ref) => {
          const hasCol = ref.collectionIds?.includes(collectionId);
          const shouldHaveCol = targetSet.has(ref.id);

          if (shouldHaveCol && !hasCol) {
            return {
              ...ref,
              collectionIds: [...(ref.collectionIds || []), collectionId],
              updatedAt: new Date().toISOString(),
            };
          } else if (!shouldHaveCol && hasCol) {
            return {
              ...ref,
              collectionIds: (ref.collectionIds || []).filter((cId) => cId !== collectionId),
              updatedAt: new Date().toISOString(),
            };
          }
          return ref;
        })
      );
      showToast('Associações da coleção sincronizadas com o Supabase.');
    } catch (err: any) {
      console.error('Erro ao salvar associações da coleção:', err);
      showToast(`Erro ao salvar associações: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleRemoveReferenceFromCollection = (collectionId: string, referenceId: string) => {
    const existing = references.find((r) => r.id === referenceId);
    if (!existing) return;
    const updatedCollectionIds = (existing.collectionIds || []).filter((cId) => cId !== collectionId);
    handleUpdateReference(referenceId, { collectionIds: updatedCollectionIds });
  };

  // Tag Management Handlers (Confirmed by Supabase)
  const handleCreateTag = (newTag: string) => {
    const norm = normalizeTag(newTag);
    if (!norm) return;
    showToast(`Etiqueta #${norm} pronta para uso.`);
  };

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!user) return;
    const normOld = normalizeTag(oldTag);
    const normNew = normalizeTag(newTag);
    if (!normNew || normOld === normNew) return;

    try {
      await supabaseService.renameTag(user.id, normOld, normNew);
      setReferences((prev) =>
        prev.map((ref) => {
          const hasTag = ref.tags?.map(normalizeTag).includes(normOld);
          if (hasTag) {
            const updated = Array.from(
              new Set(ref.tags.map((t) => (normalizeTag(t) === normOld ? normNew : t)))
            );
            return { ...ref, tags: updated, updatedAt: new Date().toISOString() };
          }
          return ref;
        })
      );
      showToast(`Etiqueta #${normOld} renomeada para #${normNew} no Supabase.`);
    } catch (err: any) {
      console.error('Erro ao renomear tag no Supabase:', err);
      showToast(`Erro ao renomear tag: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!user) return;
    const normDelete = normalizeTag(tagToDelete);
    try {
      await supabaseService.deleteTag(user.id, normDelete);
      setReferences((prev) =>
        prev.map((ref) => {
          if (ref.tags?.map(normalizeTag).includes(normDelete)) {
            return {
              ...ref,
              tags: ref.tags.filter((t) => normalizeTag(t) !== normDelete),
              updatedAt: new Date().toISOString(),
            };
          }
          return ref;
        })
      );
      showToast(`Etiqueta #${normDelete} removida das referências no Supabase.`);
    } catch (err: any) {
      console.error('Erro ao excluir tag no Supabase:', err);
      showToast(`Erro ao excluir tag: ${err.message || 'Falha no banco.'}`);
    }
  };

  // Add Reference Handlers (URL & Images — Awaited & Confirmed by Backend)
  const handleSaveUrl = async ({
    url,
    title,
    tags,
    notes,
    imageFile,
    projectIds,
    collectionIds,
    codeSnippets,
    relatedFiles,
  }: {
    url: string;
    title?: string;
    tags?: string[];
    notes?: string;
    imageFile?: File;
    projectIds?: string[];
    collectionIds?: string[];
    codeSnippets?: CodeSnippet[];
    relatedFiles?: ReferenceFile[];
  }) => {
    if (!user) {
      throw new Error('Sessão expirada. Faça login novamente para salvar referências.');
    }

    let domain = url;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = parsed.hostname.replace(/^www\./, '');
    } catch {
      // fallback
    }

    let screenshotUrl: string | undefined = undefined;
    let imageStorageId: string | undefined = undefined;
    let screenshotStatus: Reference['screenshotStatus'] = 'none';
    let originalFileName: string | undefined = undefined;

    if (imageFile) {
      const uploadRes = await supabaseService.uploadMediaFile(user.id, imageFile, 'screenshots');
      screenshotUrl = uploadRes.url;
      imageStorageId = uploadRes.storagePath;
      screenshotStatus = 'ready';
      originalFileName = imageFile.name;
    } else if (DOMAIN_SCREENSHOTS[domain]) {
      screenshotUrl = DOMAIN_SCREENSHOTS[domain];
      screenshotStatus = 'ready';
    }

    const finalTitle = title || `${domain.charAt(0).toUpperCase() + domain.slice(1)} — Referência Web`;
    const finalTags = tags && tags.length > 0 ? tags.map(normalizeTag) : ['web', 'referencia'];

    const newReference: Reference = {
      id: `ref-${Date.now()}`,
      url: url.startsWith('http') ? url : `https://${url}`,
      title: finalTitle,
      domain,
      sourceType: screenshotUrl ? 'both' : 'url',
      screenshotUrl,
      imageStorageId,
      originalFileName,
      screenshotStatus,
      tags: finalTags,
      collectionIds: collectionIds || [],
      projectIds: projectIds || [],
      notesMarkdown:
        notes ||
        `### Referência salva por endereço\n- **Origem:** [${domain}](${url})\n- Adicionado em ${new Date().toLocaleDateString('pt-BR')}.`,
      codeSnippets: codeSnippets || [],
      relatedFiles: relatedFiles || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Strict backend confirmation first
    await supabaseService.saveReference(user.id, newReference);

    setReferences((prev) => [newReference, ...prev]);
    setCurrentDestination('inbox');
    setSelectedReferenceId(newReference.id);
    showToast('Referência salva com sucesso no Supabase!');
  };

  const handleSaveImages = async (
    items: {
      file: File;
      title: string;
      tags?: string[];
      sourceUrl?: string;
      notes?: string;
      projectIds?: string[];
      collectionIds?: string[];
    }[]
  ) => {
    if (!user) {
      throw new Error('Sessão expirada. Faça login novamente para salvar imagens.');
    }

    const newReferences: Reference[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const uploadRes = await supabaseService.uploadMediaFile(user.id, item.file, 'screenshots');

      let domain: string | undefined = undefined;
      if (item.sourceUrl) {
        try {
          const parsed = new URL(item.sourceUrl);
          domain = parsed.hostname.replace(/^www\./, '');
        } catch {
          // fallback
        }
      }

      const newRef: Reference = {
        id: `ref-${Date.now()}-${i}`,
        title: item.title,
        sourceType: item.sourceUrl ? 'both' : 'image',
        url: item.sourceUrl || undefined,
        domain,
        screenshotUrl: uploadRes.url,
        imageStorageId: uploadRes.storagePath,
        originalFileName: item.file.name,
        screenshotStatus: 'ready',
        tags: item.tags && item.tags.length > 0 ? item.tags.map(normalizeTag) : ['imagem', 'referencia'],
        collectionIds: item.collectionIds || [],
        projectIds: item.projectIds || [],
        notesMarkdown:
          item.notes ||
          `### Imagem importada\n- **Arquivo:** \`${item.file.name}\`\n- Adicionado em ${new Date().toLocaleDateString('pt-BR')}.`,
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date(Date.now() + i).toISOString(),
        updatedAt: new Date(Date.now() + i).toISOString(),
      };

      await supabaseService.saveReference(user.id, newRef);
      newReferences.push(newRef);
    }

    setReferences((prev) => [...newReferences, ...prev]);
    setCurrentDestination('inbox');
    if (newReferences.length > 0) {
      setSelectedReferenceId(newReferences[0].id);
    }

    const count = newReferences.length;
    showToast(
      count === 1
        ? '1 imagem salva com sucesso no Supabase!'
        : `${count} imagens salvas com sucesso no Supabase!`
    );
  };

  // Optional tool: migrate pre-existing browser localStorage to Supabase once
  const handleMigrateBrowserLegacyData = async () => {
    if (!user) return;
    try {
      const stored = localStorage.getItem('curator_references_v2') || localStorage.getItem('curator_references_v1');
      if (!stored) {
        showToast('Nenhum dado legado encontrado no navegador.');
        return;
      }
      const parsedRefs: Reference[] = JSON.parse(stored);
      if (!Array.isArray(parsedRefs) || parsedRefs.length === 0) {
        showToast('Nenhum dado legado encontrado.');
        return;
      }

      setIsMigratingLegacy(true);
      const res = await supabaseService.migrateLocalDataToSupabase(user.id, parsedRefs, [], []);
      showToast(`${res.migratedRefs} referências importadas com sucesso para a nuvem!`);
      // Clear legacy storage key to avoid confusion
      localStorage.removeItem('curator_references_v2');
      localStorage.removeItem('curator_references_v1');
      await loadUserCloudData();
    } catch (err: any) {
      console.error('Erro ao importar dados legados:', err);
      showToast(`Erro ao importar: ${err.message || 'Falha na migração'}`);
    } finally {
      setIsMigratingLegacy(false);
    }
  };

  // Find active project or collection object if viewing details
  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const activeCollection = useMemo(() => {
    if (!activeCollectionId) return null;
    return collections.find((c) => c.id === activeCollectionId) || null;
  }, [collections, activeCollectionId]);

  // ============================================================================
  // CONDITIONAL GATES: LOADING, MISSING ENV, MANDATORY AUTH, CLOUD ERROR
  // ============================================================================

  // Gate 1: Checking authentication session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 gap-3 font-sans">
        <Loader2 size={32} className="animate-spin text-[#4355DB]" />
        <p className="text-xs text-[#A1A1AA] font-mono tracking-wider uppercase">
          Verificando sessão do Salvei...
        </p>
      </div>
    );
  }

  // Gate 2: Missing Supabase environment configuration (No local fallback permitted)
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#18181B] border border-amber-500/30 rounded-xl p-8 flex flex-col gap-4 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-bold text-lg text-white">Configuração do Supabase Ausente</h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            O Salvei opera exclusivamente conectado ao Supabase na nuvem. Defina as variáveis <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> e <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> no arquivo <code className="text-white">.env.local</code> para inicializar a aplicação.
          </p>
        </div>
      </div>
    );
  }

  // Gate 3: Mandatory Authentication (Unauthenticated users must sign in or register)
  if (!user) {
    return <AuthView />;
  }

  // Gate 4: Cloud error screen with Retry action (Requirement 5: No silent fallback to local)
  if (cloudError) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] text-[#171717] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-[#E7E7E5] rounded-xl p-8 flex flex-col items-center text-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-bold text-lg text-[#171717]">Falha na conexão com o banco</h2>
          <p className="text-xs text-[#737373] leading-relaxed">
            {cloudError}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={loadUserCloudData}
              iconLeft={<RotateCcw size={14} />}
            >
              Tentar novamente
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={signOut}
              iconLeft={<LogOut size={14} />}
            >
              Encerrar sessão
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Gate 5: Initial cloud fetch in progress
  if (isCloudLoading && references.length === 0 && projects.length === 0 && collections.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] text-[#171717] flex flex-col items-center justify-center p-6 gap-3 font-sans">
        <Loader2 size={32} className="animate-spin text-[#4355DB]" />
        <p className="text-xs text-[#737373] font-mono tracking-wider uppercase">
          Carregando acervo do Supabase...
        </p>
      </div>
    );
  }

  // ============================================================================
  // AUTHENTICATED APP WORKSPACE
  // ============================================================================
  return (
    <AppShell
      currentDestination={currentDestination}
      onNavigate={(dest) => {
        setCurrentDestination(dest);
        setActiveProjectId(null);
        setActiveCollectionId(null);
        setActiveTag(null);
      }}
      referenceCount={references.length}
      tagCount={availableTags.length}
      projectCount={projects.length}
      collectionCount={collections.length}
      projects={projects}
      collections={collections}
      onSelectProject={(pId) => {
        setCurrentDestination('projects');
        setActiveProjectId(pId);
      }}
      onSelectCollection={(cId) => {
        setCurrentDestination('collections');
        setActiveCollectionId(cId);
      }}
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q);
        if (q.trim() && currentDestination !== 'inbox') {
          setCurrentDestination('inbox');
        }
      }}
      onOpenAddModal={(mode = 'image') => {
        setAddModalInitialMode(mode);
        setIsAddModalOpen(true);
      }}
      onQuickFilterTag={(t) => {
        handleToggleTag(t);
        setCurrentDestination('inbox');
      }}
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      onOpenShortcutsModal={() => setIsKeyboardShortcutsModalOpen(true)}
      isSelectionModeActive={selectedBatchIds.length > 0}
      isFavoritesFilterActive={contentTypes.includes('is_favorite')}
      onToggleFavoritesFilter={() => {
        handleToggleContentType('is_favorite');
        setCurrentDestination('inbox');
      }}
    >
      {/* Global Drag and Drop Window Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-[#4355DB]/15 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-100">
          <div className="bg-white border-2 border-dashed border-[#4355DB] rounded-sm p-8 max-w-md text-center shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#4355DB]/10 text-[#4355DB] flex items-center justify-center">
              <UploadCloud size={28} />
            </div>
            <h3 className="font-sans font-bold text-base text-[#171717]">
              Solte suas imagens aqui
            </h3>
            <p className="font-sans text-xs text-[#737373]">
              Elas serão enviadas para o Supabase Storage e salvas na sua biblioteca em nuvem.
            </p>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-500/10 border border-amber-500/30 text-amber-900 px-4 py-2.5 text-xs flex items-center justify-between gap-3 font-sans mb-4 rounded-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <WifiOff size={15} className="text-amber-600 flex-shrink-0" />
            <span className="font-medium">
              Sem conexão com a internet. O Salvei reconectará e sincronizará com o banco assim que a rede for restabelecida.
            </span>
          </div>
          <button
            type="button"
            onClick={loadUserCloudData}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-semibold text-amber-950 transition-colors cursor-pointer flex-shrink-0"
          >
            Tentar reconectar
          </button>
        </div>
      )}

      {/* Floating Feedback Toast Notification (Accessible & Responsive) */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-sm bg-[#171717] text-white shadow-xl text-xs font-sans animate-in slide-in-from-bottom-2 duration-150 max-w-[90vw]"
        >
          <CheckCircle2 size={15} className="text-[#22c55e] flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* VIEW 1: CAIXA DE ENTRADA (INBOX COM BUSCA GLOBAL E FILTROS FACETADOS) */}
      {currentDestination === 'inbox' && (
        <InboxView
          references={filteredReferences}
          totalReferencesCount={references.length}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          availableProjects={projects}
          selectedProjectIds={selectedProjectIds}
          onToggleProject={handleToggleProject}
          availableCollections={collections}
          selectedCollectionIds={selectedCollectionIds}
          onToggleCollection={handleToggleCollection}
          contentTypes={contentTypes}
          onToggleContentType={handleToggleContentType}
          sortOption={sortOption}
          onSortChange={setSortOption}
          searchQuery={searchQuery}
          onClearAllFilters={handleClearAllFilters}
          onSelectReference={(ref) => setSelectedReferenceId(ref.id)}
          selectedReferenceId={selectedReferenceId}
          selectedBatchIds={selectedBatchIds}
          isSelectionModeActive={selectedBatchIds.length > 0}
          onToggleBatchSelect={handleToggleBatchSelect}
          onToggleFavorite={handleToggleFavorite}
          onQuickEdit={(ref) => setSelectedReferenceId(ref.id)}
          onQuickDelete={(ref) => {
            setSelectedBatchIds([ref.id]);
            setIsBulkDeleteModalOpen(true);
          }}
          onQuickAssociateProject={(ref) => {
            setSelectedBatchIds([ref.id]);
            setIsBulkProjectModalOpen(true);
          }}
          onQuickAssociateCollection={(ref) => {
            setSelectedBatchIds([ref.id]);
            setIsBulkCollectionModalOpen(true);
          }}
          onTagClick={(tag) => handleToggleTag(tag)}
          onOpenAddModal={(mode: 'image' | 'url' = 'image') => {
            setAddModalInitialMode(mode);
            setIsAddModalOpen(true);
          }}
          isFiltered={isFiltered}
        />
      )}

      {/* VIEW 2: PROJETOS (LISTA OU DETALHE) */}
      {currentDestination === 'projects' && (
        activeProject ? (
          <ProjectDetailView
            project={activeProject}
            allReferences={references}
            onBack={() => setActiveProjectId(null)}
            onSelectReference={(ref) => setSelectedReferenceId(ref.id)}
            selectedReferenceId={selectedReferenceId}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onSaveAssociations={(refIds: string[]) =>
              handleSaveProjectAssociations(activeProject.id, refIds)
            }
            onRemoveReferenceFromProject={(refId: string) =>
              handleRemoveReferenceFromProject(activeProject.id, refId)
            }
            onToggleFavorite={handleToggleFavorite}
            onQuickEdit={(ref) => setSelectedReferenceId(ref.id)}
            onQuickDelete={(ref) => {
              setSelectedBatchIds([ref.id]);
              setIsBulkDeleteModalOpen(true);
            }}
            onQuickAssociateProject={(ref) => {
              setSelectedBatchIds([ref.id]);
              setIsBulkProjectModalOpen(true);
            }}
            onQuickAssociateCollection={(ref) => {
              setSelectedBatchIds([ref.id]);
              setIsBulkCollectionModalOpen(true);
            }}
            selectedBatchIds={selectedBatchIds}
            isSelectionModeActive={selectedBatchIds.length > 0}
            onToggleBatchSelect={handleToggleBatchSelect}
          />
        ) : (
          <ProjectsListView
            projects={projects}
            references={references}
            onSelectProject={(projectId) => setActiveProjectId(projectId)}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        )
      )}

      {/* VIEW 3: COLEÇÕES (LISTA OU DETALHE) */}
      {currentDestination === 'collections' && (
        activeCollection ? (
          <CollectionDetailView
            collection={activeCollection}
            allReferences={references}
            onBack={() => setActiveCollectionId(null)}
            onSelectReference={(ref) => setSelectedReferenceId(ref.id)}
            selectedReferenceId={selectedReferenceId}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
            onSaveAssociations={(refIds: string[]) =>
              handleSaveCollectionAssociations(activeCollection.id, refIds)
            }
            onRemoveReferenceFromCollection={(refId: string) =>
              handleRemoveReferenceFromCollection(activeCollection.id, refId)
            }
            onToggleFavorite={handleToggleFavorite}
            onQuickEdit={(ref) => setSelectedReferenceId(ref.id)}
            onQuickDelete={(ref) => {
              setSelectedBatchIds([ref.id]);
              setIsBulkDeleteModalOpen(true);
            }}
            onQuickAssociateProject={(ref) => {
              setSelectedBatchIds([ref.id]);
              setIsBulkProjectModalOpen(true);
            }}
            onQuickAssociateCollection={(ref) => {
              setSelectedBatchIds([ref.id]);
              setIsBulkCollectionModalOpen(true);
            }}
            selectedBatchIds={selectedBatchIds}
            isSelectionModeActive={selectedBatchIds.length > 0}
            onToggleBatchSelect={handleToggleBatchSelect}
          />
        ) : (
          <CollectionsListView
            collections={collections}
            references={references}
            onSelectCollection={(collectionId) => setActiveCollectionId(collectionId)}
            onCreateCollection={handleCreateCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
          />
        )
      )}

      {/* VIEW 4: ETIQUETAS (GESTÃO, RENOMEAÇÃO E EXCLUSÃO) */}
      {currentDestination === 'tags' && (
        <TagsManagementView
          allReferences={references}
          activeTag={activeTag}
          onSelectTag={setActiveTag}
          onCreateTag={handleCreateTag}
          onRenameTag={handleRenameTag}
          onDeleteTag={handleDeleteTag}
          onSelectReference={(ref) => setSelectedReferenceId(ref.id)}
          selectedReferenceId={selectedReferenceId}
        />
      )}

      {/* VIEW 5: CONFIGURAÇÕES */}
      {currentDestination === 'settings' && (
        <div className="flex flex-col gap-6 max-w-xl">
          <div className="flex flex-col gap-1">
            <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] tracking-tight">
              Configurações
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#737373]">
              Gestão de persistência em nuvem, segurança e preferências do Salvei.
            </p>
          </div>

          {/* Card Supabase & PostgreSQL */}
          <div className="bg-white border border-[#E7E7E5] rounded-sm p-6 flex flex-col gap-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#171717] text-white flex items-center justify-center">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#171717]">
                    Persistência Real (Supabase & PostgreSQL)
                  </h3>
                  <p className="font-sans text-xs text-[#737373]">
                    Armazenamento relacional com Row Level Security (RLS)
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NUVEM CONECTADA
              </span>
            </div>

            <div className="p-3.5 bg-[#F8F8F6] rounded-sm border border-[#E7E7E5] flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-[#737373]">
                <span>E-mail do Usuário:</span>
                <strong className="text-[#171717] font-medium font-mono text-[11px]">
                  {user.email}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>ID da Conta (UUID):</span>
                <span className="font-mono text-[10px] text-[#737373]">
                  {user.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Banco de Dados:</span>
                <span className="font-mono text-[11px] text-[#171717]">
                  PostgreSQL 15 (Supabase)
                </span>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Segurança:</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                  <ShieldCheck size={13} /> RLS Ativo por usuário
                </span>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Armazenamento de Mídia:</span>
                <span className="font-mono text-[11px] text-[#171717]">Bucket curator-media (Privado)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#E7E7E5]/70">
              <Button
                variant="primary"
                size="sm"
                onClick={loadUserCloudData}
                disabled={isCloudLoading}
                iconLeft={
                  isCloudLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )
                }
              >
                {isCloudLoading ? 'Recarregando...' : 'Recarregar dados do Supabase'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={signOut}
                iconLeft={<LogOut size={14} />}
              >
                Encerrar sessão
              </Button>
            </div>
          </div>

          {/* Card Estatísticas */}
          <div className="bg-white border border-[#E7E7E5] rounded-sm p-6 flex flex-col gap-4 shadow-xs">
            <div>
              <h3 className="font-sans font-bold text-sm text-[#171717] mb-1">
                Estatísticas do Acervo
              </h3>
              <p className="font-sans text-xs text-[#737373] leading-relaxed">
                Você possui <strong className="text-[#171717]">{references.length}</strong> referências,{' '}
                <strong className="text-[#171717]">{projects.length}</strong> projetos,{' '}
                <strong className="text-[#171717]">{collections.length}</strong> coleções e{' '}
                <strong className="text-[#171717]">{availableTags.length}</strong> etiquetas registradas no banco de dados.
              </p>
            </div>

            {/* Legacy data migration tool */}
            <div className="pt-3 border-t border-[#E7E7E5]/70 flex flex-col gap-2">
              <p className="text-[11px] text-[#737373]">
                Possui itens salvos no armazenamento local deste navegador de versões anteriores?
              </p>
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMigrateBrowserLegacyData}
                  disabled={isMigratingLegacy}
                  iconLeft={
                    isMigratingLegacy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <HardDriveUpload size={14} />
                    )
                  }
                >
                  {isMigratingLegacy ? 'Importando...' : 'Importar dados legados do navegador'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Referência */}
      <AddReferenceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveUrl={handleSaveUrl}
        onSaveImages={handleSaveImages}
        existingUrls={references.map((r) => r.url).filter((u): u is string => Boolean(u))}
        initialMode={addModalInitialMode}
        availableProjects={projects}
        availableCollections={collections}
        onOpenExisting={(existingUrl) => {
          const found = references.find((r) => r.url === existingUrl);
          if (found) {
            setSelectedReferenceId(found.id);
            setCurrentDestination('inbox');
          }
        }}
      />

      {/* Painel Lateral de Detalhes (SidePanel) */}
      <SidePanel
        reference={selectedReference}
        isOpen={!!selectedReferenceId && !isExpandedViewOpen}
        onClose={() => setSelectedReferenceId(null)}
        onExpand={() => setIsExpandedViewOpen(true)}
        onUpdateReference={handleUpdateReference}
        onDeleteReference={handleDeleteReference}
        availableProjects={projects}
        availableCollections={collections}
      />

      {/* Overlay de Visualização Expandida (ExpandedOverlay) */}
      <ExpandedOverlay
        reference={selectedReference}
        isOpen={isExpandedViewOpen}
        onClose={() => setIsExpandedViewOpen(false)}
        onUpdateReference={handleUpdateReference}
        onDeleteReference={handleDeleteReference}
        availableProjects={projects}
        availableCollections={collections}
      />

      {/* Barra de Ações em Lote (Contextual Bulk Action Toolbar) */}
      <BulkActionBar
        selectedCount={selectedBatchIds.length}
        totalVisibleCount={currentViewReferences.length}
        allVisibleSelected={
          currentViewReferences.length > 0 &&
          currentViewReferences.every((r) => selectedBatchIds.includes(r.id))
        }
        onSelectAllVisible={handleSelectAllVisible}
        onClearSelection={handleClearBatchSelection}
        onBulkFavorite={handleBulkFavorite}
        onOpenCollectionModal={() => setIsBulkCollectionModalOpen(true)}
        onOpenProjectModal={() => setIsBulkProjectModalOpen(true)}
        onOpenTagModal={() => setIsBulkTagModalOpen(true)}
        onOpenDeleteModal={() => setIsBulkDeleteModalOpen(true)}
        isProcessing={isProcessingBatch}
      />

      {/* Modal de Exclusão em Lote */}
      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        count={selectedBatchIds.length}
        isLoading={isProcessingBatch}
      />

      {/* Modal de Associação a Coleções em Lote */}
      <BulkAssociateModal
        isOpen={isBulkCollectionModalOpen}
        onClose={() => setIsBulkCollectionModalOpen(false)}
        type="collection"
        availableItems={collections}
        count={selectedBatchIds.length}
        onConfirm={handleBulkAssociateCollection}
      />

      {/* Modal de Associação a Projetos em Lote */}
      <BulkAssociateModal
        isOpen={isBulkProjectModalOpen}
        onClose={() => setIsBulkProjectModalOpen(false)}
        type="project"
        availableItems={projects}
        count={selectedBatchIds.length}
        onConfirm={handleBulkAssociateProject}
      />

      {/* Modal de Adição/Remoção de Etiquetas em Lote */}
      <BulkTagModal
        isOpen={isBulkTagModalOpen}
        onClose={() => setIsBulkTagModalOpen(false)}
        count={selectedBatchIds.length}
        availableTags={availableTags}
        onConfirm={handleBulkTags}
      />

      {/* Menu de Comandos e Busca Rápida (Command Palette - Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        references={references}
        onNavigate={(dest) => {
          setCurrentDestination(dest);
          if (dest !== 'projects') setActiveProjectId(null);
          if (dest !== 'collections') setActiveCollectionId(null);
        }}
        onOpenAddModal={(mode) => {
          setAddModalInitialMode(mode);
          setIsAddModalOpen(true);
        }}
        onSelectReference={(ref) => {
          setSelectedReferenceId(ref.id);
          setCurrentDestination('inbox');
        }}
        onSelectAllVisible={filteredReferences.length > 0 ? handleSelectAllVisible : undefined}
        onOpenShortcutsModal={() => setIsKeyboardShortcutsModalOpen(true)}
      />

      {/* Guia de Atalhos de Teclado (?) */}
      <KeyboardShortcutsModal
        isOpen={isKeyboardShortcutsModalOpen}
        onClose={() => setIsKeyboardShortcutsModalOpen(false)}
      />
    </AppShell>
  );
}

export default App;
