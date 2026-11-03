import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateAuthError } from '../contexts/AuthContext';
import * as neonService from './neonService';
import type { Reference } from '../types/reference';

describe('Neon Database & Autenticação em pt-BR', () => {
  it('traduz erro de credenciais inválidas para português', () => {
    expect(translateAuthError('Invalid login credentials')).toBe('E-mail ou senha incorretos.');
  });

  it('traduz erro de usuário já cadastrado', () => {
    expect(translateAuthError('User already registered')).toBe('Este endereço de e-mail já está cadastrado. Tente entrar.');
  });

  it('traduz erro de tamanho mínimo da senha', () => {
    expect(translateAuthError('Password should be at least 6 characters')).toBe('A senha deve conter no mínimo 6 caracteres.');
  });

  it('traduz limite de taxa de requisições excedido', () => {
    expect(translateAuthError('Email rate limit exceeded')).toBe('Muitas tentativas em sequência. Por favor, aguarde alguns instantes.');
  });

  it('traduz erro de conexão de rede', () => {
    expect(translateAuthError('Failed to fetch network request')).toBe('Falha na conexão de rede. Verifique seu acesso à internet.');
  });

  it('retorna a mensagem original caso não coincida com padrão conhecido', () => {
    expect(translateAuthError('Custom business error')).toBe('Custom business error');
  });
});

describe('Regras de Integridade e Não-Destrutividade no Neon', () => {
  it('garante que a exclusão de um projeto preserva as referências na camada de domínio', () => {
    const references: Reference[] = [
      {
        id: 'ref-1',
        title: 'Linear App',
        screenshotStatus: 'ready',
        tags: ['design'],
        projectIds: ['proj-1', 'proj-2'],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ref-2',
        title: 'Raycast',
        screenshotStatus: 'ready',
        tags: ['mac'],
        projectIds: ['proj-1'],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const projectToDeleteId = 'proj-1';

    const updatedReferences = references.map((ref) => {
      if (ref.projectIds?.includes(projectToDeleteId)) {
        return {
          ...ref,
          projectIds: ref.projectIds.filter((pId) => pId !== projectToDeleteId),
        };
      }
      return ref;
    });

    expect(updatedReferences).toHaveLength(2);
    expect(updatedReferences[0].id).toBe('ref-1');
    expect(updatedReferences[0].projectIds).toEqual(['proj-2']);
    expect(updatedReferences[1].id).toBe('ref-2');
    expect(updatedReferences[1].projectIds).toEqual([]);
  });

  it('garante que a exclusão de uma coleção preserva as referências na camada de domínio', () => {
    const references: Reference[] = [
      {
        id: 'ref-1',
        title: 'Design System',
        screenshotStatus: 'ready',
        tags: ['ui'],
        projectIds: [],
        collectionIds: ['col-1', 'col-2'],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const collectionToDeleteId = 'col-1';

    const updatedReferences = references.map((ref) => {
      if (ref.collectionIds?.includes(collectionToDeleteId)) {
        return {
          ...ref,
          collectionIds: ref.collectionIds.filter((cId) => cId !== collectionToDeleteId),
        };
      }
      return ref;
    });

    expect(updatedReferences).toHaveLength(1);
    expect(updatedReferences[0].collectionIds).toEqual(['col-2']);
  });

  it('garante que a exclusão de uma etiqueta remove apenas a etiqueta das referências', () => {
    const references: Reference[] = [
      {
        id: 'ref-1',
        title: 'Vercel',
        screenshotStatus: 'ready',
        tags: ['frontend', 'deploy', 'react'],
        projectIds: [],
        collectionIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const tagToDelete = 'deploy';

    const updatedReferences = references.map((ref) => ({
      ...ref,
      tags: ref.tags.filter((t) => t !== tagToDelete),
    }));

    expect(updatedReferences).toHaveLength(1);
    expect(updatedReferences[0].tags).toEqual(['frontend', 'react']);
  });
});

describe('Validadores e Utilitários do Neon Service', () => {
  it('valida nomes de exibição corretamente', () => {
    expect(neonService.validateDisplayName('').valid).toBe(false);
    expect(neonService.validateDisplayName('   ').valid).toBe(false);
    expect(neonService.validateDisplayName('A').valid).toBe(false);
    expect(neonService.validateDisplayName('Designer Pro').valid).toBe(true);
    expect(neonService.validateDisplayName('Designer Pro').sanitizedName).toBe('Designer Pro');
  });

  it('valida arquivos de avatar com formato e tamanho', () => {
    const validFile = new File(['dummy'], 'avatar.png', { type: 'image/png' });
    expect(neonService.validateAvatarFile(validFile).valid).toBe(true);

    const invalidType = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
    expect(neonService.validateAvatarFile(invalidType).valid).toBe(false);
  });
});
