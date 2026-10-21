import React, { useState, useEffect, useRef } from 'react';
import { Reference, Project, Collection, CodeSnippet, ReferenceFile } from '../../types/reference';
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
  Briefcase,
  Code2,
  Edit3,
  Eye,
  Image as ImageIcon,
  Upload,
  Trash2,
  Paperclip,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';
import { CodeSnippetBlock } from './CodeSnippetBlock';
import { saveImageBlob } from '../../lib/imageStorage';
import { formatBytes, validateAndFormatUrl } from '../../lib/referenceLifecycle';

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
  availableProjects = [],
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

  const [isAddingSnippet, setIsAddingSnippet] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetLanguage, setSnippetLanguage] = useState<
    'css' | 'tailwind' | 'typescript' | 'javascript' | 'html' | 'json'
  >('tailwind');
  const [snippetCode, setSnippetCode] = useState('');

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileAttachmentInputRef = useRef<HTMLInputElement>(null);
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
      setIsAddingSnippet(false);
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
      const objectUrl = await saveImageBlob(storageId, file);

      onUpdateReference(reference.id, {
        screenshotUrl: objectUrl,
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

  const handleAddSnippet = () => {
    if (snippetTitle.trim() && snippetCode.trim()) {
      const newSnippet: CodeSnippet = {
        id: `code-${Date.now()}`,
        title: snippetTitle.trim(),
        language: snippetLanguage,
        code: snippetCode.trim(),
      };
      onUpdateReference(reference.id, {
        codeSnippets: [...reference.codeSnippets, newSnippet],
      });
      setSnippetTitle('');
      setSnippetCode('');
      setIsAddingSnippet(false);
    }
  };

  const handleRemoveSnippet = (snippetId: string) => {
    onUpdateReference(reference.id, {
      codeSnippets: reference.codeSnippets.filter((s) => s.id !== snippetId),
    });
  };

  const handleUpdateSnippet = (updatedSnippet: CodeSnippet) => {
    onUpdateReference(reference.id, {
      codeSnippets: reference.codeSnippets.map((s) =>
        s.id === updatedSnippet.id ? updatedSnippet : s
      ),
    });
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
    onUpdateReference(reference.id, {
      relatedFiles: (reference.relatedFiles || []).filter((f) => f.id !== fileId),
    });
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

      <input
        ref={fileAttachmentInputRef}
        type="file"
        onChange={handleAttachFile}
        className="hidden"
      />

      {/* Main Overlay Card */}
      <div className="relative w-full h-full max-w-[1600px] sm:max-h-[94vh] bg-white border-0 sm:border border-[#E7E7E5] rounded-none sm:rounded-sm shadow-2xl flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topbar of Expanded View */}
        <header className="h-14 px-5 sm:px-6 border-b border-[#E7E7E5] bg-white flex items-center justify-between gap-4 flex-shrink-0">
          {/* Left Title & Domain */}
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="font-mono text-xs font-bold text-[#4355DB] uppercase tracking-wider flex-shrink-0">
              {displaySubtitle}
            </span>
            <span className="text-[#E7E7E5] hidden sm:inline">|</span>
            <h2 className="font-sans font-bold text-sm text-[#171717] truncate">
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
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white hover:bg-[#F1F1EF] text-[#171717] text-xs font-medium border border-[#E7E7E5] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
                title="Abrir site original em nova aba"
              >
                <span className="hidden sm:inline">Visitar site</span>
                <ExternalLink size={13} strokeWidth={2} />
              </a>
            )}

            {hasUrl && (
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white hover:bg-[#F1F1EF] text-[#171717] text-xs font-medium border border-[#E7E7E5] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
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
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
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
          <div className="w-full lg:w-[62%] bg-[#F8F8F6] p-4 sm:p-6 md:p-8 lg:overflow-y-auto flex items-start justify-center border-b lg:border-b-0 lg:border-r border-[#E7E7E5] scrollbar-thin">
            <div className="w-full max-w-4xl bg-white rounded-sm border border-[#E7E7E5] shadow-xs overflow-hidden">
              {hasImage ? (
                <div className="relative group">
                  <img
                    src={reference.screenshotUrl}
                    alt={reference.title}
                    className="w-full h-auto object-cover object-top"
                  />
                  <div className="p-3 bg-white border-t border-[#E7E7E5] flex justify-end">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="text-xs font-mono text-[#737373] hover:text-[#171717] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={12} />
                      <span>{isUploadingImage ? 'Atualizando...' : 'Substituir imagem da referência'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[16/10] flex flex-col items-center justify-center gap-3 p-8 text-[#A8A8A6] bg-[#FAFAF8] text-center">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E7E7E5] flex items-center justify-center text-[#4355DB] shadow-2xs mb-1">
                    <Globe size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans font-bold text-sm text-[#171717]">
                    Referência sem captura de tela
                  </h3>
                  <p className="font-sans text-xs text-[#737373] max-w-sm">
                    Esta referência foi salva exclusivamente via URL. Você pode anexar uma captura ou imagem a qualquer momento.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="mt-2 px-3 py-1.5 rounded bg-white hover:bg-[#F1F1EF] border border-[#E7E7E5] font-sans text-xs font-semibold text-[#171717] inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Upload size={13} strokeWidth={2} />
                    <span>{isUploadingImage ? 'Salvando imagem...' : 'Anexar imagem agora'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Reference Inspector & Documentation (38% width) */}
          <div className="w-full lg:w-[38%] bg-white p-6 lg:overflow-y-auto flex flex-col gap-6 scrollbar-thin">
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
                    className="w-full text-lg font-bold text-[#171717] px-2 py-1 rounded bg-[#F8F8F6] border border-[#4355DB] outline-none"
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
                  <h1 className="font-sans font-bold text-xl text-[#171717] leading-snug">
                    {reference.title}
                  </h1>
                  <Edit3
                    size={14}
                    className="text-[#A8A8A6] opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0 mt-1"
                  />
                </div>
              )}
            </div>

            {/* Source URL Section (Editable) */}
            <div className="flex flex-col gap-2 pb-4 border-b border-[#E7E7E5]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={12} /> Endereço URL de Origem
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
                    {reference.url ? reference.url : 'Nenhuma URL vinculada'}
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

            {/* Tags Management */}
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
                    className="text-[11px] text-[#4355DB] hover:text-[#3646B8] font-medium flex items-center gap-1 cursor-pointer outline-none"
                  >
                    <Plus size={12} /> Adicionar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {reference.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1F1EF] border border-[#E7E7E5] text-xs font-mono text-[#737373]"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 rounded-full hover:bg-black/10 text-[#A8A8A6] hover:text-[#171717] cursor-pointer"
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
                      className="h-6 w-24 px-2 rounded-full text-xs font-mono bg-[#F8F8F6] border border-[#4355DB] outline-none text-[#171717]"
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

            {/* Projects & Collections Associations */}
            <div className="flex flex-col gap-3 pb-4 border-b border-[#E7E7E5]/70 text-xs">
              <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider">
                Associações
              </span>

              {/* Projects */}
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
                          onUpdateReference(reference.id, {
                            projectIds: [...(reference.projectIds || []), pId],
                          });
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
                              onUpdateReference(reference.id, {
                                projectIds: reference.projectIds.filter((id) => id !== pId),
                              });
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

              {/* Collections */}
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
                          onUpdateReference(reference.id, {
                            collectionIds: [...(reference.collectionIds || []), cId],
                          });
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
                              onUpdateReference(reference.id, {
                                collectionIds: reference.collectionIds.filter((id) => id !== cId),
                              });
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

            {/* Code Snippets Section */}
            <div className="flex flex-col gap-3 pb-5 border-b border-[#E7E7E5]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 size={13} /> Trechos de Código ({reference.codeSnippets.length})
                </span>
                {!isAddingSnippet && (
                  <button
                    onClick={() => setIsAddingSnippet(true)}
                    className="text-xs font-medium text-[#4355DB] hover:text-[#3646B8] flex items-center gap-1 cursor-pointer outline-none"
                  >
                    <Plus size={12} /> Adicionar snippet
                  </button>
                )}
              </div>

              {reference.codeSnippets.map((snippet) => (
                <CodeSnippetBlock
                  key={snippet.id}
                  snippet={snippet}
                  onDelete={() => handleRemoveSnippet(snippet.id)}
                  onUpdate={handleUpdateSnippet}
                />
              ))}

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
            <div className="flex flex-col gap-3 pb-5 border-b border-[#E7E7E5]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip size={12} /> Arquivos Anexados ({reference.relatedFiles?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={() => fileAttachmentInputRef.current?.click()}
                  className="text-xs font-medium text-[#4355DB] hover:text-[#3646B8] flex items-center gap-1 cursor-pointer outline-none"
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
