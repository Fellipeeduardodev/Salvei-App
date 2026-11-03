import { describe, it, expect, vi } from 'vitest';
import * as geminiService from '../services/geminiService';
import { extractTextLocally, extractTextFromImage } from './ocrExtractor';

describe('SALVEI — EXTRAÇÃO DE TEXTO & OCR (IMAGENS)', () => {
  it('retorna um resultado estruturado sem falhas mesmo sem API key', async () => {
    vi.spyOn(geminiService, 'hasGeminiApiKey').mockReturnValue(false);

    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await extractTextFromImage(fakeDataUrl);
    expect(result).toHaveProperty('text');
    expect(result.source).toBe('canvas-local');
    expect(result).toHaveProperty('detectedLinesCount');

    vi.restoreAllMocks();
  });

  it('analisa imagem localmente e gera sumário visual', async () => {
    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const text = await extractTextLocally(fakeDataUrl);
    expect(typeof text).toBe('string');
  });
});
