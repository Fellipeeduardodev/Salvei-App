import { describe, it, expect } from 'vitest';
import {
  validateAndFormatUrl,
  checkDuplicateUrl,
  createReferenceFromPayload,
  updateReferenceInPlace,
  deleteReferenceFromList,
  addSnippetToReference,
  updateSnippetInReference,
  removeSnippetFromReference,
  addFileToReference,
  removeFileFromReference,
  formatBytes,
} from './referenceLifecycle';
import { Reference } from '../types/reference';

describe('Ciclo de Vida de Referências (referenceLifecycle)', () => {
  describe('Validação e Formatação de URLs', () => {
    it('deve aceitar e formatar uma URL válida sem protocolo', () => {
      const res = validateAndFormatUrl('linear.app');
      expect(res.isValid).toBe(true);
      expect(res.formattedUrl).toBe('https://linear.app/');
      expect(res.domain).toBe('linear.app');
      expect(res.error).toBeUndefined();
    });

    it('deve aceitar uma URL completa com HTTPS e www', () => {
      const res = validateAndFormatUrl('https://www.stripe.com/docs');
      expect(res.isValid).toBe(true);
      expect(res.domain).toBe('stripe.com');
      expect(res.formattedUrl).toBe('https://www.stripe.com/docs');
    });

    it('deve rejeitar uma string vazia com mensagem amigável', () => {
      const res = validateAndFormatUrl('   ');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Por favor, informe a URL do website.');
    });

    it('deve rejeitar domínios inválidos sem ponto ou formato reconhecível', () => {
      const res = validateAndFormatUrl('nao-eh-uma-url');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('URL inválida');
    });

    it('deve rejeitar protocolos não suportados (ex: ftp ou javascript)', () => {
      const res = validateAndFormatUrl('ftp://servidor.com/arquivo');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Apenas endereços HTTP ou HTTPS');
    });
  });

  describe('Detecção de URLs Duplicadas', () => {
    const existing = [
      'https://linear.app/',
      'https://stripe.com',
      'https://apple.com/design',
    ];

    it('deve detectar duplicata exata', () => {
      expect(checkDuplicateUrl('https://linear.app/', existing)).toBe(true);
    });

    it('deve detectar duplicata ignorando www e barra final', () => {
      expect(checkDuplicateUrl('http://www.linear.app', existing)).toBe(true);
      expect(checkDuplicateUrl('linear.app', existing)).toBe(true);
      expect(checkDuplicateUrl('https://stripe.com/', existing)).toBe(true);
    });

    it('deve retornar falso para URLs novas e não cadastradas', () => {
      expect(checkDuplicateUrl('https://github.com', existing)).toBe(false);
      expect(checkDuplicateUrl('https://raycast.com', existing)).toBe(false);
    });

    it('deve preservar parâmetros de consulta e fragmentos, não considerando URLs com parâmetros ou âncoras diferentes como duplicatas', () => {
      const parameterized = [
        'https://linear.app/docs?page=1',
        'https://linear.app/features#pricing',
      ];

      // Parâmetro de busca diferente deve ser tratado como página distinta
      expect(checkDuplicateUrl('https://linear.app/docs?page=2', parameterized)).toBe(false);
      expect(checkDuplicateUrl('https://linear.app/docs?page=1', parameterized)).toBe(true);

      // Fragmento/âncora diferente deve ser tratado como seção distinta
      expect(checkDuplicateUrl('https://linear.app/features#faq', parameterized)).toBe(false);
      expect(checkDuplicateUrl('https://linear.app/features#pricing', parameterized)).toBe(true);
    });
  });

  describe('Criação de Referência a partir de Payload', () => {
    it('deve criar uma referência válida baseada em URL com valores padrão', () => {
      const ref = createReferenceFromPayload({
        url: 'https://linear.app',
      });

      expect(ref.id).toBeDefined();
      expect(ref.url).toBe('https://linear.app');
      expect(ref.domain).toBe('linear.app');
      expect(ref.sourceType).toBe('url');
      expect(ref.title).toBe('Linear.app — Referência Web');
      expect(ref.tags).toContain('referencia');
      expect(ref.createdAt).toBeDefined();
      expect(ref.updatedAt).toBe(ref.createdAt);
    });

    it('deve criar uma referência com associações a projetos e coleções', () => {
      const ref = createReferenceFromPayload({
        url: 'https://cosmos.so',
        title: 'Cosmos Inspiration',
        tags: ['moodboard', 'design'],
        projectIds: ['proj-1'],
        collectionIds: ['col-1', 'col-2'],
      });

      expect(ref.title).toBe('Cosmos Inspiration');
      expect(ref.projectIds).toEqual(['proj-1']);
      expect(ref.collectionIds).toEqual(['col-1', 'col-2']);
      expect(ref.tags).toEqual(['moodboard', 'design']);
    });

    it('deve derivar sourceType híbrido "both" quando houver URL e imagem', () => {
      const ref = createReferenceFromPayload({
        url: 'https://framer.com',
        screenshotUrl: 'blob:http://localhost/sample-blob',
        imageStorageId: 'img-123',
      });

      expect(ref.sourceType).toBe('both');
      expect(ref.screenshotStatus).toBe('ready');
    });
  });

  describe('Edição e Preservação de Dados (updateReferenceInPlace)', () => {
    const baseRef: Reference = {
      id: 'ref-original-id',
      title: 'Título Original',
      url: 'https://antigo.com',
      domain: 'antigo.com',
      sourceType: 'url',
      screenshotStatus: 'none',
      tags: ['antiga'],
      projectIds: ['p-1'],
      collectionIds: [],
      notesMarkdown: 'Nota antiga',
      codeSnippets: [],
      relatedFiles: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    it('deve atualizar campos preservando rigorosamente id e createdAt', () => {
      const updated = updateReferenceInPlace(baseRef, {
        title: 'Título Novo',
        notesMarkdown: 'Nota atualizada',
        tags: ['nova-tag'],
      });

      expect(updated.id).toBe(baseRef.id);
      expect(updated.createdAt).toBe(baseRef.createdAt);
      expect(updated.title).toBe('Título Novo');
      expect(updated.notesMarkdown).toBe('Nota atualizada');
      expect(updated.tags).toEqual(['nova-tag']);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(baseRef.updatedAt).getTime()
      );
    });

    it('deve recalcular domínio quando a URL for editada', () => {
      const updated = updateReferenceInPlace(baseRef, {
        url: 'https://novo-destino.org/sobre',
      });

      expect(updated.domain).toBe('novo-destino.org');
      expect(updated.url).toBe('https://novo-destino.org/sobre');
    });
  });

  describe('Exclusão de Referências (deleteReferenceFromList)', () => {
    const list: Reference[] = [
      {
        id: 'ref-1',
        title: 'Item 1',
        tags: [],
        projectIds: ['p-1'],
        collectionIds: [],
        screenshotStatus: 'none',
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'ref-2',
        title: 'Item 2',
        tags: [],
        projectIds: ['p-1'],
        collectionIds: [],
        screenshotStatus: 'none',
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    it('deve remover apenas o item indicado mantendo os demais intactos', () => {
      const result = deleteReferenceFromList(list, 'ref-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('ref-2');
    });

    it('não deve alterar a lista se o ID não existir', () => {
      const result = deleteReferenceFromList(list, 'ref-inexistente');
      expect(result).toHaveLength(2);
    });
  });

  describe('Gerenciamento de Snippets e Arquivos Anexados', () => {
    const baseRef: Reference = {
      id: 'ref-code',
      title: 'Ref com Código',
      tags: [],
      projectIds: [],
      collectionIds: [],
      screenshotStatus: 'none',
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    it('deve adicionar e depois remover um snippet de código', () => {
      const withSnippet = addSnippetToReference(baseRef, {
        title: 'Tailwind Button',
        language: 'tailwind',
        code: 'px-4 py-2 bg-black text-white rounded',
      });

      expect(withSnippet.codeSnippets).toHaveLength(1);
      const snippetId = withSnippet.codeSnippets[0].id;
      expect(withSnippet.codeSnippets[0].title).toBe('Tailwind Button');

      const removed = removeSnippetFromReference(withSnippet, snippetId);
      expect(removed.codeSnippets).toHaveLength(0);
    });

    it('deve atualizar o conteúdo e linguagem de um trecho de código existente', () => {
      const withSnippet = addSnippetToReference(baseRef, {
        id: 'snip-edit-test',
        title: 'Botão Antigo',
        language: 'css',
        code: '.btn { color: red; }',
      });

      const updated = updateSnippetInReference(withSnippet, {
        id: 'snip-edit-test',
        title: 'Botão Moderno',
        language: 'tailwind',
        code: 'text-white bg-blue-600',
      });

      expect(updated.codeSnippets).toHaveLength(1);
      expect(updated.codeSnippets[0].title).toBe('Botão Moderno');
      expect(updated.codeSnippets[0].language).toBe('tailwind');
      expect(updated.codeSnippets[0].code).toBe('text-white bg-blue-600');
    });

    it('deve adicionar e remover arquivos anexados', () => {
      const withFile = addFileToReference(baseRef, {
        id: 'file-1',
        name: 'spec.json',
        type: 'application/json',
        size: '1.2 KB',
      });

      expect(withFile.relatedFiles).toHaveLength(1);
      expect(withFile.relatedFiles[0].name).toBe('spec.json');

      const removed = removeFileFromReference(withFile, 'file-1');
      expect(removed.relatedFiles).toHaveLength(0);
    });

    it('deve formatar bytes corretamente', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(2048)).toBe('2.0 KB');
      expect(formatBytes(15 * 1024 * 1024)).toBe('15.0 MB');
    });
  });

  describe('Fluxo Completo de Ciclo de Vida da Fase 4', () => {
    it('deve capturar com payload rico, alertar duplicata, permitir cópia, editar in-place e excluir limpando referências sem apagar projetos', () => {
      // 1. Setup mock projects
      const projects = [
        { id: 'proj-design', name: 'Design System', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      ];
      const collections = [
        { id: 'col-inspiration', name: 'Inspiração 2026', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      ];

      // 2. Validate URL and create initial reference
      const urlValidation = validateAndFormatUrl('linear.app/features');
      expect(urlValidation.isValid).toBe(true);

      const ref1 = createReferenceFromPayload({
        url: urlValidation.formattedUrl,
        title: 'Linear Features',
        tags: ['minimalismo', 'dark-mode'],
        projectIds: [projects[0].id],
        collectionIds: [collections[0].id],
        codeSnippets: [
          {
            id: 'snip-1',
            title: 'Grid Spec',
            language: 'css',
            code: 'display: grid; gap: 1rem;',
          },
        ],
        relatedFiles: [
          {
            id: 'file-doc',
            name: 'briefing.pdf',
            type: 'application/pdf',
            size: '340 KB',
          },
        ],
      });

      let library = [ref1];
      expect(library).toHaveLength(1);
      expect(library[0].projectIds).toContain('proj-design');
      expect(library[0].codeSnippets).toHaveLength(1);
      expect(library[0].relatedFiles).toHaveLength(1);

      // 3. Attempting to add duplicate URL
      const isDup = checkDuplicateUrl('https://linear.app/features/', library.map((r) => r.url || ''));
      expect(isDup).toBe(true);

      // 4. User chooses "Salvar como cópia independente"
      const ref2 = createReferenceFromPayload({
        url: 'https://linear.app/features/',
        title: 'Linear Features (Cópia Independente)',
        tags: ['copia'],
      });
      library = [ref2, ...library];
      expect(library).toHaveLength(2);
      expect(ref1.id).not.toBe(ref2.id);

      // 5. In-place edition of ref1
      const updatedRef1 = updateReferenceInPlace(ref1, {
        title: 'Linear Features v2 (Atualizado)',
        notesMarkdown: 'Nova anotação técnica pós-revisão.',
        tags: ['minimalismo', 'atualizado'],
      });

      // ID and creation date strictly preserved
      expect(updatedRef1.id).toBe(ref1.id);
      expect(updatedRef1.createdAt).toBe(ref1.createdAt);
      expect(updatedRef1.title).toBe('Linear Features v2 (Atualizado)');
      expect(updatedRef1.tags).toEqual(['minimalismo', 'atualizado']);

      // Update in library
      library = library.map((r) => (r.id === updatedRef1.id ? updatedRef1 : r));

      // 6. Deletion of ref1
      library = deleteReferenceFromList(library, updatedRef1.id);
      expect(library).toHaveLength(1);
      expect(library[0].id).toBe(ref2.id);

      // Verify that projects and collections entities were NOT mutated/deleted
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('proj-design');
      expect(collections).toHaveLength(1);
      expect(collections[0].id).toBe('col-inspiration');
    });
  });
});
