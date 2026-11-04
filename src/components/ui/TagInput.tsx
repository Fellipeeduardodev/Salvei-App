import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Tag as TagIcon, Sparkles } from 'lucide-react';

export interface TagInputProps {
  id?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-');
}

export const TagInput: React.FC<TagInputProps> = ({
  id,
  tags,
  onChange,
  placeholder = 'Digite e aperte Enter ou vírgula...',
  suggestions = [],
  maxTags = 20,
  disabled = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (rawTag: string) => {
    if (disabled) return;
    const clean = normalizeTag(rawTag);
    if (!clean) return;
    if (tags.length >= maxTags) return;

    if (!tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const toggleSuggestion = (sug: string) => {
    if (disabled) return;
    const clean = normalizeTag(sug);
    if (!clean) return;

    if (tags.includes(clean)) {
      removeTag(clean);
    } else {
      addTag(clean);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault();
      // Remove last tag when backspacing on empty input
      const lastTag = tags[tags.length - 1];
      removeTag(lastTag);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  // Filter unique suggestions
  const uniqueSuggestions = Array.from(
    new Set(suggestions.map((s) => normalizeTag(s)).filter(Boolean))
  ).slice(0, 10);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Interactive Tag Box */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`min-h-[40px] w-full p-1.5 px-2.5 rounded-md bg-white dark:bg-[#15171C] border transition-all duration-150 flex flex-wrap items-center gap-1.5 cursor-text ${
          disabled
            ? 'bg-[#F8F8F6] dark:bg-[#191B20] border-[#E7E7E5] dark:border-[#2D3139] opacity-60 cursor-not-allowed'
            : 'border-[#E7E7E5] dark:border-[#2D3139] hover:border-[#D4D4D0] dark:hover:border-[#3E434D] focus-within:border-[#4355DB] dark:focus-within:border-[#6375F1] focus-within:ring-2 focus-within:ring-[#4355DB]/15 dark:focus-within:ring-[#6375F1]/20'
        }`}
      >
        <TagIcon size={13} className="text-[#A8A8A6] dark:text-[#6B7280] flex-shrink-0" />

        {/* Selected Tags as Interactive Chips */}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4355DB]/10 dark:bg-[#6375F1]/15 text-[#4355DB] dark:text-[#818CF8] border border-[#4355DB]/20 dark:border-[#6375F1]/30 text-xs font-mono font-medium animate-in fade-in zoom-in-95 duration-100 select-none"
          >
            <span>#{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="p-0.5 -mr-1 rounded-full hover:bg-[#4355DB]/20 dark:hover:bg-[#6375F1]/25 text-[#4355DB] dark:text-[#818CF8] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                title={`Remover #${tag}`}
                aria-label={`Remover #${tag}`}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
          </span>
        ))}

        {/* Inline Input for typing new tags */}
        {!disabled && (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : '+ tag...'}
            className="flex-1 min-w-[90px] h-6 bg-transparent text-xs text-[#171717] dark:text-[#F3F4F6] placeholder-[#A8A8A6] dark:placeholder-[#6B7280] outline-none font-sans"
          />
        )}
      </div>

      {/* Quick Suggestions Chips */}
      {uniqueSuggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-mono text-[#737373] dark:text-[#9CA3AF] flex items-center gap-1 select-none mr-0.5">
            <Sparkles size={11} className="text-[#F59E0B]" />
            <span>Sugeridas:</span>
          </span>

          {uniqueSuggestions.map((sug) => {
            const isSelected = tags.includes(sug);
            return (
              <button
                key={sug}
                type="button"
                onClick={() => toggleSuggestion(sug)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all duration-150 cursor-pointer inline-flex items-center gap-1 select-none ${
                  isSelected
                    ? 'bg-[#4355DB] dark:bg-[#6375F1] text-white shadow-2xs font-semibold'
                    : 'bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#E7E7E5] dark:hover:bg-[#2D3139] border border-[#E7E7E5] dark:border-[#2D3139]'
                }`}
                title={isSelected ? `Remover #${sug}` : `Adicionar #${sug}`}
              >
                <span>{isSelected ? '✓' : '+'}</span>
                <span>#{sug}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
