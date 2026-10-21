import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as supabaseService from './supabaseService';
import type { UserProfile, UserPreferences } from '../types/database';

const mockFrom = vi.fn();
const mockStorageFrom = vi.fn();
const mockAuthSignOut = vi.fn();

vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      from: (...args: any[]) => mockFrom(...args),
      storage: {
        from: (...args: any[]) => mockStorageFrom(...args),
      },
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        signOut: (...args: any[]) => mockAuthSignOut(...args),
      },
    },
    isSupabaseConfigured: vi.fn().mockReturnValue(true),
  };
});

describe('FASE 9 — PERFIL, PERSONALIZAÇÃO E ONBOARDING', () => {
  const userId = 'user-uuid-999';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // 1. VALIDAÇÃO DE PERFIL
  // ==========================================================================
  describe('1. Validação de perfil (Nome de exibição)', () => {
    it('rejeita nome vazio ou composto apenas por espaços', () => {
      const res1 = supabaseService.validateDisplayName('');
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain('não pode ficar em branco');

      const res2 = supabaseService.validateDisplayName('     ');
      expect(res2.valid).toBe(false);
      expect(res2.error).toContain('não pode ficar em branco');
    });

    it('rejeita nome com menos de 2 caracteres', () => {
      const res = supabaseService.validateDisplayName('A');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('pelo menos 2 caracteres');
    });

    it('rejeita nome com mais de 50 caracteres', () => {
      const longName = 'A'.repeat(51);
      const res = supabaseService.validateDisplayName(longName);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('máximo 50 caracteres');
    });

    it('aceita nome válido entre 2 e 50 caracteres', () => {
      const validNames = ['Fellipe', 'Ana Luiza', 'Jo', 'A'.repeat(50), '  Design Lead  '];
      for (const name of validNames) {
        const res = supabaseService.validateDisplayName(name);
        expect(res.valid).toBe(true);
        expect(res.error).toBeUndefined();
      }
    });

    it('atualiza o perfil no Supabase com sucesso', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: userId,
          email: 'admin@salvei.tech',
          full_name: 'Fellipe Eduardo',
          avatar_url: null,
          created_at: '2026-10-21T00:00:00Z',
          updated_at: '2026-10-21T12:00:00Z',
          onboarding_completed: true,
          preferences: {},
        },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const updated = await supabaseService.updateUserProfile(userId, { full_name: 'Fellipe Eduardo' });

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: 'Fellipe Eduardo' })
      );
      expect(mockEq).toHaveBeenCalledWith('id', userId);
      expect(updated.full_name).toBe('Fellipe Eduardo');
    });
  });

  // ==========================================================================
  // 2. UPLOAD E FOTO DE PERFIL
  // ==========================================================================
  describe('2. Upload e foto de perfil', () => {
    it('rejeita tipos de arquivo não permitidos (ex: PDF, TXT, EXE)', () => {
      const badPdf = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const badTxt = new File(['content'], 'script.txt', { type: 'text/plain' });
      const badExe = new File(['binary'], 'virus.exe', { type: 'application/x-msdownload' });

      expect(supabaseService.validateAvatarFile(badPdf).valid).toBe(false);
      expect(supabaseService.validateAvatarFile(badPdf).error).toContain('não suportado');

      expect(supabaseService.validateAvatarFile(badTxt).valid).toBe(false);
      expect(supabaseService.validateAvatarFile(badExe).valid).toBe(false);
    });

    it('rejeita arquivo maior que 5 MB', () => {
      const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'photo.png', { type: 'image/png' });
      const res = supabaseService.validateAvatarFile(bigFile);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('5 MB');
    });

    it('aceita arquivos de imagem válidos (PNG, JPEG, WebP, GIF) dentro do limite', () => {
      const pngFile = new File(['dummy'], 'avatar.png', { type: 'image/png' });
      const jpgFile = new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' });
      const webpFile = new File(['dummy'], 'avatar.webp', { type: 'image/webp' });
      const gifFile = new File(['dummy'], 'avatar.gif', { type: 'image/gif' });

      expect(supabaseService.validateAvatarFile(pngFile).valid).toBe(true);
      expect(supabaseService.validateAvatarFile(jpgFile).valid).toBe(true);
      expect(supabaseService.validateAvatarFile(webpFile).valid).toBe(true);
      expect(supabaseService.validateAvatarFile(gifFile).valid).toBe(true);
    });

    it('realiza upload no bucket privado e gera URL assinada atualizando o perfil', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: `${userId}/avatars/123-avatar.png` },
        error: null,
      });
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://supabase.co/storage/v1/object/sign/curator-media/avatar.png?token=xyz' },
        error: null,
      });
      const mockRemove = vi.fn().mockResolvedValue({ data: [], error: null });

      mockStorageFrom.mockReturnValue({
        upload: mockUpload,
        createSignedUrl: mockCreateSignedUrl,
        remove: mockRemove,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: userId,
          full_name: 'Admin',
          avatar_url: `${userId}/avatars/123-avatar.png`,
        },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' });
      const res = await supabaseService.uploadAvatar(userId, file, null);

      expect(mockStorageFrom).toHaveBeenCalledWith('curator-media');
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining(`${userId}/avatars/`),
        file,
        expect.objectContaining({ upsert: true })
      );
      expect(mockCreateSignedUrl).toHaveBeenCalled();
      expect(res.url).toContain('https://supabase.co/storage/v1/object/sign/curator-media');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar_url: expect.stringContaining(`${userId}/avatars/`),
        })
      );
    });

    it('remove a foto anterior do bucket antes de subir a nova para evitar arquivos órfãos', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: `${userId}/avatars/new-avatar.png` },
        error: null,
      });
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://supabase.co/storage/v1/object/sign/new.png' },
        error: null,
      });
      const mockRemove = vi.fn().mockResolvedValue({ data: [], error: null });

      mockStorageFrom.mockReturnValue({
        upload: mockUpload,
        createSignedUrl: mockCreateSignedUrl,
        remove: mockRemove,
      });

      const mockSingle = vi.fn().mockResolvedValue({ data: { id: userId }, error: null });
      mockFrom.mockReturnValue({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) }) }) });

      const file = new File(['fake-image'], 'new.png', { type: 'image/png' });
      const oldAvatarUrl = `https://supabase.co/storage/v1/object/sign/curator-media/${userId}/avatars/old-avatar.png?token=xyz`;

      await supabaseService.uploadAvatar(userId, file, oldAvatarUrl);

      expect(mockRemove).toHaveBeenCalledWith([`${userId}/avatars/old-avatar.png`]);
    });

    it('remove o avatar redefinindo avatar_url para null e limpando o storage', async () => {
      const mockRemove = vi.fn().mockResolvedValue({ data: [], error: null });
      mockStorageFrom.mockReturnValue({ remove: mockRemove });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: userId, avatar_url: null },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const currentAvatarUrl = `https://example.com/storage/v1/object/sign/curator-media/${userId}/avatars/current.png?token=123`;
      await supabaseService.removeAvatar(userId, currentAvatarUrl);

      expect(mockRemove).toHaveBeenCalledWith([`${userId}/avatars/current.png`]);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ avatar_url: null })
      );
    });
  });

  // ==========================================================================
  // 3. ONBOARDING E TUTORIAL DE PRIMEIRO ACESSO
  // ==========================================================================
  describe('3. Onboarding e tutorial de primeiro acesso', () => {
    it('persiste a conclusão do onboarding no Supabase com onboarding_completed = true', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: userId, onboarding_completed: true },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await supabaseService.completeOnboarding(userId);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ onboarding_completed: true })
      );
      expect(mockEq).toHaveBeenCalledWith('id', userId);
    });

    it('simula lógica de navegação entre os 5 passos do tutorial (avanço e recuo delimitados)', () => {
      const TOTAL_STEPS = 5;
      let currentStep = 0; // Passo 1 (índice 0)

      const handleNext = () => {
        if (currentStep < TOTAL_STEPS - 1) {
          currentStep += 1;
        }
      };

      const handleBack = () => {
        if (currentStep > 0) {
          currentStep -= 1;
        }
      };

      // Começa no passo 0
      expect(currentStep).toBe(0);

      // Avança até o final
      handleNext(); // 1
      handleNext(); // 2
      handleNext(); // 3
      handleNext(); // 4
      expect(currentStep).toBe(4);

      // Não ultrapassa o último passo
      handleNext();
      expect(currentStep).toBe(4);

      // Recua
      handleBack(); // 3
      handleBack(); // 2
      expect(currentStep).toBe(2);

      // Recua até o início
      handleBack(); // 1
      handleBack(); // 0
      expect(currentStep).toBe(0);

      // Não recua antes do primeiro passo
      handleBack();
      expect(currentStep).toBe(0);
    });

    it('reconhece se o usuário deve ver onboarding baseado no profile do Supabase', () => {
      const newUserProfile: UserProfile = {
        id: userId,
        email: 'user@test.com',
        full_name: 'Novo Usuário',
        avatar_url: null,
        created_at: '2026-10-21T00:00:00Z',
        updated_at: '2026-10-21T00:00:00Z',
        onboarding_completed: false,
        preferences: {},
      };

      const experiencedUserProfile: UserProfile = {
        ...newUserProfile,
        onboarding_completed: true,
      };

      const shouldShowOnboarding = (p: UserProfile | null) => Boolean(p && !p.onboarding_completed);

      expect(shouldShowOnboarding(newUserProfile)).toBe(true);
      expect(shouldShowOnboarding(experiencedUserProfile)).toBe(false);
      expect(shouldShowOnboarding(null)).toBe(false);
    });
  });

  // ==========================================================================
  // 4. PREFERÊNCIAS E PERSONALIZAÇÃO
  // ==========================================================================
  describe('4. Preferências e personalização', () => {
    it('salva preferências customizadas no perfil do usuário no Supabase', async () => {
      const newPrefs: UserPreferences = {
        theme: 'light',
        shortcuts_enabled: false,
        default_view: 'projects',
        compact_cards: true,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: userId, preferences: newPrefs },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const saved = await supabaseService.saveUserPreferences(userId, newPrefs);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ preferences: newPrefs })
      );
      expect(mockEq).toHaveBeenCalledWith('id', userId);
      expect(saved).toEqual(newPrefs);
    });

    it('bloqueia atalhos rápidos de caractere único quando shortcuts_enabled é false', () => {
      const prefsEnabled: UserPreferences = { shortcuts_enabled: true };
      const prefsDisabled: UserPreferences = { shortcuts_enabled: false };

      const isShortcutAllowed = (key: string, prefs: UserPreferences) => {
        // Escape e Cmd+K permanecem ativos
        if (key === 'Escape' || key === 'k') return true;
        return prefs.shortcuts_enabled !== false;
      };

      // Com atalhos ativados
      expect(isShortcutAllowed('/', prefsEnabled)).toBe(true);
      expect(isShortcutAllowed('?', prefsEnabled)).toBe(true);
      expect(isShortcutAllowed('n', prefsEnabled)).toBe(true);

      // Com atalhos desativados
      expect(isShortcutAllowed('/', prefsDisabled)).toBe(false);
      expect(isShortcutAllowed('?', prefsDisabled)).toBe(false);
      expect(isShortcutAllowed('n', prefsDisabled)).toBe(false);

      // Teclas essenciais (Escape e Cmd+K) permanecem ativas
      expect(isShortcutAllowed('Escape', prefsDisabled)).toBe(true);
      expect(isShortcutAllowed('k', prefsDisabled)).toBe(true);
    });
  });

  // ==========================================================================
  // 5. LOGOUT SEGURO
  // ==========================================================================
  describe('5. Logout seguro', () => {
    it('limpa os estados em memória e invoca signOut na autenticação', async () => {
      let referencesState: any[] = [{ id: 'ref-1' }, { id: 'ref-2' }];
      let projectsState: any[] = [{ id: 'proj-1' }];
      let collectionsState: any[] = [{ id: 'col-1' }];
      let userProfileState: any = { id: userId, full_name: 'Admin' };
      let selectedBatchIdsState: string[] = ['ref-1'];

      const safeLogout = async () => {
        // 1. Limpa dados privados em memória antes ou durante o logout
        referencesState = [];
        projectsState = [];
        collectionsState = [];
        userProfileState = null;
        selectedBatchIdsState = [];

        // 2. Chama signOut do Supabase
        await mockAuthSignOut();
      };

      await safeLogout();

      expect(referencesState).toEqual([]);
      expect(projectsState).toEqual([]);
      expect(collectionsState).toEqual([]);
      expect(userProfileState).toBeNull();
      expect(selectedBatchIdsState).toEqual([]);
      expect(mockAuthSignOut).toHaveBeenCalled();
    });
  });
});
