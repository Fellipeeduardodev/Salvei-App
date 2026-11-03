import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
  testGeminiConnection,
  GEMINI_LOCAL_STORAGE_KEY,
} from './geminiService';

class MockLocalStorage {
  private store: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as any).window = globalThis;
(globalThis as any).localStorage = mockStorage;

describe('SALVEI — SERVIÇO DE IA (GOOGLE GEMINI FLASH)', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('salva e recupera a chave de API no localStorage corretamente', () => {
    setGeminiApiKey('minha-chave-de-teste-123');
    expect(getGeminiApiKey()).toBe('minha-chave-de-teste-123');

    setGeminiApiKey('');
    expect(mockStorage.getItem(GEMINI_LOCAL_STORAGE_KEY)).toBeNull();
  });

  it('retorna erro amigável se testar com chave vazia', async () => {
    const result = await testGeminiConnection('   ');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Nenhuma chave');
  });

  it('identifica o modelo padrão e lista de modelos candidatos', async () => {
    const result = await testGeminiConnection('   ');
    expect(result.model).toBeDefined();
    expect(typeof result.model).toBe('string');
  });
});
