import { supabase } from '../lib/supabase';
import type { Database, UserProfile, UserPreferences } from '../types/database';
import type {
  Reference,
  Project,
  Collection,
  CodeSnippet,
  ReferenceFile,
} from '../types/reference';
import { normalizeTag } from '../lib/searchAndFilter';

export interface UserLibraryData {
  references: Reference[];
  projects: Project[];
  collections: Collection[];
  tags: string[];
}

/**
 * Normalizes slug for unique tag constraints.
 */
function toSlug(name: string): string {
  return normalizeTag(name).replace(/\s+/g, '-');
}

/**
 * Uploads a media file (screenshot or attachment) to the Supabase Storage bucket 'curator-media'.
 */
export async function uploadMediaFile(
  userId: string,
  file: File,
  folder: string = 'screenshots'
): Promise<{ url: string; storagePath: string }> {
  const fileExt = file.name.split('.').pop() || 'bin';
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const fileName = `${Date.now()}-${cleanBaseName}.${fileExt}`;
  const storagePath = `${userId}/${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('curator-media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Erro ao enviar arquivo para o Supabase Storage: ${uploadError.message}`);
  }

  // Create signed URL for secure private bucket access
  try {
    const { data: signedData, error: signErr } = await supabase.storage
      .from('curator-media')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

    if (!signErr && signedData?.signedUrl) {
      return {
        url: signedData.signedUrl,
        storagePath,
      };
    }
  } catch {
    // fallback if createSignedUrl is unavailable
  }

  const { data: publicUrlData } = supabase.storage
    .from('curator-media')
    .getPublicUrl(storagePath);

  return {
    url: publicUrlData.publicUrl,
    storagePath,
  };
}

/**
 * Fetches all library data for an authenticated user.
 */
export async function fetchUserData(userId: string): Promise<UserLibraryData> {
  // 1. Projects
  const { data: projectsData, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (projErr) throw projErr;

  // 2. Collections
  const { data: collectionsData, error: colErr } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (colErr) throw colErr;

  // 3. Tags
  const { data: tagsData, error: tagErr } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (tagErr) throw tagErr;

  // 4. References
  const { data: referencesData, error: refErr } = await supabase
    .from('references')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (refErr) throw refErr;

  // 5. Junction and child tables for references
  const refIds = (referencesData || []).map((r) => r.id);

  let refTagsData: { reference_id: string; tag_id: string }[] = [];
  let projRefsData: { project_id: string; reference_id: string }[] = [];
  let colRefsData: { collection_id: string; reference_id: string }[] = [];
  let snippetsData: Array<{
    id: string;
    reference_id: string;
    title: string;
    language: string;
    code: string;
  }> = [];
  let attachmentsData: Array<{
    id: string;
    reference_id: string;
    file_name: string;
    file_type: string;
    file_size: string | null;
    storage_path: string | null;
  }> = [];

  if (refIds.length > 0) {
    const [
      refTagsRes,
      projRefsRes,
      colRefsRes,
      snippetsRes,
      attachmentsRes,
    ] = await Promise.all([
      supabase.from('reference_tags').select('reference_id, tag_id').in('reference_id', refIds),
      supabase.from('project_references').select('project_id, reference_id').in('reference_id', refIds),
      supabase.from('collection_references').select('collection_id, reference_id').in('reference_id', refIds),
      supabase.from('reference_code_snippets').select('*').in('reference_id', refIds),
      supabase.from('reference_attachments').select('*').in('reference_id', refIds),
    ]);

    if (refTagsRes.data) refTagsData = refTagsRes.data;
    if (projRefsRes.data) projRefsData = projRefsRes.data;
    if (colRefsRes.data) colRefsData = colRefsRes.data;
    if (snippetsRes.data) snippetsData = snippetsRes.data as any;
    if (attachmentsRes.data) attachmentsData = attachmentsRes.data as any;
  }

  // Build Tag lookup
  const tagMap = new Map<string, string>(); // tagId -> tagName
  (tagsData || []).forEach((t) => tagMap.set(t.id, t.name));

  // Build Reference Tag Map
  const refToTags = new Map<string, string[]>();
  refTagsData.forEach(({ reference_id, tag_id }) => {
    const tagName = tagMap.get(tag_id);
    if (tagName) {
      const list = refToTags.get(reference_id) || [];
      list.push(tagName);
      refToTags.set(reference_id, list);
    }
  });

  // Build Reference Project Map
  const refToProjects = new Map<string, string[]>();
  projRefsData.forEach(({ reference_id, project_id }) => {
    const list = refToProjects.get(reference_id) || [];
    list.push(project_id);
    refToProjects.set(reference_id, list);
  });

  // Build Reference Collection Map
  const refToCollections = new Map<string, string[]>();
  colRefsData.forEach(({ reference_id, collection_id }) => {
    const list = refToCollections.get(reference_id) || [];
    list.push(collection_id);
    refToCollections.set(reference_id, list);
  });

  // Build Snippets Map
  const refToSnippets = new Map<string, CodeSnippet[]>();
  snippetsData.forEach((s) => {
    const list = refToSnippets.get(s.reference_id) || [];
    list.push({
      id: s.id,
      title: s.title,
      language: s.language as any,
      code: s.code,
    });
    refToSnippets.set(s.reference_id, list);
  });

  // Collect paths for secure signed URLs (private bucket)
  const mediaPaths: string[] = [];
  (referencesData || []).forEach((r) => {
    if (r.image_storage_path) mediaPaths.push(r.image_storage_path);
  });
  attachmentsData.forEach((a) => {
    if (a.storage_path) mediaPaths.push(a.storage_path);
  });

  const signedUrlMap = new Map<string, string>();
  if (mediaPaths.length > 0) {
    try {
      const { data: signedResults, error: signErr } = await supabase.storage
        .from('curator-media')
        .createSignedUrls(mediaPaths, 60 * 60 * 24 * 7); // 7 days

      if (!signErr && signedResults) {
        signedResults.forEach((item) => {
          if (item.signedUrl && item.path) {
            signedUrlMap.set(item.path, item.signedUrl);
          }
        });
      }
    } catch {
      // ignore signed url fallback
    }
  }

  // Build Attachments Map
  const refToAttachments = new Map<string, ReferenceFile[]>();
  attachmentsData.forEach((a) => {
    const list = refToAttachments.get(a.reference_id) || [];
    let fileUrl: string | undefined = undefined;
    if (a.storage_path) {
      fileUrl = signedUrlMap.get(a.storage_path);
      if (!fileUrl) {
        const { data: pubData } = supabase.storage.from('curator-media').getPublicUrl(a.storage_path);
        fileUrl = pubData.publicUrl;
      }
    }

    list.push({
      id: a.id,
      name: a.file_name,
      type: a.file_type,
      size: a.file_size || undefined,
      url: fileUrl,
    });
    refToAttachments.set(a.reference_id, list);
  });

  // Hydrate References
  const references: Reference[] = (referencesData || []).map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url || undefined,
    domain: row.domain || undefined,
    screenshotUrl:
      (row.image_storage_path && signedUrlMap.get(row.image_storage_path)) ||
      row.screenshot_url ||
      undefined,
    imageStorageId: row.image_storage_path || undefined,
    screenshotStatus: row.screenshot_status as any,
    sourceType: (row.source_type as any) || 'url',
    originalFileName: row.original_file_name || undefined,
    notesMarkdown: row.notes_markdown || '',
    isFavorite: Boolean((row as any).is_favorite),
    tags: refToTags.get(row.id) || [],
    projectIds: refToProjects.get(row.id) || [],
    collectionIds: refToCollections.get(row.id) || [],
    codeSnippets: refToSnippets.get(row.id) || [],
    relatedFiles: refToAttachments.get(row.id) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const projects: Project[] = (projectsData || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  const collections: Collection[] = (collectionsData || []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || undefined,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));

  const tags: string[] = (tagsData || []).map((t) => t.name);

  return {
    references,
    projects,
    collections,
    tags,
  };
}

/**
 * Helper to ensure tags exist in the DB for this user and return their IDs.
 */
async function ensureTagsExist(userId: string, tags: string[]): Promise<string[]> {
  if (!tags || tags.length === 0) return [];

  const tagIds: string[] = [];

  for (const rawTag of tags) {
    const normalized = normalizeTag(rawTag);
    if (!normalized) continue;
    const slug = toSlug(normalized);

    // Try finding existing tag
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .eq('slug', slug)
      .maybeSingle();

    if (existingTag) {
      tagIds.push(existingTag.id);
    } else {
      const newTagId = `tag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const { data: inserted, error: insErr } = await supabase
        .from('tags')
        .insert({
          id: newTagId,
          user_id: userId,
          name: normalized,
          slug,
        })
        .select('id')
        .single();

      if (!insErr && inserted) {
        tagIds.push(inserted.id);
      }
    }
  }

  return tagIds;
}

/**
 * Creates or upserts a full Reference in Supabase with its associations.
 */
export async function saveReference(userId: string, ref: Reference): Promise<void> {
  // 1. Upsert Reference base record
  const { error: refError } = await supabase.from('references').upsert({
    id: ref.id,
    user_id: userId,
    title: ref.title,
    url: ref.url || null,
    domain: ref.domain || null,
    screenshot_url: ref.screenshotUrl || null,
    image_storage_path: ref.imageStorageId || null,
    screenshot_status: ref.screenshotStatus || 'none',
    source_type: ref.sourceType || 'url',
    original_file_name: ref.originalFileName || null,
    notes_markdown: ref.notesMarkdown || '',
    is_favorite: Boolean(ref.isFavorite),
    created_at: ref.createdAt,
    updated_at: ref.updatedAt,
  });

  if (refError) throw refError;

  // 2. Synchronize Tags
  const tagIds = await ensureTagsExist(userId, ref.tags || []);
  await supabase.from('reference_tags').delete().eq('reference_id', ref.id);
  if (tagIds.length > 0) {
    await supabase.from('reference_tags').insert(
      tagIds.map((tagId) => ({
        reference_id: ref.id,
        tag_id: tagId,
      }))
    );
  }

  // 3. Synchronize Project associations
  await supabase.from('project_references').delete().eq('reference_id', ref.id);
  if (ref.projectIds && ref.projectIds.length > 0) {
    await supabase.from('project_references').insert(
      ref.projectIds.map((projectId) => ({
        reference_id: ref.id,
        project_id: projectId,
      }))
    );
  }

  // 4. Synchronize Collection associations
  await supabase.from('collection_references').delete().eq('reference_id', ref.id);
  if (ref.collectionIds && ref.collectionIds.length > 0) {
    await supabase.from('collection_references').insert(
      ref.collectionIds.map((collectionId) => ({
        reference_id: ref.id,
        collection_id: collectionId,
      }))
    );
  }

  // 5. Synchronize Code Snippets
  await supabase.from('reference_code_snippets').delete().eq('reference_id', ref.id);
  if (ref.codeSnippets && ref.codeSnippets.length > 0) {
    await supabase.from('reference_code_snippets').insert(
      ref.codeSnippets.map((s) => ({
        id: s.id || `snip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        reference_id: ref.id,
        user_id: userId,
        title: s.title,
        language: s.language,
        code: s.code,
      }))
    );
  }

  // 6. Synchronize Attachments
  await supabase.from('reference_attachments').delete().eq('reference_id', ref.id);
  if (ref.relatedFiles && ref.relatedFiles.length > 0) {
    await supabase.from('reference_attachments').insert(
      ref.relatedFiles.map((f) => ({
        id: f.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        reference_id: ref.id,
        user_id: userId,
        file_name: f.name,
        file_type: f.type,
        file_size: f.size || null,
        storage_path: f.url || null,
      }))
    );
  }
}

/**
 * Updates a Reference in Supabase.
 */
export async function updateReference(
  userId: string,
  id: string,
  updates: Partial<Reference>
): Promise<void> {
  const updatePayload: Database['public']['Tables']['references']['Update'] = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updatePayload.title = updates.title;
  if (updates.url !== undefined) updatePayload.url = updates.url || null;
  if (updates.domain !== undefined) updatePayload.domain = updates.domain || null;
  if (updates.screenshotUrl !== undefined) updatePayload.screenshot_url = updates.screenshotUrl || null;
  if (updates.imageStorageId !== undefined) updatePayload.image_storage_path = updates.imageStorageId || null;
  if (updates.screenshotStatus !== undefined) updatePayload.screenshot_status = updates.screenshotStatus;
  if (updates.sourceType !== undefined) updatePayload.source_type = updates.sourceType;
  if (updates.originalFileName !== undefined) updatePayload.original_file_name = updates.originalFileName || null;
  if (updates.notesMarkdown !== undefined) updatePayload.notes_markdown = updates.notesMarkdown;
  if (updates.isFavorite !== undefined) (updatePayload as any).is_favorite = updates.isFavorite;

  const { error } = await supabase
    .from('references')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;

  // Handle relationship updates if explicitly passed
  if (updates.tags !== undefined) {
    const tagIds = await ensureTagsExist(userId, updates.tags);
    await supabase.from('reference_tags').delete().eq('reference_id', id);
    if (tagIds.length > 0) {
      await supabase.from('reference_tags').insert(
        tagIds.map((tagId) => ({
          reference_id: id,
          tag_id: tagId,
        }))
      );
    }
  }

  if (updates.projectIds !== undefined) {
    await supabase.from('project_references').delete().eq('reference_id', id);
    if (updates.projectIds.length > 0) {
      await supabase.from('project_references').insert(
        updates.projectIds.map((projectId) => ({
          reference_id: id,
          project_id: projectId,
        }))
      );
    }
  }

  if (updates.collectionIds !== undefined) {
    await supabase.from('collection_references').delete().eq('reference_id', id);
    if (updates.collectionIds.length > 0) {
      await supabase.from('collection_references').insert(
        updates.collectionIds.map((collectionId) => ({
          reference_id: id,
          collection_id: collectionId,
        }))
      );
    }
  }

  if (updates.codeSnippets !== undefined) {
    await supabase.from('reference_code_snippets').delete().eq('reference_id', id);
    if (updates.codeSnippets.length > 0) {
      await supabase.from('reference_code_snippets').insert(
        updates.codeSnippets.map((s) => ({
          id: s.id,
          reference_id: id,
          user_id: userId,
          title: s.title,
          language: s.language,
          code: s.code,
        }))
      );
    }
  }

  if (updates.relatedFiles !== undefined) {
    await supabase.from('reference_attachments').delete().eq('reference_id', id);
    if (updates.relatedFiles.length > 0) {
      await supabase.from('reference_attachments').insert(
        updates.relatedFiles.map((f) => ({
          id: f.id,
          reference_id: id,
          user_id: userId,
          file_name: f.name,
          file_type: f.type,
          file_size: f.size || null,
          storage_path: f.url || null,
        }))
      );
    }
  }
}

/**
 * Deletes a Reference from Supabase (cascades to junction tables and snippet/attachment tables).
 */
export async function deleteReference(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('references')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Saves or updates a Project in Supabase.
 */
export async function saveProject(userId: string, project: Project): Promise<void> {
  const { error } = await supabase.from('projects').upsert({
    id: project.id,
    user_id: userId,
    name: project.name,
    description: project.description || null,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  });

  if (error) throw error;
}

/**
 * Deletes a Project in Supabase.
 * NOTE: Junction table project_references cascades; references are preserved!
 */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Syncs project reference associations.
 */
export async function syncProjectReferences(
  projectId: string,
  referenceIds: string[]
): Promise<void> {
  await supabase.from('project_references').delete().eq('project_id', projectId);
  if (referenceIds.length > 0) {
    const { error } = await supabase.from('project_references').insert(
      referenceIds.map((refId) => ({
        project_id: projectId,
        reference_id: refId,
      }))
    );
    if (error) throw error;
  }
}

/**
 * Saves or updates a Collection in Supabase.
 */
export async function saveCollection(userId: string, collection: Collection): Promise<void> {
  const { error } = await supabase.from('collections').upsert({
    id: collection.id,
    user_id: userId,
    name: collection.name,
    description: collection.description || null,
    created_at: collection.createdAt,
    updated_at: collection.updatedAt,
  });

  if (error) throw error;
}

/**
 * Deletes a Collection in Supabase.
 * NOTE: Junction table collection_references cascades; references are preserved!
 */
export async function deleteCollection(userId: string, collectionId: string): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Syncs collection reference associations.
 */
export async function syncCollectionReferences(
  collectionId: string,
  referenceIds: string[]
): Promise<void> {
  await supabase.from('collection_references').delete().eq('collection_id', collectionId);
  if (referenceIds.length > 0) {
    const { error } = await supabase.from('collection_references').insert(
      referenceIds.map((refId) => ({
        collection_id: collectionId,
        reference_id: refId,
      }))
    );
    if (error) throw error;
  }
}

/**
 * Renames a tag in Supabase and updates associations.
 */
export async function renameTag(
  userId: string,
  oldTagName: string,
  newTagName: string
): Promise<void> {
  const oldSlug = toSlug(oldTagName);
  const newSlug = toSlug(newTagName);
  const normNewName = normalizeTag(newTagName);

  // Check if target tag already exists
  const { data: targetTag } = await supabase
    .from('tags')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', newSlug)
    .maybeSingle();

  const { data: sourceTag } = await supabase
    .from('tags')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', oldSlug)
    .maybeSingle();

  if (!sourceTag) return;

  if (targetTag && targetTag.id !== sourceTag.id) {
    // Merge: Move references from sourceTag to targetTag
    const { data: refTags } = await supabase
      .from('reference_tags')
      .select('reference_id')
      .eq('tag_id', sourceTag.id);

    if (refTags && refTags.length > 0) {
      for (const row of refTags) {
        await supabase
          .from('reference_tags')
          .upsert({ reference_id: row.reference_id, tag_id: targetTag.id });
      }
    }
    // Delete sourceTag
    await supabase.from('tags').delete().eq('id', sourceTag.id);
  } else {
    // Just rename
    await supabase
      .from('tags')
      .update({ name: normNewName, slug: newSlug })
      .eq('id', sourceTag.id);
  }
}

/**
 * Deletes a tag in Supabase.
 * NOTE: Junction table reference_tags cascades; references are preserved!
 */
export async function deleteTag(userId: string, tagName: string): Promise<void> {
  const slug = toSlug(tagName);
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('user_id', userId)
    .eq('slug', slug);

  if (error) throw error;
}

/**
 * Migrates local data into Supabase PostgreSQL tables.
 */
export async function migrateLocalDataToSupabase(
  userId: string,
  localReferences: Reference[],
  localProjects: Project[],
  localCollections: Collection[]
): Promise<{ migratedRefs: number; migratedProjects: number; migratedCollections: number }> {
  // 1. Projects
  for (const project of localProjects) {
    await saveProject(userId, project);
  }

  // 2. Collections
  for (const collection of localCollections) {
    await saveCollection(userId, collection);
  }

  // 3. References & their associations
  for (const ref of localReferences) {
    await saveReference(userId, ref);
  }

  return {
    migratedRefs: localReferences.length,
    migratedProjects: localProjects.length,
    migratedCollections: localCollections.length,
  };
}

// ==============================================================================
// FASE 6: OPERAÇÕES EM LOTE E AÇÕES RÁPIDAS
// ==============================================================================

export interface BatchOperationResult {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  failedIds?: string[];
  errors?: string[];
}

/**
 * Toggles favorite state of a single reference.
 */
export async function toggleFavorite(
  userId: string,
  referenceId: string,
  isFavorite: boolean
): Promise<void> {
  const { error } = await supabase
    .from('references')
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() } as any)
    .eq('id', referenceId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Bulk updates favorite status for multiple references belonging to userId.
 */
export async function bulkUpdateFavorite(
  userId: string,
  referenceIds: string[],
  isFavorite: boolean
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0) {
    return { totalRequested: 0, successCount: 0, failedCount: 0 };
  }

  const { error } = await supabase
    .from('references')
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() } as any)
    .in('id', referenceIds)
    .eq('user_id', userId);

  if (error) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [error.message],
    };
  }

  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

/**
 * Bulk adds multiple references to a collection, preventing duplicate junction records.
 */
export async function bulkAddCollection(
  userId: string,
  referenceIds: string[],
  collectionId: string
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0) {
    return { totalRequested: 0, successCount: 0, failedCount: 0 };
  }

  // 1. Verify user owns the collection
  const { data: collection, error: colErr } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (colErr || !collection) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: ['Coleção não encontrada ou não pertence ao usuário.'],
    };
  }

  // 2. Filter reference IDs owned by the user
  const { data: validRefs, error: refErr } = await supabase
    .from('references')
    .select('id')
    .in('id', referenceIds)
    .eq('user_id', userId);

  if (refErr) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [refErr.message],
    };
  }

  const ownedRefIds = (validRefs || []).map((r) => r.id);
  const unownedIds = referenceIds.filter((id) => !ownedRefIds.includes(id));

  // 3. Find existing associations to avoid duplicates
  const { data: existingPairs } = await supabase
    .from('collection_references')
    .select('reference_id')
    .eq('collection_id', collectionId)
    .in('reference_id', ownedRefIds);

  const existingRefIdSet = new Set((existingPairs || []).map((p) => p.reference_id));
  const idsToInsert = ownedRefIds.filter((id) => !existingRefIdSet.has(id));

  if (idsToInsert.length > 0) {
    const { error: insErr } = await supabase.from('collection_references').insert(
      idsToInsert.map((refId) => ({
        collection_id: collectionId,
        reference_id: refId,
      }))
    );

    if (insErr) {
      return {
        totalRequested: referenceIds.length,
        successCount: existingRefIdSet.size,
        failedCount: idsToInsert.length + unownedIds.length,
        failedIds: [...idsToInsert, ...unownedIds],
        errors: [insErr.message],
      };
    }
  }

  return {
    totalRequested: referenceIds.length,
    successCount: ownedRefIds.length,
    failedCount: unownedIds.length,
    failedIds: unownedIds.length > 0 ? unownedIds : undefined,
    errors: unownedIds.length > 0 ? ['Algumas referências não pertencem ao usuário.'] : undefined,
  };
}

/**
 * Bulk removes multiple references from a collection.
 */
export async function bulkRemoveCollection(
  userId: string,
  referenceIds: string[],
  collectionId: string
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0) {
    return { totalRequested: 0, successCount: 0, failedCount: 0 };
  }

  // 1. Verify user owns the collection
  const { data: collection, error: colErr } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (colErr || !collection) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: ['Coleção não encontrada ou não pertence ao usuário.'],
    };
  }

  const { error } = await supabase
    .from('collection_references')
    .delete()
    .eq('collection_id', collectionId)
    .in('reference_id', referenceIds);

  if (error) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [error.message],
    };
  }

  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

/**
 * Bulk associates multiple references to a project, preventing duplicate junction records.
 */
export async function bulkAddProject(
  userId: string,
  referenceIds: string[],
  projectId: string
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0) {
    return { totalRequested: 0, successCount: 0, failedCount: 0 };
  }

  // 1. Verify project ownership
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (projErr || !project) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: ['Projeto não encontrado ou não pertence ao usuário.'],
    };
  }

  // 2. Filter reference IDs owned by the user
  const { data: validRefs, error: refErr } = await supabase
    .from('references')
    .select('id')
    .in('id', referenceIds)
    .eq('user_id', userId);

  if (refErr) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [refErr.message],
    };
  }

  const ownedRefIds = (validRefs || []).map((r) => r.id);
  const unownedIds = referenceIds.filter((id) => !ownedRefIds.includes(id));

  // 3. Find existing associations to avoid duplicates
  const { data: existingPairs } = await supabase
    .from('project_references')
    .select('reference_id')
    .eq('project_id', projectId)
    .in('reference_id', ownedRefIds);

  const existingRefIdSet = new Set((existingPairs || []).map((p) => p.reference_id));
  const idsToInsert = ownedRefIds.filter((id) => !existingRefIdSet.has(id));

  if (idsToInsert.length > 0) {
    const { error: insErr } = await supabase.from('project_references').insert(
      idsToInsert.map((refId) => ({
        project_id: projectId,
        reference_id: refId,
      }))
    );

    if (insErr) {
      return {
        totalRequested: referenceIds.length,
        successCount: existingRefIdSet.size,
        failedCount: idsToInsert.length + unownedIds.length,
        failedIds: [...idsToInsert, ...unownedIds],
        errors: [insErr.message],
      };
    }
  }

  return {
    totalRequested: referenceIds.length,
    successCount: ownedRefIds.length,
    failedCount: unownedIds.length,
    failedIds: unownedIds.length > 0 ? unownedIds : undefined,
    errors: unownedIds.length > 0 ? ['Algumas referências não pertencem ao usuário.'] : undefined,
  };
}

/**
 * Bulk removes multiple references from a project.
 */
export async function bulkRemoveProject(
  userId: string,
  referenceIds: string[],
  projectId: string
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0) {
    return { totalRequested: 0, successCount: 0, failedCount: 0 };
  }

  // 1. Verify user owns the project
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (projErr || !project) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: ['Projeto não encontrado ou não pertence ao usuário.'],
    };
  }

  const { error } = await supabase
    .from('project_references')
    .delete()
    .eq('project_id', projectId)
    .in('reference_id', referenceIds);

  if (error) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [error.message],
    };
  }

  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

/**
 * Bulk adds tags to multiple references, ensuring unique records.
 */
export async function bulkAddTags(
  userId: string,
  referenceIds: string[],
  tagsToAdd: string[]
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0 || !tagsToAdd || tagsToAdd.length === 0) {
    return { totalRequested: referenceIds.length, successCount: 0, failedCount: 0 };
  }

  // 1. Ensure tags exist in DB
  const tagIds = await ensureTagsExist(userId, tagsToAdd);
  if (tagIds.length === 0) {
    return { totalRequested: referenceIds.length, successCount: 0, failedCount: 0 };
  }

  // 2. Validate user ownership of referenceIds
  const { data: validRefs, error: refErr } = await supabase
    .from('references')
    .select('id')
    .in('id', referenceIds)
    .eq('user_id', userId);

  if (refErr) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [refErr.message],
    };
  }

  const ownedRefIds = (validRefs || []).map((r) => r.id);
  const unownedIds = referenceIds.filter((id) => !ownedRefIds.includes(id));

  // 3. Find existing pairs
  const { data: existingPairs } = await supabase
    .from('reference_tags')
    .select('reference_id, tag_id')
    .in('reference_id', ownedRefIds)
    .in('tag_id', tagIds);

  const existingPairSet = new Set(
    (existingPairs || []).map((p) => `${p.reference_id}::${p.tag_id}`)
  );

  const pairsToInsert: { reference_id: string; tag_id: string }[] = [];
  for (const refId of ownedRefIds) {
    for (const tagId of tagIds) {
      if (!existingPairSet.has(`${refId}::${tagId}`)) {
        pairsToInsert.push({ reference_id: refId, tag_id: tagId });
      }
    }
  }

  if (pairsToInsert.length > 0) {
    const { error: insErr } = await supabase.from('reference_tags').insert(pairsToInsert);
    if (insErr) {
      return {
        totalRequested: referenceIds.length,
        successCount: 0,
        failedCount: referenceIds.length,
        failedIds: [...referenceIds],
        errors: [insErr.message],
      };
    }
  }

  return {
    totalRequested: referenceIds.length,
    successCount: ownedRefIds.length,
    failedCount: unownedIds.length,
    failedIds: unownedIds.length > 0 ? unownedIds : undefined,
    errors: unownedIds.length > 0 ? ['Algumas referências não pertencem ao usuário.'] : undefined,
  };
}

/**
 * Bulk removes tags from multiple references.
 */
export async function bulkRemoveTags(
  userId: string,
  referenceIds: string[],
  tagNamesToRemove: string[]
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0 || !tagNamesToRemove || tagNamesToRemove.length === 0) {
    return { totalRequested: referenceIds.length, successCount: 0, failedCount: 0 };
  }

  // 1. Find tag IDs matching the names for this user
  const slugs = tagNamesToRemove.map((t) => toSlug(t)).filter(Boolean);
  const { data: tags, error: tagErr } = await supabase
    .from('tags')
    .select('id')
    .eq('user_id', userId)
    .in('slug', slugs);

  if (tagErr || !tags || tags.length === 0) {
    return {
      totalRequested: referenceIds.length,
      successCount: referenceIds.length,
      failedCount: 0,
    };
  }

  const tagIds = tags.map((t) => t.id);

  // 2. Delete junction pairs
  const { error: delErr } = await supabase
    .from('reference_tags')
    .delete()
    .in('reference_id', referenceIds)
    .in('tag_id', tagIds);

  if (delErr) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [delErr.message],
    };
  }

  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}

/**
 * Bulk deletes references owned by userId (cascades to junction and child tables).
 */
export async function bulkDeleteReferences(
  userId: string,
  referenceIds: string[]
): Promise<BatchOperationResult> {
  if (!referenceIds || referenceIds.length === 0) {
    return { totalRequested: 0, successCount: 0, failedCount: 0 };
  }

  const { error } = await supabase
    .from('references')
    .delete()
    .in('id', referenceIds)
    .eq('user_id', userId);

  if (error) {
    return {
      totalRequested: referenceIds.length,
      successCount: 0,
      failedCount: referenceIds.length,
      failedIds: [...referenceIds],
      errors: [error.message],
    };
  }

  return {
    totalRequested: referenceIds.length,
    successCount: referenceIds.length,
    failedCount: 0,
  };
}


// ==============================================================================
// FASE 9: PERFIL, PERSONALIZAÇÃO, FOTO E ONBOARDING
// ==============================================================================

export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  shortcuts_enabled: true,
  default_view: 'inbox',
  compact_cards: false,
};

/**
 * Valida o nome de exibição do usuário (não pode ser vazio, min 2 e max 50 caracteres).
 */
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

/**
 * Valida o arquivo de imagem para foto de perfil.
 */
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

/**
 * Busca o perfil completo do usuário no Supabase.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await (supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single() as any);

  if (error || !data) {
    return null;
  }

  // Gera Signed URL fresca para o avatar se houver caminho salvo
  let resolvedAvatarUrl = data.avatar_url;
  if (resolvedAvatarUrl && resolvedAvatarUrl.includes(userId)) {
    try {
      const path = resolvedAvatarUrl.startsWith('http')
        ? resolvedAvatarUrl.split('/curator-media/')[1]?.split('?')[0]
        : resolvedAvatarUrl;

      if (path) {
        const { data: signed } = await supabase.storage
          .from('curator-media')
          .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 dias
        if (signed?.signedUrl) {
          resolvedAvatarUrl = signed.signedUrl;
        }
      }
    } catch {
      // fallback
    }
  }

  const rawPrefs = data.preferences;
  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...(typeof rawPrefs === 'object' && rawPrefs !== null ? rawPrefs : {}),
  };

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    avatar_url: resolvedAvatarUrl,
    created_at: data.created_at,
    updated_at: data.updated_at,
    onboarding_completed: Boolean(data.onboarding_completed),
    preferences,
  };
}

/**
 * Atualiza metadados do perfil (nome, avatar, onboarding ou preferências).
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    avatar_url?: string | null;
    onboarding_completed?: boolean;
    preferences?: UserPreferences;
  }
): Promise<UserProfile> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.full_name !== undefined) {
    const nameCheck = validateDisplayName(updates.full_name);
    if (!nameCheck.valid) {
      throw new Error(nameCheck.error || 'Nome de exibição inválido.');
    }
    updatePayload.full_name = nameCheck.sanitizedName;
  }

  if (updates.avatar_url !== undefined) {
    updatePayload.avatar_url = updates.avatar_url;
  }

  if (updates.onboarding_completed !== undefined) {
    updatePayload.onboarding_completed = updates.onboarding_completed;
  }

  if (updates.preferences !== undefined) {
    updatePayload.preferences = updates.preferences;
  }

  const { data, error } = await (supabase
    .from('profiles')
    .update(updatePayload as any)
    .eq('id', userId)
    .select('*')
    .single() as any);

  if (error || !data) {
    throw new Error(`Falha ao atualizar perfil: ${error?.message || 'Erro desconhecido'}`);
  }

  const rawPrefs = data.preferences;
  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...(typeof rawPrefs === 'object' && rawPrefs !== null ? rawPrefs : {}),
  };

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    onboarding_completed: Boolean(data.onboarding_completed),
    preferences,
  };
}

/**
 * Envia uma nova foto de perfil para o storage privado sob a pasta do usuário.
 * Remove a foto anterior se for informada, evitando arquivos órfãos.
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  previousStoragePath?: string | null
): Promise<{ url: string; storagePath: string }> {
  const val = validateAvatarFile(file);
  if (!val.valid) {
    throw new Error(val.error || 'Arquivo de imagem inválido.');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${Date.now()}-avatar.${fileExt}`;
  const storagePath = `${userId}/avatars/${fileName}`;

  // Upload para o bucket privado
  const { error: uploadError } = await supabase.storage
    .from('curator-media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Falha ao enviar a foto de perfil: ${uploadError.message}`);
  }

  // Gera Signed URL segura com validade de 7 dias
  let signedUrl = '';
  try {
    const { data: signedData, error: signErr } = await supabase.storage
      .from('curator-media')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    if (!signErr && signedData?.signedUrl) {
      signedUrl = signedData.signedUrl;
    }
  } catch {
    // fallback
  }

  if (!signedUrl) {
    const { data: pubData } = supabase.storage
      .from('curator-media')
      .getPublicUrl(storagePath);
    signedUrl = pubData.publicUrl;
  }

  // Se havia foto anterior e o upload da nova deu certo, remove a foto antiga para evitar lixo
  if (previousStoragePath && previousStoragePath !== storagePath) {
    try {
      const cleanPrevPath = previousStoragePath.startsWith('http')
        ? previousStoragePath.split('/curator-media/')[1]?.split('?')[0]
        : previousStoragePath;
      if (cleanPrevPath && cleanPrevPath.includes(`${userId}/avatars/`)) {
        await supabase.storage.from('curator-media').remove([cleanPrevPath]);
      }
    } catch {
      // limpeza silenciosa de arquivo antigo
    }
  }

  // Atualiza o perfil no banco com a nova foto
  await updateUserProfile(userId, { avatar_url: storagePath });

  return {
    url: signedUrl,
    storagePath,
  };
}

/**
 * Remove a foto de perfil atual e retorna ao avatar padrão.
 */
export async function removeAvatar(
  userId: string,
  currentStoragePath?: string | null
): Promise<void> {
  if (currentStoragePath) {
    try {
      const cleanPath = currentStoragePath.startsWith('http')
        ? currentStoragePath.split('/curator-media/')[1]?.split('?')[0]
        : currentStoragePath;
      if (cleanPath && cleanPath.includes(`${userId}/avatars/`)) {
        await supabase.storage.from('curator-media').remove([cleanPath]);
      }
    } catch {
      // limpeza silenciosa
    }
  }

  // Atualiza perfil no banco definindo avatar_url como null
  await updateUserProfile(userId, { avatar_url: null });
}

/**
 * Registra a conclusão do tutorial de primeiro acesso.
 */
export async function completeOnboarding(userId: string): Promise<void> {
  try {
    await updateUserProfile(userId, { onboarding_completed: true });
  } catch (err) {
    console.warn('Erro ao salvar conclusão de onboarding no servidor:', err);
  }
}

/**
 * Salva as preferências de usuário (tema, densidade, atalhos, visão inicial).
 */
export async function saveUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<UserPreferences> {
  const updated = await updateUserProfile(userId, { preferences });
  return updated.preferences;
}
