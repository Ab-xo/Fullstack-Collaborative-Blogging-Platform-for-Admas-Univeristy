/**
 * Table Operations Utility
 * Pure functions for manipulating HTML table elements
 */

/**
 * Get the row index of a cell
 */
function getCellRowIndex(cell) {
  const row = cell.parentElement;
  return Array.from(row.parentElement.children).indexOf(row);
}

/**
 * Get the column index of a cell
 */
function getCellColumnIndex(cell) {
  return Array.from(cell.parentElement.children).indexOf(cell);
}

/**
 * Get the table element from a cell
 */
function getTableFromCell(cell) {
  let element = cell;
  while (element && element.tagName !== 'TABLE') {
    element = element.parentElement;
  }
  return element;
}

/**
 * Insert a new row above the specified row
 * @param {HTMLTableElement} table - The table element
 * @param {number} rowIndex - The index of the row
 */
export function insertRowAbove(table, rowIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rowIndex < 0 || rowIndex >= rows.length) return;

  const targetRow = rows[rowIndex];
  const newRow = document.createElement('tr');
  const columnCount = targetRow.children.length;

  // Create cells for the new row
  for (let i = 0; i < columnCount; i++) {
    const cell = targetRow.children[i].tagName === 'TH' 
      ? document.createElement('th')
      : document.createElement('td');
    
    // Copy styles from the cell below
    const styleAttr = targetRow.children[i].getAttribute('style');
    if (styleAttr) {
      cell.setAttribute('style', styleAttr);
    }
    
    cell.textContent = '';
    newRow.appendChild(cell);
  }

  targetRow.parentElement.insertBefore(newRow, targetRow);
}

/**
 * Insert a new row below the specified row
 * @param {HTMLTableElement} table - The table element
 * @param {number} rowIndex - The index of the row
 */
export function insertRowBelow(table, rowIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rowIndex < 0 || rowIndex >= rows.length) return;

  const targetRow = rows[rowIndex];
  const newRow = document.createElement('tr');
  const columnCount = targetRow.children.length;

  // Create cells for the new row
  for (let i = 0; i < columnCount; i++) {
    const cell = document.createElement('td');
    
    // Copy styles from the cell above
    const styleAttr = targetRow.children[i].getAttribute('style');
    if (styleAttr) {
      cell.setAttribute('style', styleAttr);
    }
    
    cell.textContent = '';
    newRow.appendChild(cell);
  }

  if (targetRow.nextSibling) {
    targetRow.parentElement.insertBefore(newRow, targetRow.nextSibling);
  } else {
    targetRow.parentElement.appendChild(newRow);
  }
}

/**
 * Insert a new column to the left of the specified column
 * @param {HTMLTableElement} table - The table element
 * @param {number} columnIndex - The index of the column
 */
export function insertColumnLeft(table, columnIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  
  rows.forEach((row, rowIdx) => {
    if (columnIndex < 0 || columnIndex >= row.children.length) return;
    
    const targetCell = row.children[columnIndex];
    const newCell = rowIdx === 0 && targetCell.tagName === 'TH'
      ? document.createElement('th')
      : document.createElement('td');
    
    // Copy styles from the cell to the right
    const styleAttr = targetCell.getAttribute('style');
    if (styleAttr) {
      newCell.setAttribute('style', styleAttr);
    }
    
    newCell.textContent = '';
    row.insertBefore(newCell, targetCell);
  });
}

/**
 * Insert a new column to the right of the specified column
 * @param {HTMLTableElement} table - The table element
 * @param {number} columnIndex - The index of the column
 */
export function insertColumnRight(table, columnIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  
  rows.forEach((row, rowIdx) => {
    if (columnIndex < 0 || columnIndex >= row.children.length) return;
    
    const targetCell = row.children[columnIndex];
    const newCell = rowIdx === 0 && targetCell.tagName === 'TH'
      ? document.createElement('th')
      : document.createElement('td');
    
    // Copy styles from the cell to the left
    const styleAttr = targetCell.getAttribute('style');
    if (styleAttr) {
      newCell.setAttribute('style', styleAttr);
    }
    
    newCell.textContent = '';
    
    if (targetCell.nextSibling) {
      row.insertBefore(newCell, targetCell.nextSibling);
    } else {
      row.appendChild(newCell);
    }
  });
}

/**
 * Delete the specified row
 * @param {HTMLTableElement} table - The table element
 * @param {number} rowIndex - The index of the row
 * @returns {boolean} - True if deleted, false if it's the last row
 */
export function deleteRow(table, rowIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  
  // Prevent deletion of the last row
  if (rows.length <= 1) {
    return false;
  }
  
  if (rowIndex < 0 || rowIndex >= rows.length) return false;
  
  rows[rowIndex].remove();
  return true;
}

/**
 * Delete the specified column
 * @param {HTMLTableElement} table - The table element
 * @param {number} columnIndex - The index of the column
 * @returns {boolean} - True if deleted, false if it's the last column
 */
export function deleteColumn(table, columnIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  
  // Check if it's the last column
  if (rows.length > 0 && rows[0].children.length <= 1) {
    return false;
  }
  
  rows.forEach(row => {
    if (columnIndex >= 0 && columnIndex < row.children.length) {
      row.children[columnIndex].remove();
    }
  });
  
  return true;
}

/**
 * Delete the entire table
 * @param {HTMLTableElement} table - The table element
 */
export function deleteTable(table) {
  if (table && table.parentElement) {
    // Check if table is wrapped in resizable-wrapper
    const wrapper = table.parentElement;
    if (wrapper.classList.contains('resizable-wrapper')) {
      // Remove the entire wrapper
      wrapper.remove();
    } else {
      // Just remove the table
      table.remove();
    }
  }
}

/**
 * Check if cells are adjacent (form a contiguous rectangular region)
 * @param {HTMLTableCellElement[]} cells - Array of cells
 * @returns {boolean} - True if cells are adjacent
 */
export function canMergeCells(cells) {
  if (!cells || cells.length < 2) return false;
  
  // Get row and column indices for all cells
  const positions = cells.map(cell => ({
    row: getCellRowIndex(cell),
    col: getCellColumnIndex(cell),
    cell
  }));
  
  // Find bounds
  const minRow = Math.min(...positions.map(p => p.row));
  const maxRow = Math.max(...positions.map(p => p.row));
  const minCol = Math.min(...positions.map(p => p.col));
  const maxCol = Math.max(...positions.map(p => p.col));
  
  // Check if all cells in the rectangular region are selected
  const expectedCount = (maxRow - minRow + 1) * (maxCol - minCol + 1);
  if (cells.length !== expectedCount) return false;
  
  // Verify all positions in the rectangle are present
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const found = positions.some(p => p.row === row && p.col === col);
      if (!found) return false;
    }
  }
  
  return true;
}

/**
 * Merge selected cells into a single cell
 * @param {HTMLTableCellElement[]} cells - Array of cells to merge
 * @returns {boolean} - True if merged successfully
 */
export function mergeCells(cells) {
  if (!canMergeCells(cells)) return false;
  
  // Get positions and bounds
  const positions = cells.map(cell => ({
    row: getCellRowIndex(cell),
    col: getCellColumnIndex(cell),
    cell
  }));
  
  const minRow = Math.min(...positions.map(p => p.row));
  const maxRow = Math.max(...positions.map(p => p.row));
  const minCol = Math.min(...positions.map(p => p.col));
  const maxCol = Math.max(...positions.map(p => p.col));
  
  // Find the top-left cell (anchor cell)
  const anchorCell = positions.find(p => p.row === minRow && p.col === minCol)?.cell;
  if (!anchorCell) return false;
  
  // Collect all content from cells
  const allContent = cells
    .map(cell => cell.textContent.trim())
    .filter(content => content.length > 0)
    .join(' ');
  
  // Set colspan and rowspan on anchor cell
  const rowSpan = maxRow - minRow + 1;
  const colSpan = maxCol - minCol + 1;
  
  if (rowSpan > 1) {
    anchorCell.setAttribute('rowspan', rowSpan);
  }
  if (colSpan > 1) {
    anchorCell.setAttribute('colspan', colSpan);
  }
  
  // Set the combined content
  anchorCell.textContent = allContent;
  
  // Remove all other cells except the anchor
  cells.forEach(cell => {
    if (cell !== anchorCell) {
      cell.remove();
    }
  });
  
  return true;
}

/**
 * Helper function to get cell from table by row and column index
 * @param {HTMLTableElement} table - The table element
 * @param {number} rowIndex - Row index
 * @param {number} colIndex - Column index
 * @returns {HTMLTableCellElement|null}
 */
export function getCellAt(table, rowIndex, colIndex) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rowIndex < 0 || rowIndex >= rows.length) return null;
  
  const row = rows[rowIndex];
  if (colIndex < 0 || colIndex >= row.children.length) return null;
  
  return row.children[colIndex];
}

/**
 * Get table dimensions
 * @param {HTMLTableElement} table - The table element
 * @returns {{rows: number, cols: number}}
 */
export function getTableDimensions(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  const cols = rows.length > 0 ? rows[0].children.length : 0;
  return { rows: rows.length, cols };
}
