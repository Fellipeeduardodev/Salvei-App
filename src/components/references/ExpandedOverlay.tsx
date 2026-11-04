import React, { useState, useEffect, useRef } from 'react';
import { Reference, Project, Collection } from '../../types/reference';
import {
  ExternalLink,
  Copy,
  Check,
  Minimize2,
  Globe,
  Tag,
  Plus,
  Calendar,
  Layers,
  Edit3,
  Eye,
  Image as ImageIcon,
  Upload,
  Trash2,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';
import { saveImageBlob, readFileAsOptimizedDataUrl } from '../../lib/imageStorage';
import { validateAndFormatUrl } from '../../lib/referenceLifecycle';

interface ExpandedOverlayProps {
  reference: Reference | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReference: (id: string, updates: Partial<Reference>) => void;
  onDeleteReference: (id: string) => void;
  availableProjects?: Project[];
  availableCollections?: Collection[];
}

export const ExpandedOverlay: React.FC<ExpandedOverlayProps> = ({
  reference,
  isOpen,
  onClose,
  onUpdateReference,
  onDeleteReference,
  availableProjects: _availableProjects = [],
  availableCollections = [],
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlEditError, setUrlEditError] = useState('');

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Sync drafts whenever reference changes
  useEffect(() => {
    if (reference) {
      setTitleDraft(reference.title);
      setUrlDraft(reference.url || '');
      setNotesDraft(reference.notesMarkdown || '');
      setIsEditingTitle(false);
      setIsEditingUrl(false);
      setIsEditingNotes(false);
      setIsAddingTag(false);
      setIsConfirmingDelete(false);
    }
  }, [reference?.id]);

  // Handle Escape key to close expanded overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !reference) {
    return null;
  }

  const hasImage = Boolean(reference.screenshotUrl && reference.screenshotStatus !== 'failed');
  const hasUrl = Boolean(reference.url);

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

  const handleSaveTitle = () => {
    if (titleDraft.trim() && titleDraft !== reference.title) {
      onUpdateReference(reference.id, { title: titleDraft.trim() });
    }
    setIsEditingTitle(false);
  };

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

  const handleSaveNotes = () => {
    onUpdateReference(reference.id, { notesMarkdown: notesDraft });
    setIsEditingNotes(false);
  };

  const handleAddTag = () => {
    const cleanTag = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (cleanTag && !reference.tags.includes(cleanTag)) {
      onUpdateReference(reference.id, { tags: [...reference.tags, cleanTag] });
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateReference(reference.id, {
      tags: reference.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const storageId = `img-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      await saveImageBlob(storageId, file);
      const permanentUrl = await readFileAsOptimizedDataUrl(file);

      onUpdateReference(reference.id, {
        screenshotUrl: permanentUrl,
        imageStorageId: storageId,
        originalFileName: file.name,
        screenshotStatus: 'ready',
        sourceType: reference.url ? 'both' : 'image',
      });
    } catch (err) {
      console.error('Falha ao salvar imagem:', err);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const formattedDate = new Date(reference.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const displaySubtitle = reference.domain || reference.originalFileName || 'Referência visual';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização expandida: ${reference.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6"
    >
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F0F0F]/65 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif"
        onChange={handleImageFileSelected}
        className="hidden"
      />

      {/* Main Overlay Card */}
      <div className="relative w-full h-full max-w-[1600px] sm:max-h-[94vh] bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] border-0 sm:border border-[#E7E7E5] dark:border-[#2D3139] rounded-none sm:rounded-sm shadow-2xl flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topbar of Expanded View */}
        <header className="h-14 px-5 sm:px-6 border-b border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#191B20] flex items-center justify-between gap-4 flex-shrink-0">
          {/* Left Title & Domain */}
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="font-mono text-xs font-bold text-[#4355DB] dark:text-[#6375F1] uppercase tracking-wider flex-shrink-0">
              {displaySubtitle}
            </span>
            <span className="text-[#E7E7E5] dark:text-[#2D3139] hidden sm:inline">|</span>
            <h2 className="font-sans font-bold text-sm text-[#171717] dark:text-[#F3F4F6] truncate">
              {reference.title}
            </h2>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasUrl && (
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white dark:bg-[#20232A] hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] text-[#171717] dark:text-[#F3F4F6] text-xs font-medium border border-[#E7E7E5] dark:border-[#2D3139] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
                title="Abrir site original em nova aba"
              >
                <span className="hidden sm:inline">Visitar site</span>
                <ExternalLink size={13} strokeWidth={2} />
              </a>
            )}

            {hasUrl && (
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white dark:bg-[#20232A] hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] text-[#171717] dark:text-[#F3F4F6] text-xs font-medium border border-[#E7E7E5] dark:border-[#2D3139] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
                title="Copiar URL"
              >
                {copiedUrl ? (
                  <>
                    <Check size={13} className="text-[#22c55e]" />
                    <span className="text-[#22c55e] font-semibold text-xs">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="hidden sm:inline">Copiar URL</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              title="Voltar ao painel lateral (Esc)"
              aria-label="Fechar visualização expandida e voltar ao painel"
            >
              <Minimize2 size={16} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Content Body: Two Columns */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* LEFT: Massive Screenshot / Image Viewer (65% width) */}
          <div className="w-full lg:w-[62%] bg-[#F8F8F6] dark:bg-[#121417] p-4 sm:p-6 md:p-8 lg:overflow-y-auto flex items-start justify-center border-b lg:border-b-0 lg:border-r border-[#E7E7E5] dark:border-[#2D3139] scrollbar-thin">
            <div className="w-full max-w-4xl bg-white dark:bg-[#191B20] rounded-sm border border-[#E7E7E5] dark:border-[#2D3139] shadow-xs overflow-hidden">
              {hasImage ? (
                <div className="relative group">
                  <img
                    src={reference.screenshotUrl}
                    alt={reference.title}
                    className="w-full h-auto object-cover object-top"
                  />
                  <div className="p-3 bg-white dark:bg-[#191B20] border-t border-[#E7E7E5] dark:border-[#2D3139] flex justify-end">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="text-xs font-mono text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={12} />
                      <span>{isUploadingImage ? 'Atualizando...' : 'Substituir imagem da referência'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[16/10] flex flex-col items-center justify-center gap-3 p-8 text-[#A8A8A6] dark:text-[#9CA3AF] bg-[#FAFAF8] dark:bg-[#15171C] text-center">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-center text-[#4355DB] dark:text-[#6375F1] shadow-2xs mb-1">
                    <Globe size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans font-bold text-sm text-[#171717] dark:text-[#F3F4F6]">
                    Referência sem captura de tela
                  </h3>
                  <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] max-w-sm">
                    Esta referência foi salva exclusivamente via URL. Você pode anexar uma captura ou imagem a qualquer momento.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="mt-2 px-3 py-1.5 rounded bg-white dark:bg-[#20232A] hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] border border-[#E7E7E5] dark:border-[#2D3139] font-sans text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Upload size={13} strokeWidth={2} />
                    <span>{isUploadingImage ? 'Salvando imagem...' : 'Anexar imagem agora'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Reference Inspector & Documentation (38% width) */}
          <div className="w-full lg:w-[38%] bg-white dark:bg-[#191B20] p-4 sm:p-6 lg:overflow-y-auto flex flex-col gap-6 scrollbar-thin pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
            {/* Title & Domain (Editable) */}
            <div className="flex flex-col gap-2 pb-4 border-b border-[#E7E7E5]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#4355DB] uppercase tracking-wider truncate">
                  {displaySubtitle}
                </span>
                <span className="font-mono text-[11px] text-[#A8A8A6] flex items-center gap-1 flex-shrink-0">
                  <Calendar size={11} /> {formattedDate}
                </span>
              </div>

              {isEditingTitle ? (
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="w-full text-lg font-bold text-[#171717] dark:text-[#F3F4F6] px-2 py-1 rounded bg-[#F8F8F6] dark:bg-[#20232A] border border-[#4355DB] dark:border-[#6375F1] outline-none"
                  />
                  <span className="text-[10px] text-[#A8A8A6] dark:text-[#6B7280] font-mono">
                    Pressione Enter para salvar ou Esc para cancelar
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  className="group/title flex items-start justify-between gap-2 cursor-pointer p-1.5 -m-1.5 rounded-md hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors"
                  title="Clique para renomear"
                >
                  <h1 className="font-sans font-bold text-xl text-[#171717] dark:text-[#F3F4F6] leading-snug">
                    {reference.title}
                  </h1>
                  <span className="flex items-center gap-1 text-[11px] text-[#737373] dark:text-[#9CA3AF] group-hover/title:text-[#4355DB] dark:group-hover/title:text-[#6375F1] transition-colors flex-shrink-0 mt-1">
                    <Edit3 size={13} />
                    <span className="text-[10px] font-mono hidden group-hover/title:inline">Renomear</span>
                  </span>
                </div>
              )}
            </div>

            {/* Source URL Section (Editable) */}
            <div className="flex flex-col gap-2 pb-4 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={12} /> Endereço URL de Origem
                </span>
                {!isEditingUrl && (
                  <button
                    type="button"
                    onClick={() => setIsEditingUrl(true)}
                    className="text-[11px] font-medium text-[#4355DB] dark:text-[#6375F1] hover:text-[#3646B8] dark:hover:text-[#8292FD] flex items-center gap-1 cursor-pointer outline-none"
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
                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded bg-[#F8F8F6] dark:bg-[#20232A] border border-[#4355DB] dark:border-[#6375F1] text-[#171717] dark:text-[#F3F4F6] outline-none"
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
                      className="px-2 py-1 text-xs text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveUrl}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#171717] dark:bg-[#323742] text-white rounded cursor-pointer"
                    >
                      Salvar URL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 p-2 bg-[#F8F8F6] dark:bg-[#20232A] rounded border border-[#E7E7E5] dark:border-[#2D3139]">
                  <span className="text-xs font-mono text-[#171717] dark:text-[#F3F4F6] truncate">
                    {reference.url ? reference.url : 'Nenhuma URL vinculada'}
                  </span>
                  {hasUrl && (
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4355DB] dark:text-[#6375F1] hover:underline flex-shrink-0 p-1"
                      title="Visitar link"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Tags Management */}
            <div className="flex flex-col gap-2.5 pb-4 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={12} /> Etiquetas
                </span>
                {!isAddingTag && (
                  <button
                    onClick={() => {
                      setIsAddingTag(true);
                      setTimeout(() => tagInputRef.current?.focus(), 50);
                    }}
                    className="text-[11px] text-[#4355DB] dark:text-[#6375F1] hover:text-[#3646B8] dark:hover:text-[#8292FD] font-medium flex items-center gap-1 cursor-pointer outline-none"
                  >
                    <Plus size={12} /> Adicionar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {reference.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1F1EF] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-xs font-mono text-[#737373] dark:text-[#9CA3AF]"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#A8A8A6] hover:text-[#171717] dark:hover:text-[#F3F4F6] cursor-pointer"
                      title={`Remover #${tag}`}
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
                      className="h-6 w-24 px-2 rounded-full text-xs font-mono bg-[#F8F8F6] dark:bg-[#20232A] border border-[#4355DB] dark:border-[#6375F1] outline-none text-[#171717] dark:text-[#F3F4F6]"
                    />
                    <button
                      onClick={handleAddTag}
                      className="h-6 px-2 rounded-full bg-[#171717] dark:bg-[#323742] text-white text-[10px] font-mono cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Collections Associations */}
            <div className="flex flex-col gap-2 pb-4 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#737373] dark:text-[#9CA3AF] flex items-center gap-1.5 font-medium">
                  <Layers size={12} className="text-[#4355DB] dark:text-[#6375F1]" />
                  <span>Coleções vinculadas</span>
                </span>
                {availableCollections.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const cId = e.target.value;
                      if (cId && !reference.collectionIds?.includes(cId)) {
                        onUpdateReference(reference.id, {
                          collectionIds: [...(reference.collectionIds || []), cId],
                        });
                      }
                    }}
                    className="text-[11px] text-[#4355DB] dark:text-[#6375F1] bg-transparent outline-none cursor-pointer pr-1"
                  >
                    <option value="" className="dark:bg-[#191B20] dark:text-[#F3F4F6]">+ Vincular coleção...</option>
                    {availableCollections
                      .filter((c) => !reference.collectionIds?.includes(c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id} className="dark:bg-[#191B20] dark:text-[#F3F4F6]">
                          {c.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(!reference.collectionIds || reference.collectionIds.length === 0) ? (
                  <span className="text-xs text-[#A8A8A6] dark:text-[#6B7280] italic">Nenhuma coleção vinculada</span>
                ) : (
                  reference.collectionIds.map((cId) => {
                    const c = availableCollections.find((col) => col.id === cId);
                    return (
                      <span
                        key={cId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F1EF] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-[11px] text-[#171717] dark:text-[#F3F4F6]"
                      >
                        <span className="truncate max-w-[140px]">{c ? c.name : cId}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateReference(reference.id, {
                              collectionIds: reference.collectionIds.filter((id) => id !== cId),
                            });
                          }}
                          className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#A8A8A6] hover:text-[#EF4444] cursor-pointer"
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

            {/* Notes Section */}
            <div className="flex flex-col gap-2 pb-5 border-b border-[#E7E7E5]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider">
                  Anotações de Design
                </span>

                <button
                  onClick={() => {
                    if (isEditingNotes) {
                      handleSaveNotes();
                    } else {
                      setIsEditingNotes(true);
                    }
                  }}
                  className="text-xs font-medium text-[#4355DB] hover:text-[#3646B8] flex items-center gap-1 cursor-pointer outline-none focus-visible:underline"
                >
                  {isEditingNotes ? (
                    <>
                      <Eye size={12} /> Concluir edição
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
                    rows={7}
                    className="w-full p-3 rounded-md bg-[#F8F8F6] text-xs font-mono text-[#171717] border border-[#4355DB] outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A8A8A6] font-mono">Salvamento manual ou blur</span>
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 rounded-md bg-[#171717] text-white text-xs font-medium cursor-pointer"
                    >
                      Salvar anotação
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingNotes(true)}
                  className="p-4 bg-[#F8F8F6] hover:bg-[#F1F1EF] rounded-md border border-[#E7E7E5]/60 transition-colors cursor-pointer"
                  title="Clique para editar as notas"
                >
                  <MarkdownViewer content={reference.notesMarkdown} />
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
                        onClose();
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
        </div>
      </div>
    </div>
  );
};
