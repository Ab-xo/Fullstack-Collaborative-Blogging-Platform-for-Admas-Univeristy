/**
 * Table Resize Handler Utility
 * Handles column resizing for tables in the editor
 */

const MIN_COLUMN_WIDTH = 50; // Minimum column width in pixels
const RESIZE_HANDLE_TOLERANCE = 5; // Pixels from edge to detect resize handle

/**
 * Detect if mouse is over a resize handle (column edge)
 * @param {MouseEvent} e - Mouse event
 * @param {HTMLTableElement} table - Table element
 * @returns {{columnIndex: number, handle: 'left'|'right'}|null}
 */
export function detectResizeHandle(e, table) {
  const target = e.target;
  
  // Check if target is a cell
  if (!target || (target.tagName !== 'TD' && target.tagName !== 'TH')) {
    return null;
  }
  
  const rect = target.getBoundingClientRect();
  const mouseX = e.clientX;
  
  // Check right edge
  if (Math.abs(mouseX - rect.right) <= RESIZE_HANDLE_TOLERANCE) {
    const columnIndex = Array.from(target.parentElement.children).indexOf(target);
    return { columnIndex, handle: 'right' };
  }
  
  // Check left edge (only if not the first column)
  if (Math.abs(mouseX - rect.left) <= RESIZE_HANDLE_TOLERANCE) {
    const columnIndex = Array.from(target.parentElement.children).indexOf(target);
    if (columnIndex > 0) {
      return { columnIndex: columnIndex - 1, handle: 'right' };
    }
  }
  
  return null;
}

/**
 * Get all cells in a column
 * @param {HTMLTableElement} table - Table element
 * @param {number} columnIndex - Column index
 * @returns {HTMLTableCellElement[]}
 */
function getColumnCells(table, columnIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  return rows
    .map(row => row.children[columnIndex])
    .filter(cell => cell !== undefined);
}

/**
 * Get current column widths
 * @param {HTMLTableElement} table - Table element
 * @returns {number[]}
 */
function getColumnWidths(table) {
  const firstRow = table.querySelector('tr');
  if (!firstRow) return [];
  
  return Array.from(firstRow.children).map(cell => {
    return cell.getBoundingClientRect().width;
  });
}

/**
 * Start resize operation
 * @param {HTMLTableElement} table - Table element
 * @param {number} columnIndex - Index of column being resized
 * @param {number} startX - Starting X position
 * @returns {Object} Resize state
 */
export function startResize(table, columnIndex, startX) {
  const widths = getColumnWidths(table);
  
  return {
    isResizing: true,
    table,
    columnIndex,
    startX,
    startWidths: widths,
    currentWidths: [...widths]
  };
}

/**
 * Update resize operation
 * @param {Object} state - Resize state
 * @param {number} currentX - Current X position
 */
export function updateResize(state, currentX) {
  if (!state.isResizing || !state.table) return;
  
  const delta = currentX - state.startX;
  const { columnIndex, startWidths } = state;
  
  // Calculate new width for the resized column
  let newWidth = startWidths[columnIndex] + delta;
  
  // Apply minimum width constraint
  if (newWidth < MIN_COLUMN_WIDTH) {
    newWidth = MIN_COLUMN_WIDTH;
  }
  
  // Calculate the actual delta after constraint
  const actualDelta = newWidth - startWidths[columnIndex];
  
  // Get the next column index
  const nextColumnIndex = columnIndex + 1;
  
  // If there's a next column, adjust it proportionally
  if (nextColumnIndex < startWidths.length) {
    let nextColumnWidth = startWidths[nextColumnIndex] - actualDelta;
    
    // Ensure next column doesn't go below minimum
    if (nextColumnWidth < MIN_COLUMN_WIDTH) {
      nextColumnWidth = MIN_COLUMN_WIDTH;
      newWidth = startWidths[columnIndex] + (startWidths[nextColumnIndex] - MIN_COLUMN_WIDTH);
    }
    
    // Apply widths
    applyColumnWidth(state.table, columnIndex, newWidth);
    applyColumnWidth(state.table, nextColumnIndex, nextColumnWidth);
    
    // Update current widths
    state.currentWidths[columnIndex] = newWidth;
    state.currentWidths[nextColumnIndex] = nextColumnWidth;
  } else {
    // Last column - just resize it
    applyColumnWidth(state.table, columnIndex, newWidth);
    state.currentWidths[columnIndex] = newWidth;
  }
}

/**
 * Apply width to a column
 * @param {HTMLTableElement} table - Table element
 * @param {number} columnIndex - Column index
 * @param {number} width - Width in pixels
 */
function applyColumnWidth(table, columnIndex, width) {
  const cells = getColumnCells(table, columnIndex);
  cells.forEach(cell => {
    cell.style.width = `${width}px`;
    cell.style.minWidth = `${width}px`;
    cell.style.maxWidth = `${width}px`;
  });
}

/**
 * End resize operation
 * @param {Object} state - Resize state
 */
export function endResize(state) {
  if (!state.isResizing) return;
  
  // Finalize the resize - widths are already applied
  state.isResizing = false;
}

/**
 * Check if cursor should show resize indicator
 * @param {MouseEvent} e - Mouse event
 * @param {HTMLTableElement} table - Table element
 * @returns {boolean}
 */
export function shouldShowResizeCursor(e, table) {
  return detectResizeHandle(e, table) !== null;
}

/**
 * Get resize cursor style
 * @returns {string}
 */
export function getResizeCursor() {
  return 'col-resize';
}
