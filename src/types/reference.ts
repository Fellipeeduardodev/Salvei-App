export type ScreenshotStatus = 'none' | 'pending' | 'ready' | 'failed';

export type ReferenceSourceType = 'url' | 'image' | 'both';

export interface CodeSnippet {
  id: string;
  title: string;
  language: 'typescript' | 'javascript' | 'css' | 'html' | 'tailwind' | 'json';
  code: string;
}

export interface ReferenceFile {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
}

export interface Reference {
  id: string;
  title: string;
  sourceType?: ReferenceSourceType;
  
  // Optional URL and Domain (mandatory for URL-based or hybrid, optional for image-only)
  url?: string;
  domain?: string;

  // Optional Image (mandatory for image-based or hybrid, optional for URL-only)
  screenshotUrl?: string;
  imageStorageId?: string;
  originalFileName?: string;
  screenshotStatus: ScreenshotStatus;

  // Favorito
  isFavorite?: boolean;

  // Organization & Metadata
  tags: string[];
  collectionIds: string[];
  projectIds: string[];
  notesMarkdown: string;
  codeSnippets: CodeSnippet[];
  relatedFiles: ReferenceFile[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentTypeFilter = 'is_favorite' | 'has_image' | 'has_code' | 'has_notes' | 'has_files';

export interface FilterCriteria {
  searchQuery: string;
  selectedTags: string[]; // OR logic between tags
  selectedProjectIds: string[];
  selectedCollectionIds: string[];
  contentTypes: ContentTypeFilter[];
  sortOption: SortOption;
}

export type NavigationDestination = 'inbox' | 'projects' | 'collections' | 'tags' | 'settings';

export type SortOption = 'newest' | 'oldest' | 'alphabetical';
