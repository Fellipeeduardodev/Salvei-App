import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Globe,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  ArrowUpRight,
  FileImage,
  Trash2,
  CheckCircle2,
  Briefcase,
  Layers,
  Code2,
  Paperclip,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Project, Collection, CodeSnippet, ReferenceFile } from '../../types/reference';
import { validateAndFormatUrl, checkDuplicateUrl, formatBytes } from '../../lib/referenceLifecycle';

export interface ImageFileDraft {
  file: File;
  previewUrl: string;
  name: string;
  title: string;
  sizeFormatted: string;
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
      projectIds?: string[];
      collectionIds?: string[];
    }[]
  ) => Promise<void> | void;
  existingUrls: string[];
  initialMode?: 'url' | 'image';
  onOpenExisting?: (url: string) => void;
  availableProjects?: Project[];
  availableCollections?: Collection[];
}

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
  initialMode = 'image',
  onOpenExisting,
  availableProjects = [],
  availableCollections = [],
}) => {
  const [mode, setMode] = useState<'image' | 'url'>(initialMode);

  // URL Mode state
  const [url, setUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlTags, setUrlTags] = useState('');
  const [urlNotes, setUrlNotes] = useState('');
  const [urlImageFile, setUrlImageFile] = useState<File | null>(null);
  const [urlImagePreview, setUrlImagePreview] = useState<string | null>(null);
  const [urlError, setUrlError] = useState('');
  const [urlSelectedProjectIds, setUrlSelectedProjectIds] = useState<string[]>([]);
  const [urlSelectedCollectionIds, setUrlSelectedCollectionIds] = useState<string[]>([]);
  const [allowDuplicateUrl, setAllowDuplicateUrl] = useState(false);

  // Supplementary Snippet state (optional)
  const [includeSnippet, setIncludeSnippet] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetLang, setSnippetLang] = useState<CodeSnippet['language']>('tailwind');
  const [snippetCode, setSnippetCode] = useState('');

  // Supplementary Files state (optional)
  const [includeFiles, setIncludeFiles] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<ReferenceFile[]>([]);

  // Image Mode state
  const [imageDrafts, setImageDrafts] = useState<ImageFileDraft[]>([]);
  const [imageSharedTags, setImageSharedTags] = useState('');
  const [imageSharedUrl, setImageSharedUrl] = useState('');
  const [imageSelectedProjectIds, setImageSelectedProjectIds] = useState<string[]>([]);
  const [imageSelectedCollectionIds, setImageSelectedCollectionIds] = useState<string[]>([]);
  const [imageErrorMessage, setImageErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlFileInputRef = useRef<HTMLInputElement>(null);
  const supplementaryFileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUrl('');
      setUrlTitle('');
      setUrlTags('');
      setUrlNotes('');
      setUrlImageFile(null);
      setUrlImagePreview(null);
      setUrlError('');
      setUrlSelectedProjectIds([]);
      setUrlSelectedCollectionIds([]);
      setAllowDuplicateUrl(false);

      setIncludeSnippet(false);
      setSnippetTitle('');
      setSnippetLang('tailwind');
      setSnippetCode('');

      setIncludeFiles(false);
      setAttachedFiles([]);

      setImageDrafts([]);
      setImageSharedTags('');
      setImageSharedUrl('');
      setImageSelectedProjectIds([]);
      setImageSelectedCollectionIds([]);
      setImageErrorMessage('');
      setIsSubmitting(false);

      if (initialMode === 'url') {
        setTimeout(() => urlInputRef.current?.focus(), 60);
      }
    } else {
      imageDrafts.forEach((d) => URL.revokeObjectURL(d.previewUrl));
      if (urlImagePreview) URL.revokeObjectURL(urlImagePreview);
    }
  }, [isOpen, initialMode]);

  // Duplicate URL check
  const isDuplicate = checkDuplicateUrl(url, existingUrls);

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

  // Process incoming image files
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
      });
    });

    if (newDrafts.length > 0) {
      setImageDrafts((prev) => [...prev, ...newDrafts]);
    }
  }, []);

  // Window-level Ctrl+V paste handling when modal is open
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

  // Submit Image references
  const handleSubmitImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (imageDrafts.length === 0) {
      setImageErrorMessage('Por favor, selecione ou cole pelo menos uma imagem.');
      return;
    }

    const tags = imageSharedTags
      .split(',')
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
        imageDrafts.map((draft) => ({
          file: draft.file,
          title: draft.title.trim() || cleanFileNameToTitle(draft.name),
          tags: tags.length > 0 ? tags : undefined,
          sourceUrl: cleanUrl || undefined,
          projectIds: imageSelectedProjectIds.length > 0 ? imageSelectedProjectIds : undefined,
          collectionIds:
            imageSelectedCollectionIds.length > 0 ? imageSelectedCollectionIds : undefined,
        }))
      );
      onClose();
    } catch {
      setImageErrorMessage('Ocorreu um erro ao salvar as imagens localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit URL reference
  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setUrlError('');

    const validation = validateAndFormatUrl(url);
    if (!validation.isValid || !validation.formattedUrl) {
      setUrlError(validation.error || 'Por favor, informe uma URL válida.');
      return;
    }

    // Duplicate check
    if (isDuplicate && !allowDuplicateUrl) {
      setUrlError('Esta URL já está salva. Você pode visualizar a existente ou marcar "Salvar como cópia independente".');
      return;
    }

    const tags = urlTags
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    // Initial snippet if filled
    let snippets: CodeSnippet[] = [];
    if (includeSnippet && snippetCode.trim()) {
      snippets.push({
        id: `snippet-${Date.now()}`,
        title: snippetTitle.trim() || 'Trecho de Código Inicial',
        language: snippetLang,
        code: snippetCode.trim(),
      });
    }

    setIsSubmitting(true);
    try {
      await onSaveUrl({
        url: validation.formattedUrl,
        title: urlTitle.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        notes: urlNotes.trim() || undefined,
        imageFile: urlImageFile || undefined,
        projectIds: urlSelectedProjectIds.length > 0 ? urlSelectedProjectIds : undefined,
        collectionIds:
          urlSelectedCollectionIds.length > 0 ? urlSelectedCollectionIds : undefined,
        codeSnippets: snippets.length > 0 ? snippets : undefined,
        relatedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
      });
      onClose();
    } catch {
      setUrlError('Erro ao salvar a referência.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle supplementary file additions
  const handleSupplementaryFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles: ReferenceFile[] = [];
    Array.from(files).forEach((file) => {
      newFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: formatBytes(file.size),
      });
    });
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F0F0F]/55 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-[620px] max-h-[92vh] bg-white border border-[#E7E7E5] rounded-sm shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E7E7E5]/70 flex-shrink-0">
          <div>
            <h2 id="modal-title" className="font-sans font-bold text-base text-[#171717]">
              Adicionar referência
            </h2>
            <p className="font-sans text-xs text-[#737373] mt-0.5">
              Importe capturas visuais locais ou cadastre referências a partir de URLs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer"
            aria-label="Fechar diálogo"
          >
            <X size={17} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#E7E7E5] px-6 bg-[#F8F8F6]/60 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMode('image')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'image'
                ? 'border-[#4355DB] text-[#4355DB]'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            <ImageIcon size={14} />
            <span>Adicionar por imagem</span>
            {imageDrafts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#4355DB] text-white font-mono text-[10px]">
                {imageDrafts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'url'
                ? 'border-[#4355DB] text-[#4355DB]'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            <Globe size={14} />
            <span>Adicionar por URL</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* TAB 1: IMPORT IMAGES */}
          {mode === 'image' && (
            <form onSubmit={handleSubmitImages} className="flex flex-col gap-5">
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-sm border-2 border-dashed transition-all cursor-pointer text-center select-none ${
                  isDragOver
                    ? 'border-[#4355DB] bg-[#4355DB]/5 scale-[0.995]'
                    : 'border-[#D4D4D0] hover:border-[#171717] bg-[#F8F8F6]'
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

                <div className="w-10 h-10 rounded-full bg-white border border-[#E7E7E5] flex items-center justify-center text-[#4355DB] shadow-2xs mb-3">
                  <Upload size={18} strokeWidth={2} />
                </div>

                <p className="font-sans font-semibold text-xs text-[#171717]">
                  Arraste suas imagens aqui ou clique para selecionar
                </p>
                <p className="font-sans text-[11px] text-[#737373] mt-1">
                  Ou apenas cole diretamente com <kbd className="px-1 py-0.5 font-mono text-[10px] bg-white border border-[#E7E7E5] rounded">Ctrl+V</kbd>
                </p>
                <span className="font-mono text-[10px] text-[#A8A8A6] mt-2 tracking-wide uppercase">
                  PNG, JPG, WebP, GIF até 15MB • Múltiplos arquivos suportados
                </span>
              </div>

              {/* Error Alert */}
              {imageErrorMessage && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-sm text-[#B91C1C] text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{imageErrorMessage}</span>
                </div>
              )}

              {/* Selected Images List */}
              {imageDrafts.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#171717] uppercase tracking-wider">
                      Imagens selecionadas ({imageDrafts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageDrafts([])}
                      className="text-[11px] text-[#737373] hover:text-[#EF4444] font-medium transition-colors cursor-pointer"
                    >
                      Remover todas
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {imageDrafts.map((draft, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 bg-[#F8F8F6] border border-[#E7E7E5] rounded-sm"
                      >
                        <div className="w-12 h-10 rounded bg-white border border-[#E7E7E5] overflow-hidden flex-shrink-0">
                          <img
                            src={draft.previewUrl}
                            alt={draft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) => handleUpdateDraftTitle(idx, e.target.value)}
                            placeholder="Título da referência..."
                            className="w-full text-xs font-semibold text-[#171717] bg-transparent border-b border-transparent hover:border-[#D4D4D0] focus:border-[#4355DB] outline-none px-0 py-0.5 truncate"
                          />
                          <div className="flex items-center gap-2 font-mono text-[10px] text-[#A8A8A6] truncate">
                            <span className="truncate">{draft.name}</span>
                            <span>•</span>
                            <span>{draft.sizeFormatted}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDraft(idx)}
                          className="p-1.5 text-[#A8A8A6] hover:text-[#EF4444] transition-colors rounded cursor-pointer"
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

              {/* Shared Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#E7E7E5]/70">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="shared-tags" className="text-xs font-semibold text-[#171717]">
                    Etiquetas <span className="text-[#737373] font-normal">(separadas por vírgula)</span>
                  </label>
                  <Input
                    id="shared-tags"
                    type="text"
                    value={imageSharedTags}
                    onChange={(e) => setImageSharedTags(e.target.value)}
                    placeholder="ex: layout, tipografia, moodboard"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="shared-url" className="text-xs font-semibold text-[#171717]">
                    URL de origem <span className="text-[#737373] font-normal">(opcional)</span>
                  </label>
                  <Input
                    id="shared-url"
                    type="text"
                    value={imageSharedUrl}
                    onChange={(e) => setImageSharedUrl(e.target.value)}
                    placeholder="https://..."
                    iconLeft={<Globe size={13} />}
                  />
                </div>
              </div>

              {/* Associations (Projects & Collections) */}
              {(availableProjects.length > 0 || availableCollections.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E7E7E5]/70">
                  {availableProjects.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Briefcase size={12} className="text-[#4355DB]" /> Vincular a Projeto
                      </label>
                      <select
                        value={imageSelectedProjectIds[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImageSelectedProjectIds(val ? [val] : []);
                        }}
                        className="w-full text-xs p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-[#171717] outline-none"
                      >
                        <option value="">Nenhum projeto vinculado</option>
                        {availableProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {availableCollections.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Layers size={12} className="text-[#4355DB]" /> Vincular a Coleção
                      </label>
                      <select
                        value={imageSelectedCollectionIds[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImageSelectedCollectionIds(val ? [val] : []);
                        }}
                        className="w-full text-xs p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-[#171717] outline-none"
                      >
                        <option value="">Nenhuma coleção vinculada</option>
                        {availableCollections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E7E5]/70">
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
                    ? 'Salvando no navegador...'
                    : imageDrafts.length > 1
                    ? `Adicionar ${imageDrafts.length} referências`
                    : 'Adicionar referência'}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: SAVE BY URL */}
          {mode === 'url' && (
            <form onSubmit={handleSubmitUrl} className="flex flex-col gap-4">
              {/* URL Input (Obrigatório) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ref-url" className="text-xs font-semibold text-[#171717]">
                  URL do website <span className="text-[#4355DB]">*</span>
                </label>
                <Input
                  ref={urlInputRef}
                  id="ref-url"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError('');
                    setAllowDuplicateUrl(false);
                  }}
                  placeholder="https://linear.app ou stripe.com"
                  iconLeft={<Globe size={14} />}
                  error={!!urlError}
                  required
                />

                {urlError && <span className="text-[11px] text-[#EF4444] font-medium">{urlError}</span>}

                {/* Duplicate URL Banner with Non-destructive Actions */}
                {isDuplicate && (
                  <div className="mt-1.5 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-sm flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={15} className="text-[#D97706] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-xs text-[#92400E]">
                        <p className="font-semibold">Esta URL já está salva em sua biblioteca.</p>
                        <p className="text-[11px] text-[#B45309] mt-0.5 leading-snug">
                          Você pode abrir o registro existente ou salvá-la como uma cópia independente sem perder seus dados.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#FDE68A]/60">
                      {onOpenExisting && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenExisting(url);
                          }}
                          className="text-[11px] font-semibold text-[#4355DB] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          Visualizar referência existente
                          <ArrowUpRight size={11} />
                        </button>
                      )}

                      <label className="text-[11px] font-medium text-[#78350F] flex items-center gap-1.5 cursor-pointer ml-auto">
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

              {/* Title Input (Opcional) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ref-title" className="text-xs font-semibold text-[#171717]">
                  Título da referência <span className="text-[#737373] font-normal">(opcional)</span>
                </label>
                <Input
                  id="ref-title"
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Deixe em branco para derivar automaticamente do domínio"
                />
              </div>

              {/* Optional Attached Screenshot / Image */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#171717]">
                    Imagem ou captura visual <span className="text-[#737373] font-normal">(opcional)</span>
                  </label>
                  <span className="text-[10px] text-[#A8A8A6] font-mono">CORS local / screenshot manual</span>
                </div>

                {urlImagePreview ? (
                  <div className="flex items-center gap-3 p-2.5 bg-[#F8F8F6] border border-[#E7E7E5] rounded-sm">
                    <div className="w-12 h-10 rounded bg-white border border-[#E7E7E5] overflow-hidden flex-shrink-0">
                      <img
                        src={urlImagePreview}
                        alt="Pré-visualização"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-[#171717] truncate block">
                        {urlImageFile?.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#22c55e] flex items-center gap-1">
                        <CheckCircle2 size={11} /> Imagem pronta para inclusão
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (urlImagePreview) URL.revokeObjectURL(urlImagePreview);
                        setUrlImageFile(null);
                        setUrlImagePreview(null);
                      }}
                      className="p-1.5 text-[#A8A8A6] hover:text-[#EF4444] transition-colors rounded cursor-pointer"
                      title="Remover imagem"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => urlFileInputRef.current?.click()}
                    className="flex items-center gap-2 p-3 rounded-sm border border-dashed border-[#D4D4D0] hover:border-[#171717] bg-[#F8F8F6] cursor-pointer transition-colors"
                  >
                    <input
                      ref={urlFileInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > MAX_IMAGE_SIZE_BYTES) {
                            setUrlError('A imagem excede o tamanho máximo de 15MB.');
                            return;
                          }
                          setUrlImageFile(file);
                          setUrlImagePreview(URL.createObjectURL(file));
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <FileImage size={16} className="text-[#737373]" />
                    <span className="text-xs text-[#737373]">
                      Clique para anexar captura manual ou imagem de capa
                    </span>
                  </div>
                )}
              </div>

              {/* Tags Input (Opcional) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ref-tags" className="text-xs font-semibold text-[#171717]">
                  Etiquetas <span className="text-[#737373] font-normal">(separadas por vírgula)</span>
                </label>
                <Input
                  id="ref-tags"
                  type="text"
                  value={urlTags}
                  onChange={(e) => setUrlTags(e.target.value)}
                  placeholder="saas, dark-mode, landing-page"
                />
              </div>

              {/* Associations (Projects & Collections) */}
              {(availableProjects.length > 0 || availableCollections.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {availableProjects.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Briefcase size={12} className="text-[#4355DB]" /> Vincular a Projeto
                      </label>
                      <select
                        value={urlSelectedProjectIds[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUrlSelectedProjectIds(val ? [val] : []);
                        }}
                        className="w-full text-xs p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-[#171717] outline-none"
                      >
                        <option value="">Nenhum projeto selecionado</option>
                        {availableProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {availableCollections.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Layers size={12} className="text-[#4355DB]" /> Vincular a Coleção
                      </label>
                      <select
                        value={urlSelectedCollectionIds[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUrlSelectedCollectionIds(val ? [val] : []);
                        }}
                        className="w-full text-xs p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-[#171717] outline-none"
                      >
                        <option value="">Nenhuma coleção selecionada</option>
                        {availableCollections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Input (Opcional) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ref-notes" className="text-xs font-semibold text-[#171717]">
                  Anotações iniciais <span className="text-[#737373] font-normal">(opcional)</span>
                </label>
                <textarea
                  id="ref-notes"
                  value={urlNotes}
                  onChange={(e) => setUrlNotes(e.target.value)}
                  placeholder="Por que você está salvando esta referência? O que chamou sua atenção?"
                  rows={2}
                  className="w-full text-xs font-sans text-[#171717] p-2.5 rounded-sm bg-[#F8F8F6] border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none transition-colors resize-none"
                />
              </div>

              {/* Collapsible: Optional Code Snippet */}
              <div className="border border-[#E7E7E5] rounded-sm bg-[#FAFAF8] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIncludeSnippet(!includeSnippet)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Code2 size={13} className="text-[#4355DB]" />
                    <span>Incluir trecho de código inicial (opcional)</span>
                  </span>
                  {includeSnippet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {includeSnippet && (
                  <div className="p-3 border-t border-[#E7E7E5] bg-white flex flex-col gap-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Título do trecho (ex: Header Grid)"
                        value={snippetTitle}
                        onChange={(e) => setSnippetTitle(e.target.value)}
                        className="text-xs p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-[#171717] outline-none"
                      />
                      <select
                        value={snippetLang}
                        onChange={(e) => setSnippetLang(e.target.value as CodeSnippet['language'])}
                        className="text-xs p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-[#171717] outline-none"
                      >
                        <option value="tailwind">Tailwind CSS</option>
                        <option value="css">CSS Padrão</option>
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="html">HTML</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Cole o código aqui..."
                      rows={3}
                      value={snippetCode}
                      onChange={(e) => setSnippetCode(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-[#F8F8F6] border border-[#E7E7E5] rounded outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Collapsible: Optional Supplementary Files */}
              <div className="border border-[#E7E7E5] rounded-sm bg-[#FAFAF8] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIncludeFiles(!includeFiles)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Paperclip size={13} className="text-[#4355DB]" />
                    <span>Anexar arquivos complementares (opcional)</span>
                    {attachedFiles.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#171717] text-white font-mono text-[10px]">
                        {attachedFiles.length}
                      </span>
                    )}
                  </span>
                  {includeFiles ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {includeFiles && (
                  <div className="p-3 border-t border-[#E7E7E5] bg-white flex flex-col gap-2.5">
                    <input
                      ref={supplementaryFileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => {
                        handleSupplementaryFiles(e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />

                    <div
                      onClick={() => supplementaryFileInputRef.current?.click()}
                      className="p-3 border border-dashed border-[#D4D4D0] hover:border-[#171717] rounded-sm text-center cursor-pointer bg-[#F8F8F6] transition-colors"
                    >
                      <span className="text-xs text-[#737373]">
                        Clique para anexar especificações, JSON, CSS ou outros arquivos
                      </span>
                    </div>

                    {attachedFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                        {attachedFiles.map((file, idx) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-xs font-mono"
                          >
                            <span className="truncate max-w-[280px] text-[#171717]">{file.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#A8A8A6] text-[10px]">{file.size}</span>
                              <button
                                type="button"
                                onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-[#A8A8A6] hover:text-[#EF4444] cursor-pointer"
                                title="Remover anexo"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E7E5]/70">
                <Button variant="secondary" size="md" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar referência'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
