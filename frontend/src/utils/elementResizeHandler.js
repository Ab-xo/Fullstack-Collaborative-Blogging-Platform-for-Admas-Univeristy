/**
 * Universal Element Resize Handler
 * Handles resizing for tables and images with visual handles
 */

const MIN_SIZE = 50; // Minimum width/height in pixels
const HANDLE_SIZE = 10; // Size of resize handles in pixels (increased for visibility)

/**
 * Create resize handles for an element
 * @param {HTMLElement} element - The element to add handles to
 * @returns {HTMLElement} - Container with handles
 */
export function createResizeHandles(element) {
  // Create wrapper if it doesn't exist
  let wrapper = element.parentElement;
  if (!wrapper || !wrapper.classList.contains('resizable-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'resizable-wrapper';
    wrapper.setAttribute('contenteditable', 'false'); // Prevent contentEditable conflicts
    wrapper.style.cssText = `
      position: relative;
      display: inline-block;
      max-width: 100%;
    `;
    
    // Wrap the element
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    
    // Ensure the table itself remains editable
    if (element.tagName === 'TABLE') {
      element.querySelectorAll('td, th').forEach(cell => {
        cell.setAttribute('contenteditable', 'true');
      });
    }
  }

  // Remove existing handles
  wrapper.querySelectorAll('.resize-handle').forEach(h => h.remove());

  // Create 8 resize handles (corners and edges)
  // Position them at -5px to center them on the border
  const offset = -5;
  const positions = [
    { name: 'nw', cursor: 'nw-resize', top: offset, left: offset },
    { name: 'n', cursor: 'n-resize', top: offset, left: '50%', transform: 'translateX(-50%)' },
    { name: 'ne', cursor: 'ne-resize', top: offset, right: offset },
    { name: 'e', cursor: 'e-resize', top: '50%', right: offset, transform: 'translateY(-50%)' },
    { name: 'se', cursor: 'se-resize', bottom: offset, right: offset },
    { name: 's', cursor: 's-resize', bottom: offset, left: '50%', transform: 'translateX(-50%)' },
    { name: 'sw', cursor: 'sw-resize', bottom: offset, left: offset },
    { name: 'w', cursor: 'w-resize', top: '50%', left: offset, transform: 'translateY(-50%)' },
  ];

  positions.forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-handle-${pos.name}`;
    handle.dataset.position = pos.name;
    handle.setAttribute('contenteditable', 'false'); // Handles are not editable
    
    let styles = `
      position: absolute;
      width: ${HANDLE_SIZE}px;
      height: ${HANDLE_SIZE}px;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      cursor: ${pos.cursor};
      z-index: 10;
      opacity: 0;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      pointer-events: none;
      user-select: none;
    `;
    
    if (pos.top !== undefined) styles += `top: ${pos.top}px;`;
    if (pos.bottom !== undefined) styles += `bottom: ${pos.bottom}px;`;
    if (pos.left !== undefined) styles += `left: ${typeof pos.left === 'number' ? pos.left + 'px' : pos.left};`;
    if (pos.right !== undefined) styles += `right: ${pos.right}px;`;
    if (pos.transform) styles += `transform: ${pos.transform};`;
    
    handle.style.cssText = styles;
    wrapper.appendChild(handle);
  });

  // Show handles when element is clicked/selected
  const showHandles = () => {
    wrapper.classList.add('resizable-selected');
    wrapper.querySelectorAll('.resize-handle').forEach(h => {
      h.style.opacity = '1';
      h.style.pointerEvents = 'auto';
    });
  };

  const hideHandles = () => {
    wrapper.classList.remove('resizable-selected');
    wrapper.querySelectorAll('.resize-handle').forEach(h => {
      h.style.opacity = '0';
      h.style.pointerEvents = 'none';
    });
  };

  // Show handles on click (use mousedown to avoid conflicts)
  const handleElementClick = (e) => {
    // Only if not clicking on a resize handle
    if (!e.target.classList.contains('resize-handle')) {
      e.stopPropagation();
      // Hide all other selected elements
      document.querySelectorAll('.resizable-selected').forEach(el => {
        if (el !== wrapper) {
          el.classList.remove('resizable-selected');
          el.querySelectorAll('.resize-handle').forEach(h => {
            h.style.opacity = '0';
            h.style.pointerEvents = 'none';
          });
        }
      });
      showHandles();
    }
  };
  element.addEventListener('mousedown', handleElementClick);

  // Hide handles when clicking outside
  const hideOnClickOutside = (e) => {
    if (!wrapper.contains(e.target)) {
      hideHandles();
    }
  };
  document.addEventListener('mousedown', hideOnClickOutside);

  // Store handlers on wrapper for cleanup in makeResizable
  wrapper._resizeHandlers = {
    elementClick: handleElementClick,
    clickOutside: hideOnClickOutside
  };

  // Enhance handles on hover
  wrapper.addEventListener('mouseenter', () => {
    if (wrapper.classList.contains('resizable-selected')) {
      wrapper.querySelectorAll('.resize-handle').forEach(h => {
        h.style.transform = h.style.transform.includes('translate') 
          ? h.style.transform + ' scale(1.2)' 
          : 'scale(1.2)';
        h.style.background = '#3b82f6';
        h.style.borderColor = 'white';
      });
    }
  });

  wrapper.addEventListener('mouseleave', () => {
    wrapper.querySelectorAll('.resize-handle').forEach(h => {
      // Reset transform but keep translate if it exists
      const originalTransform = h.dataset.originalTransform || '';
      h.style.transform = originalTransform;
      h.style.background = 'white';
      h.style.borderColor = '#3b82f6';
    });
  });
  
  // Store original transforms
  wrapper.querySelectorAll('.resize-handle').forEach(h => {
    const computedStyle = window.getComputedStyle(h);
    const transform = computedStyle.transform;
    if (transform && transform !== 'none') {
      h.dataset.originalTransform = transform;
    }
  });

  return wrapper;
}

/**
 * Initialize resize functionality for an element
 * @param {HTMLElement} element - The element to make resizable
 * @param {Object} options - Resize options
 */
export function makeResizable(element, options = {}) {
  const {
    onResize = () => {},
    onResizeEnd = () => {},
    maintainAspectRatio = false,
    minWidth = MIN_SIZE,
    minHeight = MIN_SIZE,
  } = options;

  const wrapper = createResizeHandles(element);
  
  let isResizing = false;
  let startX, startY, startWidth, startHeight, startLeft, startTop;
  let currentHandle = null;
  let aspectRatio = 1;

  // Store references to event handlers for cleanup
  const eventHandlers = {
    elementClick: null,
    clickOutside: null
  };

  // Find and store the event handlers attached by createResizeHandles
  // These are stored on the wrapper for cleanup
  if (wrapper._resizeHandlers) {
    eventHandlers.elementClick = wrapper._resizeHandlers.elementClick;
    eventHandlers.clickOutside = wrapper._resizeHandlers.clickOutside;
  }

  const handleMouseDown = (e) => {
    if (!e.target.classList.contains('resize-handle')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isResizing = true;
    currentHandle = e.target.dataset.position;
    
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = element.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;
    
    aspectRatio = startWidth / startHeight;
    
    // Add visual feedback
    wrapper.style.outline = '2px solid #3b82f6';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    // Calculate new dimensions based on handle position
    switch (currentHandle) {
      case 'e':
      case 'ne':
      case 'se':
        newWidth = Math.max(minWidth, startWidth + deltaX);
        break;
      case 'w':
      case 'nw':
      case 'sw':
        newWidth = Math.max(minWidth, startWidth - deltaX);
        break;
    }
    
    switch (currentHandle) {
      case 's':
      case 'se':
      case 'sw':
        newHeight = Math.max(minHeight, startHeight + deltaY);
        break;
      case 'n':
      case 'ne':
      case 'nw':
        newHeight = Math.max(minHeight, startHeight - deltaY);
        break;
    }
    
    // Maintain aspect ratio for corner handles if needed
    if (maintainAspectRatio && ['nw', 'ne', 'sw', 'se'].includes(currentHandle)) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }
    
    // Apply new dimensions
    if (element.tagName === 'TABLE') {
      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
    } else if (element.tagName === 'IMG') {
      element.style.width = `${newWidth}px`;
      element.style.height = maintainAspectRatio ? 'auto' : `${newHeight}px`;
    }
    
    wrapper.style.width = `${newWidth}px`;
    
    onResize({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    if (!isResizing) return;
    
    isResizing = false;
    currentHandle = null;
    
    wrapper.style.outline = '';
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    const rect = element.getBoundingClientRect();
    onResizeEnd({ width: rect.width, height: rect.height });
  };

  wrapper.addEventListener('mousedown', handleMouseDown);
  
  return {
    destroy: () => {
      wrapper.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up handlers stored on wrapper
      if (wrapper._resizeHandlers) {
        if (wrapper._resizeHandlers.elementClick) {
          element.removeEventListener('mousedown', wrapper._resizeHandlers.elementClick);
        }
        if (wrapper._resizeHandlers.clickOutside) {
          document.removeEventListener('mousedown', wrapper._resizeHandlers.clickOutside);
        }
        delete wrapper._resizeHandlers;
      }
    }
  };
}

/**
 * Make all tables in a container resizable
 * @param {HTMLElement} container - Container element
 */
export function makeTablesResizable(container) {
  const tables = container.querySelectorAll('table[data-table-editable="true"]');
  const instances = [];
  
  tables.forEach((table) => {
    // Skip if already wrapped
    if (table.parentElement?.classList.contains('resizable-wrapper')) {
      return;
    }
    
    const instance = makeResizable(table, {
      maintainAspectRatio: false,
      minWidth: 200,
      minHeight: 100,
      onResizeEnd: () => {
        // Trigger content change event
        const event = new Event('input', { bubbles: true });
        container.dispatchEvent(event);
      }
    });
    
    instances.push(instance);
  });
  
  return instances;
}

/**
 * Make all images in a container resizable
 * @param {HTMLElement} container - Container element
 */
export function makeImagesResizable(container) {
  const images = container.querySelectorAll('img');
  const instances = [];
  
  images.forEach(img => {
    // Skip if already wrapped
    if (img.parentElement?.classList.contains('resizable-wrapper')) {
      return;
    }
    
    const instance = makeResizable(img, {
      maintainAspectRatio: true,
      minWidth: 50,
      minHeight: 50,
      onResizeEnd: () => {
        // Trigger content change event
        const event = new Event('input', { bubbles: true });
        container.dispatchEvent(event);
      }
    });
    
    instances.push(instance);
  });
  
  return instances;
}
