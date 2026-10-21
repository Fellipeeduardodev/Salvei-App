import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  if (!content || !content.trim()) {
    return (
      <p className="text-xs text-[#A8A8A6] italic font-sans">
        Nenhuma anotação adicionada ainda.
      </p>
    );
  }

  // Parse markdown lines into formatted React elements
  const lines = content.split('\n');

  const formatInline = (text: string): React.ReactNode[] => {
    // Basic regex parser for **bold**, `code`, and [link](url)
    const elements: React.ReactNode[] = [];
    let current = text;
    let keyIdx = 0;

    // Pattern for inline code, bold, links
    const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
    const parts = current.split(regex);

    parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith('**') && part.endsWith('**')) {
        elements.push(
          <strong key={keyIdx++} className="font-semibold text-[#171717]">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        elements.push(
          <code
            key={keyIdx++}
            className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#171717] border border-[#E7E7E5]/70"
          >
            {part.slice(1, -1)}
          </code>
        );
      } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const linkText = part.substring(1, part.indexOf(']('));
        const linkUrl = part.substring(part.indexOf('](') + 2, part.length - 1);
        elements.push(
          <a
            key={keyIdx++}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4355DB] hover:underline font-medium"
          >
            {linkText}
          </a>
        );
      } else {
        elements.push(<span key={keyIdx++}>{part}</span>);
      }
    });

    return elements;
  };

  return (
    <div className="flex flex-col gap-2 font-sans text-xs text-[#333333] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="font-sans font-bold text-xs uppercase tracking-wider text-[#171717] mt-3 mb-1"
            >
              {trimmed.substring(4)}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className="font-sans font-bold text-sm text-[#171717] mt-3 mb-1"
            >
              {trimmed.substring(3)}
            </h3>
          );
        }

        if (trimmed.startsWith('# ')) {
          return (
            <h2
              key={idx}
              className="font-sans font-bold text-base text-[#171717] mt-3 mb-1"
            >
              {trimmed.substring(2)}
            </h2>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="w-1 h-1 rounded-full bg-[#737373] mt-1.5 flex-shrink-0" />
              <div className="flex-1">{formatInline(trimmed.substring(2))}</div>
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx}>{formatInline(line)}</p>;
      })}
    </div>
  );
};
