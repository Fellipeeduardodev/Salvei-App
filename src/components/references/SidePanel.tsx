import React, { useState, useEffect, useRef } from 'react';
import { Reference, CodeSnippet, ReferenceFile, Project, Collection } from '../../types/reference';
import {
  X,
  Maximize2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Tag,
  Plus,
  Edit3,
  Eye,
  Calendar,
  Layers,
  Briefcase,
  Code2,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  FileText,
  Trash2,
  Paperclip,
  AlertCircle,
} from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';
import { CodeSnippetBlock } from './CodeSnippetBlock';
import { saveImageBlob } from '../../lib/imageStorage';
import { formatBytes, validateAndFormatUrl } from '../../lib/referenceLifecycle';

interface SidePanelProps {
  reference: Reference | null;
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
  onUpdateReference: (id: string, updates: Partial<Reference>) => void;
  onDeleteReference: (id: string) => void;
  availableProjects?: Project[];
  availableCollections?: Collection[];
}

export const SidePanel: React.FC<SidePanelProps> = ({
  reference,
  isOpen,
  onClose,
  onExpand,
  onUpdateReference,
  onDeleteReference,
  availableProjects = [],
  availableCollections = [],
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  
  // URL editing state
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlEditError, setUrlEditError] = useState('');

  // Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  // Tags state
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // New Snippet form state
  const [isAddingSnippet, setIsAddingSnippet] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetLanguage, setSnippetLanguage] = useState<
    'css' | 'tailwind' | 'typescript' | 'javascript' | 'html' | 'json'
  >('tailwind');
  const [snippetCode, setSnippetCode] = useState('');

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileAttachmentInputRef = useRef<HTMLInputElement>(null);
  const currentRefId = useRef<string | null>(null);
  const notesDraftRef = useRef<string>('');

  // Keep notesDraftRef in sync with state for unmount/reference change flushing
  useEffect(() => {
    notesDraftRef.current = notesDraft;
  }, [notesDraft]);

  // Flush unsaved notes before switching reference
  useEffect(() => {
    if (reference) {
      if (
        currentRefId.current &&
        currentRefId.current !== reference.id &&
        notesDraftRef.current !== undefined
      ) {
        onUpdateReference(currentRefId.current, { notesMarkdown: notesDraftRef.current });
      }

      currentRefId.current = reference.id;
      setTitleDraft(reference.title);
      setUrlDraft(reference.url || '');
      setNotesDraft(reference.notesMarkdown || '');
      setIsEditingTitle(false);
      setIsEditingUrl(false);
      setIsEditingNotes(false);
      setIsAddingTag(false);
      setIsAddingSnippet(false);
      setIsConfirmingDelete(false);
    }
  }, [reference?.id]);

  // Sync notes if reference was updated externally
  useEffect(() => {
    if (reference && !isEditingNotes && reference.notesMarkdown !== notesDraft) {
      setNotesDraft(reference.notesMarkdown || '');
    }
  }, [reference?.notesMarkdown, isEditingNotes]);

  // Handle Escape key to close side panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (reference && notesDraftRef.current !== reference.notesMarkdown) {
          onUpdateReference(reference.id, { notesMarkdown: notesDraftRef.current });
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, reference, onUpdateReference]);

  if (!isOpen || !reference) {
    return null;
  }

  const hasImage = Boolean(reference.screenshotUrl && reference.screenshotStatus !== 'failed');
  const hasUrl = Boolean(reference.url);

  // Copy URL with clipboard fallback
  const handleCopyUrl = async () => {
    if (!reference.url) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reference.url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = reference.url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Save Title
  const handleSaveTitle = () => {
    if (titleDraft.trim() && titleDraft !== reference.title) {
      onUpdateReference(reference.id, { title: titleDraft.trim() });
    }
    setIsEditingTitle(false);
  };

  // Save URL
  const handleSaveUrl = () => {
    setUrlEditError('');
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      onUpdateReference(reference.id, {
        url: undefined,
        domain: undefined,
        sourceType: hasImage ? 'image' : 'url',
      });
      setIsEditingUrl(false);
      return;
    }

    const validated = validateAndFormatUrl(trimmed);
    if (!validated.isValid || !validated.formattedUrl) {
      setUrlEditError(validated.error || 'URL inválida.');
      return;
    }

    onUpdateReference(reference.id, {
      url: validated.formattedUrl,
      domain: validated.domain,
      sourceType: hasImage ? 'both' : 'url',
    });
    setIsEditingUrl(false);
  };

  // Save Notes (auto-save and toggle)
  const handleSaveNotes = () => {
    onUpdateReference(reference.id, { notesMarkdown: notesDraft });
    setIsEditingNotes(false);
  };

  // Tag Management
  const handleAddTag = () => {
    const cleanTag = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (cleanTag && !reference.tags.includes(cleanTag)) {
      const updatedTags = [...reference.tags, cleanTag];
      onUpdateReference(reference.id, { tags: updatedTags });
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = reference.tags.filter((t) => t !== tagToRemove);
    onUpdateReference(reference.id, { tags: updatedTags });
  };

  // Attach or Replace Image via IndexedDB
  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const storageId = `img-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const objectUrl = await saveImageBlob(storageId, file);

      onUpdateReference(reference.id, {
        screenshotUrl: objectUrl,
        imageStorageId: storageId,
        originalFileName: file.name,
        screenshotStatus: 'ready',
        sourceType: reference.url ? 'both' : 'image',
      });
    } catch (err) {
      console.error('Falha ao salvar imagem no IndexedDB:', err);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Add Code Snippet
  const handleAddSnippet = () => {
    if (snippetTitle.trim() && snippetCode.trim()) {
      const newSnippet: CodeSnippet = {
        id: `code-${Date.now()}`,
        title: snippetTitle.trim(),
        language: snippetLanguage,
        code: snippetCode.trim(),
      };
      const updatedSnippets = [...reference.codeSnippets, newSnippet];
      onUpdateReference(reference.id, { codeSnippets: updatedSnippets });
      setSnippetTitle('');
      setSnippetCode('');
      setIsAddingSnippet(false);
    }
  };

  const handleRemoveSnippet = (snippetId: string) => {
    const updated = reference.codeSnippets.filter((s) => s.id !== snippetId);
    onUpdateReference(reference.id, { codeSnippets: updated });
  };

  const handleUpdateSnippet = (updatedSnippet: CodeSnippet) => {
    const updated = reference.codeSnippets.map((s) =>
      s.id === updatedSnippet.id ? updatedSnippet : s
    );
    onUpdateReference(reference.id, { codeSnippets: updated });
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFile: ReferenceFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: formatBytes(file.size),
    };

    onUpdateReference(reference.id, {
      relatedFiles: [...(reference.relatedFiles || []), newFile],
    });
    e.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = (reference.relatedFiles || []).filter((f) => f.id !== fileId);
    onUpdateReference(reference.id, { relatedFiles: updated });
  };

  const formattedDate = new Date(reference.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={() => {
          if (notesDraftRef.current !== reference.notesMarkdown) {
            onUpdateReference(reference.id, { notesMarkdown: notesDraftRef.current });
          }
          onClose();
        }}
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        aria-hidden="true"
      />

      {/* Hidden image input for attaching/replacing image */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif"
        onChange={handleImageFileSelected}
        className="hidden"
      />

      {/* Hidden file attachment input */}
      <input
        ref={fileAttachmentInputRef}
        type="file"
        onChange={handleAttachFile}
        className="hidden"
      />

      {/* Side Panel Drawer */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes da referência: ${reference.title}`}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] md:w-[440px] lg:w-[460px] bg-white border-l border-[#E7E7E5] shadow-[-10px_0_30px_rgba(0,0,0,0.04)] flex flex-col transition-transform duration-200 ease-out animate-in slide-in-from-right"
      >
        {/* Panel Header */}
        <div className="h-14 px-5 border-b border-[#E7E7E5] flex items-center justify-between gap-3 bg-white flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExpand}
              className="p-1.5 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              title="Expandir visualização (quase tela cheia)"
              aria-label="Expandir visualização da referência"
            >
              <Maximize2 size={16} strokeWidth={1.8} />
            </button>
            <span className="font-mono text-[10px] text-[#A8A8A6] uppercase tracking-wider hidden sm:inline">
              [ DETALHES ]
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Open Original Link (se URL existir) */}
            {hasUrl && (
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
                title="Abrir site original (abre em nova aba)"
                aria-label={`Abrir ${reference.domain || reference.url} em nova aba`}
              >
                <ExternalLink size={16} strokeWidth={1.8} />
              </a>
            )}

            {/* Copy URL (se URL existir) */}
            {hasUrl && (
              <button
                onClick={handleCopyUrl}
                className="p-1.5 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
                title="Copiar link"
                aria-label="Copiar link da referência"
              >
                {copiedUrl ? (
                  <Check size={16} className="text-[#22c55e]" />
                ) : (
                  <Copy size={16} strokeWidth={1.8} />
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                if (notesDraftRef.current !== reference.notesMarkdown) {
                  onUpdateReference(reference.id, { notesMarkdown: notesDraftRef.current });
                }
                onClose();
              }}
              className="p-1.5 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              title="Fechar painel (Esc)"
              aria-label="Fechar painel de detalhes"
            >
              <X size={17} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Panel Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6 scrollbar-thin"
          style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Visual Section: Image or URL-only Placeholder */}
          <div className="flex flex-col gap-2">
            {hasImage ? (
              <div className="flex flex-col gap-1.5">
                <div
                  onClick={onExpand}
                  className="group relative w-full aspect-[16/10] bg-[#F1F1EF] rounded-sm overflow-hidden border border-[#E7E7E5] cursor-pointer"
                  title="Clique para expandir"
                >
                  <img
                    src={reference.screenshotUrl}
                    alt={reference.title}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.015]"
                  />

                  {/* Status Badge Over Image */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs border border-[#E7E7E5] text-[10px] font-mono font-semibold tracking-wider flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    <span className="text-[#171717] uppercase">PRONTO</span>
                  </div>

                  {/* Hover overlay hint */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/95 text-[#171717] font-mono text-[11px] font-bold shadow-md flex items-center gap-1.5">
                      <Maximize2 size={12} /> Expandir
                    </span>
                  </div>
                </div>

                {/* Replace image button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="text-[11px] font-mono text-[#737373] hover:text-[#171717] inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload size={11} />
                    <span>{isUploadingImage ? 'Atualizando...' : 'Substituir imagem'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* State for URL-only reference: Elegant prompt to attach image */
              <div className="w-full p-6 flex flex-col items-center justify-center text-center bg-[#FAFAF8] border border-dashed border-[#D4D4D0] rounded-sm">
                <div className="w-10 h-10 rounded-full bg-white border border-[#E7E7E5] flex items-center justify-center text-[#4355DB] shadow-2xs mb-2">
                  <ImageIcon size={18} strokeWidth={1.8} />
                </div>
                <h4 className="font-sans font-semibold text-xs text-[#171717]">
                  Nenhuma imagem anexada
                </h4>
                <p className="font-sans text-[11px] text-[#737373] max-w-xs mt-0.5 mb-3">
                  Esta referência foi salva apenas pelo endereço URL. Você pode anexar uma captura de tela manual agora.
                </p>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-3 py-1.5 rounded bg-white hover:bg-[#F1F1EF] border border-[#E7E7E5] font-sans text-xs font-semibold text-[#171717] inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload size={13} strokeWidth={2} />
                  <span>{isUploadingImage ? 'Salvando imagem...' : 'Anexar imagem agora'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Title & Core Metadata */}
          <div className="flex flex-col gap-2 pb-4 border-b border-[#E7E7E5]/70">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-[#4355DB] uppercase tracking-wider truncate">
                {reference.domain || reference.originalFileName || 'Referência Visual'}
              </span>
              <span className="font-mono text-[11px] text-[#A8A8A6] flex items-center gap-1 flex-shrink-0">
                <Calendar size={11} /> {formattedDate}
              </span>
            </div>

            {/* Editable Title */}
            {isEditingTitle ? (
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      handleSaveTitle();
                    }
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="w-full text-base font-bold text-[#171717] px-2 py-1 rounded bg-[#F8F8F6] border border-[#4355DB] outline-none"
                />
                <span className="text-[10px] text-[#A8A8A6] font-mono">
                  Pressione Enter para salvar ou Esc para cancelar
                </span>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group/title flex items-start justify-between gap-2 cursor-pointer"
                title="Clique para editar o título"
              >
                <h2 className="font-sans font-bold text-lg text-[#171717] leading-snug">
                  {reference.title}
                </h2>
                <Edit3
                  size={14}
                  className="text-[#A8A8A6] opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0 mt-1"
                />
              </div>
            )}

            {/* Original file name if available */}
            {reference.originalFileName && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#737373]">
                <FileText size={12} className="text-[#A8A8A6]" />
                <span>Arquivo: {reference.originalFileName}</span>
              </div>
            )}
          </div>

          {/* Source URL Section (Editable & Optional) */}
          <div className="flex flex-col gap-2 pb-4 border-b border-[#E7E7E5]/70">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon size={12} /> Endereço URL de Origem
              </span>
              {!isEditingUrl && (
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(true)}
                  className="text-[11px] font-medium text-[#4355DB] hover:text-[#3646B8] flex items-center gap-1 cursor-pointer outline-none"
                >
                  <Edit3 size={11} /> {hasUrl ? 'Editar URL' : 'Adicionar URL'}
                </button>
              )}
            </div>

            {isEditingUrl ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={urlDraft}
                  onChange={(e) => {
                    setUrlDraft(e.target.value);
                    setUrlEditError('');
                  }}
                  placeholder="https://exemplo.com"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveUrl();
                    if (e.key === 'Escape') {
                      setUrlEditError('');
                      setIsEditingUrl(false);
                    }
                  }}
                  className="w-full text-xs font-mono px-2.5 py-1.5 rounded bg-[#F8F8F6] border border-[#4355DB] text-[#171717] outline-none"
                />
                {urlEditError && (
                  <span className="text-[11px] text-[#EF4444] font-medium">{urlEditError}</span>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUrlEditError('');
                      setIsEditingUrl(false);
                    }}
                    className="px-2 py-1 text-xs text-[#737373] hover:text-[#171717] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUrl}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#171717] text-white rounded cursor-pointer"
                  >
                    Salvar URL
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 bg-[#F8F8F6] rounded border border-[#E7E7E5]">
                <span className="text-xs font-mono text-[#171717] truncate">
                  {reference.url ? reference.url : 'Nenhuma URL associada (somente imagem)'}
                </span>
                {hasUrl && (
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4355DB] hover:underline flex-shrink-0 p-1"
                    title="Visitar link"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Tags & Organization */}
          <div className="flex flex-col gap-2.5 pb-4 border-b border-[#E7E7E5]/70">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={12} /> Etiquetas
              </span>

              {!isAddingTag && (
                <button
                  onClick={() => {
                    setIsAddingTag(true);
                    setTimeout(() => tagInputRef.current?.focus(), 50);
                  }}
                  className="text-[11px] text-[#4355DB] hover:text-[#3646B8] font-medium flex items-center gap-1 cursor-pointer outline-none focus-visible:underline"
                >
                  <Plus size={12} /> Adicionar
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {reference.tags.map((tag) => (
                <span
                  key={tag}
                  className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F1EF] border border-[#E7E7E5] text-[11px] font-mono text-[#737373]"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 rounded-full hover:bg-black/10 text-[#A8A8A6] hover:text-[#171717] transition-colors cursor-pointer"
                    title={`Remover #${tag}`}
                    aria-label={`Remover etiqueta ${tag}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}

              {isAddingTag && (
                <div className="flex items-center gap-1">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        handleAddTag();
                      }
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setIsAddingTag(false);
                      }
                    }}
                    placeholder="nova-tag"
                    className="h-6 w-24 px-2 rounded-full text-[11px] font-mono bg-[#F8F8F6] border border-[#4355DB] outline-none text-[#171717]"
                  />
                  <button
                    onClick={handleAddTag}
                    className="h-6 px-2 rounded-full bg-[#171717] text-white text-[10px] font-mono cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Associated Projects & Collections (Interactive & Multi-association) */}
          <div className="flex flex-col gap-3 pb-4 border-b border-[#E7E7E5]/70 text-xs">
            <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider">
              Associações
            </span>

            {/* Projects Association */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#737373] flex items-center gap-1.5 font-medium">
                  <Briefcase size={12} className="text-[#4355DB]" />
                  <span>Projetos vinculados</span>
                </span>
                
                {availableProjects.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const pId = e.target.value;
                      if (pId && !reference.projectIds?.includes(pId)) {
                        const updated = [...(reference.projectIds || []), pId];
                        onUpdateReference(reference.id, { projectIds: updated });
                      }
                    }}
                    className="text-[11px] text-[#4355DB] bg-transparent outline-none cursor-pointer pr-1"
                  >
                    <option value="">+ Vincular projeto...</option>
                    {availableProjects
                      .filter((p) => !reference.projectIds?.includes(p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(!reference.projectIds || reference.projectIds.length === 0) ? (
                  <span className="text-xs text-[#A8A8A6] italic">Nenhum projeto vinculado</span>
                ) : (
                  reference.projectIds.map((pId) => {
                    const p = availableProjects.find((proj) => proj.id === pId);
                    return (
                      <span
                        key={pId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F1EF] border border-[#E7E7E5] text-[11px] text-[#171717]"
                      >
                        <span className="truncate max-w-[140px]">{p ? p.name : pId}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reference.projectIds.filter((id) => id !== pId);
                            onUpdateReference(reference.id, { projectIds: updated });
                          }}
                          className="p-0.5 rounded-full hover:bg-black/10 text-[#A8A8A6] hover:text-[#EF4444] cursor-pointer"
                          title="Desvincular projeto"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Collections Association */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[#737373] flex items-center gap-1.5 font-medium">
                  <Layers size={12} className="text-[#4355DB]" />
                  <span>Coleções vinculadas</span>
                </span>
                
                {availableCollections.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const cId = e.target.value;
                      if (cId && !reference.collectionIds?.includes(cId)) {
                        const updated = [...(reference.collectionIds || []), cId];
                        onUpdateReference(reference.id, { collectionIds: updated });
                      }
                    }}
                    className="text-[11px] text-[#4355DB] bg-transparent outline-none cursor-pointer pr-1"
                  >
                    <option value="">+ Vincular coleção...</option>
                    {availableCollections
                      .filter((c) => !reference.collectionIds?.includes(c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(!reference.collectionIds || reference.collectionIds.length === 0) ? (
                  <span className="text-xs text-[#A8A8A6] italic">Nenhuma coleção vinculada</span>
                ) : (
                  reference.collectionIds.map((cId) => {
                    const c = availableCollections.find((col) => col.id === cId);
                    return (
                      <span
                        key={cId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F1EF] border border-[#E7E7E5] text-[11px] text-[#171717]"
                      >
                        <span className="truncate max-w-[140px]">{c ? c.name : cId}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reference.collectionIds.filter((id) => id !== cId);
                            onUpdateReference(reference.id, { collectionIds: updated });
                          }}
                          className="p-0.5 rounded-full hover:bg-black/10 text-[#A8A8A6] hover:text-[#EF4444] cursor-pointer"
                          title="Desvincular coleção"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Notes (Anotações em Markdown) */}
          <div className="flex flex-col gap-2.5 pb-4 border-b border-[#E7E7E5]/70">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider">
                Anotações (Markdown)
              </span>

              <button
                onClick={() => {
                  if (isEditingNotes) {
                    handleSaveNotes();
                  } else {
                    setIsEditingNotes(true);
                  }
                }}
                className="text-[11px] font-medium text-[#4355DB] hover:text-[#3646B8] flex items-center gap-1 cursor-pointer outline-none focus-visible:underline"
              >
                {isEditingNotes ? (
                  <>
                    <Eye size={12} /> Salvar & Visualizar
                  </>
                ) : (
                  <>
                    <Edit3 size={12} /> Editar notas
                  </>
                )}
              </button>
            </div>

            {isEditingNotes ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Escreva anotações em Markdown: listas com - , títulos com ###, blocos de código com ```..."
                  rows={6}
                  className="w-full p-3 font-mono text-xs text-[#171717] bg-[#F8F8F6] border border-[#4355DB] rounded-sm outline-none resize-y transition-colors leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-[#A8A8A6] font-mono">
                  <span>Suporta Markdown GFM e formatação rica</span>
                  <button
                    onClick={handleSaveNotes}
                    className="px-2.5 py-1 rounded bg-[#171717] text-white font-sans font-semibold text-xs cursor-pointer hover:bg-black transition-colors"
                  >
                    Salvar anotação
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="p-3 rounded-sm bg-[#F8F8F6] border border-[#E7E7E5] hover:border-[#D4D4D0] transition-colors cursor-text min-h-[80px]"
                title="Clique para editar as anotações"
              >
                <MarkdownViewer
                  content={
                    reference.notesMarkdown ||
                    '*Nenhuma anotação registrada ainda. Clique aqui para escrever notas e observações sobre esta referência.*'
                  }
                />
              </div>
            )}
          </div>

          {/* Code Snippets Section */}
          <div className="flex flex-col gap-3 pb-4 border-b border-[#E7E7E5]/70">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider flex items-center gap-1.5">
                <Code2 size={12} /> Snippets de Código ({reference.codeSnippets.length})
              </span>

              {!isAddingSnippet && (
                <button
                  onClick={() => setIsAddingSnippet(true)}
                  className="text-[11px] text-[#4355DB] hover:text-[#3646B8] font-medium flex items-center gap-1 cursor-pointer outline-none"
                >
                  <Plus size={12} /> Adicionar snippet
                </button>
              )}
            </div>

            {/* List existing snippets */}
            {reference.codeSnippets.map((snippet) => (
              <CodeSnippetBlock
                key={snippet.id}
                snippet={snippet}
                onDelete={() => handleRemoveSnippet(snippet.id)}
                onUpdate={handleUpdateSnippet}
              />
            ))}

            {/* Form to add new snippet */}
            {isAddingSnippet && (
              <div className="flex flex-col gap-2.5 p-3 rounded-sm bg-[#F8F8F6] border border-[#4355DB]">
                <span className="text-xs font-bold text-[#171717]">Novo Trecho de Código</span>
                <input
                  type="text"
                  placeholder="Título (ex: Tailwind Grid, Efeito CSS)"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded bg-white border border-[#E7E7E5] text-[#171717] outline-none"
                />

                <select
                  value={snippetLanguage}
                  onChange={(e) =>
                    setSnippetLanguage(
                      e.target.value as 'css' | 'tailwind' | 'typescript' | 'javascript' | 'html' | 'json'
                    )
                  }
                  className="text-xs px-2 py-1.5 rounded bg-white border border-[#E7E7E5] text-[#171717] outline-none"
                >
                  <option value="tailwind">Tailwind CSS</option>
                  <option value="css">CSS Padrão</option>
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                </select>

                <textarea
                  placeholder="Cole o código aqui..."
                  rows={4}
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  className="w-full p-2.5 font-mono text-xs bg-white border border-[#E7E7E5] rounded outline-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsAddingSnippet(false)}
                    className="px-2.5 py-1 text-xs text-[#737373] hover:text-[#171717] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddSnippet}
                    disabled={!snippetTitle.trim() || !snippetCode.trim()}
                    className="px-3 py-1 text-xs font-semibold bg-[#171717] text-white rounded cursor-pointer disabled:opacity-50"
                  >
                    Salvar snippet
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Related Files Section */}
          <div className="flex flex-col gap-3 pb-4 border-b border-[#E7E7E5]/70">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={12} /> Arquivos Anexados ({reference.relatedFiles?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => fileAttachmentInputRef.current?.click()}
                className="text-[11px] text-[#4355DB] hover:text-[#3646B8] font-medium flex items-center gap-1 cursor-pointer outline-none"
              >
                <Plus size={12} /> Anexar arquivo
              </button>
            </div>

            {(!reference.relatedFiles || reference.relatedFiles.length === 0) ? (
              <span className="text-xs text-[#A8A8A6] italic">Nenhum arquivo complementar anexado</span>
            ) : (
              <div className="flex flex-col gap-1.5">
                {reference.relatedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[280px]">
                      <FileText size={13} className="text-[#737373] flex-shrink-0" />
                      <span className="truncate text-[#171717]">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {file.size && <span className="text-[10px] text-[#A8A8A6]">{file.size}</span>}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 text-[#A8A8A6] hover:text-[#EF4444] transition-colors rounded cursor-pointer"
                        title="Remover anexo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Area: Excluir Referência */}
          <div className="pt-2 pb-6 flex flex-col gap-3">
            {isConfirmingDelete ? (
              <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-sm flex flex-col gap-3 animate-in fade-in duration-100">
                <div className="flex items-start gap-2 text-xs text-[#B91C1C]">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">Excluir esta referência da biblioteca?</span>
                    <span className="text-[11px] text-[#991B1B] leading-relaxed">
                      Esta ação removerá a referência e sua imagem local permanentemente. Projetos e coleções vinculados serão preservados.
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#FCA5A5]/60">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 text-xs text-[#737373] hover:text-[#171717] rounded cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      onDeleteReference(reference.id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded cursor-pointer transition-colors shadow-2xs"
                  >
                    Sim, excluir referência
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#A8A8A6] font-mono">Ação irreversível</span>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FCA5A5] rounded transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Excluir referência</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
