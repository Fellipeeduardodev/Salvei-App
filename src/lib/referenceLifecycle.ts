import { Reference, CodeSnippet, ReferenceFile } from '../types/reference';
import { normalizeTag } from './searchAndFilter';

export interface UrlValidationResult {
  isValid: boolean;
  formattedUrl?: string;
  domain?: string;
  error?: string;
}

/**
 * Validates and formats a raw URL string entered by the user.
 * Adds https:// protocol if omitted and extracts a clean domain.
 */
export function validateAndFormatUrl(rawUrl: string): UrlValidationResult {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Por favor, informe a URL do website.',
    };
  }

  // Check if user specified an explicit protocol
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed);
  if (hasProtocol && !/^https?:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Apenas endereços HTTP ou HTTPS são suportados.',
    };
  }

  // Auto-prepend https:// if protocol is missing
  let candidate = trimmed;
  if (!hasProtocol) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    
    // Validate protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Apenas endereços HTTP ou HTTPS são suportados.',
      };
    }

    // Validate hostname structure (must have at least a dot or be localhost)
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return {
        isValid: false,
        error: 'URL inválida. Utilize um formato válido como https://linear.app ou https://exemplo.com.',
      };
    }

    const domain = parsed.hostname.replace(/^www\./i, '');

    return {
      isValid: true,
      formattedUrl: parsed.toString(),
      domain,
    };
  } catch {
    return {
      isValid: false,
      error: 'URL malformada. Verifique se o endereço foi digitado corretamente.',
    };
  }
}

/**
 * Checks if a URL is already registered in the library.
 * Normalizes URLs (lowercasing, trimming, removing redundant www and trailing slashes from path)
 * while strictly preserving query parameters and hash fragments (as required to distinguish pages).
 */
export function checkDuplicateUrl(url: string, existingUrls: string[]): boolean {
  if (!url) return false;

  const normalizeForComparison = (u: string) => {
    try {
      const parsed = new URL(u.startsWith('http') ? u : `https://${u}`);
      const cleanPath = parsed.pathname.replace(/\/$/, '');
      return (
        parsed.hostname.replace(/^www\./i, '') +
        cleanPath +
        parsed.search +
        parsed.hash
      ).toLowerCase();
    } catch {
      return u.trim().toLowerCase().replace(/\/$/, '');
    }
  };

  const target = normalizeForComparison(url);
  return existingUrls.some((existing) => Boolean(existing) && normalizeForComparison(existing) === target);
}

/**
 * Formats file size in human-readable units.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Creates a new Reference object from payload parameters.
 */
export function createReferenceFromPayload(params: {
  url?: string;
  title?: string;
  domain?: string;
  screenshotUrl?: string;
  imageStorageId?: string;
  originalFileName?: string;
  screenshotStatus?: Reference['screenshotStatus'];
  tags?: string[];
  projectIds?: string[];
  collectionIds?: string[];
  notesMarkdown?: string;
  codeSnippets?: CodeSnippet[];
  relatedFiles?: ReferenceFile[];
  sourceType?: Reference['sourceType'];
}): Reference {
  const hasImage = Boolean(params.screenshotUrl || params.imageStorageId);
  const hasUrl = Boolean(params.url);

  let derivedSourceType: Reference['sourceType'] = 'url';
  if (hasImage && hasUrl) derivedSourceType = 'both';
  else if (hasImage) derivedSourceType = 'image';

  const now = new Date().toISOString();
  const domain = params.domain || (params.url ? validateAndFormatUrl(params.url).domain : undefined);

  let defaultTitle = params.title?.trim();
  if (!defaultTitle) {
    if (domain) {
      defaultTitle = `${domain.charAt(0).toUpperCase() + domain.slice(1)} — Referência Web`;
    } else if (params.originalFileName) {
      defaultTitle = params.originalFileName.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      defaultTitle = defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1);
    } else {
      defaultTitle = 'Nova referência';
    }
  }

  const cleanTags = (params.tags || [])
    .map(normalizeTag)
    .filter((t) => t.length > 0);

  return {
    id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: defaultTitle,
    sourceType: params.sourceType || derivedSourceType,
    url: params.url,
    domain,
    screenshotUrl: params.screenshotUrl,
    imageStorageId: params.imageStorageId,
    originalFileName: params.originalFileName,
    screenshotStatus: params.screenshotStatus || (params.screenshotUrl ? 'ready' : 'none'),
    tags: cleanTags.length > 0 ? Array.from(new Set(cleanTags)) : ['referencia'],
    projectIds: params.projectIds ? Array.from(new Set(params.projectIds)) : [],
    collectionIds: params.collectionIds ? Array.from(new Set(params.collectionIds)) : [],
    notesMarkdown:
      params.notesMarkdown ||
      (params.url
        ? `### Referência salva por endereço\n- **Origem:** [${domain || params.url}](${params.url})\n- Adicionado em ${new Date().toLocaleDateString('pt-BR')}.`
        : `### Referência visual\n- Adicionado em ${new Date().toLocaleDateString('pt-BR')}.`),
    codeSnippets: params.codeSnippets || [],
    relatedFiles: params.relatedFiles || [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates an existing reference in-place, preserving id and createdAt.
 */
export function updateReferenceInPlace(
  existing: Reference,
  updates: Partial<Reference>
): Reference {
  let updatedDomain = existing.domain;
  let updatedSourceType = existing.sourceType;

  if (updates.url !== undefined) {
    if (updates.url) {
      const validated = validateAndFormatUrl(updates.url);
      if (validated.isValid && validated.domain) {
        updatedDomain = validated.domain;
      }
      const hasImage = Boolean(updates.screenshotUrl || existing.screenshotUrl);
      updatedSourceType = hasImage ? 'both' : 'url';
    } else {
      updatedDomain = undefined;
      const hasImage = Boolean(updates.screenshotUrl || existing.screenshotUrl);
      updatedSourceType = hasImage ? 'image' : 'url';
    }
  }

  return {
    ...existing,
    ...updates,
    id: existing.id, // Strictly preserve original ID
    createdAt: existing.createdAt, // Strictly preserve original creation date
    domain: updates.domain !== undefined ? updates.domain : updatedDomain,
    sourceType: updates.sourceType !== undefined ? updates.sourceType : updatedSourceType,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Deletes a reference from the references list.
 */
export function deleteReferenceFromList(
  references: Reference[],
  idToDelete: string
): Reference[] {
  return references.filter((r) => r.id !== idToDelete);
}

/**
 * Adds a code snippet to a reference.
 */
export function addSnippetToReference(
  reference: Reference,
  snippet: Omit<CodeSnippet, 'id'> & { id?: string }
): Reference {
  const newSnippet: CodeSnippet = {
    id: snippet.id || `snippet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: snippet.title.trim(),
    language: snippet.language,
    code: snippet.code.trim(),
  };

  return updateReferenceInPlace(reference, {
    codeSnippets: [...reference.codeSnippets, newSnippet],
  });
}

/**
 * Updates an existing code snippet within a reference.
 */
export function updateSnippetInReference(
  reference: Reference,
  updatedSnippet: CodeSnippet
): Reference {
  return updateReferenceInPlace(reference, {
    codeSnippets: reference.codeSnippets.map((s) =>
      s.id === updatedSnippet.id ? updatedSnippet : s
    ),
  });
}

/**
 * Deletes a code snippet from a reference.
 */
export function removeSnippetFromReference(
  reference: Reference,
  snippetId: string
): Reference {
  return updateReferenceInPlace(reference, {
    codeSnippets: reference.codeSnippets.filter((s) => s.id !== snippetId),
  });
}

/**
 * Adds a related file to a reference.
 */
export function addFileToReference(
  reference: Reference,
  file: ReferenceFile
): Reference {
  return updateReferenceInPlace(reference, {
    relatedFiles: [...reference.relatedFiles, file],
  });
}

/**
 * Removes a related file from a reference.
 */
export function removeFileFromReference(
  reference: Reference,
  fileId: string
): Reference {
  return updateReferenceInPlace(reference, {
    relatedFiles: reference.relatedFiles.filter((f) => f.id !== fileId),
  });
}
