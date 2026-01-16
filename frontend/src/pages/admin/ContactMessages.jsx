/**
 * ============================================================================
 * CONTACT MESSAGES - SLIDE PANEL UI
 * ============================================================================
 * Message list with slide-in side panel for viewing details
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  Trash2,
  X,
  User,
  RefreshCw,
  Send,
  Archive,
  Clock,
  MailOpen,
  CheckCircle2,
  Star,
  Phone,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { contactAPI } from "../../api/contact";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    page: 1,
    limit: 15,
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMessages();
  }, [filters.status, filters.page]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getMessages(filters);
      setMessages(response.data.messages);
      setCounts(response.data.counts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message) => {
    try {
      const response = await contactAPI.getMessage(message._id);
      setSelectedMessage(response.data);
      setPanelOpen(true);
      fetchMessages();
    } catch (error) {
      console.error("Failed to fetch message:", error);
      toast.error("Failed to load message details");
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedMessage(null), 300);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await contactAPI.updateStatus(id, status);
      toast.success(`Marked as ${status}`);
      fetchMessages();
      if (selectedMessage?._id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    try {
      setSending(true);
      await contactAPI.replyToMessage(selectedMessage._id, replyText);
      toast.success("Reply sent successfully!");
      setReplyText("");
      fetchMessages();
      setSelectedMessage({
        ...selectedMessage,
        status: "replied",
        replyMessage: replyText,
        repliedAt: new Date(),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    try {
      await contactAPI.deleteMessage(id);
      toast.success("Message deleted");
      closePanel();
      fetchMessages();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters({ ...filters, status: tab === "all" ? "all" : tab, page: 1 });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      new: {
        color: "bg-blue-500",
        text: "text-blue-700",
        bg: "bg-blue-100",
        label: "New",
      },
      read: {
        color: "bg-amber-500",
        text: "text-amber-700",
        bg: "bg-amber-100",
        label: "Read",
      },
      replied: {
        color: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-100",
        label: "Replied",
      },
      archived: {
        color: "bg-gray-400",
        text: "text-gray-700",
        bg: "bg-gray-200",
        label: "Archived",
      },
    };
    return configs[status] || configs.new;
  };

  const tabs = [
    { id: "all", label: "All", count: counts.total || 0 },
    { id: "new", label: "New", count: counts.new || 0 },
    { id: "read", label: "Read", count: counts.read || 0 },
    { id: "replied", label: "Replied", count: counts.replied || 0 },
    { id: "archived", label: "Archived", count: counts.archived || 0 },
  ];

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -m-6 p-6 relative">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Contact Messages
                </h1>
                <p className="text-sm text-gray-500">
                  {counts.new || 0} unread • {counts.total || 0} total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Message Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Mail className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No messages found</p>
              <p className="text-sm">Messages will appear here when received</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredMessages.map((message) => {
                  const statusConfig = getStatusConfig(message.status);
                  const isUnread = message.status === "new";
                  const isSelected = selectedMessage?._id === message._id;

                  return (
                    <tr
                      key={message._id}
                      onClick={() => handleViewMessage(message)}
                      className={`cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                        isSelected ? "bg-blue-50 dark:bg-blue-900/30" : ""
                      } ${isUnread ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              isUnread ? "bg-blue-600" : "bg-gray-400"
                            }`}
                          >
                            {message.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                isUnread
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {message.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {message.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className={`truncate max-w-[300px] ${
                            isUnread
                              ? "font-semibold text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {message.subject}
                        </p>
                        <p className="text-sm text-gray-400 truncate max-w-[300px]">
                          {message.message?.substring(0, 50)}...
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getTimeAgo(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * filters.limit + 1} to{" "}
                {Math.min(pagination.page * filters.limit, pagination.total)} of{" "}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  disabled={filters.page >= pagination.pages}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slide-in Side Panel */}
        <AnimatePresence>
          {panelOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePanel}
                className="fixed inset-0 bg-black/30 z-40"
              />

              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
              >
                {selectedMessage && (
                  <>
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                          {selectedMessage.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {selectedMessage.name}
                          </h3>
                          <p className="text-blue-100 text-sm">
                            {selectedMessage.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closePanel}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {/* Subject */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {selectedMessage.subject}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              getStatusConfig(selectedMessage.status).bg
                            } ${getStatusConfig(selectedMessage.status).text}`}
                          >
                            {getStatusConfig(selectedMessage.status).label}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {formatDate(selectedMessage.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 mb-6">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                          {selectedMessage.message}
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-6">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Contact Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <a
                              href={`mailto:${selectedMessage.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {selectedMessage.email}
                            </a>
                          </div>
                          {selectedMessage.phone && (
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-blue-600" />
                              <a
                                href={`tel:${selectedMessage.phone}`}
                                className="text-blue-600 hover:underline"
                              >
                                {selectedMessage.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Previous Reply */}
                      {selectedMessage.replyMessage && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 mb-6">
                          <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Your Reply
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {selectedMessage.replyMessage}
                          </p>
                          {selectedMessage.repliedAt && (
                            <p className="text-sm text-emerald-600 mt-3">
                              Sent on {formatDate(selectedMessage.repliedAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {selectedMessage.status === "new" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedMessage._id, "read")
                            }
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all font-medium"
                          >
                            <MailOpen className="w-4 h-4" />
                            Mark as Read
                          </button>
                        )}
                        {selectedMessage.status !== "archived" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                selectedMessage._id,
                                "archived"
                              )
                            }
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                          >
                            <Archive className="w-4 h-4" />
                            Archive
                          </button>
                        )}
                        {selectedMessage.status === "archived" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedMessage._id, "read")
                            }
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium"
                          >
                            <Mail className="w-4 h-4" />
                            Unarchive
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(selectedMessage._id)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Reply Section */}
                    {selectedMessage.status !== "replied" && (
                      <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/50">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Send Reply
                        </h4>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-3"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Reply to: {selectedMessage.email}
                          </p>
                          <button
                            onClick={handleReply}
                            disabled={sending || !replyText.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                          >
                            {sending ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            {sending ? "Sending..." : "Send Reply"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ContactMessages;
