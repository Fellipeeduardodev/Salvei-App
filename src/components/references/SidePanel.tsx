import React, { useState, useEffect, useRef } from 'react';
import { Reference, Project, Collection } from '../../types/reference';
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
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  FileText,
  Trash2,
  AlertCircle,
  Palette,
  Sparkles,
  Loader2,
  Download,
  Share2,
  ScanText,
  FileCode,
  FileJson,
} from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';
import { saveImageBlob, readFileAsOptimizedDataUrl } from '../../lib/imageStorage';
import { validateAndFormatUrl } from '../../lib/referenceLifecycle';
import {
  extractPaletteFromImage,
  generateStyleInsightsFromPalette,
  exportPaletteAsTailwind,
  exportPaletteAsCss,
  exportPaletteAsJson,
  exportPaletteAsFigmaTokens,
  downloadPaletteCardPng,
} from '../../lib/colorExtractor';
import { extractTextFromImage } from '../../lib/ocrExtractor';
import { analyzeDesignWithGemini, hasGeminiApiKey } from '../../services/geminiService';

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

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAnalyzingPalette, setIsAnalyzingPalette] = useState(false);
  const [copiedColorHex, setCopiedColorHex] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [ocrDraft, setOcrDraft] = useState('');
  const [isEditingOcr, setIsEditingOcr] = useState(false);
  const [hasCopiedOcr, setHasCopiedOcr] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
      setOcrDraft(reference.ocrText || '');
      setIsEditingTitle(false);
      setIsEditingUrl(false);
      setIsEditingNotes(false);
      setIsEditingOcr(false);
      setIsExportMenuOpen(false);
      setIsAddingTag(false);
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

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColorHex(hex);
    setTimeout(() => setCopiedColorHex(null), 1600);
  };

  const handleAnalyzePaletteWithAI = async () => {
    if (!reference || !reference.screenshotUrl) return;
    setIsAnalyzingPalette(true);
    try {
      const palette = await extractPaletteFromImage(reference.screenshotUrl, 5);
      const currentTags = new Set(reference.tags || []);
      let updatedNotes = reference.notesMarkdown || '';

      if (hasGeminiApiKey()) {
        try {
          const aiAnalysis = await analyzeDesignWithGemini(reference.screenshotUrl, reference.tags);
          aiAnalysis.suggestedTags.forEach((t) => currentTags.add(t));

          const aiSection = `\n\n### ✨ Análise de Design com IA (${aiAnalysis.styleTitle})\n- **Diagnóstico:** ${aiAnalysis.visualDiagnosis}\n- **Tipografia:** ${aiAnalysis.typographyNotes}\n- **Atmosfera:** ${aiAnalysis.moodDescription}`;
          if (!updatedNotes.includes('### ✨ Análise de Design com IA')) {
            updatedNotes = (updatedNotes.trim() + aiSection).trim();
            setNotesDraft(updatedNotes);
          }
        } catch (geminiErr) {
          console.warn('Gemini vision fallback para regras locais:', geminiErr);
          const insights = generateStyleInsightsFromPalette(palette);
          insights.suggestedTags.forEach((t) => currentTags.add(t));
        }
      } else {
        const insights = generateStyleInsightsFromPalette(palette);
        insights.suggestedTags.forEach((t) => currentTags.add(t));
      }

      onUpdateReference(reference.id, {
        palette,
        tags: Array.from(currentTags),
        notesMarkdown: updatedNotes,
      });
      setExportFeedback('Análise concluída!');
      setTimeout(() => setExportFeedback(null), 2500);
    } catch (e) {
      console.error('Erro na análise de paleta com IA:', e);
    } finally {
      setIsAnalyzingPalette(false);
    }
  };

  // Exportação de paleta em múltiplos formatos
  const handleExportPalette = (format: 'tailwind' | 'css' | 'json' | 'figma' | 'png') => {
    if (!reference || !reference.palette || reference.palette.length === 0) return;

    if (format === 'tailwind') {
      const code = exportPaletteAsTailwind(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setExportFeedback('Tailwind copiado!');
    } else if (format === 'css') {
      const code = exportPaletteAsCss(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setExportFeedback('CSS copiado!');
    } else if (format === 'json') {
      const code = exportPaletteAsJson(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setExportFeedback('Tokens JSON copiados!');
    } else if (format === 'figma') {
      const code = exportPaletteAsFigmaTokens(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setExportFeedback('Figma Tokens copiados!');
    } else if (format === 'png') {
      downloadPaletteCardPng(reference.title, reference.palette);
      setExportFeedback('Cartela PNG baixada!');
    }

    setTimeout(() => {
      setExportFeedback(null);
      setIsExportMenuOpen(false);
    }, 1800);
  };

  // Extração e OCR de texto em imagem
  const handleExtractOcr = async () => {
    if (!reference || !reference.screenshotUrl || isExtractingOcr) return;
    setIsExtractingOcr(true);
    try {
      const res = await extractTextFromImage(reference.screenshotUrl);
      if (res.text) {
        onUpdateReference(reference.id, { ocrText: res.text });
        setOcrDraft(res.text);
      }
    } catch (e) {
      console.error('Erro na extração de texto/OCR:', e);
    } finally {
      setIsExtractingOcr(false);
    }
  };

  const handleSaveOcr = () => {
    if (!reference) return;
    onUpdateReference(reference.id, { ocrText: ocrDraft.trim() });
    setIsEditingOcr(false);
  };

  const handleCopyOcr = () => {
    if (!ocrDraft) return;
    navigator.clipboard.writeText(ocrDraft);
    setHasCopiedOcr(true);
    setTimeout(() => setHasCopiedOcr(false), 1800);
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

  // Attach or Replace Image with persistent data URI
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

      {/* Side Panel Drawer */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes da referência: ${reference.title}`}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] md:w-[440px] lg:w-[460px] bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] border-l border-[#E7E7E5] dark:border-[#2D3139] shadow-[-10px_0_30px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-200 ease-out animate-in slide-in-from-right"
      >
        {/* Panel Header matching hero-03 */}
        <div className="h-14 px-4 sm:px-5 border-b border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#191B20] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-semibold text-[#4355DB] dark:text-[#6375F1] tracking-wider whitespace-nowrap truncate">
              <span className="sm:hidden">[ DETALHES ]</span>
              <span className="hidden sm:inline">[ DETALHES DA REFERÊNCIA ]</span>
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                if (notesDraftRef.current !== reference.notesMarkdown) {
                  onUpdateReference(reference.id, { notesMarkdown: notesDraftRef.current });
                }
                onClose();
              }}
              className="font-mono text-[10px] text-[#A8A8A6] dark:text-[#6B7280] hover:text-[#171717] dark:hover:text-[#F3F4F6] tracking-wider uppercase transition-colors cursor-pointer mr-1 hidden sm:inline"
            >
              ESC PARA FECHAR
            </button>

            {/* Expand View */}
            <button
              onClick={onExpand}
              className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              title="Expandir visualização"
              aria-label="Expandir visualização da referência"
            >
              <Maximize2 size={16} strokeWidth={1.8} />
            </button>

            {/* Open Original Link (se URL existir) */}
            {hasUrl && (
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
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
                className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
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
              className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              title="Fechar painel (Esc)"
              aria-label="Fechar painel de detalhes"
            >
              <X size={17} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Panel Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 scrollbar-thin"
          style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Visual Section: Image or URL-only Placeholder */}
          <div className="flex flex-col gap-2">
            {hasImage ? (
              <div className="flex flex-col gap-1.5">
                <div
                  onClick={onExpand}
                  className="group relative w-full aspect-[16/10] bg-[#F1F1EF] rounded-xl overflow-hidden border border-[#E7E7E5] dark:border-[#2D3139] shadow-sm cursor-pointer"
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
                  className="w-full text-base font-bold text-[#171717] dark:text-[#F3F4F6] px-2 py-1 rounded bg-[#F8F8F6] dark:bg-[#15171C] border border-[#4355DB] outline-none"
                />
                <span className="text-[10px] text-[#A8A8A6] font-mono">
                  Pressione Enter para salvar ou Esc para cancelar
                </span>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group/title flex items-start justify-between gap-2 cursor-pointer p-1.5 -m-1.5 rounded-md hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors"
                title="Clique para renomear"
              >
                <h2 className="font-sans font-bold text-lg text-[#171717] dark:text-[#F3F4F6] leading-snug">
                  {reference.title}
                </h2>
                <span className="flex items-center gap-1 text-[11px] text-[#737373] dark:text-[#9CA3AF] group-hover/title:text-[#4355DB] dark:group-hover/title:text-[#6375F1] transition-colors flex-shrink-0 mt-1">
                  <Edit3 size={13} />
                  <span className="text-[10px] font-mono hidden group-hover/title:inline">Renomear</span>
                </span>
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

          {/* Color Palette & AI Analysis Section */}
          {hasImage && (
            <div className="flex flex-col gap-2.5 pb-4 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] dark:text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={12} className="text-[#4355DB] dark:text-[#6375F1]" />
                  Paleta de Cores {reference.palette && reference.palette.length > 0 && `(${reference.palette.length})`}
                </span>

                <div className="flex items-center gap-2">
                  {/* Export Palette Button */}
                  {reference.palette && reference.palette.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsExportMenuOpen((prev) => !prev)}
                        className="text-[11px] font-medium text-[#737373] hover:text-[#171717] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] flex items-center gap-1 cursor-pointer"
                        title="Exportar paleta de cores para Tailwind, CSS, JSON ou Cartela PNG"
                      >
                        <Download size={11} />
                        <span>Exportar</span>
                      </button>

                      {isExportMenuOpen && (
                        <div className="absolute right-0 top-6 z-30 w-44 rounded-md bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] shadow-xl p-1 flex flex-col gap-0.5 animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => handleExportPalette('tailwind')}
                            className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                          >
                            <FileCode size={12} className="text-[#38BDF8]" />
                            <span>Copiar Tailwind</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportPalette('css')}
                            className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                          >
                            <FileCode size={12} className="text-[#818CF8]" />
                            <span>Copiar CSS (:root)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportPalette('json')}
                            className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                          >
                            <FileJson size={12} className="text-[#F59E0B]" />
                            <span>Copiar Tokens JSON</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportPalette('figma')}
                            className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                          >
                            <Sparkles size={12} className="text-[#A855F7]" />
                            <span>Copiar Figma Tokens</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportPalette('png')}
                            className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                          >
                            <Download size={12} className="text-[#10B981]" />
                            <span>Baixar Cartela PNG</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {exportFeedback && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                      {exportFeedback}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyzePaletteWithAI}
                    disabled={isAnalyzingPalette}
                    className="text-[11px] font-medium text-[#4355DB] dark:text-[#6375F1] hover:text-[#3646B8] dark:hover:text-[#8292FD] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Extrai ou refina cores com inteligência de design e sugere tags estéticas"
                  >
                    {isAnalyzingPalette ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-[#4355DB]" />
                        <span>Analisando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>Analisar com IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {reference.palette && reference.palette.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {/* Visual strip */}
                  <div className="w-full h-3 rounded-md overflow-hidden flex ring-1 ring-black/10 dark:ring-white/10 shadow-2xs">
                    {reference.palette.map((color, idx) => (
                      <div
                        key={`strip-${color.hex}-${idx}`}
                        className="flex-1 h-full cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => handleCopyHex(color.hex)}
                        title={`${color.name || color.hex} (${color.hex}) — Clique para copiar`}
                      />
                    ))}
                  </div>

                  {/* Color swatches list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {reference.palette.map((color, idx) => (
                      <div
                        key={`card-${color.hex}-${idx}`}
                        onClick={() => handleCopyHex(color.hex)}
                        className="flex items-center justify-between p-1.5 px-2 rounded-md bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] hover:border-[#4355DB] dark:hover:border-[#6375F1] transition-all cursor-pointer group shadow-2xs"
                        title="Clique para copiar o código HEX"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-4 h-4 rounded-full ring-1 ring-black/10 dark:ring-white/10 shrink-0 shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-[#171717] dark:text-[#F3F4F6] truncate">
                              {color.name || color.hex}
                            </span>
                            <span className="font-mono text-[9px] text-[#737373] dark:text-[#9CA3AF]">
                              {color.hex}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-[#737373] group-hover:text-[#4355DB] dark:group-hover:text-[#6375F1]">
                          {copiedColorHex === color.hex ? (
                            <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              Copiado!
                            </span>
                          ) : (
                            <Copy size={11} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#F8F8F6] dark:bg-[#20232A] rounded-md border border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-between text-xs">
                  <span className="text-[#737373] dark:text-[#9CA3AF] text-[11px]">
                    Nenhuma paleta extraída ainda.
                  </span>
                  <button
                    type="button"
                    onClick={handleAnalyzePaletteWithAI}
                    disabled={isAnalyzingPalette}
                    className="px-2.5 py-1 rounded bg-[#171717] dark:bg-[#4355DB] hover:bg-black dark:hover:bg-[#3646B8] text-white text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Extrair cores
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OCR / Texto em Imagem Section */}
          {hasImage && (
            <div className="flex flex-col gap-2.5 pb-4 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] dark:text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                  <ScanText size={12} className="text-[#4355DB] dark:text-[#6375F1]" />
                  Texto em Imagem (OCR & IA)
                </span>

                <button
                  type="button"
                  onClick={handleExtractOcr}
                  disabled={isExtractingOcr}
                  className="text-[11px] font-medium text-[#4355DB] dark:text-[#6375F1] hover:text-[#3646B8] dark:hover:text-[#8292FD] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Lê e transcreve todo texto contido nesta imagem, tornando-o pesquisável"
                >
                  {isExtractingOcr ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-[#4355DB]" />
                      <span>Lendo texto...</span>
                    </>
                  ) : (
                    <>
                      <ScanText size={12} />
                      <span>{reference.ocrText ? 'Re-escanear' : 'Extrair texto'}</span>
                    </>
                  )}
                </button>
              </div>

              {reference.ocrText || isEditingOcr ? (
                <div className="flex flex-col gap-2">
                  {isEditingOcr ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={ocrDraft}
                        onChange={(e) => setOcrDraft(e.target.value)}
                        className="w-full h-24 p-2 text-xs font-mono rounded bg-white dark:bg-[#121316] border border-[#4355DB] dark:border-[#6375F1] text-[#171717] dark:text-[#F3F4F6] resize-y outline-none"
                        placeholder="Texto detectado via OCR..."
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOcrDraft(reference.ocrText || '');
                            setIsEditingOcr(false);
                          }}
                          className="px-2 py-1 text-xs text-[#737373] hover:text-[#171717] dark:text-[#9CA3AF] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveOcr}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-[#4355DB] text-white hover:bg-[#3646B8] cursor-pointer"
                        >
                          Salvar Texto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-md bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex flex-col gap-1.5 group relative shadow-2xs">
                      <p className="font-mono text-xs text-[#171717] dark:text-[#F3F4F6] whitespace-pre-wrap line-clamp-4 leading-relaxed">
                        {reference.ocrText}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#E7E7E5]/60 dark:border-[#2D3139]/60 text-[10px] text-[#737373] dark:text-[#9CA3AF]">
                        <span className="font-mono text-[9px]">Indexado na busca global</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyOcr}
                            className="hover:text-[#4355DB] dark:hover:text-[#6375F1] cursor-pointer flex items-center gap-1"
                          >
                            {hasCopiedOcr ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            <span>{hasCopiedOcr ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingOcr(true)}
                            className="hover:text-[#4355DB] dark:hover:text-[#6375F1] cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 size={11} />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 bg-[#F8F8F6] dark:bg-[#20232A] rounded-md border border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-between text-xs">
                  <span className="text-[#737373] dark:text-[#9CA3AF] text-[11px]">
                    Nenhum texto extraído do print ainda.
                  </span>
                  <button
                    type="button"
                    onClick={handleExtractOcr}
                    disabled={isExtractingOcr}
                    className="px-2.5 py-1 rounded bg-[#171717] dark:bg-[#4355DB] hover:bg-black dark:hover:bg-[#3646B8] text-white text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Escanear
                  </button>
                </div>
              )}
            </div>
          )}

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

          {/* Associated Collections (Interactive & Multi-association) */}
          <div className="flex flex-col gap-2 pb-4 border-b border-[#E7E7E5]/70 text-xs">
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
                      const updated = [...(reference.collectionIds || []), cId];
                      onUpdateReference(reference.id, { collectionIds: updated });
                    }
                  }}
                  className="text-[11px] text-[#4355DB] dark:text-[#6375F1] bg-transparent outline-none cursor-pointer pr-1"
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
                          const updated = reference.collectionIds.filter((id) => id !== cId);
                          onUpdateReference(reference.id, { collectionIds: updated });
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
                className="p-4 rounded-xl bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] hover:border-[#D4D4D0] dark:hover:border-[#3E434D] transition-colors cursor-text min-h-[90px]"
                title="Clique para editar as notas do designer"
              >
                <div className="font-mono text-[10px] font-bold text-[#737373] dark:text-[#9CA3AF] tracking-wider uppercase mb-2">
                  NOTAS DO DESIGNER:
                </div>
                <MarkdownViewer
                  content={
                    reference.notesMarkdown ||
                    '*Nenhuma anotação registrada ainda. Clique aqui para registrar notas e análises sobre esta referência.*'
                  }
                />
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
