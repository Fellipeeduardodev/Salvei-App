/**
 * SALVEI — ZIP EXPORT
 *
 * Exporta uma coleção como um pacote ZIP contendo:
 *   - moodboard.md   : Markdown com todas as referências
 *   - tokens.json    : Tokens de cor no formato Figma Tokens Studio
 *   - tailwind.config.js : Extensão de cores para Tailwind CSS
 *   - paleta.css     : Variáveis CSS :root com todas as cores
 *
 * Implementação 100% nativa — sem dependências externas.
 * Formata o ZIP binário manualmente (Local File Headers + Central Directory + EOCD).
 */

import { Collection, Reference, ColorPaletteItem } from '../types/reference';
import {
  exportPaletteAsFigmaTokens,
  exportPaletteAsTailwind,
  exportPaletteAsCss,
} from './colorExtractor';

// ---------------------------------------------------------------------------
// CRC-32 (necessário para o formato ZIP)
// ---------------------------------------------------------------------------

/** Tabela de lookup CRC-32 pré-calculada */
const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// Helpers de escrita de inteiros little-endian
// ---------------------------------------------------------------------------

function writeUint16LE(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32LE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

// ---------------------------------------------------------------------------
// Assembler ZIP puro (sem compressão — método STORED = 0)
// ---------------------------------------------------------------------------

interface ZipFileEntry {
  name: string;
  data: string | Uint8Array;
}

/**
 * Monta um arquivo ZIP válido em memória e retorna como Uint8Array.
 * Usa STORED (sem compressão) — compatível com todos os clientes ZIP.
 */
function zipFiles(files: ZipFileEntry[]): Uint8Array {
  const encoder = new TextEncoder();

  // Pré-processa cada arquivo: converte strings para bytes e calcula metadados
  const entries: {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    localHeaderOffset: number;
  }[] = [];

  // Primeira passagem: codificar dados e calcular CRCs
  let currentOffset = 0;
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes =
      typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
    const crc = crc32(dataBytes);

    entries.push({
      nameBytes,
      dataBytes,
      crc,
      localHeaderOffset: currentOffset,
    });

    // Local file header (30 bytes) + nome + dados
    currentOffset += 30 + nameBytes.length + dataBytes.length;
  }

  const centralDirOffset = currentOffset;

  // Calcula tamanho total do central directory
  let centralDirSize = 0;
  for (const entry of entries) {
    centralDirSize += 46 + entry.nameBytes.length;
  }

  const totalSize = centralDirOffset + centralDirSize + 22; // 22 = EOCD fixo
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let pos = 0;

  // -------------------------------------------------------------------------
  // Escreve Local File Headers + dados
  // -------------------------------------------------------------------------
  for (const entry of entries) {
    const { nameBytes, dataBytes, crc } = entry;

    // Assinatura Local File Header
    writeUint32LE(view, pos, 0x04034b50);
    pos += 4;
    // Versão necessária para extrair (2.0)
    writeUint16LE(view, pos, 20);
    pos += 2;
    // Flags gerais de propósito
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Método de compressão: 0 = STORED
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Hora e data de modificação (zeramos — sem timestamp)
    writeUint16LE(view, pos, 0);
    pos += 2;
    writeUint16LE(view, pos, 0);
    pos += 2;
    // CRC-32
    writeUint32LE(view, pos, crc);
    pos += 4;
    // Tamanho comprimido (= não comprimido pois é STORED)
    writeUint32LE(view, pos, dataBytes.length);
    pos += 4;
    // Tamanho não comprimido
    writeUint32LE(view, pos, dataBytes.length);
    pos += 4;
    // Tamanho do nome do arquivo
    writeUint16LE(view, pos, nameBytes.length);
    pos += 2;
    // Tamanho do campo extra
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Nome do arquivo
    bytes.set(nameBytes, pos);
    pos += nameBytes.length;
    // Dados do arquivo
    bytes.set(dataBytes, pos);
    pos += dataBytes.length;
  }

  // -------------------------------------------------------------------------
  // Escreve Central Directory
  // -------------------------------------------------------------------------
  for (const entry of entries) {
    const { nameBytes, dataBytes, crc, localHeaderOffset } = entry;

    // Assinatura Central Directory File Header
    writeUint32LE(view, pos, 0x02014b50);
    pos += 4;
    // Versão que criou (2.0, compatibilidade Unix)
    writeUint16LE(view, pos, 20);
    pos += 2;
    // Versão necessária para extrair
    writeUint16LE(view, pos, 20);
    pos += 2;
    // Flags gerais de propósito
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Método de compressão
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Hora e data de modificação
    writeUint16LE(view, pos, 0);
    pos += 2;
    writeUint16LE(view, pos, 0);
    pos += 2;
    // CRC-32
    writeUint32LE(view, pos, crc);
    pos += 4;
    // Tamanho comprimido
    writeUint32LE(view, pos, dataBytes.length);
    pos += 4;
    // Tamanho não comprimido
    writeUint32LE(view, pos, dataBytes.length);
    pos += 4;
    // Tamanho do nome do arquivo
    writeUint16LE(view, pos, nameBytes.length);
    pos += 2;
    // Tamanho do campo extra
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Tamanho do comentário do arquivo
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Número do disco onde começa
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Atributos internos de arquivo
    writeUint16LE(view, pos, 0);
    pos += 2;
    // Atributos externos de arquivo
    writeUint32LE(view, pos, 0);
    pos += 4;
    // Offset relativo do Local File Header
    writeUint32LE(view, pos, localHeaderOffset);
    pos += 4;
    // Nome do arquivo
    bytes.set(nameBytes, pos);
    pos += nameBytes.length;
  }

  // -------------------------------------------------------------------------
  // End of Central Directory Record (EOCD)
  // -------------------------------------------------------------------------
  writeUint32LE(view, pos, 0x06054b50); // Assinatura EOCD
  pos += 4;
  writeUint16LE(view, pos, 0); // Número do disco
  pos += 2;
  writeUint16LE(view, pos, 0); // Disco onde central dir começa
  pos += 2;
  writeUint16LE(view, pos, entries.length); // Entradas neste disco
  pos += 2;
  writeUint16LE(view, pos, entries.length); // Total de entradas
  pos += 2;
  writeUint32LE(view, pos, centralDirSize); // Tamanho do central directory
  pos += 4;
  writeUint32LE(view, pos, centralDirOffset); // Offset do central directory
  pos += 4;
  writeUint16LE(view, pos, 0); // Tamanho do comentário ZIP
  // pos += 2; // último campo, não precisamos incrementar

  return bytes;
}

// ---------------------------------------------------------------------------
// Geradores de conteúdo de arquivo
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'colecao'
  );
}

function generateMoodboardMd(collection: Collection, refs: Reference[]): string {
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const header = [
    `# ${collection.name}`,
    '',
    collection.description ? `> ${collection.description}` : '',
    '',
    `**Referências:** ${refs.length}  `,
    `**Exportado em:** ${dateStr}`,
    '',
    '---',
    '',
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n');

  const sections = refs.map((ref) => {
    const lines: string[] = [];

    lines.push(`## ${ref.title}`);
    lines.push('');

    if (ref.url) {
      lines.push(`**URL:** ${ref.url}  `);
    }
    if (ref.domain) {
      lines.push(`**Domínio:** ${ref.domain}  `);
    }
    if (ref.tags && ref.tags.length > 0) {
      lines.push(`**Tags:** ${ref.tags.map((t) => `#${t}`).join(', ')}  `);
    }
    if (ref.palette && ref.palette.length > 0) {
      lines.push(
        `**Paleta:** ${ref.palette.map((c) => c.hex).join(', ')}  `
      );
    }
    lines.push('');

    if (ref.notesMarkdown && ref.notesMarkdown.trim()) {
      lines.push(ref.notesMarkdown.trim());
      lines.push('');
    }

    lines.push('---');
    lines.push('');

    return lines.join('\n');
  });

  return header + sections.join('');
}

function generateTokensJson(collectionName: string, allColors: ColorPaletteItem[]): string {
  return exportPaletteAsFigmaTokens(collectionName, allColors);
}

function generateTailwindConfig(collectionName: string, allColors: ColorPaletteItem[]): string {
  return exportPaletteAsTailwind(collectionName, allColors);
}

function generatePaletaCss(collectionName: string, allColors: ColorPaletteItem[]): string {
  return exportPaletteAsCss(collectionName, allColors);
}

// ---------------------------------------------------------------------------
// Função principal de export
// ---------------------------------------------------------------------------

/**
 * Gera e dispara o download de um arquivo ZIP contendo:
 *   - moodboard.md
 *   - tokens.json  (Figma Tokens Studio)
 *   - tailwind.config.js
 *   - paleta.css
 *
 * Zero dependências externas — apenas APIs nativas do browser.
 */
export function downloadCollectionZip(collection: Collection, references: Reference[]): void {
  const collectionRefs = references.filter((r) =>
    r.collectionIds?.includes(collection.id)
  );

  const allColors: ColorPaletteItem[] = collectionRefs.flatMap(
    (r) => r.palette || []
  );

  const files: ZipFileEntry[] = [
    {
      name: 'moodboard.md',
      data: generateMoodboardMd(collection, collectionRefs),
    },
    {
      name: 'tokens.json',
      data:
        allColors.length > 0
          ? generateTokensJson(collection.name, allColors)
          : JSON.stringify({ info: 'Nenhuma cor extraída nesta coleção.' }, null, 2),
    },
    {
      name: 'tailwind.config.js',
      data:
        allColors.length > 0
          ? generateTailwindConfig(collection.name, allColors)
          : '// Nenhuma cor extraída nesta coleção.\nmodule.exports = {};',
    },
    {
      name: 'paleta.css',
      data:
        allColors.length > 0
          ? generatePaletaCss(collection.name, allColors)
          : '/* Nenhuma cor extraída nesta coleção. */',
    },
  ];

  const zipBytes = zipFiles(files);
  const blob = new Blob([zipBytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `salvei-${slugify(collection.name)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
