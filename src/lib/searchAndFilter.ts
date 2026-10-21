import { Reference, FilterCriteria, ContentTypeFilter } from '../types/reference';

/**
 * Normalizes text by removing accents, diacritics, and converting to lowercase.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Normalizes a tag string by stripping leading '#', whitespace, and accents.
 */
export function normalizeTag(tag: string): string {
  if (!tag) return '';
  return normalizeText(tag).replace(/^#+/, '').replace(/\s+/g, '-');
}

/**
 * Extracts all searchable text fields from a Reference into a single searchable string.
 */
export function getSearchableReferenceText(ref: Reference): string {
  const parts: string[] = [
    ref.title || '',
    ref.domain || '',
    ref.url || '',
    ref.originalFileName || '',
    ref.tags ? ref.tags.join(' ') : '',
    ref.notesMarkdown || '',
  ];

  // Include Code Snippets (titles and code bodies)
  if (ref.codeSnippets && ref.codeSnippets.length > 0) {
    ref.codeSnippets.forEach((s) => {
      parts.push(s.title || '');
      parts.push(s.code || '');
    });
  }

  // Include Related Files (file names)
  if (ref.relatedFiles && ref.relatedFiles.length > 0) {
    ref.relatedFiles.forEach((f) => {
      parts.push(f.name || '');
    });
  }

  return parts.join(' ');
}

/**
 * Checks if a reference matches a given search query.
 * Multi-word search requires every term to be found in the reference.
 */
export function matchesSearchQuery(ref: Reference, query: string): boolean {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return true;

  const terms = cleanQuery.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchable = normalizeText(getSearchableReferenceText(ref));

  // Every word/term in the query must match
  return terms.every((term) => searchable.includes(term));
}

/**
 * Checks content-type constraints.
 */
export function matchesContentType(ref: Reference, type: ContentTypeFilter): boolean {
  switch (type) {
    case 'is_favorite':
      return Boolean(ref.isFavorite);
    case 'has_image':
      return Boolean(ref.screenshotUrl && ref.screenshotStatus === 'ready');
    case 'has_code':
      return Boolean(ref.codeSnippets && ref.codeSnippets.length > 0);
    case 'has_notes':
      return Boolean(ref.notesMarkdown && ref.notesMarkdown.trim().length > 0);
    case 'has_files':
      return Boolean(
        (ref.relatedFiles && ref.relatedFiles.length > 0) || Boolean(ref.originalFileName)
      );
    default:
      return true;
  }
}

/**
 * Filters and sorts references using complete combinable criteria:
 * - Search query (all terms must match)
 * - Tags: OR logic between selected tags
 * - Projects: OR logic between selected projects (reference in any selected project)
 * - Collections: OR logic between selected collections (reference in any selected collection)
 * - Content Types: AND logic between selected content types (reference must have all)
 * - Cross-category: AND logic across all categories
 * - Sorting: newest, oldest, alphabetical
 */
export function filterAndSortReferences(
  references: Reference[],
  criteria: Partial<FilterCriteria>
): Reference[] {
  const {
    searchQuery = '',
    selectedTags = [],
    selectedProjectIds = [],
    selectedCollectionIds = [],
    contentTypes = [],
    sortOption = 'newest',
  } = criteria;

  const filtered = references.filter((ref) => {
    // 1. Search Query
    if (searchQuery.trim() && !matchesSearchQuery(ref, searchQuery)) {
      return false;
    }

    // 2. Tags Filter (OR logic between selected tags)
    if (selectedTags.length > 0) {
      const normalizedRefTags = (ref.tags || []).map(normalizeTag);
      const normalizedSelectedTags = selectedTags.map(normalizeTag);
      const hasAnyTag = normalizedSelectedTags.some((selected) =>
        normalizedRefTags.includes(selected)
      );
      if (!hasAnyTag) return false;
    }

    // 3. Projects Filter (Matches if reference belongs to any of the selected projects)
    if (selectedProjectIds.length > 0) {
      const refProjects = ref.projectIds || [];
      const hasAnyProject = selectedProjectIds.some((pId) => refProjects.includes(pId));
      if (!hasAnyProject) return false;
    }

    // 4. Collections Filter (Matches if reference belongs to any of the selected collections)
    if (selectedCollectionIds.length > 0) {
      const refCollections = ref.collectionIds || [];
      const hasAnyCollection = selectedCollectionIds.some((cId) =>
        refCollections.includes(cId)
      );
      if (!hasAnyCollection) return false;
    }

    // 5. Content Types Filter (AND logic: must satisfy every selected content type constraint)
    if (contentTypes.length > 0) {
      const satisfiesAllTypes = contentTypes.every((type) => matchesContentType(ref, type));
      if (!satisfiesAllTypes) return false;
    }

    return true;
  });

  // Sort results
  filtered.sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOption === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortOption === 'alphabetical') {
      return a.title.localeCompare(b.title, 'pt-BR');
    }
    return 0;
  });

  return filtered;
}
