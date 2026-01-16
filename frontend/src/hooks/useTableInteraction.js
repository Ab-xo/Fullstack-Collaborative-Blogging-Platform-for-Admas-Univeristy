import { useState, useCallback, useEffect } from "react";
import {
  detectResizeHandle,
  startResize,
  updateResize,
  endResize,
  shouldShowResizeCursor,
  getResizeCursor,
} from "../utils/tableResizeHandler";
import { canMergeCells } from "../utils/tableOperations";

/**
 * Hook for managing table interactions (resize, selection, keyboard navigation)
 */
export function useTableInteraction(editorRef) {
  const [state, setState] = useState({
    activeTable: null,
    selectedCells: [],
    resizingColumn: null,
    hoveredCell: null,
    contextMenu: {
      isOpen: false,
      position: { x: 0, y: 0 },
      targetCell: null,
    },
  });

  /**
   * Get table element from any child element
   */
  const getTableFromElement = useCallback((element) => {
    let current = element;
    while (current && current.tagName !== "TABLE") {
      current = current.parentElement;
      if (current === editorRef.current) return null;
    }
    return current;
  }, [editorRef]);

  /**
   * Handle mouse down - start resize or cell selection
   */
  const handleMouseDown = useCallback(
    (e) => {
      const target = e.target;
      if (!target) return;

      // Check if clicking on a table cell
      if (target.tagName === "TD" || target.tagName === "TH") {
        const table = getTableFromElement(target);
        if (!table) return;

        // Check for resize handle
        const resizeHandle = detectResizeHandle(e, table);
        if (resizeHandle) {
          e.preventDefault();
          const resizeState = startResize(
            table,
            resizeHandle.columnIndex,
            e.clientX
          );
          setState((prev) => ({
            ...prev,
            resizingColumn: resizeState,
            activeTable: table,
          }));
          return;
        }

        // Cell selection
        setState((prev) => ({
          ...prev,
          activeTable: table,
          selectedCells: [target],
          hoveredCell: target,
        }));
      }
    },
    [getTableFromElement]
  );

  /**
   * Handle mouse move - update resize or show resize cursor
   */
  const handleMouseMove = useCallback(
    (e) => {
      // Handle active resize
      if (state.resizingColumn) {
        updateResize(state.resizingColumn, e.clientX);
        return;
      }

      // Update cursor for resize handles
      const target = e.target;
      if (target && (target.tagName === "TD" || target.tagName === "TH")) {
        const table = getTableFromElement(target);
        if (table && shouldShowResizeCursor(e, table)) {
          editorRef.current.style.cursor = getResizeCursor();
        } else {
          editorRef.current.style.cursor = "";
        }

        // Update hovered cell
        setState((prev) => ({
          ...prev,
          hoveredCell: target,
        }));
      } else {
        editorRef.current.style.cursor = "";
        setState((prev) => ({
          ...prev,
          hoveredCell: null,
        }));
      }
    },
    [state.resizingColumn, getTableFromElement, editorRef]
  );

  /**
   * Handle mouse up - end resize
   */
  const handleMouseUp = useCallback(() => {
    if (state.resizingColumn) {
      endResize(state.resizingColumn);
      setState((prev) => ({
        ...prev,
        resizingColumn: null,
      }));
    }
  }, [state.resizingColumn]);

  /**
   * Handle context menu (right-click)
   */
  const handleContextMenu = useCallback(
    (e) => {
      const target = e.target;
      if (!target || (target.tagName !== "TD" && target.tagName !== "TH")) {
        return;
      }

      const table = getTableFromElement(target);
      if (!table) return;

      e.preventDefault();
      e.stopPropagation();

      setState((prev) => ({
        ...prev,
        activeTable: table,
        contextMenu: {
          isOpen: true,
          position: { x: e.clientX, y: e.clientY },
          targetCell: target,
        },
        selectedCells: prev.selectedCells.includes(target)
          ? prev.selectedCells
          : [target],
      }));
    },
    [getTableFromElement]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e) => {
      const target = e.target;
      if (!target || (target.tagName !== "TD" && target.tagName !== "TH")) {
        return;
      }

      const table = getTableFromElement(target);
      if (!table) return;

      const row = target.parentElement;
      const rowIndex = Array.from(row.parentElement.children).indexOf(row);
      const cellIndex = Array.from(row.children).indexOf(target);

      // Tab - move to next cell
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        const nextCell = row.children[cellIndex + 1];
        if (nextCell) {
          nextCell.focus();
        } else {
          // Move to first cell of next row
          const nextRow = row.parentElement.children[rowIndex + 1];
          if (nextRow) {
            nextRow.children[0]?.focus();
          } else {
            // Last cell - create new row (handled in parent component)
            const event = new CustomEvent("tableTabOnLastCell", {
              detail: { table, cell: target },
            });
            editorRef.current?.dispatchEvent(event);
          }
        }
      }

      // Shift+Tab - move to previous cell
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        const prevCell = row.children[cellIndex - 1];
        if (prevCell) {
          prevCell.focus();
        } else {
          // Move to last cell of previous row
          const prevRow = row.parentElement.children[rowIndex - 1];
          if (prevRow) {
            const lastCell = prevRow.children[prevRow.children.length - 1];
            lastCell?.focus();
          } else {
            // First cell - move focus out of table
            editorRef.current?.focus();
          }
        }
      }

      // Enter - create new line within cell (default behavior, just track it)
      if (e.key === "Enter") {
        // Allow default behavior (creates <br> or new paragraph)
      }
    },
    [getTableFromElement, editorRef]
  );

  /**
   * Close context menu
   */
  const closeContextMenu = useCallback(() => {
    setState((prev) => ({
      ...prev,
      contextMenu: {
        isOpen: false,
        position: { x: 0, y: 0 },
        targetCell: null,
      },
    }));
  }, []);

  /**
   * Select a cell
   */
  const selectCell = useCallback((cell) => {
    setState((prev) => ({
      ...prev,
      selectedCells: [cell],
    }));
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCells: [],
      hoveredCell: null,
    }));
  }, []);

  /**
   * Check if selected cells can be merged
   */
  const canMerge = canMergeCells(state.selectedCells);

  // Attach global mouse up listener for resize
  useEffect(() => {
    if (state.resizingColumn) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [state.resizingColumn, handleMouseUp, handleMouseMove]);

  return {
    state: {
      ...state,
      canMerge,
    },
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onContextMenu: handleContextMenu,
      onKeyDown: handleKeyDown,
    },
    actions: {
      selectCell,
      clearSelection,
      closeContextMenu,
    },
  };
}
