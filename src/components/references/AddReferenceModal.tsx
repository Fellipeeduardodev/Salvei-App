import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Globe,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Loader2,
  Plus,
  Pencil,
  Tag as TagIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TagInput } from '../ui/TagInput';
import { Project, Collection, CodeSnippet, ReferenceFile, ColorPaletteItem } from '../../types/reference';
import { validateAndFormatUrl, checkDuplicateUrl, formatBytes } from '../../lib/referenceLifecycle';
import { generateMetadataForUrlWithGemini, hasGeminiApiKey } from '../../services/geminiService';
import { extractPaletteFromImage, generateStyleInsightsFromPalette } from '../../lib/colorExtractor';

export interface ImageFileDraft {
  file: File;
  previewUrl: string;
  name: string;
  title: string;
  sizeFormatted: string;
  palette?: ColorPaletteItem[];
  suggestedTags?: string[];
  isExtractingPalette?: boolean;
}

interface AddReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUrl: (data: {
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
  }) => Promise<void> | void;
  onSaveImages: (
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
  ) => Promise<void> | void;
  existingUrls: string[];
  initialMode?: 'url' | 'image';
  initialPastedUrl?: string | null;
  initialPastedFile?: File | null;
  onOpenExisting?: (url: string) => void;
  availableProjects?: Project[];
  availableCollections?: Collection[];
  availableTags?: string[];
}

const DEFAULT_SUGGESTED_TAGS = [
  'saas',
  'landing-page',
  'dark-mode',
  'dashboard',
  'mobile',
  'minimal',
  'tipografia',
  'editorial',
];

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
];

function cleanFileNameToTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  const cleaned = withoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return 'Referência visual';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export const AddReferenceModal: React.FC<AddReferenceModalProps> = ({
  isOpen,
  onClose,
  onSaveUrl,
  onSaveImages,
  existingUrls,
  initialMode = 'url',
  initialPastedUrl,
  initialPastedFile,
  onOpenExisting,
  availableProjects: _availableProjects = [],
  availableCollections = [],
  availableTags = [],
}) => {
  const [mode, setMode] = useState<'url' | 'image'>(initialMode);

  // URL Mode state
  const [url, setUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlTags, setUrlTags] = useState<string[]>([]);
  const [urlSelectedCollectionId, setUrlSelectedCollectionId] = useState<string>('');
  const [urlImageFile, setUrlImageFile] = useState<File | null>(null);
  const [urlImagePreview, setUrlImagePreview] = useState<string | null>(null);
  const [urlImagePalette, setUrlImagePalette] = useState<ColorPaletteItem[] | undefined>(undefined);
  const [showCustomImageUpload, setShowCustomImageUpload] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [allowDuplicateUrl, setAllowDuplicateUrl] = useState(false);

  // Image Mode state
  const [imageDrafts, setImageDrafts] = useState<ImageFileDraft[]>([]);
  const [imageSharedTags, setImageSharedTags] = useState<string[]>([]);
  const [imageSharedUrl, setImageSharedUrl] = useState('');
  const [imageSelectedCollectionId, setImageSelectedCollectionId] = useState<string>('');
  const [imageErrorMessage, setImageErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAiMeta, setIsGeneratingAiMeta] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlFileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const isDuplicate = checkDuplicateUrl(url, existingUrls);

  // Dynamic tag suggestions
  const tagSuggestions = useMemo(() => {
    return Array.from(new Set([...(availableTags || []), ...DEFAULT_SUGGESTED_TAGS]));
  }, [availableTags]);

  const imageTagSuggestions = useMemo(() => {
    const draftTags = imageDrafts.flatMap((d) => d.suggestedTags || []);
    return Array.from(new Set([...draftTags, ...tagSuggestions]));
  }, [imageDrafts, tagSuggestions]);

  // Keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Process incoming image files with background palette extraction
  const processImageFiles = useCallback((files: FileList | File[]) => {
    setImageErrorMessage('');
    const newDrafts: ImageFileDraft[] = [];

    Array.from(files).forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setImageErrorMessage(`Formato não suportado para "${file.name}". Use PNG, JPG, WebP, GIF ou AVIF.`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setImageErrorMessage(`O arquivo "${file.name}" excede o tamanho máximo de 15MB.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newDrafts.push({
        file,
        previewUrl,
        name: file.name,
        title: cleanFileNameToTitle(file.name),
        sizeFormatted: formatBytes(file.size),
        isExtractingPalette: true,
      });

      // Background palette extraction
      extractPaletteFromImage(previewUrl, 5).then((pal) => {
        if (pal && pal.length > 0) {
          const insights = generateStyleInsightsFromPalette(pal);
          setImageDrafts((prev) =>
            prev.map((d) =>
              d.previewUrl === previewUrl
                ? {
                    ...d,
                    palette: pal,
                    suggestedTags: insights.suggestedTags,
                    isExtractingPalette: false,
                  }
                : d
            )
          );
        } else {
          setImageDrafts((prev) =>
            prev.map((d) =>
              d.previewUrl === previewUrl ? { ...d, isExtractingPalette: false } : d
            )
          );
        }
      });
    });

    if (newDrafts.length > 0) {
      setImageDrafts((prev) => [...prev, ...newDrafts]);
    }
  }, []);

  // Global Ctrl+V paste handling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedImageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) pastedImageFiles.push(file);
        }
      }

      if (pastedImageFiles.length > 0) {
        e.preventDefault();
        setMode('image');
        processImageFiles(pastedImageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, processImageFiles]);

  // AI Metadata generation via Gemini
  const handleGenerateAiMetadata = async () => {
    if (!url.trim() || isGeneratingAiMeta) return;
    setIsGeneratingAiMeta(true);
    try {
      const res = await generateMetadataForUrlWithGemini(url, urlTitle);
      if (res.title) setUrlTitle(res.title);
      if (res.tags && res.tags.length > 0) {
        setUrlTags((prev) => Array.from(new Set([...prev, ...res.tags])));
      }
    } catch (e) {
      console.warn('Falha ao gerar metadados via IA:', e);
    } finally {
      setIsGeneratingAiMeta(false);
    }
  };

  // Reset state on modal open/close
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialPastedUrl) {
        setMode('url');
        setUrl(initialPastedUrl);
        const validation = validateAndFormatUrl(initialPastedUrl);
        if (validation.isValid && validation.domain) {
          const dom = validation.domain;
          setUrlTitle(`${dom.charAt(0).toUpperCase() + dom.slice(1)} — Referência Web`);
        }
      } else {
        setUrl('');
        setUrlTitle('');
      }

      setUrlTags([]);
      setUrlSelectedCollectionId('');
      setUrlImageFile(null);
      setUrlImagePreview(null);
      setUrlImagePalette(undefined);
      setShowCustomImageUpload(false);
      setUrlError('');
      setAllowDuplicateUrl(false);

      if (initialPastedFile) {
        setMode('image');
        const previewUrl = URL.createObjectURL(initialPastedFile);
        setImageDrafts([
          {
            file: initialPastedFile,
            previewUrl,
            name: initialPastedFile.name,
            title: cleanFileNameToTitle(initialPastedFile.name),
            sizeFormatted: formatBytes(initialPastedFile.size),
            isExtractingPalette: true,
          },
        ]);

        extractPaletteFromImage(previewUrl, 5).then((pal) => {
          if (pal && pal.length > 0) {
            const insights = generateStyleInsightsFromPalette(pal);
            setImageDrafts((prev) =>
              prev.map((d) =>
                d.previewUrl === previewUrl
                  ? {
                      ...d,
                      palette: pal,
                      suggestedTags: insights.suggestedTags,
                      isExtractingPalette: false,
                    }
                  : d
              )
            );
          }
        });
      } else {
        setImageDrafts([]);
      }
      setImageSharedTags([]);
      setImageSharedUrl('');
      setImageSelectedCollectionId('');
      setImageErrorMessage('');
      setIsSubmitting(false);

      if (initialMode === 'url' || !initialPastedFile) {
        setTimeout(() => urlInputRef.current?.focus(), 80);
      }
    } else {
      imageDrafts.forEach((d) => URL.revokeObjectURL(d.previewUrl));
      if (urlImagePreview) URL.revokeObjectURL(urlImagePreview);
      setUrlImagePalette(undefined);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveDraft = (index: number) => {
    setImageDrafts((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpdateDraftTitle = (index: number, newTitle: string) => {
    setImageDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, title: newTitle } : d))
    );
  };

  // Submit URL Reference
  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setUrlError('');

    const validation = validateAndFormatUrl(url);
    if (!validation.isValid || !validation.formattedUrl) {
      setUrlError(validation.error || 'Por favor, informe uma URL válida.');
      return;
    }

    if (isDuplicate && !allowDuplicateUrl) {
      setUrlError('Esta URL já está salva. Você pode visualizar a existente ou marcar "Salvar como cópia independente".');
      return;
    }

    const tags = urlTags
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    setIsSubmitting(true);
    try {
      await onSaveUrl({
        url: validation.formattedUrl,
        title: urlTitle.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        imageFile: urlImageFile || undefined,
        palette: urlImagePalette,
        collectionIds: urlSelectedCollectionId ? [urlSelectedCollectionId] : undefined,
      });
      onClose();
    } catch {
      setUrlError('Erro ao salvar a referência.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Image References
  const handleSubmitImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (imageDrafts.length === 0) {
      setImageErrorMessage('Por favor, selecione ou cole pelo menos uma imagem.');
      return;
    }

    const sharedTagsList = imageSharedTags
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    let cleanUrl = imageSharedUrl.trim();
    if (cleanUrl) {
      const validated = validateAndFormatUrl(cleanUrl);
      if (validated.isValid && validated.formattedUrl) {
        cleanUrl = validated.formattedUrl;
      }
    }

    setIsSubmitting(true);
    try {
      await onSaveImages(
        imageDrafts.map((draft) => {
          const itemTags = Array.from(
            new Set([...sharedTagsList, ...(draft.suggestedTags || [])])
          );
          return {
            file: draft.file,
            title: draft.title.trim() || cleanFileNameToTitle(draft.name),
            tags: itemTags.length > 0 ? itemTags : undefined,
            sourceUrl: cleanUrl || undefined,
            palette: draft.palette,
            collectionIds: imageSelectedCollectionId ? [imageSelectedCollectionId] : undefined,
          };
        })
      );
      onClose();
    } catch {
      setImageErrorMessage('Ocorreu um erro ao salvar as imagens.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F0F0F]/55 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full sm:max-w-[560px] max-h-[92vh] bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] border-t sm:border border-[#E7E7E5] dark:border-[#2D3139] rounded-t-2xl sm:rounded-md shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D4D4D0] dark:bg-[#3E434D]" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70 flex-shrink-0">
          <div>
            <h2 id="modal-title" className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6]">
              Adicionar referência
            </h2>
            <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] mt-0.5">
              Salve links visuais ou importe imagens diretamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer"
            aria-label="Fechar diálogo"
          >
            <X size={17} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#E7E7E5] dark:border-[#2D3139] px-5 bg-[#F8F8F6]/60 dark:bg-[#15171C]/60 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'url'
                ? 'border-[#4355DB] dark:border-[#6375F1] text-[#4355DB] dark:text-[#6375F1]'
                : 'border-transparent text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
            }`}
          >
            <Globe size={14} />
            <span>Por URL</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('image')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'image'
                ? 'border-[#4355DB] dark:border-[#6375F1] text-[#4355DB] dark:text-[#6375F1]'
                : 'border-transparent text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
            }`}
          >
            <ImageIcon size={14} />
            <span>Por imagem</span>
            {imageDrafts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#4355DB] text-white font-mono text-[10px]">
                {imageDrafts.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-5 scrollbar-thin"
          style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* TAB 1: POR URL */}
          {mode === 'url' && (
            <form onSubmit={handleSubmitUrl} className="flex flex-col gap-4">
              {/* URL Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ref-url" className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">
                  URL do website <span className="text-[#4355DB] dark:text-[#6375F1]">*</span>
                </label>
                <Input
                  ref={urlInputRef}
                  id="ref-url"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setUrl(nextVal);
                    setUrlError('');
                    setAllowDuplicateUrl(false);
                    if (!urlTitle.trim()) {
                      try {
                        const parsed = new URL(nextVal.startsWith('http') ? nextVal : 'https://' + nextVal);
                        const dom = parsed.hostname.replace(/^www\./, '');
                        if (dom && dom.includes('.')) {
                          setUrlTitle(`${dom.charAt(0).toUpperCase() + dom.slice(1)} — Referência`);
                        }
                      } catch {}
                    }
                  }}
                  placeholder="https://linear.app ou stripe.com"
                  iconLeft={
                    url.includes('.') ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${url.replace(/^https?:\/\//, '').split('/')[0]}&sz=32`}
                        alt=""
                        className="w-4 h-4 rounded-xs shrink-0 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe size={14} />
                    )
                  }
                  error={!!urlError}
                  required
                />

                {urlError && <span className="text-[11px] text-[#EF4444] font-medium">{urlError}</span>}

                {/* Duplicate URL alert banner */}
                {isDuplicate && (
                  <div className="p-3 bg-[#FFFBEB] dark:bg-amber-950/40 border border-[#FDE68A] dark:border-amber-700/50 rounded-sm flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={15} className="text-[#D97706] dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-xs text-[#92400E] dark:text-amber-200">
                        <p className="font-semibold">Esta URL já está salva na sua biblioteca.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#FDE68A]/60 dark:border-amber-700/40">
                      {onOpenExisting && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenExisting(url);
                          }}
                          className="text-[11px] font-semibold text-[#4355DB] dark:text-[#6375F1] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          Visualizar existente
                          <ArrowUpRight size={11} />
                        </button>
                      )}

                      <label className="text-[11px] font-medium text-[#78350F] dark:text-amber-300 flex items-center gap-1.5 cursor-pointer ml-auto">
                        <input
                          type="checkbox"
                          checked={allowDuplicateUrl}
                          onChange={(e) => {
                            setAllowDuplicateUrl(e.target.checked);
                            setUrlError('');
                          }}
                          className="accent-[#4355DB] rounded"
                        />
                        <span>Salvar como cópia independente</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="ref-title" className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-1.5">
                    <Pencil size={12} className="text-[#4355DB] dark:text-[#6375F1]" />
                    <span>Nome / Título da referência</span>
                    <span className="text-[#737373] dark:text-[#9CA3AF] font-normal">(opcional)</span>
                  </label>

                  {hasGeminiApiKey() && url.trim().length > 3 && (
                    <button
                      type="button"
                      onClick={handleGenerateAiMetadata}
                      disabled={isGeneratingAiMeta}
                      className="text-[11px] font-medium text-[#4355DB] dark:text-[#818CF8] hover:text-[#3646B8] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Sugerir título e tags automaticamente com IA"
                    >
                      {isGeneratingAiMeta ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-[#4355DB]" />
                          <span>Sugerindo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} className="text-[#F59E0B]" />
                          <span>Sugerir com IA</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <Input
                  id="ref-title"
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Ex: Stripe Billing ou Linear App"
                />
              </div>

              {/* Organization: Collection & Interactive Tags */}
              <div className="flex flex-col gap-3">
                {/* Collection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-1.5">
                    <Layers size={12} className="text-[#4355DB] dark:text-[#6375F1]" /> Coleção <span className="text-[#737373] dark:text-[#9CA3AF] font-normal">(opcional)</span>
                  </label>
                  <select
                    value={urlSelectedCollectionId}
                    onChange={(e) => setUrlSelectedCollectionId(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] outline-none cursor-pointer"
                  >
                    <option value="">Nenhuma coleção</option>
                    {availableCollections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive Tags */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-1.5">
                      <TagIcon size={12} className="text-[#4355DB] dark:text-[#6375F1]" />
                      <span>Etiquetas</span>
                      <span className="text-[#737373] dark:text-[#9CA3AF] font-normal">(opcional)</span>
                    </label>
                    {urlTags.length > 0 && (
                      <span className="text-[10px] font-mono text-[#4355DB] dark:text-[#6375F1]">
                        {urlTags.length} etiqueta{urlTags.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <TagInput
                    id="ref-tags"
                    tags={urlTags}
                    onChange={setUrlTags}
                    suggestions={tagSuggestions}
                    placeholder="Digite e aperte Enter ou vírgula..."
                  />
                </div>
              </div>

              {/* Optional Custom Cover Image (Minimal, subtle affordance) */}
              <div className="pt-1">
                {urlImagePreview ? (
                  <div className="flex items-center gap-3 p-2 bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] rounded-md">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-[#E7E7E5] dark:border-[#2D3139]">
                      <img src={urlImagePreview} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[#171717] dark:text-[#F3F4F6] truncate block">
                        {urlImageFile?.name}
                      </span>
                      <span className="text-[10px] text-[#22c55e] flex items-center gap-1 font-mono">
                        <CheckCircle2 size={10} /> Capa personalizada anexada
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (urlImagePreview) URL.revokeObjectURL(urlImagePreview);
                        setUrlImageFile(null);
                        setUrlImagePreview(null);
                        setUrlImagePalette(undefined);
                      }}
                      className="p-1 text-[#737373] hover:text-[#EF4444] cursor-pointer"
                      title="Remover capa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : showCustomImageUpload ? (
                  <div className="flex items-center gap-2 p-2 rounded border border-dashed border-[#D4D4D0] dark:border-[#3E434D] bg-[#F8F8F6] dark:bg-[#15171C]">
                    <input
                      ref={urlFileInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > MAX_IMAGE_SIZE_BYTES) {
                            setUrlError('A imagem excede 15MB.');
                            return;
                          }
                          setUrlImageFile(file);
                          const preview = URL.createObjectURL(file);
                          setUrlImagePreview(preview);
                          extractPaletteFromImage(preview, 5).then((pal) => {
                            if (pal && pal.length > 0) setUrlImagePalette(pal);
                          });
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => urlFileInputRef.current?.click()}
                      className="text-xs text-[#4355DB] dark:text-[#6375F1] font-medium hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload size={12} /> Selecionar imagem do computador
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomImageUpload(false)}
                      className="text-xs text-[#737373] ml-auto hover:text-[#171717] cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomImageUpload(true)}
                    className="text-[11px] text-[#737373] dark:text-[#9CA3AF] hover:text-[#4355DB] dark:hover:text-[#6375F1] inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Personalizar imagem de capa (opcional)</span>
                  </button>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
                <Button variant="secondary" size="md" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button variant="primary" size="md" type="submit" disabled={isSubmitting || !url.trim()}>
                  {isSubmitting ? 'Salvando...' : 'Salvar referência'}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: POR IMAGEM */}
          {mode === 'image' && (
            <form onSubmit={handleSubmitImages} className="flex flex-col gap-4">
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 rounded-md border-2 border-dashed transition-all cursor-pointer text-center select-none ${
                  isDragOver
                    ? 'border-[#4355DB] bg-[#4355DB]/5'
                    : 'border-[#D4D4D0] dark:border-[#3E434D] hover:border-[#171717] dark:hover:border-[#F3F4F6] bg-[#F8F8F6] dark:bg-[#15171C]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={(e) => {
                    if (e.target.files) processImageFiles(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <div className="w-9 h-9 rounded-full bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-center text-[#4355DB] dark:text-[#6375F1] shadow-2xs mb-2">
                  <Upload size={16} strokeWidth={2} />
                </div>

                <p className="font-sans font-semibold text-xs text-[#171717] dark:text-[#F3F4F6]">
                  Arraste imagens ou clique para selecionar
                </p>
                <p className="font-sans text-[11px] text-[#737373] dark:text-[#9CA3AF] mt-0.5">
                  Ou cole diretamente com <kbd className="px-1 py-0.5 font-mono text-[9px] bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] rounded text-[#171717] dark:text-[#F3F4F6]">Ctrl+V</kbd>
                </p>
              </div>

              {/* Error Alert */}
              {imageErrorMessage && (
                <div className="p-2.5 bg-[#FEF2F2] dark:bg-rose-950/40 border border-[#FCA5A5] dark:border-rose-800/60 rounded-md text-[#B91C1C] dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{imageErrorMessage}</span>
                </div>
              )}

              {/* Selected Images List */}
              {imageDrafts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#171717] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Imagens selecionadas</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#4355DB]/10 dark:bg-[#6375F1]/15 text-[#4355DB] dark:text-[#6375F1] text-[10px]">
                        {imageDrafts.length}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageDrafts([])}
                      className="text-[11px] text-[#737373] dark:text-[#9CA3AF] hover:text-[#EF4444] font-medium transition-colors cursor-pointer"
                    >
                      Remover todas
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {imageDrafts.map((draft, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] rounded-lg shadow-2xs hover:border-[#D4D4D0] dark:hover:border-[#3E434D] transition-all"
                      >
                        {/* Thumbnail preview */}
                        <div className="w-12 h-11 rounded-md bg-white dark:bg-[#15171C] border border-[#E7E7E5] dark:border-[#2D3139] overflow-hidden flex-shrink-0 shadow-2xs">
                          <img
                            src={draft.previewUrl}
                            alt={draft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Interactive editable title */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <div className="relative flex items-center group/edit">
                            <input
                              type="text"
                              value={draft.title}
                              onChange={(e) => handleUpdateDraftTitle(idx, e.target.value)}
                              placeholder="Nome da referência..."
                              aria-label={`Editar nome da imagem ${idx + 1}`}
                              className="w-full text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] bg-white dark:bg-[#15171C] border border-[#E7E7E5] dark:border-[#2D3139] hover:border-[#4355DB] dark:hover:border-[#6375F1] focus:border-[#4355DB] dark:focus:border-[#6375F1] focus:ring-1 focus:ring-[#4355DB] dark:focus:ring-[#6375F1] rounded-md px-2.5 py-1.5 pr-7 outline-none transition-all placeholder:text-[#A8A8A6] shadow-2xs"
                              title="Clique para renomear esta referência"
                            />
                            <Pencil
                              size={12}
                              className="absolute right-2.5 text-[#A8A8A6] dark:text-[#6B7280] group-hover/edit:text-[#4355DB] dark:group-hover/edit:text-[#6375F1] pointer-events-none transition-colors"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-[#A8A8A6] dark:text-[#6B7280] px-0.5">
                            <span className="truncate max-w-[200px]" title={draft.name}>
                              {draft.name}
                            </span>
                            <span>{draft.sizeFormatted}</span>
                          </div>
                        </div>

                        {/* Remove image draft */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDraft(idx)}
                          className="p-1.5 text-[#A8A8A6] dark:text-[#6B7280] hover:text-[#EF4444] dark:hover:text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors rounded-md cursor-pointer flex-shrink-0"
                          title="Remover imagem"
                          aria-label={`Remover ${draft.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organization: Collection & Source URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
                {/* Collection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-1.5">
                    <Layers size={12} className="text-[#4355DB] dark:text-[#6375F1]" /> Coleção <span className="text-[#737373] dark:text-[#9CA3AF] font-normal">(opcional)</span>
                  </label>
                  <select
                    value={imageSelectedCollectionId}
                    onChange={(e) => setImageSelectedCollectionId(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] outline-none cursor-pointer"
                  >
                    <option value="">Nenhuma coleção</option>
                    {availableCollections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Source URL */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="shared-url" className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6]">
                    URL de origem <span className="text-[#737373] dark:text-[#9CA3AF] font-normal">(opcional)</span>
                  </label>
                  <Input
                    id="shared-url"
                    type="text"
                    value={imageSharedUrl}
                    onChange={(e) => setImageSharedUrl(e.target.value)}
                    placeholder="https://exemplo.com/pagina"
                    iconLeft={<Globe size={13} />}
                  />
                </div>
              </div>

              {/* Interactive Tags with Quick Suggestions */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-1.5">
                    <TagIcon size={12} className="text-[#4355DB] dark:text-[#6375F1]" />
                    <span>Etiquetas</span>
                    <span className="text-[#737373] dark:text-[#9CA3AF] font-normal">
                      {imageDrafts.length > 1 ? '(aplicadas a todas as imagens)' : '(opcional)'}
                    </span>
                  </label>
                  {imageSharedTags.length > 0 && (
                    <span className="text-[10px] font-mono text-[#4355DB] dark:text-[#6375F1]">
                      {imageSharedTags.length} etiqueta{imageSharedTags.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <TagInput
                  id="shared-tags"
                  tags={imageSharedTags}
                  onChange={setImageSharedTags}
                  suggestions={imageTagSuggestions}
                  placeholder="Digite e aperte Enter ou vírgula..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
                <Button variant="secondary" size="md" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={imageDrafts.length === 0 || isSubmitting}
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : imageDrafts.length > 1
                    ? `Adicionar ${imageDrafts.length} referências`
                    : 'Adicionar referência'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
