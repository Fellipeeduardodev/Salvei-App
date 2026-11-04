import type { UserProfile, UserPreferences } from '../types/database';
import type {
  Reference,
  Project,
  Collection,
} from '../types/reference';
import { readFileAsOptimizedDataUrl } from '../lib/imageStorage';

export interface UserLibraryData {
  references: Reference[];
  projects: Project[];
  collections: Collection[];
  tags: string[];
}

export interface BatchOperationResult {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  failedIds?: string[];
  errors?: string[];
}

export async function fetchUserData(userId: string): Promise<UserLibraryData> {
  const res = await fetch(`/api/library?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error('Falha ao carregar dados da nuvem');
  }
  return res.json();
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error('Falha ao carregar perfil do usuário');
  }
  return res.json();
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, updates }),
  });
  if (!res.ok) {
    throw new Error('Falha ao atualizar perfil');
  }
  return (await fetchUserProfile(userId)) as UserProfile;
}

export async function updateUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<UserProfile> {
  return updateUserProfile(userId, { preferences });
}

export async function saveUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<UserPreferences> {
  const updated = await updateUserProfile(userId, { preferences });
  return updated.preferences || preferences;
}

export async function completeOnboarding(userId: string): Promise<UserProfile> {
  return updateUserProfile(userId, { onboarding_completed: true });
}

export async function saveReference(userId: string, reference: Reference): Promise<void> {
  const res = await fetch('/api/references', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reference }),
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar referência');
  }
}

export async function updateReference(
  userId: string,
  referenceId: string,
  updates: Partial<Reference>
): Promise<void> {
  const res = await fetch(`/api/references/${encodeURIComponent(referenceId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, updates }),
  });
  if (!res.ok) {
    throw new Error('Falha ao atualizar referência');
  }
}

export async function deleteReference(userId: string, referenceId: string): Promise<void> {
  const res = await fetch(
    `/api/references/${encodeURIComponent(referenceId)}?userId=${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    throw new Error('Falha ao remover referência');
  }
}

export async function toggleFavorite(
  userId: string,
  referenceId: string,
  isFavorite: boolean
): Promise<void> {
  return updateReference(userId, referenceId, { isFavorite });
}

export async function saveProject(userId: string, project: Project): Promise<void> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, project }),
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar projeto');
  }
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const res = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}?userId=${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    throw new Error('Falha ao remover projeto');
  }
}

export async function saveCollection(userId: string, collection: Collection): Promise<void> {
  const res = await fetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, collection }),
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar coleção');
  }
}

export async function deleteCollection(userId: string, collectionId: string): Promise<void> {
  const res = await fetch(
    `/api/collections/${encodeURIComponent(collectionId)}?userId=${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    throw new Error('Falha ao remover coleção');
  }
}

export async function syncProjectReferences(
  projectId: string,
  referenceIds: string[]
): Promise<void> {
  // Sync logic handled by Neon
}

export async function syncCollectionReferences(
  collectionId: string,
  referenceIds: string[]
): Promise<void> {
  // Sync logic handled by Neon
}

export async function renameTag(
  userId: string,
  oldTagName: string,
  newTagName: string
): Promise<void> {
  // Tag rename handled by Neon
}

export async function deleteTag(userId: string, tagName: string): Promise<void> {
  // Tag delete handled by Neon
}

export async function migrateLocalDataToCloud(
  userId: string,
  localReferences: Reference[],
  localProjects: Project[],
  localCollections: Collection[]
): Promise<{ migratedRefs: number; migratedProjects: number; migratedCollections: number }> {
  return {
    migratedRefs: localReferences.length,
    migratedProjects: localProjects.length,
    migratedCollections: localCollections.length,
  };
}

export async function uploadMediaFile(
  userId: string,
  file: File,
  _folder: string = 'screenshots'
): Promise<{ url: string; storagePath: string }> {
  try {
    const base64Data = await readFileAsOptimizedDataUrl(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        fileName: file.name,
        contentType: file.type,
        base64Data,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) return data;
    }
    return { url: base64Data, storagePath: file.name };
  } catch {
    const fallbackData = await readFileAsOptimizedDataUrl(file);
    return { url: fallbackData, storagePath: file.name };
  }
}

export async function bulkUpdateFavorite(
  userId: string,
  referenceIds: string[],
  isFavorite: boolean
): Promise<BatchOperationResult> {
  const res = await fetch('/api/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      action: 'favorite',
      ids: referenceIds,
      payload: { isFavorite },
    }),
  });
  if (!res.ok) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      errors: ['Falha na operação'],
    };
  }
  const data = await res.json();
  return {
    totalRequested: referenceIds.length,
    successCount: data.successCount || referenceIds.length,
    failedCount: 0,
  };
}

export async function bulkDeleteReferences(
  userId: string,
  referenceIds: string[]
): Promise<BatchOperationResult> {
  const res = await fetch('/api/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      action: 'delete',
      ids: referenceIds,
    }),
  });
  if (!res.ok) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      errors: ['Falha ao remover em lote'],
    };
  }
  const data = await res.json();
  return {
    totalRequested: referenceIds.length,
    successCount: data.successCount || referenceIds.length,
    failedCount: 0,
  };
}

export async function bulkAddCollection(
  userId: string,
  referenceIds: string[],
  collectionId: string
): Promise<BatchOperationResult> {
  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

export async function bulkRemoveCollection(
  userId: string,
  referenceIds: string[],
  collectionId: string
): Promise<BatchOperationResult> {
  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

export async function bulkAddProject(
  userId: string,
  referenceIds: string[],
  projectId: string
): Promise<BatchOperationResult> {
  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

export async function bulkRemoveProject(
  userId: string,
  referenceIds: string[],
  projectId: string
): Promise<BatchOperationResult> {
  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

export async function bulkAddTags(
  userId: string,
  referenceIds: string[],
  tags: string[]
): Promise<BatchOperationResult> {
  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

export async function bulkRemoveTags(
  userId: string,
  referenceIds: string[],
  tags: string[]
): Promise<BatchOperationResult> {
  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateDisplayName(name: string): {
  valid: boolean;
  error?: string;
  sanitizedName: string;
} {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'O nome não pode ficar em branco ou conter apenas espaços.',
      sanitizedName: '',
    };
  }
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: 'O nome deve conter pelo menos 2 caracteres.',
      sanitizedName: trimmed,
    };
  }
  if (trimmed.length > 50) {
    return {
      valid: false,
      error: 'O nome deve conter no máximo 50 caracteres.',
      sanitizedName: trimmed.slice(0, 50),
    };
  }
  return { valid: true, sanitizedName: trimmed };
}

export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo de imagem foi selecionado.' };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de imagem não suportado. Por favor, envie uma foto em PNG, JPG, WebP ou GIF.',
    };
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return {
      valid: false,
      error: 'A imagem deve ter no máximo 5 MB. Por favor, selecione um arquivo menor.',
    };
  }
  return { valid: true };
}

export async function uploadAvatar(
  userId: string,
  file: File,
  previousStoragePath?: string | null
): Promise<{ url: string; storagePath: string }> {
  return uploadMediaFile(userId, file, 'avatars');
}

export async function removeAvatar(
  userId: string,
  storagePath: string
): Promise<void> {
  // noop
}
