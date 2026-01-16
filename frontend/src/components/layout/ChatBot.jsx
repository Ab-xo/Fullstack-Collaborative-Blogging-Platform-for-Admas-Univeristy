import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User,
  ChevronDown,
  Sparkles,
  Minimize2,
  Maximize2,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import apiClient from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hello ${user?.firstName || 'there'}! I'm your Admas Blog Assistant. How can I help you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearConversation = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: `Hello ${user?.firstName || 'there'}! I'm your Admas Blog Assistant. How can I help you today?`,
        timestamp: new Date().toISOString()
      }
    ]);
    setSelectedImage(null);
    setImagePreview(null);
    toast.success("Conversation cleared!");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim() || "📷 [Image attached]",
      timestamp: new Date().toISOString(),
      image: imagePreview
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    const tempImage = selectedImage;
    const tempPreview = imagePreview;
    setSelectedImage(null);
    setImagePreview(null);
    setLoading(true);

    try {
      // If image is attached, inform the assistant
      let messageContent = userMessage.content;
      if (tempImage) {
        messageContent = `[User attached an image] ${messageContent}`;
      }

      const response = await apiClient.post("/ai/chat", {
        message: messageContent,
        context: `Current page: ${window.location.pathname}`
      });

      if (response.data?.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.data.reply,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("Assistant is having trouble connecting.");
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9998]">
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
          >
            <MessageSquare className="w-7 h-7" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window - Larger Size */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              height: isMinimized ? '70px' : '650px',
              width: '450px'
            }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="glass dark:glass rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Blog Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                  {messages.map((msg, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.role === 'user' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          {msg.image && (
                            <img 
                              src={msg.image} 
                              alt="Uploaded" 
                              className="max-w-[200px] rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          )}
                          <div className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-600'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-xs text-gray-500">Assistant is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-16 rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Area with Clear Button */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                  {/* Clear Conversation Button - Visible Above Input */}
                  {messages.length > 1 && (
                    <div className="mb-2 flex justify-end">
                      <button
                        onClick={clearConversation}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Clear conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Chat</span>
                      </button>
                    </div>
                  )}
                  
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0"
                      title="Attach image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={(!input.trim() && !selectedImage) || loading}
                      className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0 shadow-lg shadow-blue-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;
