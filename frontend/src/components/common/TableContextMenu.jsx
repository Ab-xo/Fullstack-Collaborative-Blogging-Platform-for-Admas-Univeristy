import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Merge,
  Table as TableIcon,
} from "lucide-react";

/**
 * Context menu for table operations
 */
const TableContextMenu = ({
  isOpen,
  position,
  targetCell,
  selectedCells,
  onClose,
  onAction,
  canMerge,
}) => {
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !targetCell) return null;

  const menuItems = [
    {
      icon: ArrowUp,
      label: "Insert Row Above",
      action: () => onAction({ type: "INSERT_ROW_ABOVE" }),
      enabled: true,
    },
    {
      icon: ArrowDown,
      label: "Insert Row Below",
      action: () => onAction({ type: "INSERT_ROW_BELOW" }),
      enabled: true,
    },
    {
      type: "separator",
    },
    {
      icon: ArrowLeft,
      label: "Insert Column Left",
      action: () => onAction({ type: "INSERT_COLUMN_LEFT" }),
      enabled: true,
    },
    {
      icon: ArrowRight,
      label: "Insert Column Right",
      action: () => onAction({ type: "INSERT_COLUMN_RIGHT" }),
      enabled: true,
    },
    {
      type: "separator",
    },
    {
      icon: Trash2,
      label: "Delete Row",
      action: () => onAction({ type: "DELETE_ROW" }),
      enabled: true,
      danger: true,
    },
    {
      icon: Trash2,
      label: "Delete Column",
      action: () => onAction({ type: "DELETE_COLUMN" }),
      enabled: true,
      danger: true,
    },
    {
      type: "separator",
    },
    {
      icon: Merge,
      label: "Merge Cells",
      action: () => onAction({ type: "MERGE_CELLS" }),
      enabled: canMerge && selectedCells.length > 1,
    },
    {
      type: "separator",
    },
    {
      icon: () => <span className="text-xs">⬅️</span>,
      label: "Align Left",
      action: () => onAction({ type: "ALIGN_LEFT" }),
      enabled: true,
    },
    {
      icon: () => <span className="text-xs">↔️</span>,
      label: "Align Center",
      action: () => onAction({ type: "ALIGN_CENTER" }),
      enabled: true,
    },
    {
      icon: () => <span className="text-xs">➡️</span>,
      label: "Align Right",
      action: () => onAction({ type: "ALIGN_RIGHT" }),
      enabled: true,
    },
    {
      type: "separator",
    },
    {
      icon: TableIcon,
      label: "Delete Table",
      action: () => onAction({ type: "DELETE_TABLE" }),
      enabled: true,
      danger: true,
    },
  ];

  // Adjust position to keep menu on screen
  const adjustedPosition = { ...position };
  if (menuRef.current) {
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (position.x + menuRect.width > viewportWidth) {
      adjustedPosition.x = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position
    if (position.y + menuRect.height > viewportHeight) {
      adjustedPosition.y = viewportHeight - menuRect.height - 10;
    }

    // Ensure minimum position
    adjustedPosition.x = Math.max(10, adjustedPosition.x);
    adjustedPosition.y = Math.max(10, adjustedPosition.y);
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-[9999] min-w-[200px] max-h-[80vh] overflow-y-auto py-1"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      {menuItems.map((item, index) => {
        if (item.type === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="h-px bg-gray-200 dark:bg-gray-700 my-1"
            />
          );
        }

        const Icon = item.icon;
        const isDisabled = !item.enabled;

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (!isDisabled) {
                item.action();
                onClose();
              }
            }}
            disabled={isDisabled}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-sm text-left
              transition-colors
              ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : item.danger
                  ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }
            `}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

TableContextMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  targetCell: PropTypes.object,
  selectedCells: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  canMerge: PropTypes.bool,
};

TableContextMenu.defaultProps = {
  targetCell: null,
  selectedCells: [],
  canMerge: false,
};

export default TableContextMenu;
