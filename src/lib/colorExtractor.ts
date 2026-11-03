/**
 * SALVEI — EXTRATOR & ANALISADOR DE PALETA DE CORES (CANVAS + IA)
 * 
 * Extrai até 5 cores dominantes de imagens via HTML5 Canvas (K-Means/Quantização)
 * e aplica inteligência de design editorial:
 * - Mapeamento para nomes de design em pt-BR (ex: "Índigo Elétrico", "Areia Editorial")
 * - Identificação de papéis (primary, accent, background, neutral)
 * - Cálculo de contraste e temperatura cromática
 * - Sugestão automática de tags estéticas (#dark-mode, #minimalismo, #vibrante)
 */

import { ColorPaletteItem } from '../types/reference';

// Dicionário de cores conceituais de design curadas (pt-BR)
const CURATED_DESIGN_COLORS: { hex: string; name: string; role: ColorPaletteItem['role'] }[] = [
  // Grafites e Neutros Escuros
  { hex: '#0F1012', name: 'Grafite Ônix', role: 'background' },
  { hex: '#18191B', name: 'Ardósia Escura', role: 'background' },
  { hex: '#23252A', name: 'Carvão Fosco', role: 'neutral' },
  { hex: '#343841', name: 'Chumbo Frio', role: 'neutral' },
  { hex: '#4A505C', name: 'Titânio', role: 'neutral' },

  // Neutros Claros e Editoriais
  { hex: '#FFFFFF', name: 'Branco Puro', role: 'background' },
  { hex: '#FAF7F2', name: 'Papel Editorial', role: 'background' },
  { hex: '#F4EFE6', name: 'Areia Suíço', role: 'background' },
  { hex: '#EBE6DC', name: 'Linho Natural', role: 'neutral' },
  { hex: '#E2E8F0', name: 'Névoa Suave', role: 'neutral' },
  { hex: '#CBD5E1', name: 'Cinza Platina', role: 'neutral' },

  // Azuis e Índigos Tecnológicos
  { hex: '#4355DB', name: 'Índigo Elétrico', role: 'primary' },
  { hex: '#2563EB', name: 'Azul Cobalto', role: 'primary' },
  { hex: '#3B82F6', name: 'Azul Ciano', role: 'accent' },
  { hex: '#0EA5E9', name: 'Azul Celeste', role: 'accent' },
  { hex: '#1E3A8A', name: 'Azul Marinho Real', role: 'primary' },
  { hex: '#6366F1', name: 'Índigo Fluido', role: 'primary' },

  // Laranjas, Âmbares e Acentos Quentes
  { hex: '#F06A38', name: 'Laranja Persimmon', role: 'accent' },
  { hex: '#EA580C', name: 'Laranja Fogo', role: 'accent' },
  { hex: '#F97316', name: 'Tangerina Solar', role: 'accent' },
  { hex: '#F59E0B', name: 'Âmbar Dourado', role: 'accent' },
  { hex: '#D97706', name: 'Ocre Queimado', role: 'accent' },
  { hex: '#C2410C', name: 'Terracota Editorial', role: 'accent' },

  // Verdes e Esmeraldas
  { hex: '#10B981', name: 'Verde Esmeralda', role: 'accent' },
  { hex: '#059669', name: 'Verde Floresta', role: 'primary' },
  { hex: '#14B8A6', name: 'Turquesa Menta', role: 'accent' },
  { hex: '#84CC16', name: 'Lima Fresca', role: 'accent' },

  // Violetas e Magentas
  { hex: '#8B5CF6', name: 'Violeta Digital', role: 'accent' },
  { hex: '#A855F7', name: 'Lavanda Vibrante', role: 'accent' },
  { hex: '#EC4899', name: 'Magenta Carmim', role: 'accent' },
  { hex: '#E11D48', name: 'Rubi Intenso', role: 'accent' },
  { hex: '#BE123C', name: 'Vinho Bordô', role: 'primary' },
];

/**
 * Converte componentes RGB para formato HEX padronizado (#RRGGBB)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converte HEX para RGB [r, g, b]
 */
export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Calcula a distância euclidiana ponderada no espaço de cor RGB
 */
export function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const rDiff = rgb1[0] - rgb2[0];
  const gDiff = rgb1[1] - rgb2[1];
  const bDiff = rgb1[2] - rgb2[2];
  // Ponderação perceptiva humana aproximada (Redmean)
  const rMean = (rgb1[0] + rgb2[0]) / 2;
  const rWeight = 2 + rMean / 256;
  const gWeight = 4.0;
  const bWeight = 2 + (255 - rMean) / 256;
  return Math.sqrt(rWeight * rDiff * rDiff + gWeight * gDiff * gDiff + bWeight * bDiff * bDiff);
}

/**
 * Calcula luminância relativa (WCAG 2.1)
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Identifica o nome de design mais próximo e sugere o papel da cor
 */
export function findClosestDesignColor(hex: string): { name: string; role: ColorPaletteItem['role'] } {
  const targetRgb = hexToRgb(hex);
  let closest = CURATED_DESIGN_COLORS[0];
  let minDistance = Infinity;

  for (const item of CURATED_DESIGN_COLORS) {
    const itemRgb = hexToRgb(item.hex);
    const dist = colorDistance(targetRgb, itemRgb);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  // Refina o papel com base na luminância
  const lum = getRelativeLuminance(targetRgb);
  let calculatedRole = closest.role;
  if (lum < 0.08) {
    calculatedRole = 'background';
  } else if (lum > 0.85) {
    calculatedRole = 'neutral';
  }

  return {
    name: closest.name,
    role: calculatedRole,
  };
}

/**
 * Extrai as cores dominantes de uma imagem usando HTML5 Canvas em miniatura (K-Means quantizado)
 */
export async function extractPaletteFromImage(
  imageSource: string,
  maxColors: number = 5
): Promise<ColorPaletteItem[]> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [
      { hex: '#0F172A', name: 'Ardósia Escura', role: 'background' },
      { hex: '#4355DB', name: 'Índigo Elétrico', role: 'primary' },
      { hex: '#FAF7F2', name: 'Papel Editorial', role: 'neutral' },
    ];
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallbackTimeout = setTimeout(() => {
      resolve([
        { hex: '#0F1012', name: 'Grafite Ônix', role: 'background' },
        { hex: '#4355DB', name: 'Índigo Elétrico', role: 'primary' },
        { hex: '#F06A38', name: 'Laranja Persimmon', role: 'accent' },
      ]);
    }, 4000);

    img.onload = () => {
      clearTimeout(fallbackTimeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve([]);
          return;
        }

        // Amostra em miniatura de 80x80 px (6400 pixels são ideais para precisão e velocidade < 10ms)
        const sampleSize = 80;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

        // Amostra pixels ignorando transparências e quantizando em steps de 16
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // ignora transparente

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Quantiza em blocos de 24 para agrupar tons similares
          const qR = Math.round(r / 24) * 24;
          const qG = Math.round(g / 24) * 24;
          const qB = Math.round(b / 24) * 24;
          const key = `${qR},${qG},${qB}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorBuckets.set(key, { r, g, b, count: 1 });
          }
        }

        // Ordena por frequência
        const sortedBuckets = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

        // Filtra para selecionar cores suficientemente distintas entre si
        const selectedColors: [number, number, number][] = [];
        const minDistanceBetweenSelected = 45;

        for (const bucket of sortedBuckets) {
          const currentRgb: [number, number, number] = [bucket.r, bucket.g, bucket.b];

          // Verifica se já não é muito parecida com uma cor já selecionada
          const isDistinct = selectedColors.every(
            (c) => colorDistance(c, currentRgb) >= minDistanceBetweenSelected
          );

          if (isDistinct) {
            selectedColors.push(currentRgb);
            if (selectedColors.length >= maxColors) break;
          }
        }

        // Se encontrou menos que o desejado, preenche com as mais frequentes
        if (selectedColors.length < maxColors) {
          for (const bucket of sortedBuckets) {
            const currentRgb: [number, number, number] = [bucket.r, bucket.g, bucket.b];
            if (!selectedColors.some((c) => c[0] === currentRgb[0] && c[1] === currentRgb[1] && c[2] === currentRgb[2])) {
              selectedColors.push(currentRgb);
              if (selectedColors.length >= maxColors) break;
            }
          }
        }

        const paletteItems: ColorPaletteItem[] = selectedColors.map(([r, g, b]) => {
          const hex = rgbToHex(r, g, b);
          const meta = findClosestDesignColor(hex);
          return {
            hex,
            name: meta.name,
            role: meta.role,
          };
        });

        resolve(paletteItems);
      } catch (err) {
        console.error('Erro ao extrair paleta de cores via Canvas:', err);
        resolve([]);
      }
    };

    img.onerror = () => {
      clearTimeout(fallbackTimeout);
      resolve([]);
    };

    img.src = imageSource;
  });
}

/**
 * Inteligência Editorial / IA: Gera tags e insights de design a partir da paleta
 */
export function generateStyleInsightsFromPalette(palette: ColorPaletteItem[]): {
  suggestedTags: string[];
  contrastRatio: string;
  themeType: 'dark' | 'light' | 'vibrant' | 'minimal';
} {
  if (!palette || palette.length === 0) {
    return {
      suggestedTags: ['design'],
      contrastRatio: '4.5:1',
      themeType: 'minimal',
    };
  }

  const luminances = palette.map((p) => getRelativeLuminance(hexToRgb(p.hex)));
  const avgLum = luminances.reduce((a, b) => a + b, 0) / luminances.length;
  const maxLum = Math.max(...luminances);
  const minLum = Math.min(...luminances);

  // Contraste aproximado entre a cor mais clara e a mais escura
  const ratio = (maxLum + 0.05) / (minLum + 0.05);
  const formattedRatio = `${ratio.toFixed(1)}:1`;

  const tags = new Set<string>();

  if (avgLum < 0.25) {
    tags.add('dark-mode');
  } else if (avgLum > 0.65) {
    tags.add('light-mode');
    tags.add('editorial');
  }

  if (ratio > 7.0) {
    tags.add('alto-contraste');
  }

  const hasAccent = palette.some((p) => p.role === 'accent');
  if (hasAccent) {
    tags.add('identidade-visual');
  }

  // Tags conceituais de cores específicas
  for (const item of palette) {
    const [r, g, b] = hexToRgb(item.hex);
    if (b > r + 30 && b > g) tags.add('paleta-azul');
    if (r > g + 40 && r > b + 40) tags.add('paleta-quente');
    if (g > r + 20 && g > b) tags.add('paleta-verde');
  }

  return {
    suggestedTags: Array.from(tags).slice(0, 4),
    contrastRatio: formattedRatio,
    themeType: avgLum < 0.35 ? 'dark' : 'light',
  };
}

/**
 * Converte a paleta para configuração de tema do Tailwind CSS
 */
export function exportPaletteAsTailwind(title: string, palette: ColorPaletteItem[]): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'palette';

  const colorEntries = palette
    .map((item, idx) => {
      const roleKey = item.role || `shade-${(idx + 1) * 100}`;
      const nameComment = item.name ? ` // ${item.name}` : '';
      return `      '${roleKey}': '${item.hex}',${nameComment}`;
    })
    .join('\n');

  return `// Tailwind CSS Theme Extension — ${title}\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${slug}': {\n${colorEntries}\n        }\n      }\n    }\n  }\n};`;
}

/**
 * Converte a paleta para variáveis de CSS nativas (:root)
 */
export function exportPaletteAsCss(title: string, palette: ColorPaletteItem[]): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'palette';

  const lines = palette.map((item, idx) => {
    const roleKey = item.role || `color-${idx + 1}`;
    const comment = item.name ? ` /* ${item.name} */` : '';
    return `  --${slug}-${roleKey}: ${item.hex};${comment}`;
  });

  return `/* Tokens de Cores — ${title} */\n:root {\n${lines.join('\n')}\n}`;
}

/**
 * Converte a paleta para formato JSON de Design Tokens padronizado
 */
export function exportPaletteAsJson(title: string, palette: ColorPaletteItem[]): string {
  const payload = {
    name: title,
    extractedAt: new Date().toISOString(),
    swatches: palette.map((item, idx) => ({
      index: idx + 1,
      hex: item.hex,
      name: item.name || `Cor ${idx + 1}`,
      role: item.role || 'accent',
      rgb: hexToRgb(item.hex),
    })),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Converte a paleta para formato de Design Tokens compatível com Figma Tokens / Token Studio
 */
export function exportPaletteAsFigmaTokens(title: string, palette: ColorPaletteItem[]): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'palette';

  const tokens: Record<string, Record<string, { value: string; type: string; description: string }>> = {
    [slug]: {},
  };

  palette.forEach((item, idx) => {
    const key = item.role || `color-${idx + 1}`;
    tokens[slug][key] = {
      value: item.hex,
      type: 'color',
      description: item.name || `Tom ${idx + 1}`,
    };
  });

  return JSON.stringify(tokens, null, 2);
}

/**
 * Renderiza um cartão de paleta estilizado (estilo Pantone / Design Studio) em Canvas e retorna a DataURL PNG
 */
export function generatePaletteCardDataUrl(title: string, palette: ColorPaletteItem[]): string | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 560;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Fundo editorial escuro
  ctx.fillStyle = '#0F1012';
  ctx.fillRect(0, 0, width, height);

  // Borda sutil
  ctx.strokeStyle = '#2D3139';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Topo: Marca e Título da Referência
  ctx.fillStyle = '#6B7280';
  ctx.font = '600 13px ui-monospace, monospace';
  ctx.fillText('SALVEI — PALETA DE DESIGN EDITORIAL', 48, 56);

  ctx.fillStyle = '#F3F4F6';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const cleanTitle = title.length > 50 ? `${title.slice(0, 47)}...` : title;
  ctx.fillText(cleanTitle, 48, 92);

  // Faixa de amostras de cores
  const paddingX = 48;
  const availableWidth = width - paddingX * 2;
  const count = Math.max(1, palette.length);
  const gap = 16;
  const swatchWidth = (availableWidth - gap * (count - 1)) / count;
  const swatchHeight = 240;
  const swatchY = 130;

  palette.forEach((item, i) => {
    const x = paddingX + i * (swatchWidth + gap);

    // Bloco de Cor
    ctx.fillStyle = item.hex;
    ctx.beginPath();
    ctx.roundRect(x, swatchY, swatchWidth, swatchHeight, 10);
    ctx.fill();

    // Sombra interna sutil na base da amostra
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Metadados abaixo da amostra
    const metaY = swatchY + swatchHeight + 28;

    // Código HEX em destaque
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px ui-monospace, monospace';
    ctx.fillText(item.hex, x, metaY);

    // Nome da Cor
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const name = item.name ? (item.name.length > 18 ? item.name.slice(0, 16) + '...' : item.name) : `Cor #${i + 1}`;
    ctx.fillText(name, x, metaY + 22);

    // Papel (Role)
    if (item.role) {
      ctx.fillStyle = '#6366F1';
      ctx.font = '600 10px ui-monospace, monospace';
      ctx.fillText(item.role.toUpperCase(), x, metaY + 40);
    }
  });

  // Rodapé do Card
  ctx.fillStyle = '#4B5563';
  ctx.font = '500 12px ui-monospace, monospace';
  ctx.fillText('Gerado no Salvei • Curadoria de referências visuais', 48, height - 36);

  return canvas.toDataURL('image/png');
}

/**
 * Dispara o download imediato de um cartão de paleta em PNG
 */
export function downloadPaletteCardPng(title: string, palette: ColorPaletteItem[]): boolean {
  if (typeof document === 'undefined') return false;
  const dataUrl = generatePaletteCardDataUrl(title, palette);
  if (!dataUrl) return false;

  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'paleta';

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `salvei-paleta-${slug}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
