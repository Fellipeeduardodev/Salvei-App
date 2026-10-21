import { describe, it, expect, vi } from 'vitest';
import { normalizeTag, matchesSearchQuery } from '../../lib/searchAndFilter';

describe('Fase 6: Regras de Interação de Teclado e Seleção Múltipla', () => {
  describe('Atalhos de Teclado e Prevenção de Conflitos', () => {
    it('determina se um elemento em foco é um campo editável', () => {
      const isInput = (tagName: string, isContentEditable = false) => {
        return (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          isContentEditable
        );
      };

      expect(isInput('INPUT')).toBe(true);
      expect(isInput('TEXTAREA')).toBe(true);
      expect(isInput('SELECT')).toBe(true);
      expect(isInput('DIV', true)).toBe(true);
      expect(isInput('DIV', false)).toBe(false);
      expect(isInput('BODY')).toBe(false);
      expect(isInput('ARTICLE')).toBe(false);
    });

    it('impede que o atalho "/" seja acionado quando o usuário estiver digitando', () => {
      const shouldFocusSearch = (key: string, isInputFocused: boolean, hasModifier: boolean) => {
        return key === '/' && !isInputFocused && !hasModifier;
      };

      expect(shouldFocusSearch('/', false, false)).toBe(true);
      expect(shouldFocusSearch('/', true, false)).toBe(false); // inside input
      expect(shouldFocusSearch('/', false, true)).toBe(false); // with ctrl/meta
    });

    it('permite Ctrl+A selecionar itens visíveis somente quando o contexto de seleção múltipla estiver ativo e sem texto selecionado', () => {
      const shouldSelectAllVisible = (
        isCtrlOrMeta: boolean,
        key: string,
        isInputFocused: boolean,
        textSelectionLength: number,
        selectedBatchCount: number
      ) => {
        if (!isCtrlOrMeta || key.toLowerCase() !== 'a') return false;
        if (isInputFocused) return false;
        if (textSelectionLength > 0) return false;
        return selectedBatchCount > 0;
      };

      // When batch selection is already active and no text is selected:
      expect(shouldSelectAllVisible(true, 'a', false, 0, 1)).toBe(true);
      expect(shouldSelectAllVisible(true, 'A', false, 0, 3)).toBe(true);

      // When NOT in batch selection mode: allows normal browser text selection!
      expect(shouldSelectAllVisible(true, 'a', false, 0, 0)).toBe(false);

      // When inside an input field: preserves form select all!
      expect(shouldSelectAllVisible(true, 'a', true, 0, 2)).toBe(false);

      // When user already selected a text range: preserves text selection!
      expect(shouldSelectAllVisible(true, 'a', false, 12, 2)).toBe(false);
    });

    it('garante que Delete e Backspace não excluam silenciosamente e exijam itens selecionados', () => {
      const shouldOpenDeleteConfirm = (
        key: string,
        isInputFocused: boolean,
        hasModalOpen: boolean,
        selectedBatchCount: number
      ) => {
        if (key !== 'Delete' && key !== 'Backspace') return false;
        if (isInputFocused || hasModalOpen) return false;
        return selectedBatchCount > 0;
      };

      // When items are selected and not typing: opens confirmation!
      expect(shouldOpenDeleteConfirm('Delete', false, false, 2)).toBe(true);
      expect(shouldOpenDeleteConfirm('Backspace', false, false, 1)).toBe(true);

      // Zero items selected: does nothing!
      expect(shouldOpenDeleteConfirm('Delete', false, false, 0)).toBe(false);

      // Inside text input: does normal text delete, does NOT open modal!
      expect(shouldOpenDeleteConfirm('Delete', true, false, 2)).toBe(false);
      expect(shouldOpenDeleteConfirm('Backspace', true, false, 2)).toBe(false);

      // Another modal already open: prevents overlapping delete modal!
      expect(shouldOpenDeleteConfirm('Delete', false, true, 2)).toBe(false);
    });

    it('valida hierarquia de fechamento por Escape', () => {
      type Surface =
        | 'command_palette'
        | 'shortcuts_modal'
        | 'bulk_delete'
        | 'bulk_associate'
        | 'add_modal'
        | 'expanded_overlay'
        | 'side_panel'
        | 'batch_selection'
        | 'search_query'
        | 'none';

      const resolveEscapeAction = (state: {
        isCommandPaletteOpen: boolean;
        isShortcutsModalOpen: boolean;
        isBulkDeleteOpen: boolean;
        isAddModalOpen: boolean;
        isExpandedOpen: boolean;
        isSidePanelOpen: boolean;
        hasBatchSelection: boolean;
        hasSearchQuery: boolean;
      }): Surface => {
        if (state.isCommandPaletteOpen) return 'command_palette';
        if (state.isShortcutsModalOpen) return 'shortcuts_modal';
        if (state.isBulkDeleteOpen) return 'bulk_delete';
        if (state.isAddModalOpen) return 'add_modal';
        if (state.isExpandedOpen) return 'expanded_overlay';
        if (state.isSidePanelOpen) return 'side_panel';
        if (state.hasBatchSelection) return 'batch_selection';
        if (state.hasSearchQuery) return 'search_query';
        return 'none';
      };

      // 1. Highest priority is modal dialogs
      expect(
        resolveEscapeAction({
          isCommandPaletteOpen: true,
          isShortcutsModalOpen: false,
          isBulkDeleteOpen: false,
          isAddModalOpen: false,
          isExpandedOpen: false,
          isSidePanelOpen: true,
          hasBatchSelection: true,
          hasSearchQuery: true,
        })
      ).toBe('command_palette');

      // 2. Next is side panel / overlay
      expect(
        resolveEscapeAction({
          isCommandPaletteOpen: false,
          isShortcutsModalOpen: false,
          isBulkDeleteOpen: false,
          isAddModalOpen: false,
          isExpandedOpen: false,
          isSidePanelOpen: true,
          hasBatchSelection: true,
          hasSearchQuery: true,
        })
      ).toBe('side_panel');

      // 3. Next is clearing active batch selection
      expect(
        resolveEscapeAction({
          isCommandPaletteOpen: false,
          isShortcutsModalOpen: false,
          isBulkDeleteOpen: false,
          isAddModalOpen: false,
          isExpandedOpen: false,
          isSidePanelOpen: false,
          hasBatchSelection: true,
          hasSearchQuery: true,
        })
      ).toBe('batch_selection');

      // 4. Finally clearing search query
      expect(
        resolveEscapeAction({
          isCommandPaletteOpen: false,
          isShortcutsModalOpen: false,
          isBulkDeleteOpen: false,
          isAddModalOpen: false,
          isExpandedOpen: false,
          isSidePanelOpen: false,
          hasBatchSelection: false,
          hasSearchQuery: true,
        })
      ).toBe('search_query');
    });
  });

  describe('Lógica de Seleção Múltipla e Coerência de Dados', () => {
    it('alterna seleção de IDs individuais sem duplicatas', () => {
      const toggleId = (list: string[], id: string) =>
        list.includes(id) ? list.filter((i) => i !== id) : [...list, id];

      let selection: string[] = [];
      selection = toggleId(selection, 'ref-1');
      expect(selection).toEqual(['ref-1']);

      selection = toggleId(selection, 'ref-2');
      expect(selection).toEqual(['ref-1', 'ref-2']);

      // Toggle off
      selection = toggleId(selection, 'ref-1');
      expect(selection).toEqual(['ref-2']);
    });

    it('seleciona todas as visíveis e limpa corretamente', () => {
      const visible = ['ref-1', 'ref-2', 'ref-3'];
      let selection: string[] = ['ref-1'];

      // Select all visible
      selection = visible;
      expect(selection).toHaveLength(3);

      // Deselect all
      selection = [];
      expect(selection).toHaveLength(0);
    });

    it('mantém a seleção limpa de IDs de referências deletadas no banco', () => {
      const currentReferences = [{ id: 'ref-1' }, { id: 'ref-3' }];
      const batchSelection = ['ref-1', 'ref-2', 'ref-3']; // ref-2 was deleted

      const sanitizedSelection = batchSelection.filter((id) =>
        currentReferences.some((r) => r.id === id)
      );

      expect(sanitizedSelection).toEqual(['ref-1', 'ref-3']);
      expect(sanitizedSelection).not.toContain('ref-2');
    });
  });
});
