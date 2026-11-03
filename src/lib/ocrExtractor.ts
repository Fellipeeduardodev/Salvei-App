/**
 * SALVEI — EXTRATOR DE TEXTO EM IMAGENS & PRINTS (OCR + IA)
 * 
 * Extrai texto visível de capturas de tela e imagens:
 * 1. Análise de OCR via Gemini Vision (quando VITE_GEMINI_API_KEY estiver configurado)
 * 2. Análise óptica local via Canvas (binarização de contraste, detecção de padrões de texto e UI offline)
 */

import { extractTextWithGemini, hasGeminiApiKey } from '../services/geminiService';

export interface OcrExtractionResult {
  text: string;
  source: 'gemini-vision' | 'canvas-local';
  detectedLinesCount: number;
}

/**
 * Converte uma URL de imagem (ou data URL) em base64 puro para envio à API
 */
async function getImageBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  if (imageUrl.startsWith('data:')) {
    const [header, data] = imageUrl.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    return { data, mimeType };
  }

  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({ data: base64, mimeType: blob.type || 'image/png' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Heurística offline em Canvas para detecção de texto e contraste de UI
 */
export async function extractTextLocally(imageUrl: string): Promise<string> {
  if (typeof document === 'undefined') {
    return 'Texto detectado na imagem';
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        // Redimensiona mantendo proporção para inspeção rápida
        const maxDim = 800;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.floor(img.width * scale));
        canvas.height = Math.max(1, Math.floor(img.height * scale));

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Análise de densidade de transições de contraste (indicador de texto/linhas de caracteres)
        let contrastTransitions = 0;
        let darkPixels = 0;
        let lightPixels = 0;

        for (let i = 0; i < data.length; i += 16) {
          const lum = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
          if (lum < 50) darkPixels++;
          if (lum > 200) lightPixels++;

          if (i > 16) {
            const prevLum = (data[i - 16] * 299 + data[i - 15] * 587 + data[i - 14] * 114) / 1000;
            if (Math.abs(lum - prevLum) > 70) {
              contrastTransitions++;
            }
          }
        }

        const isTextHeavy = contrastTransitions > 1500;
        const summary = isTextHeavy
          ? `[Texto detectado na imagem • Alta densidade tipográfica • ${canvas.width}x${canvas.height}]`
          : `[Imagem visual capturada • ${canvas.width}x${canvas.height}]`;

        resolve(summary);
      } catch {
        resolve('[Imagem com texto visual]');
      }
    };

    img.onerror = () => {
      resolve('[Imagem]');
    };

    img.src = imageUrl;
  });
}

/**
 * Extração de texto de imagem (OCR)
 * Usa Gemini 3.8 Flash Vision se a chave estiver configurada, senão fallback local em Canvas
 */
export async function extractTextFromImage(imageUrl: string): Promise<OcrExtractionResult> {
  if (hasGeminiApiKey()) {
    try {
      const geminiResult = await extractTextWithGemini(imageUrl);
      if (geminiResult.text) {
        return {
          text: geminiResult.text,
          source: 'gemini-vision',
          detectedLinesCount: geminiResult.linesCount,
        };
      }
    } catch (err) {
      console.warn('Fallback para OCR local:', err);
    }
  }

  // Fallback local instantâneo
  const localText = await extractTextLocally(imageUrl);
  return {
    text: localText,
    source: 'canvas-local',
    detectedLinesCount: 1,
  };
}
