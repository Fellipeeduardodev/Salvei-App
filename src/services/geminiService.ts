/// <reference types="vite/client" />
/**
 * SALVEI — SERVIÇO DE INTELIGÊNCIA ARTIFICIAL (GOOGLE GEMINI FLASH)
 * 
 * Integração multimodal com modelos Google Gemini Flash para:
 * 1. Análise Estética e Diagnóstico de Design (Visão Computacional)
 * 2. OCR e Transcrição Fiel de Texto em Prints e Interfaces
 * 3. Geração Automática de Metadados e Tags para URLs
 * 4. Gestão, Validação e Teste de Chave de API (BYOK / Env)
 * 5. Arquitetura resiliente com rotação automática de modelos (evita erros 503 de alta demanda)
 */

export const GEMINI_LOCAL_STORAGE_KEY = 'salvei_gemini_api_key';

/**
 * Modelos Gemini suportados no endpoint v1beta generateContent.
 * Ordenados por disponibilidade comprovada, velocidade (< 400ms) e capacidade multimodal:
 * - gemini-flash-lite-latest (Principal: ultrarrápido, altamente disponível, cota generosa)
 * - gemini-3-flash-preview (Excelente para visão computacional de alta fidelidade)
 * - gemini-3.1-flash-lite-preview (Reserva de baixa latência)
 * - gemini-3.8-flash (Modelo de última geração quando disponível)
 */
export const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.8-flash',
] as const;

export const GEMINI_MODEL = CANDIDATE_MODELS[0];

export interface GeminiDesignAnalysis {
  styleTitle: string;
  visualDiagnosis: string;
  typographyNotes: string;
  suggestedTags: string[];
  moodDescription: string;
}

export interface GeminiOcrResult {
  text: string;
  linesCount: number;
}

/**
 * Recupera a chave de API ativa (prioridade: localStorage do usuário > variável de ambiente .env)
 */
export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(GEMINI_LOCAL_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return String(import.meta.env.VITE_GEMINI_API_KEY).trim();
  }

  return '';
}

/**
 * Salva ou remove a chave configurada pelo usuário no navegador
 */
export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  if (clean) {
    localStorage.setItem(GEMINI_LOCAL_STORAGE_KEY, clean);
  } else {
    localStorage.removeItem(GEMINI_LOCAL_STORAGE_KEY);
  }
}

/**
 * Verifica se há uma chave de API configurada e pronta para uso
 */
export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey().length > 0);
}

/**
 * Converte uma URL de imagem (ou data URL) em base64 puro e mimeType
 * com suporte resiliente a Blob, Assets locais e fallback via Canvas em caso de restrições CORS.
 */
async function getImageBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  if (imageUrl.startsWith('data:')) {
    const [header, data] = imageUrl.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    return { data, mimeType };
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return await new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ data: base64, mimeType: blob.type || 'image/png' });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (fetchErr) {
    // Se fetch falhar (ex: restrições CORS de CDN de terceiros), tenta carregar via Image + Canvas
    if (typeof document !== 'undefined') {
      return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 1200;
            const naturalW = img.naturalWidth || 800;
            const naturalH = img.naturalHeight || 600;
            const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH));
            canvas.width = Math.max(1, Math.floor(naturalW * scale));
            canvas.height = Math.max(1, Math.floor(naturalH * scale));

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return reject(new Error('Falha ao instanciar canvas para leitura de imagem.'));
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const [header, data] = dataUrl.split(',');
            resolve({ data, mimeType: 'image/jpeg' });
          } catch (canvasErr) {
            reject(
              new Error(
                'A imagem externa possui restrições de CORS que impedem o processamento pela IA. Experimente colar ou fazer upload do print diretamente.'
              )
            );
          }
        };
        img.onerror = () => {
          reject(new Error(`Não foi possível carregar a imagem em "${imageUrl}".`));
        };
        img.src = imageUrl;
      });
    }
    throw fetchErr;
  }
}

/**
 * Executa chamadas à API Gemini com rotação de modelos transparente.
 * Se o Google retornar 503 (alta demanda temporária), 404 ou 429,
 * o engine migra automaticamente para o próximo modelo candidato sem falhar.
 */
async function callGeminiWithFallback<T>(
  apiKey: string,
  requestFactory: (model: string) => { body: any },
  responseParser: (json: any, model: string) => T
): Promise<{ result: T; usedModel: string }> {
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const { body } = requestFactory(model);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        
        // Se for 503 (alta demanda), 404 (descontinuado) ou 429 (rate limit), tenta próximo modelo
        if (res.status === 503 || res.status === 404 || res.status === 429 || res.status === 400) {
          console.warn(`[Gemini Fallback] Modelo ${model} retornou ${res.status}: ${errMsg}. Tentando modelo alternativo...`);
          lastError = new Error(`Modelo ${model} indisponível: ${errMsg}`);
          continue;
        }

        throw new Error(errMsg);
      }

      const json = await res.json();
      const parsed = responseParser(json, model);
      return { result: parsed, usedModel: model };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Fallback] Falha no modelo ${model}:`, err.message);
    }
  }

  throw lastError || new Error('Não foi possível obter resposta de nenhum dos modelos Gemini disponíveis.');
}

/**
 * Testa a conexão com a API do Google Gemini
 */
export async function testGeminiConnection(keyOverride?: string): Promise<{
  success: boolean;
  message: string;
  model: string;
}> {
  const apiKey = (keyOverride !== undefined ? keyOverride.trim() : getGeminiApiKey()).trim();

  if (!apiKey) {
    return {
      success: false,
      message: 'Nenhuma chave de API configurada. Cole sua chave do Google AI Studio.',
      model: GEMINI_MODEL,
    };
  }

  try {
    const { usedModel } = await callGeminiWithFallback(
      apiKey,
      () => ({
        body: {
          contents: [
            {
              parts: [{ text: 'Responda apenas com a palavra OK.' }],
            },
          ],
        },
      }),
      (json) => {
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Resposta vazia da API do Gemini.');
        return text;
      }
    );

    return {
      success: true,
      message: `Conexão estabelecida com sucesso com o Google Gemini Flash (${usedModel})!`,
      model: usedModel,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Falha de rede ao conectar com os servidores do Google.',
      model: GEMINI_MODEL,
    };
  }
}

/**
 * Análise visual aprofundada de design e curadoria via Gemini Flash Vision
 */
export async function analyzeDesignWithGemini(
  imageUrl: string,
  existingTags: string[] = []
): Promise<GeminiDesignAnalysis> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chave de API do Google Gemini não configurada.');
  }

  const { data, mimeType } = await getImageBase64(imageUrl);

  const prompt = `Você é um curador e diretor de arte especialista em interfaces digitais, design editorial, tipografia e branding.
Analise a imagem fornecida e retorne estritamente um objeto JSON com esta estrutura:
{
  "styleTitle": "Título conciso do estilo estético (ex: Minimalismo Suíço & Dark UI, Neobrutalismo Digital, Design Editorial Corporativo)",
  "visualDiagnosis": "Diagnóstico de 2 frases sobre a hierarquia visual, uso de espaços negativos e composição da peça.",
  "typographyNotes": "Breve comentário sobre o tratamento tipográfico (ex: Sem serifa geométrica com alto contraste, fontes grotescas modernas).",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "moodDescription": "Atmosfera visual em 1 frase (ex: Sofisticada, técnica e de alta densidade de informação)."
}
Observação: Gere tags relevantes em minúsculas (ex: dark-mode, bento-grid, saas, fintech, dashboard, tipografia, editorial).${
  existingTags.length > 0 ? ` Tags existentes para contexto: ${existingTags.join(', ')}.` : ''
}`;

  const { result } = await callGeminiWithFallback<GeminiDesignAnalysis>(
    apiKey,
    () => ({
      body: {
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      },
    }),
    (json) => {
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Resposta vazia da API do Gemini.');
      }

      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        styleTitle: parsed.styleTitle || 'Design Digital Curado',
        visualDiagnosis: parsed.visualDiagnosis || 'Composição equilibrada com forte identidade gráfica.',
        typographyNotes: parsed.typographyNotes || 'Tipografia contemporânea com boa hierarquia.',
        suggestedTags: Array.isArray(parsed.suggestedTags)
          ? parsed.suggestedTags.map((t: string) => String(t).toLowerCase().replace(/[^a-z0-9-]/g, ''))
          : [],
        moodDescription: parsed.moodDescription || 'Visual moderno e elegante.',
      };
    }
  );

  return result;
}

/**
 * Extração de texto de alta fidelidade (OCR) com Gemini Vision
 */
export async function extractTextWithGemini(imageUrl: string): Promise<GeminiOcrResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chave de API do Google Gemini não configurada.');
  }

  const { data, mimeType } = await getImageBase64(imageUrl);

  const { result } = await callGeminiWithFallback<GeminiOcrResult>(
    apiKey,
    () => ({
      body: {
        contents: [
          {
            parts: [
              {
                text: 'Transcreva todo o texto visível nesta imagem/captura de tela com fidelidade absoluta. Preserve cabeçalhos, menus de navegação, títulos, botões, códigos e parágrafos. Retorne apenas o texto transcrito, sem introduções ou explicações.',
              },
              { inlineData: { mimeType, data } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      },
    }),
    (json) => {
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const lines = text.trim().split('\n').filter((l: string) => l.trim().length > 0);
      return {
        text: text.trim(),
        linesCount: lines.length,
      };
    }
  );

  return result;
}

/**
 * Geração de metadados inteligentes (título, resumo e tags) para links e URLs
 */
export async function generateMetadataForUrlWithGemini(
  url: string,
  currentTitle?: string
): Promise<{ title: string; summary: string; tags: string[] }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chave de API do Google Gemini não configurada.');
  }

  const prompt = `Você é um curador digital. Para o site com a URL "${url}" ${
    currentTitle ? `e título "${currentTitle}"` : ''
  }, sugira metadados ideais de curadoria.
Retorne estritamente um objeto JSON com:
{
  "title": "Título conciso e elegante do site ou produto",
  "summary": "Resumo de 2 frases explicando o que é o produto/site e sua proposta de valor",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}`;

  const { result } = await callGeminiWithFallback<{ title: string; summary: string; tags: string[] }>(
    apiKey,
    () => ({
      body: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      },
    }),
    (json) => {
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Resposta vazia da IA.');

      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        title: parsed.title || currentTitle || url,
        summary: parsed.summary || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      };
    }
  );

  return result;
}
