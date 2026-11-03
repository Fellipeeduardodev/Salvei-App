import { useState, useEffect, useCallback } from 'react';

interface UseGridKeyboardNavOptions {
  /** Total number of items in the visible grid */
  totalItems: number;
  /** Whether the command palette is currently open (disables nav when true) */
  isCommandPaletteOpen?: boolean;
  /** Called when the user presses F on a focused card */
  onToggleFavorite?: (index: number) => void;
  /** Called when the user presses C on a focused card */
  onCopyUrl?: (index: number) => void;
  /** Called when the user presses E on a focused card */
  onQuickEdit?: (index: number) => void;
}

interface UseGridKeyboardNavReturn {
  focusedIndex: number;
  setFocusedIndex: (idx: number) => void;
  isQuickLookOpen: boolean;
  openQuickLook: () => void;
  closeQuickLook: () => void;
}

/**
 * useGridKeyboardNav
 * Provides keyboard navigation for a reference grid.
 * Active keys: J/K or ArrowDown/Up (move focus), Space (Quick Look),
 * F (favorite), C (copy URL), E (quick edit), Escape (close / deselect).
 */
export function useGridKeyboardNav({
  totalItems,
  isCommandPaletteOpen = false,
  onToggleFavorite,
  onCopyUrl,
  onQuickEdit,
}: UseGridKeyboardNavOptions): UseGridKeyboardNavReturn {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isQuickLookOpen, setIsQuickLookOpen] = useState(false);

  const openQuickLook = useCallback(() => setIsQuickLookOpen(true), []);
  const closeQuickLook = useCallback(() => setIsQuickLookOpen(false), []);

  // Reset focused index when the list changes significantly (e.g. after filtering)
  useEffect(() => {
    setFocusedIndex((prev) => {
      if (totalItems === 0) return -1;
      if (prev >= totalItems) return totalItems - 1;
      return prev;
    });
  }, [totalItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if the command palette is open
      if (isCommandPaletteOpen) return;

      // Skip when focus is inside an input / editable element
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      // Skip if no items
      if (totalItems === 0) return;

      const isModified = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;

      switch (e.key) {
        // ──────────────────────────────────────────
        // J / ArrowDown → Move focus down
        // ──────────────────────────────────────────
        case 'j':
        case 'J':
        case 'ArrowDown': {
          if (isModified) return;
          e.preventDefault();
          setFocusedIndex((prev) => {
            if (prev < 0) return 0;
            return Math.min(prev + 1, totalItems - 1);
          });
          break;
        }

        // ──────────────────────────────────────────
        // K / ArrowUp → Move focus up
        // ──────────────────────────────────────────
        case 'k':
        case 'K':
        case 'ArrowUp': {
          if (isModified) return;
          e.preventDefault();
          setFocusedIndex((prev) => {
            if (prev < 0) return 0;
            return Math.max(prev - 1, 0);
          });
          break;
        }

        // ──────────────────────────────────────────
        // Space → Open / close Quick Look
        // ──────────────────────────────────────────
        case ' ': {
          if (isModified) return;
          // Only intercept Space when a card is focused
          if (focusedIndex < 0) return;
          e.preventDefault();
          setIsQuickLookOpen((prev) => !prev);
          break;
        }

        // ──────────────────────────────────────────
        // F → Toggle favourite
        // ──────────────────────────────────────────
        case 'f':
        case 'F': {
          if (isModified || focusedIndex < 0) return;
          e.preventDefault();
          onToggleFavorite?.(focusedIndex);
          break;
        }

        // ──────────────────────────────────────────
        // C → Copy URL
        // ──────────────────────────────────────────
        case 'c':
        case 'C': {
          if (isModified || focusedIndex < 0) return;
          e.preventDefault();
          onCopyUrl?.(focusedIndex);
          break;
        }

        // ──────────────────────────────────────────
        // E → Quick Edit
        // ──────────────────────────────────────────
        case 'e':
        case 'E': {
          if (isModified || focusedIndex < 0) return;
          e.preventDefault();
          onQuickEdit?.(focusedIndex);
          break;
        }

        // ──────────────────────────────────────────
        // Escape → Close Quick Look or deselect
        // ──────────────────────────────────────────
        case 'Escape': {
          if (isQuickLookOpen) {
            e.preventDefault();
            setIsQuickLookOpen(false);
            return;
          }
          if (focusedIndex >= 0) {
            e.preventDefault();
            setFocusedIndex(-1);
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    totalItems,
    focusedIndex,
    isQuickLookOpen,
    isCommandPaletteOpen,
    onToggleFavorite,
    onCopyUrl,
    onQuickEdit,
  ]);

  return {
    focusedIndex,
    setFocusedIndex,
    isQuickLookOpen,
    openQuickLook,
    closeQuickLook,
  };
}
