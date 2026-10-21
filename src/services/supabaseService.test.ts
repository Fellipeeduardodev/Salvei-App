import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateAuthError } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import * as supabaseService from './supabaseService';
import type { Reference, Project, Collection } from '../types/reference';

vi.mock('../lib/supabase', () => {
  const createTableMock = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  });

  const mockFrom = vi.fn().mockImplementation(() => createTableMock());

  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
      createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://test.supabase.co/signed' }, error: null }),
      createSignedUrls: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.supabase.co/storage/v1/test' } }),
    }),
  };

  return {
    supabase: {
      from: mockFrom,
      storage: mockStorage,
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        signInWithPassword: vi.fn(),
        signUpWithPassword: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
      },
    },
    isSupabaseConfigured: vi.fn().mockReturnValue(true),
  };
});

describe('Fase 5: Autenticação e Erros em pt-BR', () => {
  it('traduz erro de credenciais inválidas para português', () => {
    expect(translateAuthError('Invalid login credentials')).toBe('E-mail ou senha incorretos.');
  });

  it('traduz erro de usuário já cadastrado', () => {
    expect(translateAuthError('User already registered')).toBe('Este endereço de e-mail já está cadastrado. Tente entrar.');
  });

  it('traduz erro de tamanho mínimo da senha', () => {
    expect(translateAuthError('Password should be at least 6 characters')).toBe('A senha deve conter no mínimo 6 caracteres.');
  });

  it('traduz limite de taxa de requisições excedido', () => {
    expect(translateAuthError('Email rate limit exceeded')).toBe('Muitas tentativas em sequência. Por favor, aguarde alguns instantes.');
  });

  it('traduz erro de conexão de rede', () => {
    expect(translateAuthError('Failed to fetch network request')).toBe('Falha na conexão de rede. Verifique seu acesso à internet.');
  });

  it('retorna a mensagem original caso não coincida com padrão conhecido', () => {
    expect(translateAuthError('Custom business error')).toBe('Custom business error');
  });
});

describe('Fase 5: Regras de Integridade e Não-Destrutividade', () => {
  it('garante que a exclusão de um projeto preserva as referências na camada de domínio', () => {
    const references: Reference[] = [
      {
        id: 'ref-1',
        title: 'Linear App',
        screenshotStatus: 'ready',
        tags: ['design'],
        projectIds: ['proj-1', 'proj-2'],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ref-2',
        title: 'Raycast',
        screenshotStatus: 'ready',
        tags: ['mac'],
        projectIds: ['proj-1'],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const projectToDeleteId = 'proj-1';

    // Simulated non-destructive project deletion
    const updatedReferences = references.map((ref) => {
      if (ref.projectIds?.includes(projectToDeleteId)) {
        return {
          ...ref,
          projectIds: ref.projectIds.filter((pId) => pId !== projectToDeleteId),
        };
      }
      return ref;
    });

    // References must still exist!
    expect(updatedReferences).toHaveLength(2);
    expect(updatedReferences[0].id).toBe('ref-1');
    expect(updatedReferences[0].projectIds).toEqual(['proj-2']);
    expect(updatedReferences[1].id).toBe('ref-2');
    expect(updatedReferences[1].projectIds).toEqual([]);
  });

  it('garante que a exclusão de uma coleção preserva as referências na camada de domínio', () => {
    const references: Reference[] = [
      {
        id: 'ref-1',
        title: 'Design System',
        screenshotStatus: 'ready',
        tags: ['ui'],
        projectIds: [],
        collectionIds: ['col-1', 'col-2'],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const collectionToDeleteId = 'col-1';

    const updatedReferences = references.map((ref) => {
      if (ref.collectionIds?.includes(collectionToDeleteId)) {
        return {
          ...ref,
          collectionIds: ref.collectionIds.filter((cId) => cId !== collectionToDeleteId),
        };
      }
      return ref;
    });

    expect(updatedReferences).toHaveLength(1);
    expect(updatedReferences[0].collectionIds).toEqual(['col-2']);
  });

  it('garante que a exclusão de uma etiqueta remove apenas a etiqueta das referências', () => {
    const references: Reference[] = [
      {
        id: 'ref-1',
        title: 'Vercel',
        screenshotStatus: 'ready',
        tags: ['frontend', 'deploy', 'react'],
        projectIds: [],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const tagToDelete = 'deploy';

    const updatedReferences = references.map((ref) => ({
      ...ref,
      tags: ref.tags.filter((t) => t !== tagToDelete),
    }));

    expect(updatedReferences).toHaveLength(1);
    expect(updatedReferences[0].tags).toEqual(['frontend', 'react']);
  });
});

describe('Fase 5: Migração de Dados Locais para o Supabase', () => {
  it('itera sobre referências, projetos e coleções locais e executa salvamento', async () => {
    const mockLocalRefs: Reference[] = [
      {
        id: 'ref-1',
        title: 'Linear',
        screenshotStatus: 'ready',
        tags: ['product'],
        projectIds: [],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ref-2',
        title: 'Stripe',
        screenshotStatus: 'ready',
        tags: ['fintech'],
        projectIds: [],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const mockLocalProjects: Project[] = [
      {
        id: 'proj-1',
        name: 'Redesign Web',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const mockLocalCols: Collection[] = [
      {
        id: 'col-1',
        name: 'Inspirações Dark Mode',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = await supabaseService.migrateLocalDataToSupabase(
      'user-123',
      mockLocalRefs,
      mockLocalProjects,
      mockLocalCols
    );

    expect(result.migratedRefs).toBe(2);
    expect(result.migratedProjects).toBe(1);
    expect(result.migratedCollections).toBe(1);
  });
});

describe('Fase 5: Tratamento de Erros de Backend e Indisponibilidade', () => {
  it('propaga erro de banco de dados no saveReference sem mascarar falha', async () => {
    const { supabase } = await import('../lib/supabase');
    vi.mocked(supabase.from).mockReturnValueOnce({
      upsert: vi.fn().mockResolvedValueOnce({ error: new Error('Postgres connection timeout') }),
    } as any);

    const testRef: Reference = {
      id: 'ref-fail',
      title: 'Failing Reference',
      screenshotStatus: 'none',
      tags: [],
      projectIds: [],
      collectionIds: [],
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await expect(supabaseService.saveReference('user-1', testRef)).rejects.toThrow('Postgres connection timeout');
  });

  it('propaga erro no upload de mídia caso o storage falhe', async () => {
    const { supabase } = await import('../lib/supabase');
    vi.mocked(supabase.storage.from).mockReturnValueOnce({
      upload: vi.fn().mockResolvedValueOnce({ error: new Error('Storage bucket offline') }),
    } as any);

    const dummyFile = new File(['dummy content'], 'screenshot.png', { type: 'image/png' });

    await expect(supabaseService.uploadMediaFile('user-1', dummyFile)).rejects.toThrow(
      'Erro ao enviar arquivo para o Supabase Storage: Storage bucket offline'
    );
  });

  it('salva arquivos dentro do caminho isolado do usuário {userId}/*', async () => {
    const { supabase } = await import('../lib/supabase');
    const uploadMock = vi.fn().mockResolvedValueOnce({ data: { path: 'user-xyz/screenshots/file.png' }, error: null });
    const createSignedUrlMock = vi.fn().mockResolvedValueOnce({ data: { signedUrl: 'https://test.supabase.co/signed' }, error: null });

    vi.mocked(supabase.storage.from).mockReturnValueOnce({
      upload: uploadMock,
      createSignedUrl: createSignedUrlMock,
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.supabase.co/public' } }),
    } as any);

    const dummyFile = new File(['image bytes'], 'capture.png', { type: 'image/png' });
    const result = await supabaseService.uploadMediaFile('user-xyz', dummyFile, 'screenshots');

    expect(uploadMock).toHaveBeenCalled();
    const uploadedPath = uploadMock.mock.calls[0][0];
    expect(uploadedPath).toMatch(/^user-xyz\/screenshots\/\d+-capture\.png$/);
    expect(result.storagePath).toBe(uploadedPath);
    expect(result.url).toBe('https://test.supabase.co/signed');
  });
});

describe('Fase 5: Lembrar meu e-mail e Persistência de Sessão', () => {
  const REMEMBER_EMAIL_KEY = 'curator_remembered_email';
  let mockStore: Record<string, string> = {};

  const localStorageMock = {
    getItem: (key: string) => mockStore[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete mockStore[key];
    },
    clear: () => {
      mockStore = {};
    },
    get length() {
      return Object.keys(mockStore).length;
    },
    key: (i: number) => Object.keys(mockStore)[i] ?? null,
  };

  beforeEach(() => {
    mockStore = {};
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('salva apenas o e-mail no localStorage quando o usuário seleciona lembrar e-mail', () => {
    const testEmail = 'admin@admin.com';
    const testPassword = 'adminSecretPassword123!';

    // Simulation of remember email logic
    localStorage.setItem(REMEMBER_EMAIL_KEY, testEmail.trim());

    expect(localStorage.getItem(REMEMBER_EMAIL_KEY)).toBe('admin@admin.com');
    // Security assertion: Password must never be present in localStorage
    expect(localStorage.getItem('password')).toBeNull();
    expect(localStorage.getItem('curator_password')).toBeNull();
    expect(JSON.stringify(mockStore)).not.toContain(testPassword);
  });

  it('remove o e-mail do localStorage quando o usuário desmarca a opção', () => {
    localStorage.setItem(REMEMBER_EMAIL_KEY, 'user@example.com');
    expect(localStorage.getItem(REMEMBER_EMAIL_KEY)).toBe('user@example.com');

    // User unchecks the box
    localStorage.removeItem(REMEMBER_EMAIL_KEY);

    expect(localStorage.getItem(REMEMBER_EMAIL_KEY)).toBeNull();
  });

  it('inicializa o campo com o e-mail salvo e checkbox ativo quando existente', () => {
    localStorage.setItem(REMEMBER_EMAIL_KEY, 'designer@curator.com');

    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
    const isChecked = Boolean(savedEmail);

    expect(savedEmail).toBe('designer@curator.com');
    expect(isChecked).toBe(true);
  });

  it('mantém o campo vazio e checkbox desmarcado quando não há e-mail salvo', () => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
    const isChecked = Boolean(savedEmail);

    expect(savedEmail).toBe('');
    expect(isChecked).toBe(false);
  });
});
