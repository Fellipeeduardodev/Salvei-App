import React, { useState } from 'react';
import { CodeSnippet } from '../../types/reference';
import { Copy, Check, Code2, Trash2, Edit3, X } from 'lucide-react';

interface CodeSnippetBlockProps {
  snippet: CodeSnippet;
  onDelete?: () => void;
  onUpdate?: (updated: CodeSnippet) => void;
}

export const CodeSnippetBlock: React.FC<CodeSnippetBlockProps> = ({
  snippet,
  onDelete,
  onUpdate,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(snippet.title);
  const [editLanguage, setEditLanguage] = useState(snippet.language);
  const [editCode, setEditCode] = useState(snippet.code);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet.code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = snippet.code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silent handling
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editCode.trim() && onUpdate) {
      onUpdate({
        ...snippet,
        title: editTitle.trim(),
        language: editLanguage,
        code: editCode.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(snippet.title);
    setEditLanguage(snippet.language);
    setEditCode(snippet.code);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col bg-[#171717] text-[#FAFAFA] rounded-md overflow-hidden border border-[#262626] shadow-2xs">
      {/* Snippet Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#1C1C1E] border-b border-[#2B2B2D] text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 size={13} className="text-[#A8A8A6] flex-shrink-0" />
          <span className="font-sans font-medium text-xs text-[#E5E5E5] truncate max-w-[200px]">
            {snippet.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#A8A8A6] px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
            {snippet.language}
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans font-medium text-[#A8A8A6] hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#4355DB]"
            title="Copiar código"
            aria-label={`Copiar código de ${snippet.title}`}
          >
            {copied ? (
              <>
                <Check size={12} className="text-[#22c55e]" />
                <span className="text-[#22c55e] font-semibold text-[10px]">Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[10px]">Copiar</span>
              </>
            )}
          </button>

          {onUpdate && (
            <button
              onClick={() => {
                if (isEditing) handleCancelEdit();
                else setIsEditing(true);
              }}
              className="p-1 rounded text-[#A8A8A6] hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none"
              title={isEditing ? 'Cancelar edição' : 'Editar trecho de código'}
              aria-label={isEditing ? 'Cancelar edição' : `Editar trecho de código ${snippet.title}`}
            >
              {isEditing ? <X size={12} /> : <Edit3 size={12} />}
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded text-[#A8A8A6] hover:text-[#EF4444] hover:bg-white/10 transition-colors cursor-pointer outline-none"
              title="Excluir trecho de código"
              aria-label={`Excluir trecho de código ${snippet.title}`}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Snippet Code Area or Edit Form */}
      {isEditing ? (
        <div className="p-3 bg-[#1C1C1E] flex flex-col gap-2.5 border-t border-[#2B2B2D]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título do trecho"
              className="text-xs px-2.5 py-1.5 rounded bg-[#121212] border border-[#333333] text-white outline-none focus:border-[#4355DB]"
            />
            <select
              value={editLanguage}
              onChange={(e) =>
                setEditLanguage(
                  e.target.value as 'css' | 'tailwind' | 'typescript' | 'javascript' | 'html' | 'json'
                )
              }
              className="text-xs px-2 py-1.5 rounded bg-[#121212] border border-[#333333] text-white outline-none focus:border-[#4355DB]"
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
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
            rows={4}
            className="w-full p-2.5 font-mono text-xs bg-[#121212] border border-[#333333] rounded text-white outline-none focus:border-[#4355DB]"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-2.5 py-1 text-xs text-[#A8A8A6] hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || !editCode.trim()}
              className="px-3 py-1 text-xs font-semibold bg-[#4355DB] hover:bg-[#3646B8] text-white rounded cursor-pointer disabled:opacity-50"
            >
              Salvar alterações
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 overflow-x-auto">
          <pre className="font-mono text-xs text-[#E5E5E5] leading-relaxed whitespace-pre font-normal select-text">
            <code>{snippet.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
