import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Minus,
  ChevronDown,
  Type,
  Palette,
  Highlighter,
  Video,
  FileText,
} from "lucide-react";
import { useTableInteraction } from "../../hooks/useTableInteraction";
import { useIsMobile } from "../../hooks/useMediaQuery";
import TableContextMenu from "./TableContextMenu";
import DeleteTableDialog from "./DeleteTableDialog";
import {
  insertRowAbove,
  insertRowBelow,
  insertColumnLeft,
  insertColumnRight,
  deleteRow,
  deleteColumn,
  deleteTable,
  mergeCells,
} from "../../utils/tableOperations";
import {
  makeTablesResizable,
  makeImagesResizable,
} from "../../utils/elementResizeHandler";

/**
 * Simple Rich Text Editor Component
 * For production, consider using libraries like:
 * - TinyMCE
 * - Quill
 * - Draft.js
 * - Slate
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  error,
  minHeight = "300px",
  postId,
  socket,
  isConnected,
}) => {
  const editorRef = useRef(null);
  const isMobile = useIsMobile();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [currentFont, setCurrentFont] = useState("Default");
  const [currentSize, setCurrentSize] = useState("16");
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableStyle, setTableStyle] = useState("default");
  const [showDeleteTableDialog, setShowDeleteTableDialog] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [docUrl, setDocUrl] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);

  // Table interaction hook
  const tableInteraction = useTableInteraction(editorRef);

  // Make tables and images resizable
  useEffect(() => {
    if (isRemoteUpdate) return;

    const timeout = setTimeout(() => {
      if (editorRef.current) {
        const tableInstances = makeTablesResizable(editorRef.current);
        const imageInstances = makeImagesResizable(editorRef.current);

        return () => {
          tableInstances.forEach((inst) => inst.destroy());
          imageInstances.forEach((inst) => inst.destroy());
        };
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [value, isRemoteUpdate]);

  // Handle Tab on last cell - create new row
  useEffect(() => {
    const handleTabOnLastCell = (e) => {
      const { table } = e.detail;
      if (table) {
        const rows = Array.from(table.querySelectorAll("tr"));
        const lastRow = rows[rows.length - 1];
        insertRowBelow(table, rows.length - 1);
        handleContentChange();
        // Focus first cell of new row
        setTimeout(() => {
          const newLastRow = table.querySelectorAll("tr")[rows.length];
          if (newLastRow) {
            newLastRow.children[0]?.focus();
          }
        }, 0);
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("tableTabOnLastCell", handleTabOnLastCell);
      return () => {
        editor.removeEventListener("tableTabOnLastCell", handleTabOnLastCell);
      };
    }
  }, [editorRef]);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange?.(newContent);

      // Real-time synchronization
      if (socket && isConnected && postId && !isRemoteUpdate) {
        socket.emit("content:update", {
          postId,
          content: newContent,
          selection: null, // Could add selection sync later
        });
      }
    }
  };

  // Listen for remote updates
  useEffect(() => {
    if (!socket || !isConnected || !postId) return;

    socket.on("content:changed", ({ content }) => {
      if (editorRef.current && content !== editorRef.current.innerHTML) {
        setIsRemoteUpdate(true);
        editorRef.current.innerHTML = content;
        onChange?.(content);
        setTimeout(() => setIsRemoteUpdate(false), 0);
      }
    });

    return () => {
      socket.off("content:changed");
    };
  }, [socket, isConnected, postId]);

  // Handle typing indicator
  const handleKeyUp = () => {
    if (socket && isConnected && postId) {
      socket.emit("typing:start", { postId });
      // Throttled stop would be better, for now simple timeout
      if (window.typingTimeout) clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.emit("typing:stop", { postId });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          executeCommand("bold");
          break;
        case "i":
          e.preventDefault();
          executeCommand("italic");
          break;
        case "u":
          e.preventDefault();
          executeCommand("underline");
          break;
        case "k":
          e.preventDefault();
          setShowLinkDialog(true);
          break;
        default:
          break;
      }
    }
  };

  // Handle paste event for images
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for image files in clipboard
    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if item is an image
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();

        const file = item.getAsFile();
        if (!file) continue;

        // Convert image to base64 and insert
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target.result;
          const imgHTML = `<img src="${base64Data}" alt="Pasted image" style="max-width: 100%; height: auto;" data-resizable="true" />`;
          executeCommand("insertHTML", imgHTML);

          // Setup resize after insertion
          setTimeout(() => {
            if (editorRef.current) {
              makeImagesResizable(editorRef.current);
            }
          }, 100);

          toast.success("Image pasted successfully!");
        };

        reader.onerror = () => {
          toast.error("Failed to paste image");
        };

        reader.readAsDataURL(file);
        return; // Only handle first image
      }
    }

    // Check for image URL in pasted text (e.g., from "Copy image address")
    const pastedText = clipboardData.getData("text/plain");
    if (pastedText) {
      // Check if it looks like an image URL
      const imageUrlPattern =
        /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff?|avif)(\?.*)?$/i;
      const imageServicePattern =
        /^https?:\/\/.*(googleusercontent|twimg|fbcdn|imgur|unsplash|pexels|cloudinary|media|image|img|photo|picture|cdn)\..*/i;

      if (
        imageUrlPattern.test(pastedText) ||
        imageServicePattern.test(pastedText)
      ) {
        e.preventDefault();

        // Insert image from URL
        const imgHTML = `<img src="${pastedText}" alt="Pasted image" style="max-width: 100%; height: auto;" data-resizable="true" />`;
        executeCommand("insertHTML", imgHTML);

        setTimeout(() => {
          if (editorRef.current) {
            makeImagesResizable(editorRef.current);
          }
        }, 100);

        toast.success("Image URL inserted!");
        return;
      }
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [currentFormat, setCurrentFormat] = useState("Normal");

  const formatOptions = [
    { label: "Normal", value: "normal", markdown: "" },
    { label: "Heading 1", value: "h1", markdown: "# " },
    { label: "Heading 2", value: "h2", markdown: "## " },
    { label: "Heading 3", value: "h3", markdown: "### " },
    { label: "Heading 4", value: "h4", markdown: "#### " },
    { label: "Heading 5", value: "h5", markdown: "##### " },
    { label: "Heading 6", value: "h6", markdown: "###### " },
  ];

  const applyFormat = (format) => {
    if (format.value === "normal") {
      executeCommand("formatBlock", "<p>");
    } else {
      executeCommand("formatBlock", `<${format.value}>`);
    }
    setCurrentFormat(format.label);
    setShowFormatDropdown(false);
  };

  const fontOptions = [
    { label: "Default", value: "default" },
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Georgia", value: "Georgia" },
    { label: "Courier New", value: "Courier New" },
    { label: "Verdana", value: "Verdana" },
    { label: "Comic Sans MS", value: "Comic Sans MS" },
    { label: "Impact", value: "Impact" },
    { label: "Trebuchet MS", value: "Trebuchet MS" },
  ];

  const sizeOptions = [
    "8",
    "9",
    "10",
    "11",
    "12",
    "14",
    "16",
    "18",
    "20",
    "22",
    "24",
    "26",
    "28",
    "36",
    "48",
    "72",
  ];

  const textColors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#808080",
    "#C00000",
    "#00C000",
    "#0000C0",
    "#C0C000",
    "#C000C0",
    "#00C0C0",
    "#C0C0C0",
  ];

  const highlightColors = [
    "transparent",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#FF00FF",
    "#0000FF",
    "#FF0000",
    "#00FF7F",
    "#FFD700",
    "#FF69B4",
    "#FFA500",
    "#90EE90",
    "#87CEEB",
    "#DDA0DD",
  ];

  const bulletListOptions = [
    { label: "• Disc", value: "disc", markdown: "- " },
    { label: "○ Circle", value: "circle", markdown: "○ " },
    { label: "■ Square", value: "square", markdown: "■ " },
    { label: "▸ Arrow", value: "arrow", markdown: "▸ " },
    { label: "✓ Checkmark", value: "check", markdown: "✓ " },
    { label: "★ Star", value: "star", markdown: "★ " },
  ];

  const numberListOptions = [
    { label: "1. Numbers", value: "numbers", markdown: "1. " },
    { label: "a. Lowercase", value: "lower-alpha", markdown: "a. " },
    { label: "A. Uppercase", value: "upper-alpha", markdown: "A. " },
    { label: "i. Roman Lower", value: "lower-roman", markdown: "i. " },
    { label: "I. Roman Upper", value: "upper-roman", markdown: "I. " },
  ];

  const toolbarGroups = [
    // Format dropdown
    {
      type: "dropdown",
      label: currentFormat,
      icon: Type,
      options: formatOptions,
      action: applyFormat,
    },
    // Font family dropdown
    {
      type: "font-dropdown",
      label: currentFont,
      options: fontOptions,
    },
    // Font size dropdown
    {
      type: "size-dropdown",
      label: currentSize,
      options: sizeOptions,
    },
    // Text formatting
    {
      type: "group",
      buttons: [
        {
          icon: Bold,
          label: "Bold (Ctrl+B)",
          action: () => executeCommand("bold"),
        },
        {
          icon: Italic,
          label: "Italic (Ctrl+I)",
          action: () => executeCommand("italic"),
        },
        {
          icon: Underline,
          label: "Underline (Ctrl+U)",
          action: () => executeCommand("underline"),
        },
        {
          icon: Strikethrough,
          label: "Strikethrough",
          action: () => executeCommand("strikeThrough"),
        },
      ],
    },
    // Text & Highlight Color
    {
      type: "group",
      buttons: [
        {
          icon: Palette,
          label: "Text Color",
          action: () => {},
          hasColorPicker: true,
          pickerType: "text",
        },
        {
          icon: Highlighter,
          label: "Highlight Color",
          action: () => {},
          hasColorPicker: true,
          pickerType: "highlight",
        },
      ],
    },
    // Subscript & Superscript
    {
      type: "group",
      buttons: [
        {
          icon: () => <span className="text-xs font-bold">x₂</span>,
          label: "Subscript (H₂O)",
          action: () => executeCommand("subscript"),
        },
        {
          icon: () => <span className="text-xs font-bold">x²</span>,
          label: "Superscript (E=mc²)",
          action: () => executeCommand("superscript"),
        },
      ],
    },
    // Lists with dropdowns
    {
      type: "group",
      buttons: [
        {
          icon: List,
          label: "Bullet List",
          action: () => executeCommand("insertUnorderedList"),
          hasDropdown: true,
          dropdownId: "bullet",
          dropdownOptions: bulletListOptions,
        },
        {
          icon: ListOrdered,
          label: "Numbered List",
          action: () => executeCommand("insertOrderedList"),
          hasDropdown: true,
          dropdownId: "number",
          dropdownOptions: numberListOptions,
        },
      ],
    },
    // Alignment
    {
      type: "group",
      buttons: [
        {
          icon: AlignLeft,
          label: "Align Left (works for tables too)",
          action: () => handleAlign("Left"),
        },
        {
          icon: AlignCenter,
          label: "Align Center (works for tables too)",
          action: () => handleAlign("Center"),
        },
        {
          icon: AlignRight,
          label: "Align Right (works for tables too)",
          action: () => handleAlign("Right"),
        },
      ],
    },
    // Insert
    {
      type: "group",
      buttons: [
        {
          icon: Quote,
          label: "Quote",
          action: () => executeCommand("formatBlock", "<blockquote>"),
        },
        {
          icon: Code,
          label: "Inline Code",
          action: () => {
            const selection = window.getSelection();
            if (selection.toString()) {
              executeCommand(
                "insertHTML",
                `<code>${selection.toString()}</code>`,
              );
            }
          },
        },
        {
          icon: LinkIcon,
          label: "Insert Link",
          action: () => setShowLinkDialog(true),
        },
        {
          icon: ImageIcon,
          label: "Insert Image",
          action: () => setShowImageDialog(true),
        },
        {
          icon: Video,
          label: "Insert Video",
          action: () => setShowVideoDialog(true),
        },
        {
          icon: FileText,
          label: "Insert Document",
          action: () => setShowDocDialog(true),
        },
        {
          icon: Table,
          label: "Insert Table",
          action: () => setShowTableDialog(true),
        },
        {
          icon: Minus,
          label: "Horizontal Rule",
          action: () => executeCommand("insertHorizontalRule"),
        },
      ],
    },
  ];

  const insertLink = () => {
    if (linkUrl) {
      executeCommand("createLink", linkUrl);
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const insertVideo = () => {
    if (videoUrl) {
      let finalUrl = videoUrl;
      // Convert YouTube URL to embed
      if (videoUrl.includes("youtube.com/watch?v=")) {
        const videoId = videoUrl.split("v=")[1]?.split("&")[0];
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes("youtu.be/")) {
        const videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0];
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes("vimeo.com/")) {
        const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];
        finalUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      const videoHTML = `
        <div class="video-wrapper my-4" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
          <iframe 
            src="${finalUrl}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
            allowfullscreen 
            contenteditable="false"
          ></iframe>
        </div>
        <p><br></p>
      `;
      executeCommand("insertHTML", videoHTML);
      setVideoUrl("");
      setShowVideoDialog(false);
    }
  };

  const insertDoc = () => {
    if (docUrl) {
      const docHTML = `
        <div class="doc-wrapper my-4 p-4 border rounded-lg bg-gray-50 flex items-center justify-between" contenteditable="false">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 text-blue-600 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">${docTitle || "Document Attachment"}</p>
              <p class="text-xs text-gray-500">Attachment</p>
            </div>
          </div>
          <a href="${docUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
            Download
          </a>
        </div>
        <p><br></p>
      `;
      executeCommand("insertHTML", docHTML);
      setDocUrl("");
      setDocTitle("");
      setShowDocDialog(false);
    }
  };

  const tableStyles = {
    default: {
      name: "Default",
      style: "border-collapse: collapse; width: 100%; margin: 16px 0;",
      cellStyle: "border: 1px solid #d1d5db; padding: 8px;",
      headerStyle:
        "background: #f3f4f6; font-weight: 600; border: 1px solid #d1d5db; padding: 8px;",
    },
    striped: {
      name: "Striped",
      style: "border-collapse: collapse; width: 100%; margin: 16px 0;",
      cellStyle: "border: 1px solid #e5e7eb; padding: 10px;",
      headerStyle:
        "background: #3b82f6; color: white; font-weight: 600; border: 1px solid #2563eb; padding: 10px;",
      rowStyle: "background: #f9fafb;",
    },
    bordered: {
      name: "Bordered",
      style:
        "border-collapse: collapse; width: 100%; margin: 16px 0; border: 2px solid #374151;",
      cellStyle: "border: 2px solid #6b7280; padding: 12px;",
      headerStyle:
        "background: #1f2937; color: white; font-weight: 700; border: 2px solid #374151; padding: 12px;",
    },
    minimal: {
      name: "Minimal",
      style: "border-collapse: collapse; width: 100%; margin: 16px 0;",
      cellStyle:
        "border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left;",
      headerStyle:
        "border-bottom: 2px solid #374151; font-weight: 600; padding: 12px; text-align: left;",
    },
    colorful: {
      name: "Colorful",
      style:
        "border-collapse: collapse; width: 100%; margin: 16px 0; border-radius: 8px; overflow: hidden;",
      cellStyle:
        "border: 1px solid #ddd; padding: 10px; background: linear-gradient(to bottom, #ffffff, #f9fafb);",
      headerStyle:
        "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; padding: 12px;",
    },
  };

  const insertTable = () => {
    const style = tableStyles[tableStyle];

    // Wrap table in alignment wrapper div (MS Word-style)
    let tableHTML = '<div class="table-alignment-wrapper align-left">';
    tableHTML += `<table style="${style.style.replace(
      "width: 100%",
      "width: auto",
    )}; display: table;" data-table-editable="true">`;

    // Header row
    tableHTML += "<thead><tr>";
    for (let c = 0; c < tableCols; c++) {
      tableHTML += `<th style="${
        style.headerStyle
      }" contenteditable="true">Header ${c + 1}</th>`;
    }
    tableHTML += "</tr></thead>";

    // Body rows
    tableHTML += "<tbody>";
    for (let r = 0; r < tableRows; r++) {
      const rowStyle =
        style.rowStyle && r % 2 === 1 ? ` style="${style.rowStyle}"` : "";
      tableHTML += `<tr${rowStyle}>`;
      for (let c = 0; c < tableCols; c++) {
        tableHTML += `<td style="${
          style.cellStyle
        }" contenteditable="true">Cell ${r + 1}-${c + 1}</td>`;
      }
      tableHTML += "</tr>";
    }
    tableHTML += "</tbody></table></div><p><br></p>";

    executeCommand("insertHTML", tableHTML);
    setShowTableDialog(false);
    setTableRows(3);
    setTableCols(3);
    setTableStyle("default");

    // Add resize handles to the newly inserted table
    setTimeout(() => {
      if (editorRef.current) {
        makeTablesResizable(editorRef.current);
      }
    }, 100);
  };

  // Insert image from URL - handles any image URL including "Copy image address" from browsers
  const insertImageFromUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) {
      toast.error("Please enter an image URL");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoadingImage(true);

    // Try to load the image to verify it works
    const img = new Image();
    img.crossOrigin = "anonymous";

    const insertImage = (imageUrl) => {
      const alt = imageAltText.trim() || "Inserted image";
      const imgHTML = `<img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto;" data-resizable="true" />`;
      executeCommand("insertHTML", imgHTML);

      // Trigger resize setup after a short delay
      setTimeout(() => {
        if (editorRef.current) {
          makeImagesResizable(editorRef.current);
        }
      }, 100);

      // Reset and close dialog
      setShowImageDialog(false);
      setImageUrlInput("");
      setImageAltText("");
      setIsLoadingImage(false);
      toast.success("Image inserted successfully!");
    };

    img.onload = () => {
      insertImage(url);
    };

    img.onerror = () => {
      // Try again without crossOrigin
      const img2 = new Image();
      img2.onload = () => {
        insertImage(url);
      };
      img2.onerror = () => {
        // Even if we can't verify, accept URLs that look like images
        const looksLikeImage =
          /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff?|avif)(\?|$)/i.test(url) ||
          url.includes("/image") ||
          url.includes("img") ||
          url.includes("photo") ||
          url.includes("picture") ||
          url.includes("media") ||
          url.includes("cdn") ||
          url.includes("cloudinary") ||
          url.includes("imgur") ||
          url.includes("unsplash") ||
          url.includes("pexels") ||
          url.includes("googleusercontent") ||
          url.includes("twimg") ||
          url.includes("fbcdn");

        if (looksLikeImage) {
          insertImage(url);
          toast.info(
            "Image inserted! Preview may not show due to CORS, but it should work when published.",
            { duration: 4000 },
          );
        } else {
          setIsLoadingImage(false);
          toast.error(
            "Could not load image. Please check the URL is a direct image link.",
          );
        }
      };
      img2.src = url;
    };

    img.src = url;
  };

  // Handle delete table confirmation
  const handleConfirmDeleteTable = () => {
    if (tableToDelete) {
      deleteTable(tableToDelete);
      handleContentChange();
    }
    setShowDeleteTableDialog(false);
    setTableToDelete(null);
  };

  const handleCancelDeleteTable = () => {
    setShowDeleteTableDialog(false);
    setTableToDelete(null);
  };

  // Helper function to align table or text (MS Word-style)
  const handleAlign = (alignment) => {
    // Try to find table from selection or focused element
    let table = null;

    // Check selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let element = selection.anchorNode;
      while (element && element !== editorRef.current) {
        if (element.tagName === "TABLE") {
          table = element;
          break;
        }
        element = element.parentElement;
      }
    }

    // Check focused element
    if (!table && document.activeElement) {
      let element = document.activeElement;
      while (element && element !== editorRef.current) {
        if (element.tagName === "TABLE") {
          table = element;
          break;
        }
        element = element.parentElement;
      }
    }

    // If we found a table, align it using wrapper approach
    if (table) {
      // Find or create wrapper div
      let wrapper = table.parentElement;

      // If table is not wrapped, wrap it
      if (!wrapper || !wrapper.classList.contains("table-alignment-wrapper")) {
        const newWrapper = document.createElement("div");
        newWrapper.className = "table-alignment-wrapper";
        table.parentNode.insertBefore(newWrapper, table);
        newWrapper.appendChild(table);
        wrapper = newWrapper;
      }

      // Remove all alignment classes
      wrapper.classList.remove("align-left", "align-center", "align-right");

      // Add the appropriate alignment class
      if (alignment === "Left") {
        wrapper.classList.add("align-left");
      } else if (alignment === "Center") {
        wrapper.classList.add("align-center");
      } else if (alignment === "Right") {
        wrapper.classList.add("align-right");
      }

      // Ensure table has proper display and width
      table.style.display = "table";
      table.style.width = "auto";

      handleContentChange();
      return;
    }

    // Not in a table, use normal text alignment
    executeCommand(`justify${alignment}`);
  };

  // Handle table context menu actions
  const handleTableAction = (action) => {
    const { targetCell } = tableInteraction.state.contextMenu;
    if (!targetCell) return;

    const table = targetCell.closest("table");
    if (!table) return;

    const row = targetCell.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const colIndex = Array.from(row.children).indexOf(targetCell);

    switch (action.type) {
      case "INSERT_ROW_ABOVE":
        insertRowAbove(table, rowIndex);
        handleContentChange();
        break;
      case "INSERT_ROW_BELOW":
        insertRowBelow(table, rowIndex);
        handleContentChange();
        break;
      case "INSERT_COLUMN_LEFT":
        insertColumnLeft(table, colIndex);
        handleContentChange();
        break;
      case "INSERT_COLUMN_RIGHT":
        insertColumnRight(table, colIndex);
        handleContentChange();
        break;
      case "DELETE_ROW":
        if (!deleteRow(table, rowIndex)) {
          toast.error("Cannot delete the last row");
        } else {
          handleContentChange();
        }
        break;
      case "DELETE_COLUMN":
        if (!deleteColumn(table, colIndex)) {
          toast.error("Cannot delete the last column");
        } else {
          handleContentChange();
        }
        break;
      case "DELETE_TABLE":
        setTableToDelete(table);
        setShowDeleteTableDialog(true);
        break;
      case "MERGE_CELLS":
        if (mergeCells(tableInteraction.state.selectedCells)) {
          handleContentChange();
        }
        break;
      case "ALIGN_LEFT":
        {
          // Find or create wrapper div
          let wrapper = table.parentElement;

          if (
            !wrapper ||
            !wrapper.classList.contains("table-alignment-wrapper")
          ) {
            const newWrapper = document.createElement("div");
            newWrapper.className = "table-alignment-wrapper";
            table.parentNode.insertBefore(newWrapper, table);
            newWrapper.appendChild(table);
            wrapper = newWrapper;
          }

          wrapper.classList.remove("align-left", "align-center", "align-right");
          wrapper.classList.add("align-left");
          table.style.display = "table";
          table.style.width = "auto";
          handleContentChange();
        }
        break;
      case "ALIGN_CENTER":
        {
          // Find or create wrapper div
          let wrapper = table.parentElement;

          if (
            !wrapper ||
            !wrapper.classList.contains("table-alignment-wrapper")
          ) {
            const newWrapper = document.createElement("div");
            newWrapper.className = "table-alignment-wrapper";
            table.parentNode.insertBefore(newWrapper, table);
            newWrapper.appendChild(table);
            wrapper = newWrapper;
          }

          wrapper.classList.remove("align-left", "align-center", "align-right");
          wrapper.classList.add("align-center");
          table.style.display = "table";
          table.style.width = "auto";
          handleContentChange();
        }
        break;
      case "ALIGN_RIGHT":
        {
          // Find or create wrapper div
          let wrapper = table.parentElement;

          if (
            !wrapper ||
            !wrapper.classList.contains("table-alignment-wrapper")
          ) {
            const newWrapper = document.createElement("div");
            newWrapper.className = "table-alignment-wrapper";
            table.parentNode.insertBefore(newWrapper, table);
            newWrapper.appendChild(table);
            wrapper = newWrapper;
          }

          wrapper.classList.remove("align-left", "align-center", "align-right");
          wrapper.classList.add("align-right");
          table.style.display = "table";
          table.style.width = "auto";
          handleContentChange();
        }
        break;
      default:
        break;
    }
  };

  // Simplified mobile toolbar with essential tools only
  const mobileToolbarGroups = [
    // Text formatting
    {
      type: "group",
      buttons: [
        {
          icon: Bold,
          label: "Bold",
          action: () => executeCommand("bold"),
        },
        {
          icon: Italic,
          label: "Italic",
          action: () => executeCommand("italic"),
        },
        {
          icon: Underline,
          label: "Underline",
          action: () => executeCommand("underline"),
        },
      ],
    },
    // Lists
    {
      type: "group",
      buttons: [
        {
          icon: List,
          label: "Bullet List",
          action: () => executeCommand("insertUnorderedList"),
        },
        {
          icon: ListOrdered,
          label: "Numbered List",
          action: () => executeCommand("insertOrderedList"),
        },
      ],
    },
    // Insert
    {
      type: "group",
      buttons: [
        {
          icon: LinkIcon,
          label: "Link",
          action: () => setShowLinkDialog(true),
        },
        {
          icon: ImageIcon,
          label: "Image",
          action: () => setShowImageDialog(true),
        },
      ],
    },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] {
          outline: none;
        }
        [contenteditable] b, [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] i, [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin: 16px 0;
          color: #6b7280;
        }
        [contenteditable] code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
          position: relative;
        }
        [contenteditable] table td, [contenteditable] table th {
          border: 1px solid #d1d5db;
          padding: 8px;
          min-width: 80px;
          position: relative;
          transition: background-color 0.15s ease;
        }
        [contenteditable] table td:focus, [contenteditable] table th:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
          background: #eff6ff;
        }
        [contenteditable] table th {
          background: #f3f4f6;
          font-weight: 600;
        }
        [contenteditable] table td:hover, [contenteditable] table th:hover {
          background: #f9fafb;
        }
        [contenteditable] table td.table-cell-selected,
        [contenteditable] table th.table-cell-selected {
          background: #dbeafe !important;
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }
        [contenteditable] hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 24px 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 24px;
          margin: 12px 0;
        }
        [contenteditable] li {
          margin: 4px 0;
        }
        
        /* Resizable wrapper styles */
        .resizable-wrapper {
          position: relative;
          display: table;
          max-width: 100%;
          margin: 16px 0;
          border: 2px solid transparent;
          transition: border-color 0.2s;
          user-select: none;
        }
        
        .resizable-wrapper table {
          display: table;
          width: 100%;
          user-select: text;
        }
        
        .resizable-wrapper table td,
        .resizable-wrapper table th {
          user-select: text;
        }
        
        .resizable-wrapper.resizable-selected {
          border-color: #3b82f6;
        }
        
        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          z-index: 10;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .resizable-selected .resize-handle {
          opacity: 1;
          pointer-events: auto;
        }
        
        .resize-handle:hover {
          background: #3b82f6;
          border-color: white;
          transform: scale(1.3);
          box-shadow: 0 3px 8px rgba(59, 130, 246, 0.5);
        }
        
        .resizable-wrapper img {
          max-width: 100%;
          height: auto;
          display: block;
        }
        
        .resizable-wrapper table {
          display: table;
        }
        
        /* MS Word-style table alignment wrapper */
        .table-alignment-wrapper {
          width: 100%;
          display: block;
          margin: 16px 0;
        }
        
        .table-alignment-wrapper.align-left {
          text-align: left;
        }
        
        .table-alignment-wrapper.align-left table {
          margin-left: 0;
          margin-right: auto;
        }
        
        .table-alignment-wrapper.align-center {
          text-align: center;
        }
        
        .table-alignment-wrapper.align-center table {
          margin-left: auto;
          margin-right: auto;
        }
        
        .table-alignment-wrapper.align-right {
          text-align: right;
        }
        
        .table-alignment-wrapper.align-right table {
          margin-left: auto;
          margin-right: 0;
        }
      `}</style>
      {/* Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {(isMobile ? mobileToolbarGroups : toolbarGroups).map(
            (group, groupIndex) => (
              <div key={groupIndex} className="flex items-center">
                {group.type === "font-dropdown" ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFontDropdown(!showFontDropdown);
                        setShowSizeDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px] justify-between"
                    >
                      <span>{group.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showFontDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[180px] max-h-[300px] overflow-y-auto">
                        {group.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => {
                              setCurrentFont(option.label);
                              executeCommand("fontName", option.value);
                              setShowFontDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg"
                            style={{ fontFamily: option.value }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : group.type === "size-dropdown" ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSizeDropdown(!showSizeDropdown);
                        setShowFontDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] justify-between"
                    >
                      <span>{group.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showSizeDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[80px] max-h-[300px] overflow-y-auto">
                        {group.options.map((size, optIndex) => (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => {
                              setCurrentSize(size);
                              executeCommand("fontSize", "7");
                              const selection = window.getSelection();
                              if (selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                const span = document.createElement("span");
                                span.style.fontSize = `${size}px`;
                                range.surroundContents(span);
                              }
                              setShowSizeDropdown(false);
                              handleContentChange();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : group.type === "dropdown" ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] justify-between"
                    >
                      <span>{group.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showFormatDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[150px]">
                        {group.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => group.action(option)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5">
                    {group.buttons.map((button, btnIndex) => (
                      <div key={btnIndex} className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            if (button.hasColorPicker) {
                              e.stopPropagation();
                              if (button.pickerType === "text") {
                                setShowColorPicker(!showColorPicker);
                                setShowHighlightPicker(false);
                              } else if (button.pickerType === "highlight") {
                                setShowHighlightPicker(!showHighlightPicker);
                                setShowColorPicker(false);
                              }
                            } else if (button.hasDropdown) {
                              e.stopPropagation();
                              if (button.dropdownId === "bullet") {
                                setShowBulletDropdown(!showBulletDropdown);
                                setShowNumberDropdown(false);
                              } else if (button.dropdownId === "number") {
                                setShowNumberDropdown(!showNumberDropdown);
                                setShowBulletDropdown(false);
                              }
                            } else {
                              button.action();
                            }
                          }}
                          onMouseEnter={() =>
                            setHoveredButton(`${groupIndex}-${btnIndex}`)
                          }
                          onMouseLeave={() => setHoveredButton(null)}
                          className="touch-target p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group relative"
                        >
                          {typeof button.icon === "function" ? (
                            <button.icon />
                          ) : (
                            <button.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                          )}
                          {button.hasDropdown && (
                            <ChevronDown className="w-2 h-2 absolute bottom-0 right-0 text-gray-500" />
                          )}
                        </button>

                        {/* Tooltip */}
                        {hoveredButton === `${groupIndex}-${btnIndex}` && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
                            {button.label}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                          </div>
                        )}

                        {/* Dropdown Menu */}
                        {button.hasDropdown &&
                          ((button.dropdownId === "bullet" &&
                            showBulletDropdown) ||
                            (button.dropdownId === "number" &&
                              showNumberDropdown)) && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[180px]">
                              {button.dropdownOptions.map((option, optIdx) => (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => {
                                    if (button.dropdownId === "bullet") {
                                      executeCommand("insertUnorderedList");
                                    } else {
                                      executeCommand("insertOrderedList");
                                    }
                                    setShowBulletDropdown(false);
                                    setShowNumberDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                                >
                                  <span className="font-mono">
                                    {option.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                        {/* Color Picker - Full Size Swatches */}
                        {button.hasColorPicker &&
                          button.pickerType === "text" &&
                          showColorPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-3 min-w-[240px]">
                              <div className="grid grid-cols-7 gap-2">
                                {textColors.map((color, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      executeCommand("foreColor", color);
                                      setShowColorPicker(false);
                                    }}
                                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 hover:border-blue-500 transition-all cursor-pointer"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Highlight Picker - Full Size Swatches */}
                        {button.hasColorPicker &&
                          button.pickerType === "highlight" &&
                          showHighlightPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-3 min-w-[240px]">
                              <div className="grid grid-cols-7 gap-2">
                                {highlightColors.map((color, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      executeCommand("backColor", color);
                                      setShowHighlightPicker(false);
                                    }}
                                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 hover:border-blue-500 transition-all cursor-pointer"
                                    style={{
                                      backgroundColor:
                                        color === "transparent"
                                          ? "#ffffff"
                                          : color,
                                      backgroundImage:
                                        color === "transparent"
                                          ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                                          : "none",
                                      backgroundSize:
                                        color === "transparent"
                                          ? "8px 8px"
                                          : "auto",
                                      backgroundPosition:
                                        color === "transparent"
                                          ? "0 0, 4px 4px"
                                          : "0 0",
                                    }}
                                    title={
                                      color === "transparent"
                                        ? "No highlight"
                                        : color
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
                {groupIndex < toolbarGroups.length - 1 && (
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Editor - ContentEditable for WYSIWYG */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          handleKeyDown(e);
          tableInteraction.handlers.onKeyDown(e);
        }}
        onMouseDown={tableInteraction.handlers.onMouseDown}
        onMouseMove={tableInteraction.handlers.onMouseMove}
        onContextMenu={tableInteraction.handlers.onContextMenu}
        data-placeholder={
          placeholder ||
          "Write your content here... Use the toolbar for formatting - changes apply instantly!"
        }
        className="w-full p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none text-base leading-relaxed overflow-y-auto"
        style={{
          minHeight,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
        spellCheck="true"
      />

      {/* Table Context Menu */}
      <TableContextMenu
        isOpen={tableInteraction.state.contextMenu.isOpen}
        position={tableInteraction.state.contextMenu.position}
        targetCell={tableInteraction.state.contextMenu.targetCell}
        selectedCells={tableInteraction.state.selectedCells}
        canMerge={tableInteraction.state.canMerge}
        onClose={tableInteraction.actions.closeContextMenu}
        onAction={handleTableAction}
      />

      {/* Delete Table Confirmation Dialog */}
      <DeleteTableDialog
        isOpen={showDeleteTableDialog}
        onConfirm={handleConfirmDeleteTable}
        onCancel={handleCancelDeleteTable}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Link
            </h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Table
            </h3>

            {/* Table Size */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rows
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Columns
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table Style Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Table Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tableStyles).map(([key, style]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTableStyle(key)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      tableStyle === key
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {style.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {key === "default" && "Simple bordered table"}
                      {key === "striped" && "Alternating row colors"}
                      {key === "bordered" && "Bold borders"}
                      {key === "minimal" && "Clean, no borders"}
                      {key === "colorful" && "Gradient header"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Preview: {tableRows} rows × {tableCols} columns
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Style: {tableStyles[tableStyle].name}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTableDialog(false);
                  setTableRows(3);
                  setTableCols(3);
                  setTableStyle("default");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image URL Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Image from URL
            </h3>

            <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste image URL here (right-click image → Copy image address)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && imageUrlInput.trim()) {
                      e.preventDefault();
                      insertImageFromUrl();
                    }
                  }}
                />
              </div>

              {/* Alt Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Text (optional)
                </label>
                <input
                  type="text"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">
                  💡 How to get image URL:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>Right-click any image → "Copy image address"</li>
                  <li>Works with Google Images, Unsplash, Pexels, etc.</li>
                  <li>Direct links ending in .jpg, .png, .gif work best</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrlInput("");
                  setImageAltText("");
                  setIsLoadingImage(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoadingImage}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertImageFromUrl}
                disabled={!imageUrlInput.trim() || isLoadingImage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoadingImage ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Insert Image"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video URL Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Video from URL
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Supports YouTube and Vimeo links. The video will be embedded
                  responsively.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowVideoDialog(false);
                  setVideoUrl("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertVideo}
                disabled={!videoUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Insert Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doc URL Dialog */}
      {showDocDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Document Link
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Research Paper.pdf"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File URL
                </label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDocDialog(false);
                  setDocUrl("");
                  setDocTitle("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertDoc}
                disabled={!docUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Insert Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
          {error}
        </p>
      )}

      {/* Helper Text */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>✨ Markdown supported</span>
          <span>•</span>
          <span>Ctrl+B: Bold</span>
          <span>•</span>
          <span>Ctrl+I: Italic</span>
          <span>•</span>
          <span>Ctrl+K: Link</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {editorRef.current?.textContent?.length || 0} characters
        </div>
      </div>
    </div>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  minHeight: PropTypes.string,
};

export default RichTextEditor;
