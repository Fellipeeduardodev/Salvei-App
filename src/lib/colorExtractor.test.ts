import { describe, it, expect } from 'vitest';
import {
  rgbToHex,
  hexToRgb,
  getRelativeLuminance,
  findClosestDesignColor,
  generateStyleInsightsFromPalette,
  colorDistance,
  exportPaletteAsTailwind,
  exportPaletteAsCss,
  exportPaletteAsJson,
  extractPaletteFromImage,
} from './colorExtractor';
import { ColorPaletteItem } from '../types/reference';

describe('SALVEI — EXTRATOR & INTELIGÊNCIA DE CORES (CANVAS + IA)', () => {
  describe('1. Utilitários de Conversão e Luminância', () => {
    it('converte RGB para HEX corretamente', () => {
      expect(rgbToHex(67, 85, 219)).toBe('#4355DB');
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('converte HEX para RGB corretamente', () => {
      expect(hexToRgb('#4355DB')).toEqual([67, 85, 219]);
      expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
      expect(hexToRgb('#000')).toEqual([0, 0, 0]);
    });

    it('calcula luminância relativa (WCAG 2.1) com precisão', () => {
      const whiteLum = getRelativeLuminance([255, 255, 255]);
      const blackLum = getRelativeLuminance([0, 0, 0]);
      expect(whiteLum).toBeCloseTo(1.0, 2);
      expect(blackLum).toBeCloseTo(0.0, 2);
    });

    it('calcula distância entre cores corretamente', () => {
      const dSame = colorDistance([255, 0, 0], [255, 0, 0]);
      expect(dSame).toBe(0);
      const dDiff = colorDistance([255, 255, 255], [0, 0, 0]);
      expect(dDiff).toBeGreaterThan(100);
    });
  });

  describe('2. Mapeamento Editorial de Cores em Português (pt-BR)', () => {
    it('identifica Índigo Elétrico para azuis vibrantes tecnológicos', () => {
      const result = findClosestDesignColor('#4355DB');
      expect(result.name).toBe('Índigo Elétrico');
      expect(result.role).toBe('primary');
    });

    it('identifica Laranja Persimmon para laranjas de acento', () => {
      const result = findClosestDesignColor('#F06A38');
      expect(result.name).toBe('Laranja Persimmon');
      expect(result.role).toBe('accent');
    });

    it('identifica Grafite Ônix ou Ardósia para tons de fundo escuro', () => {
      const result = findClosestDesignColor('#0F1012');
      expect(result.role).toBe('background');
    });

    it('identifica Papel Editorial para tons suaves claros', () => {
      const result = findClosestDesignColor('#FAF7F2');
      expect(result.name).toBe('Papel Editorial');
    });
  });

  describe('3. Geração de Insights de Estilo e Tags por IA', () => {
    it('sugere dark-mode para paletas predominantemente escuras', () => {
      const darkPalette: ColorPaletteItem[] = [
        { hex: '#0F1012', name: 'Grafite Ônix', role: 'background' },
        { hex: '#18191B', name: 'Ardósia Escura', role: 'background' },
        { hex: '#4355DB', name: 'Índigo Elétrico', role: 'primary' },
      ];

      const insights = generateStyleInsightsFromPalette(darkPalette);
      expect(insights.themeType).toBe('dark');
      expect(insights.suggestedTags).toContain('dark-mode');
    });

    it('calcula contraste WCAG e identifica tags estéticas', () => {
      const contrastPalette: ColorPaletteItem[] = [
        { hex: '#000000', name: 'Preto', role: 'background' },
        { hex: '#FFFFFF', name: 'Branco', role: 'neutral' },
        { hex: '#4355DB', name: 'Índigo Elétrico', role: 'primary' },
      ];

      const insights = generateStyleInsightsFromPalette(contrastPalette);
      expect(insights.contrastRatio).toContain(':1');
      expect(insights.suggestedTags).toContain('alto-contraste');
    });
  });

  describe('4. Exportação de Paleta de Cores (Tailwind, CSS & JSON)', () => {
    const samplePalette: ColorPaletteItem[] = [
      { hex: '#0F1012', name: 'Grafite Ônix', role: 'background' },
      { hex: '#4355DB', name: 'Índigo Elétrico', role: 'primary' },
    ];

    it('exporta configuração de tema para Tailwind CSS', () => {
      const tw = exportPaletteAsTailwind('Linear App', samplePalette);
      expect(tw).toContain('linear-app');
      expect(tw).toContain('#4355DB');
      expect(tw).toContain('primary');
    });

    it('exporta variáveis CSS nativas :root', () => {
      const css = exportPaletteAsCss('Linear App', samplePalette);
      expect(css).toContain(':root');
      expect(css).toContain('--linear-app-background: #0F1012;');
    });

    it('exporta tokens de design em JSON estruturado', () => {
      const jsonStr = exportPaletteAsJson('Linear App', samplePalette);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.name).toBe('Linear App');
      expect(parsed.swatches).toHaveLength(2);
      expect(parsed.swatches[1].hex).toBe('#4355DB');
    });
  });

  describe('5. Extração de Paleta em Upload & Cartão Visual', () => {
    it('retorna paleta padrão quando executado fora do DOM', async () => {
      const palette = await extractPaletteFromImage('data:image/png;base64,...');
      expect(palette).toBeDefined();
      expect(Array.isArray(palette)).toBe(true);
      expect(palette.length).toBeGreaterThan(0);
    });
  });
});
