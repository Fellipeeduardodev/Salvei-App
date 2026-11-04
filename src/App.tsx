import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './components/landing/LandingPage';
// Lazy-loaded views and modals for optimal initial bundle & Lighthouse performance

const InboxView = React.lazy(() => import('./features/library/InboxView').then((m) => ({ default: m.InboxView })));
const ProjectsListView = React.lazy(() => import('./features/projects/ProjectsListView').then((m) => ({ default: m.ProjectsListView })));
const ProjectDetailView = React.lazy(() => import('./features/projects/ProjectDetailView').then((m) => ({ default: m.ProjectDetailView })));
const CollectionsListView = React.lazy(() => import('./features/collections/CollectionsListView').then((m) => ({ default: m.CollectionsListView })));
const CollectionDetailView = React.lazy(() => import('./features/collections/CollectionDetailView').then((m) => ({ default: m.CollectionDetailView })));
const TagsManagementView = React.lazy(() => import('./features/tags/TagsManagementView').then((m) => ({ default: m.TagsManagementView })));
const AuthView = React.lazy(() => import('./components/auth/AuthView').then((m) => ({ default: m.AuthView })));
const PublicMoodboardView = React.lazy(() => import('./features/collections/PublicMoodboardView').then((m) => ({ default: m.PublicMoodboardView })));
const SettingsView = React.lazy(() => import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView })));
const AddReferenceModal = React.lazy(() => import('./components/references/AddReferenceModal').then((m) => ({ default: m.AddReferenceModal })));
const SidePanel = React.lazy(() => import('./components/references/SidePanel').then((m) => ({ default: m.SidePanel })));
const ExpandedOverlay = React.lazy(() => import('./components/references/ExpandedOverlay').then((m) => ({ default: m.ExpandedOverlay })));
const BulkActionBar = React.lazy(() => import('./components/references/BulkActionBar').then((m) => ({ default: m.BulkActionBar })));
const BulkDeleteModal = React.lazy(() => import('./components/references/BulkDeleteModal').then((m) => ({ default: m.BulkDeleteModal })));
const BulkAssociateModal = React.lazy(() => import('./components/references/BulkAssociateModal').then((m) => ({ default: m.BulkAssociateModal })));
const BulkTagModal = React.lazy(() => import('./components/references/BulkTagModal').then((m) => ({ default: m.BulkTagModal })));
const CommandPalette = React.lazy(() => import('./components/ui/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const KeyboardShortcutsModal = React.lazy(() => import('./components/ui/KeyboardShortcutsModal').then((m) => ({ default: m.KeyboardShortcutsModal })));
const UserProfileModal = React.lazy(() => import('./components/profile/UserProfileModal').then((m) => ({ default: m.UserProfileModal })));
const OnboardingTutorialModal = React.lazy(() => import('./components/onboarding/OnboardingTutorialModal').then((m) => ({ default: m.OnboardingTutorialModal })));

import {
  parseShareFromLocation,
  generateCollectionShareUrl,
  SharedCollectionData,
} from './lib/collectionSharing';
import {
  Reference,
  CodeSnippet,
  ReferenceFile,
  Project,
  Collection,
  NavigationDestination,
  SortOption,
  ContentTypeFilter,
  ColorPaletteItem,
} from './types/reference';
import { extractPaletteFromImage } from './lib/colorExtractor';
import { UserProfile, UserPreferences } from './types/database';
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
  Layers,
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { filterAndSortReferences, normalizeTag } from './lib/searchAndFilter';
import { useAuth } from './contexts/AuthContext';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import * as neonService from './services/neonService';

// Known domain screenshots for realistic preview simulation
const DOMAIN_SCREENSHOTS: Record<string, string> = {
  'linear.app': '/brand/hero-product-mockup-16x9.webp',
  'kinfolk.com': '/brand/editorial-architecture-01.webp',
  'are.na': '/brand/editorial-typography-print-02.webp',
  'are.na/fellipe': '/brand/editorial-typography-print-02.webp',
  'designsystems.io': '/brand/digital-design-system-spec-02.webp',
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

const LOCAL_STORAGE_GUEST_KEY = 'salvei_guest_mode';
const LOCAL_STORAGE_REFS_KEY = 'salvei_guest_references';
const LOCAL_STORAGE_PROJECTS_KEY = 'salvei_guest_projects';
const LOCAL_STORAGE_COLLECTIONS_KEY = 'salvei_guest_collections';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const GUEST_STARTER_REFERENCES: Reference[] = [
  {
    id: 'local-demo-1',
    title: 'Linear — A better way to build products',
    url: 'https://linear.app',
    domain: 'linear.app',
    sourceType: 'both',
    screenshotUrl: '/brand/hero-product-mockup-16x9.webp',
    screenshotStatus: 'ready',
    tags: ['design-system', 'dark-mode', 'alta-densidade'],
    notesMarkdown: '### Linear App\n- **Referência:** Interface editorial de alta velocidade\n- **Tipografia:** Inter / JetBrains Mono\n- **Paleta:** Grafite `#0F1012` com acentos dinâmicos.',
    isFavorite: true,
    palette: [
      { hex: '#0F1012', name: 'Grafite Ônix', role: 'background' },
      { hex: '#4355DB', name: 'Índigo Elétrico', role: 'primary' },
      { hex: '#6366F1', name: 'Índigo Fluido', role: 'accent' },
      { hex: '#E2E8F0', name: 'Névoa Suave', role: 'neutral' },
    ],
    collectionIds: [],
    projectIds: [],
    codeSnippets: [],
    relatedFiles: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'local-demo-2',
    title: 'Kinfolk Gallery — Architectural & Print Edition',
    url: 'https://kinfolk.com',
    domain: 'kinfolk.com',
    sourceType: 'both',
    screenshotUrl: '/brand/editorial-architecture-01.webp',
    screenshotStatus: 'ready',
    tags: ['editorial', 'tipografia', 'minimalismo'],
    notesMarkdown: '### Kinfolk\n- **Estilo:** Design editorial suíço, respiro generoso e grid assimétrico.',
    isFavorite: false,
    palette: [
      { hex: '#FAF7F2', name: 'Papel Editorial', role: 'background' },
      { hex: '#C2410C', name: 'Terracota Editorial', role: 'accent' },
      { hex: '#343841', name: 'Chumbo Frio', role: 'neutral' },
      { hex: '#F4EFE6', name: 'Areia Suíço', role: 'neutral' },
    ],
    collectionIds: [],
    projectIds: [],
    codeSnippets: [],
    relatedFiles: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'local-demo-3',
    title: 'Are.na — Visual Research & Open Library',
    url: 'https://are.na',
    domain: 'are.na',
    sourceType: 'both',
    screenshotUrl: '/brand/editorial-typography-print-02.webp',
    screenshotStatus: 'ready',
    tags: ['pesquisa', 'curadoria', 'tipografia'],
    notesMarkdown: '### Are.na Channel\n- **Conceito:** Biblioteca de referências sem algoritmo e sem ruído social.',
    isFavorite: true,
    palette: [
      { hex: '#FFFFFF', name: 'Branco Puro', role: 'background' },
      { hex: '#0F172A', name: 'Ardósia Escura', role: 'primary' },
      { hex: '#F06A38', name: 'Laranja Persimmon', role: 'accent' },
      { hex: '#CBD5E1', name: 'Cinza Platina', role: 'neutral' },
    ],
    collectionIds: [],
    projectIds: [],
    codeSnippets: [],
    relatedFiles: [],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export function App() {
  const { user, loading: authLoading, isConfigured, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const isOnline = useOnlineStatus();

  // Local Guest Mode (Offline persistence in browser without authentication)
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'guest' || params.get('guest') === 'true') {
        return true;
      }
      return localStorage.getItem(LOCAL_STORAGE_GUEST_KEY) === 'true';
    }
    return false;
  });

  const effectiveUser = user;

  // 1. Domain Entities State (Loaded from cloud or local guest mode)
  const [references, setReferences] = useState<Reference[]>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_GUEST_KEY) === 'true') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_REFS_KEY);
        if (stored) {
          const parsed: Reference[] = JSON.parse(stored);
          return parsed.map((ref) => {
            if (!ref.palette || ref.palette.length === 0) {
              const match = GUEST_STARTER_REFERENCES.find((s) => s.id === ref.id);
              if (match?.palette) return { ...ref, palette: match.palette };
            }
            return ref;
          });
        }
        return GUEST_STARTER_REFERENCES;
      } catch {}
    }
    return [];
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_GUEST_KEY) === 'true') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [collections, setCollections] = useState<Collection[]>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_GUEST_KEY) === 'true') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // 2. User Profile & Onboarding State (Fase 9 & 10)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // 3. User Cloud & Session Loading State (Fase 10: Separated for Fluid Navigation)
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_GUEST_KEY) === 'true') {
      return true;
    }
    return false;
  });
  const [isInitialSessionLoading, setIsInitialSessionLoading] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_GUEST_KEY) === 'true') {
      return false;
    }
    return true;
  });
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [isMigratingLegacy, setIsMigratingLegacy] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Landing Page & Auth Flow Navigation
  const [authViewMode, setAuthViewMode] = useState<'login' | 'signup' | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get('auth');
      if (auth === 'login' || auth === 'signup') return auth;
    }
    return null;
  });

  const [showLandingForUser, setShowLandingForUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('landing') === 'true';
    }
    return false;
  });

  // Public Shared Collection / Moodboard State
  const [publicMoodboardCollectionId, setPublicMoodboardCollectionId] = useState<string | null>(() => {
    const share = parseShareFromLocation();
    return share.isShared ? share.collectionId : null;
  });
  const [publicMoodboardData, setPublicMoodboardData] = useState<SharedCollectionData | null>(() => {
    const share = parseShareFromLocation();
    return share.isShared ? share.data : null;
  });

  // Resolve active public moodboard data
  const activePublicMoodboardData = useMemo<SharedCollectionData | null>(() => {
    if (publicMoodboardData) return publicMoodboardData;
    if (publicMoodboardCollectionId) {
      const col = collections.find((c) => c.id === publicMoodboardCollectionId);
      if (col) {
        const colRefs = references.filter((r) => r.collectionIds?.includes(col.id));
        return {
          version: 1,
          id: col.id,
          name: col.name,
          description: col.description,
          createdAt: col.createdAt,
          authorName: userProfile?.full_name || effectiveUser?.email?.split('@')[0] || 'Curador Salvei',
          references: colRefs.map((r) => ({
            id: r.id,
            title: r.title,
            url: r.url,
            domain: r.domain,
            screenshotUrl: r.screenshotUrl,
            palette: r.palette,
            tags: r.tags,
            notesMarkdown: r.notesMarkdown,
          })),
        };
      }
    }
    return null;
  }, [publicMoodboardData, publicMoodboardCollectionId, collections, references, userProfile?.full_name, effectiveUser?.email]);

  const lastLoadedUserIdRef = useRef<string | null>(null);
  const hasPromptedOnboardingRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // 4. Load user data strictly from Neon with background sync separation
  const loadUserCloudData = useCallback(
    async (options?: { background?: boolean }) => {
      if (!user) return;
      const isBackground = options?.background || hasInitialLoadCompleted;

      if (!isBackground) {
        setIsInitialSessionLoading(true);
      } else {
        setIsBackgroundSyncing(true);
      }
      setCloudError(null);

      try {
        const [cloudData, profileData] = await Promise.all([
          neonService.fetchUserData(user.id),
          neonService.fetchUserProfile(user.id),
        ]);
        setReferences(cloudData.references);
        setProjects(cloudData.projects);
        setCollections(cloudData.collections);
        setUserProfile(profileData);
        setHasInitialLoadCompleted(true);
        lastLoadedUserIdRef.current = user.id;

        // Sync theme preference from profile if available
        if (profileData?.preferences?.theme) {
          setTheme(profileData.preferences.theme);
        }

        // Mark onboarding checked without intrusive automatic popup
        if (
          profileData &&
          !profileData.onboarding_completed &&
          !hasPromptedOnboardingRef.current
        ) {
          hasPromptedOnboardingRef.current = true;
        }
      } catch (err: any) {
        console.error('Falha ao carregar dados do Salvei:', err);
        if (!hasInitialLoadCompleted) {
          setCloudError(
            'Não foi possível conectar ao seu acervo em nuvem. Verifique sua conexão com a internet.'
          );
        } else {
          showToast('Não foi possível sincronizar suas alterações com a nuvem.');
        }
      } finally {
        setIsInitialSessionLoading(false);
        setIsBackgroundSyncing(false);
      }
    },
    [user, hasInitialLoadCompleted, setTheme, showToast]
  );

  useEffect(() => {
    if (user) {
      if (lastLoadedUserIdRef.current !== user.id) {
        loadUserCloudData({ background: false });
      }
    } else if (!isGuestMode) {
      // Clear private state upon logout
      setReferences([]);
      setProjects([]);
      setCollections([]);
      setUserProfile(null);
      setCloudError(null);
      setSelectedReferenceId(null);
      setActiveProjectId(null);
      setActiveCollectionId(null);
      setActiveTag(null);
      setSelectedBatchIds([]);
      setHasInitialLoadCompleted(false);
      setIsInitialSessionLoading(true);
      setIsBackgroundSyncing(false);
      lastLoadedUserIdRef.current = null;
      hasPromptedOnboardingRef.current = false;
    }
  }, [user, isGuestMode, loadUserCloudData]);

  // Guest Mode Initialization: load references from localStorage
  useEffect(() => {
    if (isGuestMode && !user) {
      try {
        const storedRefs = localStorage.getItem(LOCAL_STORAGE_REFS_KEY);
        const storedProjects = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
        const storedCols = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY);

        if (storedRefs) {
          const parsed: Reference[] = JSON.parse(storedRefs);
          const hydrated = parsed.map((ref) => {
            if (!ref.palette || ref.palette.length === 0) {
              const match = GUEST_STARTER_REFERENCES.find((s) => s.id === ref.id);
              if (match?.palette) return { ...ref, palette: match.palette };
            }
            return ref;
          });
          setReferences(hydrated);
        } else {
          setReferences(GUEST_STARTER_REFERENCES);
          localStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify(GUEST_STARTER_REFERENCES));
        }

        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        } else {
          setProjects([]);
        }

        if (storedCols) {
          setCollections(JSON.parse(storedCols));
        } else {
          setCollections([]);
        }

        setHasInitialLoadCompleted(true);
        setIsInitialSessionLoading(false);
      } catch (e) {
        console.error('Erro ao inicializar modo local:', e);
        setReferences(GUEST_STARTER_REFERENCES);
        setHasInitialLoadCompleted(true);
        setIsInitialSessionLoading(false);
      }
    }
  }, [isGuestMode, user]);

  // Guest Mode Persistence: save changes to localStorage
  useEffect(() => {
    if (isGuestMode && !user && hasInitialLoadCompleted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify(references));
      } catch (e) {
        console.error('Erro ao persistir referências locais:', e);
      }
    }
  }, [references, isGuestMode, user, hasInitialLoadCompleted]);

  useEffect(() => {
    if (isGuestMode && !user && hasInitialLoadCompleted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
      } catch (e) {
        console.error('Erro ao persistir projetos locais:', e);
      }
    }
  }, [projects, isGuestMode, user, hasInitialLoadCompleted]);

  useEffect(() => {
    if (isGuestMode && !user && hasInitialLoadCompleted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_COLLECTIONS_KEY, JSON.stringify(collections));
      } catch (e) {
        console.error('Erro ao persistir coleções locais:', e);
      }
    }
  }, [collections, isGuestMode, user, hasInitialLoadCompleted]);

  // Seamless Cloud Migration: when user signs up or logs in, migrate local guest references to cloud
  useEffect(() => {
    if (user && hasInitialLoadCompleted) {
      const storedRefs = localStorage.getItem(LOCAL_STORAGE_REFS_KEY);
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      const storedCols = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY);

      if (storedRefs || storedProjects || storedCols) {
        const parsedRefs: Reference[] = storedRefs ? JSON.parse(storedRefs) : [];
        const parsedProjects: Project[] = storedProjects ? JSON.parse(storedProjects) : [];
        const parsedCols: Collection[] = storedCols ? JSON.parse(storedCols) : [];

        // Exclude the demo starters if unchanged
        const userCreatedRefs = parsedRefs.filter((r) => !r.id.startsWith('local-demo-'));

        if (userCreatedRefs.length > 0 || parsedProjects.length > 0 || parsedCols.length > 0) {
          (async () => {
            try {
              for (const p of parsedProjects) {
                await neonService.saveProject(user.id, p);
              }
              for (const c of parsedCols) {
                await neonService.saveCollection(user.id, c);
              }
              for (const r of userCreatedRefs) {
                await neonService.saveReference(user.id, r);
              }
              showToast(
                `Migração concluída! ${userCreatedRefs.length} referência(s) sincronizada(s) na nuvem.`
              );
              loadUserCloudData();
            } catch (err) {
              console.error('Erro ao migrar dados locais para nuvem:', err);
            } finally {
              localStorage.removeItem(LOCAL_STORAGE_REFS_KEY);
              localStorage.removeItem(LOCAL_STORAGE_PROJECTS_KEY);
              localStorage.removeItem(LOCAL_STORAGE_COLLECTIONS_KEY);
              localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
              setIsGuestMode(false);
            }
          })();
        } else {
          localStorage.removeItem(LOCAL_STORAGE_REFS_KEY);
          localStorage.removeItem(LOCAL_STORAGE_PROJECTS_KEY);
          localStorage.removeItem(LOCAL_STORAGE_COLLECTIONS_KEY);
          localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
          setIsGuestMode(false);
        }
      }
    }
  }, [user, hasInitialLoadCompleted, loadUserCloudData, showToast]);

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
  const [selectedColorHex, setSelectedColorHex] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'moodboard'>('grid');

  // 6. Modal, SidePanel & Expanded View States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialMode, setAddModalInitialMode] = useState<'image' | 'url'>('image');
  const [pastedUrl, setPastedUrl] = useState<string | null>(null);
  const [pastedFile, setPastedFile] = useState<File | null>(null);
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('palette') === 'true';
    }
    return false;
  });
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
    if (isCommandPaletteOpen) {
      params.set('palette', 'true');
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
    isCommandPaletteOpen,
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

      const auth = params.get('auth');
      if (auth === 'login' || auth === 'signup') {
        setAuthViewMode(auth);
      } else {
        setAuthViewMode(null);
      }
      setShowLandingForUser(params.get('landing') === 'true');

      const share = parseShareFromLocation();
      if (share.isShared) {
        setPublicMoodboardCollectionId(share.collectionId);
        setPublicMoodboardData(share.data);
      } else {
        setPublicMoodboardCollectionId(null);
        setPublicMoodboardData(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clear authViewMode and remove ?auth query param when user is successfully authenticated
  useEffect(() => {
    if (effectiveUser && authViewMode) {
      setAuthViewMode(null);
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        params.delete('auth');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [effectiveUser, authViewMode]);

  // Global Paste Listener (Ctrl+V) for instant URL and Image capture
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Do not intercept if user is typing in an active form input, textarea, or contenteditable element
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);
      if (isInput) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // 1. Check for image file in clipboard (e.g. Print Screen or copied image)
      const files = Array.from(clipboardData.files);
      const imageFile = files.find((f) => f.type.startsWith('image/'));

      if (imageFile) {
        e.preventDefault();
        setAddModalInitialMode('image');
        setPastedFile(imageFile);
        setPastedUrl(null);
        setIsAddModalOpen(true);
        showToast('Imagem colada da área de transferência!');
        return;
      }

      // Check items for image blob
      for (const item of Array.from(clipboardData.items)) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            const file = new File([blob], `captura-${Date.now()}.png`, { type: blob.type });
            setAddModalInitialMode('image');
            setPastedFile(file);
            setPastedUrl(null);
            setIsAddModalOpen(true);
            showToast('Captura de tela colada da área de transferência!');
            return;
          }
        }
      }

      // 2. Check for text URL
      const text = clipboardData.getData('text')?.trim();
      if (text) {
        const isUrl =
          text.startsWith('http://') ||
          text.startsWith('https://') ||
          (/^[\w-]+(\.[\w-]+)+[/#?]?.*$/.test(text) && !text.includes(' ') && text.length < 500);

        if (isUrl) {
          e.preventDefault();
          const cleanUrl = text.startsWith('http') ? text : `https://${text}`;
          setAddModalInitialMode('url');
          setPastedUrl(cleanUrl);
          setPastedFile(null);
          setIsAddModalOpen(true);
          showToast('Link detectado na área de transferência!');
          return;
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [showToast]);

  // Export full user library as JSON backup
  const handleExportBackup = () => {
    try {
      const backupData = {
        salvei_version: '0.3',
        exportedAt: new Date().toISOString(),
        totalReferences: references.length,
        totalProjects: projects.length,
        totalCollections: collections.length,
        references,
        projects,
        collections,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `salvei-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Backup completo exportado com sucesso (.json)!');
    } catch {
      showToast('Falha ao exportar backup.');
    }
  };

  // Import references, projects & collections from Bookmarks HTML or JSON Backup
  const handleImportData = useCallback(
    (imported: { references: Reference[]; projects: Project[]; collections: Collection[] }) => {
      if (imported.references.length > 0) {
        setReferences((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newItems = imported.references.filter((r) => !existingIds.has(r.id));
          const updated = [...newItems, ...prev];
          if (isGuestMode) {
            localStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify(updated));
          }
          return updated;
        });
      }
      if (imported.projects && imported.projects.length > 0) {
        setProjects((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = imported.projects.filter((p) => !existingIds.has(p.id));
          const updated = [...prev, ...newItems];
          if (isGuestMode) {
            localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updated));
          }
          return updated;
        });
      }
      if (imported.collections && imported.collections.length > 0) {
        setCollections((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newItems = imported.collections.filter((c) => !existingIds.has(c.id));
          const updated = [...prev, ...newItems];
          if (isGuestMode) {
            localStorage.setItem(LOCAL_STORAGE_COLLECTIONS_KEY, JSON.stringify(updated));
          }
          return updated;
        });
      }
    },
    [isGuestMode]
  );

  // Web Clipper Query Parameter Detection (?quick_save=1)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('quick_save') === '1') {
      const capturedUrl = params.get('url');
      if (capturedUrl) {
        setPastedUrl(capturedUrl);
        setAddModalInitialMode('url');
        setIsAddModalOpen(true);
        showToast('Link capturado via Web Clipper!');
      }

      // Limpa os parâmetros de busca da URL sem recarregar
      const cleanParams = new URLSearchParams(window.location.search);
      cleanParams.delete('quick_save');
      cleanParams.delete('url');
      cleanParams.delete('title');
      cleanParams.delete('image');
      const newQuery = cleanParams.toString();
      window.history.replaceState(null, '', window.location.pathname + (newQuery ? `?${newQuery}` : ''));
    }
  }, [showToast]);

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
      selectedColorHex,
      sortOption,
    });
  }, [
    references,
    searchQuery,
    selectedTags,
    selectedProjectIds,
    selectedCollectionIds,
    contentTypes,
    selectedColorHex,
    sortOption,
  ]);

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedTags.length > 0 ||
    selectedProjectIds.length > 0 ||
    selectedCollectionIds.length > 0 ||
    contentTypes.length > 0 ||
    Boolean(selectedColorHex);

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
    setSelectedColorHex(undefined);
  };

  // Reference update handler (Cloud or Local Guest Mode)
  const handleUpdateReference = useCallback(
    async (id: string, updates: Partial<Reference>) => {
      if (!user && !isGuestMode) return;
      if (isGuestMode && !user) {
        setReferences((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          )
        );
        showToast('Referência atualizada localmente.');
        return;
      }
      try {
        await neonService.updateReference(user!.id, id, updates);
        setReferences((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          )
        );
        showToast('Referência atualizada com sucesso.');
      } catch (err: any) {
        console.error('Erro ao atualizar referência:', err);
        showToast(`Erro ao atualizar: ${err.message || 'Falha no banco.'}`);
      }
    },
    [user, isGuestMode, showToast]
  );

  // Freeform Moodboard Canvas Card Position update
  const handleUpdateCanvasPosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      handleUpdateReference(id, { canvasPosition: position });
    },
    [handleUpdateReference]
  );

  // Reference deletion handler (Cloud or Local Guest Mode)
  const handleDeleteReference = useCallback(
    async (id: string) => {
      if (!user && !isGuestMode) return;
      if (isGuestMode && !user) {
        setReferences((prev) => prev.filter((r) => r.id !== id));
        if (selectedReferenceId === id) {
          setSelectedReferenceId(null);
          setIsExpandedViewOpen(false);
        }
        showToast('Referência excluída.');
        return;
      }
      try {
        await neonService.deleteReference(user!.id, id);
        setReferences((prev) => prev.filter((r) => r.id !== id));

        if (selectedReferenceId === id) {
          setSelectedReferenceId(null);
          setIsExpandedViewOpen(false);
        }

        showToast('Referência excluída com sucesso.');
      } catch (err: any) {
        console.error('Erro ao excluir:', err);
        showToast(`Erro ao excluir: ${err.message || 'Falha na comunicação com o banco.'}`);
      }
    },
    [user, isGuestMode, selectedReferenceId, showToast]
  );

  // Quick Action: Favorite toggle (Cloud or Local Guest Mode)
  const handleToggleFavorite = useCallback(
    async (id: string, nextFavorite: boolean) => {
      if (!user && !isGuestMode) return;
      if (isGuestMode && !user) {
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
        return;
      }
      try {
        await neonService.toggleFavorite(user!.id, id, nextFavorite);
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
    [user, isGuestMode, showToast]
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

      const shortcutsAllowed = userProfile?.preferences?.shortcuts_enabled !== false;

      // 2. Multi-Select All Visible: Ctrl+A / Cmd+A
      // Intercept only when multi-selection context is active (selectedBatchIds > 0)
      // and not inside an editable field and no text is selected
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && shortcutsAllowed) {
        const textSelection = window.getSelection()?.toString();
        const hasTextSelection = textSelection && textSelection.trim().length > 0;
        if (!isInputFocused && !hasTextSelection && selectedBatchIds.length > 0) {
          e.preventDefault();
          handleSelectAllVisible();
          return;
        }
      }

      // 3. Global Search Focus: '/'
      if (e.key === '/' && !isInputFocused && !e.ctrlKey && !e.metaKey && shortcutsAllowed) {
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
      if (e.key === '?' && !isInputFocused && shortcutsAllowed) {
        e.preventDefault();
        setIsKeyboardShortcutsModalOpen(true);
        return;
      }

      // 5. New Reference: 'N'
      if (e.key.toLowerCase() === 'n' && !isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey && shortcutsAllowed) {
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
        isAddModalOpen ||
        isProfileModalOpen ||
        isOnboardingModalOpen;

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused && !hasAnyModalOpen) {
        if (selectedBatchIds.length > 0) {
          e.preventDefault();
          setIsBulkDeleteModalOpen(true);
          return;
        }
      }

      // 7. Escape hierarchy (closes top-most open surface or clears selection)
      if (e.key === 'Escape') {
        if (isProfileModalOpen) {
          e.preventDefault();
          setIsProfileModalOpen(false);
          return;
        }
        if (isOnboardingModalOpen) {
          e.preventDefault();
          setIsOnboardingModalOpen(false);
          return;
        }
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
    isProfileModalOpen,
    isOnboardingModalOpen,
    isExpandedViewOpen,
    selectedReferenceId,
    selectedBatchIds,
    searchQuery,
    userProfile,
    handleSelectAllVisible,
    showToast,
  ]);

  // ============================================================================
  // USER PROFILE, PREFERENCES & SAFE LOGOUT HANDLERS (FASE 9)
  // ============================================================================
  const handleCompleteOnboarding = async () => {
    if (!user) {
      setIsOnboardingModalOpen(false);
      return;
    }
    try {
      await neonService.completeOnboarding(user.id);
      setUserProfile((prev) => (prev ? { ...prev, onboarding_completed: true } : null));
      setIsOnboardingModalOpen(false);
      showToast('Tutorial concluído! Bom proveito no Salvei.');
    } catch (err: any) {
      console.error('Falha ao concluir tutorial:', err);
      setIsOnboardingModalOpen(false);
    }
  };

  const handleSafeLogout = async () => {
    // 1. Immediately wipe in-memory private user state
    setReferences([]);
    setProjects([]);
    setCollections([]);
    setUserProfile(null);
    setSelectedReferenceId(null);
    setActiveProjectId(null);
    setActiveCollectionId(null);
    setActiveTag(null);
    setSelectedBatchIds([]);
    setHasInitialLoadCompleted(false);
    setIsInitialSessionLoading(true);
    setIsBackgroundSyncing(false);
    lastLoadedUserIdRef.current = null;
    hasPromptedOnboardingRef.current = false;
    setIsProfileModalOpen(false);
    setIsOnboardingModalOpen(false);
    setAuthViewMode(null);
    setShowLandingForUser(false);
    // 2. Perform secure auth sign out
    await signOut();
  };

  const handleExitGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
    setShowLandingForUser(false);
    setAuthViewMode(null);
    setReferences([]);
    setProjects([]);
    setCollections([]);
    setHasInitialLoadCompleted(false);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('guest');
      params.delete('mode');
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
      window.history.replaceState(null, '', newUrl);
    }
    showToast('Você retornou à apresentação.');
  };

  // Batch Operations Handlers (Cloud or Local Guest Mode)
  const handleBulkFavorite = useCallback(
    async (favorite: boolean) => {
      if ((!user && !isGuestMode) || selectedBatchIds.length === 0) return;
      if (isGuestMode && !user) {
        const updatedSet = new Set(selectedBatchIds);
        setReferences((prev) =>
          prev.map((r) =>
            updatedSet.has(r.id)
              ? { ...r, isFavorite: favorite, updatedAt: new Date().toISOString() }
              : r
          )
        );
        showToast(
          `${selectedBatchIds.length} ${
            selectedBatchIds.length === 1 ? 'referência' : 'referências'
          } ${favorite ? 'adicionada aos favoritos' : 'removida dos favoritos'}.`
        );
        return;
      }
      setIsProcessingBatch(true);
      try {
        const result = await neonService.bulkUpdateFavorite(user!.id, selectedBatchIds, favorite);
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
    [user, isGuestMode, selectedBatchIds, showToast]
  );

  const handleBulkAssociateCollection = useCallback(
    async (collectionId: string, action: 'add' | 'remove') => {
      if ((!user && !isGuestMode) || selectedBatchIds.length === 0) return;
      const targetCollection = collections.find((c) => c.id === collectionId);
      const colName = targetCollection ? targetCollection.name : 'coleção';

      if (isGuestMode && !user) {
        const targetIds = new Set(selectedBatchIds);
        setReferences((prev) =>
          prev.map((r) => {
            if (!targetIds.has(r.id)) return r;
            const currentCols = r.collectionIds || [];
            const nextCols =
              action === 'add'
                ? Array.from(new Set([...currentCols, collectionId]))
                : currentCols.filter((id) => id !== collectionId);
            return { ...r, collectionIds: nextCols, updatedAt: new Date().toISOString() };
          })
        );
        showToast(
          `${selectedBatchIds.length} referências ${
            action === 'add' ? 'adicionadas à' : 'removidas da'
          } coleção "${colName}".`
        );
        return;
      }

      setIsProcessingBatch(true);
      try {
        let result: neonService.BatchOperationResult;
        if (action === 'add') {
          result = await neonService.bulkAddCollection(user!.id, selectedBatchIds, collectionId);
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
          result = await neonService.bulkRemoveCollection(user!.id, selectedBatchIds, collectionId);
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
    [user, isGuestMode, selectedBatchIds, collections, showToast]
  );

  const handleBulkAssociateProject = useCallback(
    async (projectId: string, action: 'add' | 'remove') => {
      if ((!user && !isGuestMode) || selectedBatchIds.length === 0) return;
      const targetProject = projects.find((p) => p.id === projectId);
      const projName = targetProject ? targetProject.name : 'projeto';

      if (isGuestMode && !user) {
        const targetIds = new Set(selectedBatchIds);
        setReferences((prev) =>
          prev.map((r) => {
            if (!targetIds.has(r.id)) return r;
            const currentProjs = r.projectIds || [];
            const nextProjs =
              action === 'add'
                ? Array.from(new Set([...currentProjs, projectId]))
                : currentProjs.filter((id) => id !== projectId);
            return { ...r, projectIds: nextProjs, updatedAt: new Date().toISOString() };
          })
        );
        showToast(
          `${selectedBatchIds.length} referências ${
            action === 'add' ? 'associadas ao' : 'removidas do'
          } projeto "${projName}".`
        );
        return;
      }

      setIsProcessingBatch(true);
      try {
        let result: neonService.BatchOperationResult;
        if (action === 'add') {
          result = await neonService.bulkAddProject(user!.id, selectedBatchIds, projectId);
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
          result = await neonService.bulkRemoveProject(user!.id, selectedBatchIds, projectId);
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
    [user, isGuestMode, selectedBatchIds, projects, showToast]
  );

  const handleBulkTags = useCallback(
    async (tags: string[], action: 'add' | 'remove') => {
      if ((!user && !isGuestMode) || selectedBatchIds.length === 0 || tags.length === 0) return;
      const normTags = tags.map((t) => normalizeTag(t)).filter(Boolean);

      if (isGuestMode && !user) {
        const targetIds = new Set(selectedBatchIds);
        setReferences((prev) =>
          prev.map((r) => {
            if (!targetIds.has(r.id)) return r;
            const currentTags = r.tags || [];
            const nextTags =
              action === 'add'
                ? Array.from(new Set([...currentTags, ...normTags]))
                : currentTags.filter((t) => !normTags.includes(t));
            return { ...r, tags: nextTags, updatedAt: new Date().toISOString() };
          })
        );
        showToast(`Etiquetas ${action === 'add' ? 'adicionadas' : 'removidas'}.`);
        return;
      }

      setIsProcessingBatch(true);
      try {
        let result: neonService.BatchOperationResult;

        if (action === 'add') {
          result = await neonService.bulkAddTags(user!.id, selectedBatchIds, normTags);
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
          result = await neonService.bulkRemoveTags(user!.id, selectedBatchIds, normTags);
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
    [user, isGuestMode, selectedBatchIds, showToast]
  );

  const handleBulkDeleteConfirm = useCallback(async () => {
    if ((!user && !isGuestMode) || selectedBatchIds.length === 0) return;
    if (isGuestMode && !user) {
      const deletedSet = new Set(selectedBatchIds);
      setReferences((prev) => prev.filter((r) => !deletedSet.has(r.id)));
      if (selectedReferenceId && deletedSet.has(selectedReferenceId)) {
        setSelectedReferenceId(null);
        setIsExpandedViewOpen(false);
      }
      const count = selectedBatchIds.length;
      setSelectedBatchIds([]);
      setIsBulkDeleteModalOpen(false);
      showToast(count === 1 ? '1 referência removida do acervo.' : `${count} referências removidas do acervo.`);
      return;
    }

    setIsProcessingBatch(true);
    try {
      const result = await neonService.bulkDeleteReferences(user!.id, selectedBatchIds);
      if (result.successCount > 0) {
        const deletedSet = new Set(selectedBatchIds);
        setReferences((prev) => prev.filter((r) => !deletedSet.has(r.id)));
        if (selectedReferenceId && deletedSet.has(selectedReferenceId)) {
          setSelectedReferenceId(null);
          setIsExpandedViewOpen(false);
        }
        setSelectedBatchIds([]);
        setIsBulkDeleteModalOpen(false);
        showToast(result.successCount === 1 ? '1 referência removida do acervo.' : `${result.successCount} referências removidas do acervo.`);
      }
      if (result.failedCount > 0) {
        showToast(`Falha ao excluir ${result.failedCount} itens: ${result.errors?.[0] || 'Erro'}`);
      }
    } catch (err: any) {
      showToast(`Erro ao excluir em lote: ${err.message || 'Falha na comunicação'}`);
    } finally {
      setIsProcessingBatch(false);
    }
  }, [user, isGuestMode, selectedBatchIds, selectedReferenceId, showToast]);

  // Project Management Handlers (Confirmed by Neon)
  const handleCreateProject = async (name: string, description?: string) => {
    if (!user && !isGuestMode) return;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isGuestMode && !user) {
      setProjects((prev) => [newProject, ...prev]);
      showToast(`Projeto "${name}" salvo localmente!`);
      return;
    }

    try {
      await neonService.saveProject(user!.id, newProject);
      setProjects((prev) => [newProject, ...prev]);
      showToast(`Projeto "${name}" salvo com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao salvar projeto no Neon:', err);
      showToast(`Erro ao salvar projeto: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleEditProject = async (id: string, name: string, description?: string) => {
    if (!user && !isGuestMode) return;
    const existing = projects.find((p) => p.id === id);
    if (!existing) return;

    const updatedProject: Project = {
      ...existing,
      name,
      description,
      updatedAt: new Date().toISOString(),
    };

    if (isGuestMode && !user) {
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
      showToast('Projeto atualizado localmente.');
      return;
    }

    try {
      await neonService.saveProject(user!.id, updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
      showToast('Projeto atualizado com sucesso.');
    } catch (err: any) {
      console.error('Erro ao atualizar projeto no Neon:', err);
      showToast(`Erro ao atualizar projeto: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!user && !isGuestMode) return;
    if (isGuestMode && !user) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
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
      if (activeProjectId === id) setActiveProjectId(null);
      showToast('Projeto removido. Referências preservadas.');
      return;
    }

    try {
      await neonService.deleteProject(user!.id, id);
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
      showToast('Projeto removido. Referências preservadas.');
    } catch (err: any) {
      console.error('Erro ao excluir projeto no Neon:', err);
      showToast(`Erro ao excluir projeto: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleSaveProjectAssociations = async (projectId: string, referenceIds: string[]) => {
    if (!user && !isGuestMode) return;
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

    if (isGuestMode && !user) {
      showToast('Associações do projeto atualizadas localmente.');
      return;
    }

    try {
      await neonService.syncProjectReferences(projectId, referenceIds);
      showToast('Associações do projeto sincronizadas com a nuvem.');
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

  // Collection Management Handlers (Confirmed by Neon)
  const handleCreateCollection = async (name: string, description?: string) => {
    if (!user && !isGuestMode) return;
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isGuestMode && !user) {
      setCollections((prev) => [newCol, ...prev]);
      showToast(`Coleção "${name}" salva localmente!`);
      return;
    }

    try {
      await neonService.saveCollection(user!.id, newCol);
      setCollections((prev) => [newCol, ...prev]);
      showToast(`Coleção "${name}" salva com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao salvar coleção no Neon:', err);
      showToast(`Erro ao salvar coleção: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleEditCollection = async (id: string, name: string, description?: string) => {
    if (!user && !isGuestMode) return;
    const existing = collections.find((c) => c.id === id);
    if (!existing) return;

    const updatedCol: Collection = {
      ...existing,
      name,
      description,
      updatedAt: new Date().toISOString(),
    };

    if (isGuestMode && !user) {
      setCollections((prev) => prev.map((c) => (c.id === id ? updatedCol : c)));
      showToast('Coleção atualizada localmente.');
      return;
    }

    try {
      await neonService.saveCollection(user!.id, updatedCol);
      setCollections((prev) => prev.map((c) => (c.id === id ? updatedCol : c)));
      showToast('Coleção atualizada com sucesso.');
    } catch (err: any) {
      console.error('Erro ao atualizar coleção no Neon:', err);
      showToast(`Erro ao atualizar coleção: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!user && !isGuestMode) return;
    if (isGuestMode && !user) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
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
      if (activeCollectionId === id) setActiveCollectionId(null);
      showToast('Coleção removida. Referências preservadas.');
      return;
    }

    try {
      await neonService.deleteCollection(user!.id, id);
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
      showToast('Coleção removida. Referências preservadas.');
    } catch (err: any) {
      console.error('Erro ao excluir coleção no Neon:', err);
      showToast(`Erro ao excluir coleção: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleSaveCollectionAssociations = async (collectionId: string, referenceIds: string[]) => {
    if (!user && !isGuestMode) return;
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

    if (isGuestMode && !user) {
      showToast('Associações da coleção atualizadas localmente.');
      return;
    }

    try {
      await neonService.syncCollectionReferences(collectionId, referenceIds);
      showToast('Associações da coleção sincronizadas com a nuvem.');
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

  const handleOpenPublicMoodboard = useCallback((collectionId: string) => {
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return;
    const colRefs = references.filter((r) => r.collectionIds?.includes(col.id));
    const payload: SharedCollectionData = {
      version: 1,
      id: col.id,
      name: col.name,
      description: col.description,
      createdAt: col.createdAt,
      authorName: userProfile?.full_name || effectiveUser?.email?.split('@')[0] || 'Curador Salvei',
      references: colRefs.map((r) => ({
        id: r.id,
        title: r.title,
        url: r.url,
        domain: r.domain,
        screenshotUrl: r.screenshotUrl,
        palette: r.palette,
        tags: r.tags,
        notesMarkdown: r.notesMarkdown,
      })),
    };
    setPublicMoodboardData(payload);
    setPublicMoodboardCollectionId(collectionId);
    if (typeof window !== 'undefined') {
      const url = generateCollectionShareUrl(col, references, payload.authorName);
      window.history.pushState(null, '', url);
    }
  }, [collections, references, userProfile?.full_name, effectiveUser?.email]);

  const handleExitPublicMoodboard = useCallback(() => {
    setPublicMoodboardData(null);
    setPublicMoodboardCollectionId(null);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('share');
      params.delete('id');
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  // Tag Management Handlers (Confirmed by Neon)
  const handleCreateTag = (newTag: string) => {
    const norm = normalizeTag(newTag);
    if (!norm) return;
    showToast(`Etiqueta #${norm} pronta para uso.`);
  };

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!user && !isGuestMode) return;
    const normOld = normalizeTag(oldTag);
    const normNew = normalizeTag(newTag);
    if (!normNew || normOld === normNew) return;

    if (isGuestMode && !user) {
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
      showToast(`Etiqueta #${normOld} renomeada para #${normNew}.`);
      return;
    }

    try {
      await neonService.renameTag(user!.id, normOld, normNew);
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
      showToast(`Etiqueta #${normOld} renomeada para #${normNew}.`);
    } catch (err: any) {
      console.error('Erro ao renomear tag no Neon:', err);
      showToast(`Erro ao renomear tag: ${err.message || 'Falha no banco.'}`);
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!user && !isGuestMode) return;
    const normDelete = normalizeTag(tagToDelete);
    if (isGuestMode && !user) {
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
      showToast(`Etiqueta #${normDelete} removida das referências.`);
      return;
    }

    try {
      await neonService.deleteTag(user!.id, normDelete);
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
      showToast(`Etiqueta #${normDelete} removida das referências.`);
    } catch (err: any) {
      console.error('Erro ao excluir tag no Neon:', err);
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
    palette: passedPalette,
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
    palette?: ColorPaletteItem[];
    projectIds?: string[];
    collectionIds?: string[];
    codeSnippets?: CodeSnippet[];
    relatedFiles?: ReferenceFile[];
  }) => {
    if (!user && !isGuestMode) {
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
      if (user) {
        const uploadRes = await neonService.uploadMediaFile(user.id, imageFile, 'screenshots');
        screenshotUrl = uploadRes.url;
        imageStorageId = uploadRes.storagePath;
      } else {
        screenshotUrl = await readFileAsDataUrl(imageFile);
      }
      screenshotStatus = 'ready';
      originalFileName = imageFile.name;
    } else if (DOMAIN_SCREENSHOTS[domain]) {
      screenshotUrl = DOMAIN_SCREENSHOTS[domain];
      screenshotStatus = 'ready';
    }

    const finalTitle = title || `${domain.charAt(0).toUpperCase() + domain.slice(1)} — Referência Web`;
    const finalTags = tags && tags.length > 0 ? tags.map(normalizeTag) : ['web', 'referencia'];

    let palette: ColorPaletteItem[] | undefined = passedPalette;
    if (!palette && screenshotUrl) {
      try {
        const extracted = await extractPaletteFromImage(screenshotUrl, 5);
        if (extracted && extracted.length > 0) palette = extracted;
      } catch {}
    }

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
      palette,
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

    if (user) {
      await neonService.saveReference(user.id, newReference);
    }

    setReferences((prev) => [newReference, ...prev]);
    setCurrentDestination('inbox');
    setSelectedReferenceId(newReference.id);
    showToast('Referência salva com sucesso!');
  };

  const handleRestoreDemoReferences = useCallback(() => {
    setReferences(GUEST_STARTER_REFERENCES);
    if (!user || isGuestMode) {
      localStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify(GUEST_STARTER_REFERENCES));
    }
    showToast('Acervo de demonstração restaurado com referências curadas.');
  }, [user, isGuestMode, showToast]);

  const handleSaveImages = async (
    items: {
      file: File;
      title: string;
      tags?: string[];
      sourceUrl?: string;
      notes?: string;
      palette?: ColorPaletteItem[];
      projectIds?: string[];
      collectionIds?: string[];
    }[]
  ) => {
    if (!user && !isGuestMode) {
      throw new Error('Sessão expirada. Faça login novamente para salvar imagens.');
    }

    const newReferences: Reference[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let screenshotUrl: string | undefined = undefined;
      let storagePath: string | undefined = undefined;

      if (user) {
        const uploadRes = await neonService.uploadMediaFile(user.id, item.file, 'screenshots');
        screenshotUrl = uploadRes.url;
        storagePath = uploadRes.storagePath;
      } else {
        screenshotUrl = await readFileAsDataUrl(item.file);
      }

      let domain: string | undefined = undefined;
      if (item.sourceUrl) {
        try {
          const parsed = new URL(item.sourceUrl);
          domain = parsed.hostname.replace(/^www\./, '');
        } catch {
          // fallback
        }
      }

      let palette: ColorPaletteItem[] | undefined = item.palette;
      if (!palette && screenshotUrl) {
        try {
          const extracted = await extractPaletteFromImage(screenshotUrl, 5);
          if (extracted && extracted.length > 0) palette = extracted;
        } catch {}
      }

      const newRef: Reference = {
        id: `ref-${Date.now()}-${i}`,
        title: item.title,
        sourceType: item.sourceUrl ? 'both' : 'image',
        url: item.sourceUrl || undefined,
        domain,
        screenshotUrl,
        imageStorageId: storagePath,
        originalFileName: item.file.name,
        screenshotStatus: 'ready',
        palette,
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

      if (user) {
        await neonService.saveReference(user.id, newRef);
      }
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
        ? '1 imagem salva com sucesso!'
        : `${count} imagens salvas com sucesso!`
    );
  };

  const handleUpdateReferencePalette = (referenceId: string, palette: ColorPaletteItem[]) => {
    handleUpdateReference(referenceId, { palette });
  };

  // Optional tool: migrate pre-existing browser localStorage to Neon once
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
      const res = await neonService.migrateLocalDataToCloud(user.id, parsedRefs, [], []);
      showToast(`${res.migratedRefs} referências importadas com sucesso para a nuvem!`);
      // Clear legacy storage key to avoid confusion
      localStorage.removeItem('curator_references_v2');
      localStorage.removeItem('curator_references_v1');
      await loadUserCloudData({ background: false });
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
  // CONDITIONAL GATES: PUBLIC MOODBOARD, LOADING, MISSING ENV, MANDATORY AUTH, CLOUD ERROR
  // ============================================================================

  // Public Moodboard Route (Shared Collection) - Available to all visitors, guests, and users
  if (activePublicMoodboardData) {
    return (
      <PublicMoodboardView
        collectionData={activePublicMoodboardData}
        onExit={handleExitPublicMoodboard}
        onGoToAuth={(mode) => {
          handleExitPublicMoodboard();
          setAuthViewMode(mode);
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            params.set('auth', mode);
            const newSearch = params.toString();
            const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
            window.history.replaceState(null, '', newUrl);
          }
        }}
        isOwnerPreview={!!effectiveUser || isGuestMode}
      />
    );
  }

  // If visiting an invalid or expired share link
  if (publicMoodboardCollectionId && !activePublicMoodboardData && !isInitialSessionLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#14161B] border border-[#262830] rounded-xl p-8 flex flex-col items-center text-center gap-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#4355DB]/10 text-[#6375F1] flex items-center justify-center">
            <Layers size={24} />
          </div>
          <h2 className="font-bold text-lg text-white">Coleção Não Encontrada</h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            O link do moodboard compartilhado pode ter expirado ou a coleção foi removida pelo autor.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExitPublicMoodboard}
            className="mt-2 cursor-pointer"
          >
            Ir para a Página Inicial
          </Button>
        </div>
      </div>
    );
  }

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

  // Gate 2: Missing Neon environment configuration (No local fallback permitted)
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#18181B] border border-amber-500/30 rounded-xl p-8 flex flex-col gap-4 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-bold text-lg text-white">Configuração de Nuvem Ausente</h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            O Salvei opera exclusivamente conectado à nuvem privada. Defina as variáveis de ambiente necessárias no arquivo <code className="text-white">.env.local</code> para inicializar a aplicação.
          </p>
        </div>
      </div>
    );
  }

  // Gate 3: Mandatory Authentication or Landing Page for Visitors / Explicit Auth Route
  if (!effectiveUser && !isGuestMode) {
    if (authViewMode) {
      return (
        <AuthView
          initialMode={authViewMode}
          onEnterGuestMode={() => {
            setIsGuestMode(true);
            setAuthViewMode(null);
            localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, 'true');
            const stored = localStorage.getItem(LOCAL_STORAGE_REFS_KEY);
            if (stored) {
              setReferences(JSON.parse(stored));
            } else {
              setReferences(GUEST_STARTER_REFERENCES);
              localStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify(GUEST_STARTER_REFERENCES));
            }
            const storedProjs = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
            if (storedProjs) setProjects(JSON.parse(storedProjs));
            const storedCols = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY);
            if (storedCols) setCollections(JSON.parse(storedCols));
            setHasInitialLoadCompleted(true);
            setIsInitialSessionLoading(false);
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              params.delete('auth');
              const newSearch = params.toString();
              const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
              window.history.replaceState(null, '', newUrl);
            }
            showToast('Bem-vindo ao Modo Local! Suas referências ficam salvas neste navegador.');
          }}
          onSuccess={() => {
            setAuthViewMode(null);
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              params.delete('auth');
              const newSearch = params.toString();
              const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
              window.history.replaceState(null, '', newUrl);
            }
          }}
          onBackToLanding={() => {
            setAuthViewMode(null);
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              params.delete('auth');
              const newSearch = params.toString();
              const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
              window.history.replaceState(null, '', newUrl);
            }
          }}
        />
      );
    }

    return (
      <LandingPage
        onOpenAuth={(mode) => {
          setAuthViewMode(mode);
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            params.set('auth', mode);
            const newSearch = params.toString();
            const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
            window.history.replaceState(null, '', newUrl);
          }
        }}
        onEnterGuestMode={() => {
          setIsGuestMode(true);
          localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, 'true');
          const stored = localStorage.getItem(LOCAL_STORAGE_REFS_KEY);
          if (stored) {
            setReferences(JSON.parse(stored));
          } else {
            setReferences(GUEST_STARTER_REFERENCES);
            localStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify(GUEST_STARTER_REFERENCES));
          }
          const storedProjs = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
          if (storedProjs) setProjects(JSON.parse(storedProjs));
          const storedCols = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY);
          if (storedCols) setCollections(JSON.parse(storedCols));
          setHasInitialLoadCompleted(true);
          setIsInitialSessionLoading(false);
          showToast('Bem-vindo ao Modo Local! Suas referências ficam salvas neste navegador.');
        }}
      />
    );
  }

  // If authenticated user specifically navigates to view the landing page (?landing=true)
  if (showLandingForUser) {
    return (
      <LandingPage
        isLoggedIn={true}
        onGoToApp={() => {
          setShowLandingForUser(false);
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            params.delete('landing');
            const newSearch = params.toString();
            const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
            window.history.replaceState(null, '', newUrl);
          }
        }}
        onOpenAuth={() => {
          setShowLandingForUser(false);
        }}
      />
    );
  }

  // Gate 4: Cloud error screen with Retry action (Requirement 5: Shown ONLY if initial fetch failed completely)
  if (cloudError && !hasInitialLoadCompleted && !isGuestMode) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] dark:bg-[#111214] text-[#171717] dark:text-[#F3F4F6] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-xl p-8 flex flex-col items-center text-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-bold text-lg text-[#171717] dark:text-[#F3F4F6]">Não foi possível conectar ao seu acervo</h2>
          <p className="text-xs text-[#737373] dark:text-[#9CA3AF] leading-relaxed">
            {cloudError}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => loadUserCloudData({ background: false })}
              iconLeft={<RotateCcw size={14} />}
            >
              Tentar novamente
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSafeLogout}
              iconLeft={<LogOut size={14} />}
            >
              Encerrar sessão
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Gate 5: Initial cloud fetch in progress (ONLY shown before initial data has ever loaded for this session)
  if (isInitialSessionLoading && !hasInitialLoadCompleted && !isGuestMode) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] dark:bg-[#111214] text-[#171717] dark:text-[#F3F4F6] flex flex-col items-center justify-center p-6 gap-3 font-sans transition-colors">
        <Loader2 size={32} className="animate-spin text-[#4355DB]" />
        <p className="text-xs text-[#737373] dark:text-[#9CA3AF] font-mono tracking-wider uppercase">
          Carregando suas referências...
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
      profile={userProfile}
      userEmail={effectiveUser?.email || ''}
      onOpenProfile={() => setIsProfileModalOpen(true)}
      onOpenSettings={() => setCurrentDestination('settings')}
      onOpenTutorial={() => setIsOnboardingModalOpen(true)}
      isGuestMode={!effectiveUser && isGuestMode}
      onExitGuestMode={handleExitGuestMode}
      onOpenAuthModal={(mode: 'login' | 'signup' = 'signup') => {
        setAuthViewMode(mode);
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          params.set('auth', mode);
          const newSearch = params.toString();
          const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
          window.history.replaceState(null, '', newUrl);
        }
      }}
      onSignOut={!effectiveUser && isGuestMode ? handleExitGuestMode : handleSafeLogout}
    >
      {/* Global Drag and Drop Window Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-[#4355DB]/15 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#191B20] border-2 border-dashed border-[#4355DB] dark:border-[#6375F1] rounded-sm p-8 max-w-md text-center shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#4355DB]/10 dark:bg-[#6375F1]/20 text-[#4355DB] dark:text-[#6375F1] flex items-center justify-center">
              <UploadCloud size={28} />
            </div>
            <h3 className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6]">
              Solte suas imagens aqui
            </h3>
            <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF]">
              Elas serão armazenadas com segurança e salvas na sua biblioteca em nuvem.
            </p>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 px-4 py-2.5 text-xs flex items-center justify-between gap-3 font-sans mb-4 rounded-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <WifiOff size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="font-medium">
              Sem conexão com a internet. O Salvei reconectará e sincronizará com o banco assim que a rede for restabelecida.
            </span>
          </div>
          <button
            type="button"
            onClick={() => loadUserCloudData({ background: false })}
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
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-sm bg-[#171717] dark:bg-[#1C2030] border border-[#2D3139] text-white shadow-2xl text-xs font-mono tracking-wide animate-in slide-in-from-bottom-2 duration-150 max-w-[90vw]"
        >
          <CheckCircle2 size={14} className="text-[#22c55e] flex-shrink-0" />
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
          selectedColorHex={selectedColorHex}
          onSelectColorHex={setSelectedColorHex}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onUpdatePosition={handleUpdateCanvasPosition}
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
          onUpdatePalette={handleUpdateReferencePalette}
          onRestoreDemoReferences={handleRestoreDemoReferences}
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
            onUpdatePalette={handleUpdateReferencePalette}
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
            onOpenPublicMoodboard={handleOpenPublicMoodboard}
            onUpdatePalette={handleUpdateReferencePalette}
          />
        ) : (
          <CollectionsListView
            collections={collections}
            references={references}
            onSelectCollection={(collectionId) => setActiveCollectionId(collectionId)}
            onCreateCollection={handleCreateCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
            onOpenPublicMoodboard={handleOpenPublicMoodboard}
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
          onUpdatePalette={handleUpdateReferencePalette}
        />
      )}

      {/* VIEW 5: CONFIGURAÇÕES E PREFERÊNCIAS */}
      {currentDestination === 'settings' && (
        <SettingsView
          profile={userProfile}
          userEmail={effectiveUser?.email || ''}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenTutorial={() => setIsOnboardingModalOpen(true)}
          onOpenShortcuts={() => setIsKeyboardShortcutsModalOpen(true)}
          onReloadCloudData={() => loadUserCloudData({ background: true })}
          isCloudLoading={isBackgroundSyncing}
          onSignOut={handleSafeLogout}
          showToast={showToast}
          onExportBackup={handleExportBackup}
          onImportData={handleImportData}
          onPreferencesUpdated={(newPrefs) => {
            setUserProfile((prev) => (prev ? { ...prev, preferences: newPrefs } : null));
          }}
        />
      )}

      {/* Modal de Adicionar Referência */}
      <AddReferenceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPastedUrl(null);
          setPastedFile(null);
        }}
        onSaveUrl={handleSaveUrl}
        onSaveImages={handleSaveImages}
        existingUrls={references.map((r) => r.url).filter((u): u is string => Boolean(u))}
        initialMode={addModalInitialMode}
        initialPastedUrl={pastedUrl}
        initialPastedFile={pastedFile}
        availableProjects={projects}
        availableCollections={collections}
        availableTags={availableTags}
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

      {/* Modal de Perfil do Usuário */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        userEmail={effectiveUser?.email || ''}
        onProfileUpdated={(updated) => setUserProfile(updated)}
        showToast={showToast}
      />

      {/* Modal do Tutorial de Primeiro Acesso (Onboarding) */}
      <OnboardingTutorialModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={handleCompleteOnboarding}
      />
    </AppShell>
  );
}

export default App;
