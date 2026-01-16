import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  Move,
  GraduationCap,
  BookOpen,
  Code,
  Briefcase,
  TrendingUp,
  Award,
  CircuitBoard,
  FileText,
  Wrench,
  Globe,
  Palette,
  Users,
  Lightbulb,
} from "lucide-react";
import { toast } from "react-hot-toast";
import programService from "../../services/programService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Available icons for selection
const ICON_OPTIONS = [
  { name: "GraduationCap", icon: GraduationCap },
  { name: "BookOpen", icon: BookOpen },
  { name: "Code", icon: Code },
  { name: "Briefcase", icon: Briefcase },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Award", icon: Award },
  { name: "CircuitBoard", icon: CircuitBoard },
  { name: "FileText", icon: FileText },
  { name: "Wrench", icon: Wrench },
  { name: "Globe", icon: Globe },
  { name: "Palette", icon: Palette },
  { name: "Users", icon: Users },
  { name: "Lightbulb", icon: Lightbulb },
];

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "GraduationCap",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    isActive: true,
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await programService.getAllPrograms();
      setPrograms(data.data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProgram) {
        await programService.updateProgram(currentProgram._id, formData);
        toast.success("Program updated successfully");
      } else {
        // Calculate max order to append to end
        const maxOrder = programs.reduce((max, p) => Math.max(max, p.order || 0), 0);
        await programService.createProgram({ ...formData, order: maxOrder + 1 });
        toast.success("Program created successfully");
      }
      fetchPrograms();
      resetForm();
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error(error.response?.data?.message || "Failed to save program");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?")) return;
    try {
      await programService.deleteProgram(id);
      toast.success("Program deleted successfully");
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  const handleEdit = (program) => {
    setCurrentProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      icon: program.icon,
      color: program.color,
      isActive: program.isActive,
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentProgram(null);
    setFormData({
      name: "",
      description: "",
      icon: "GraduationCap",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
      isActive: true,
    });
    setIsEditing(false);
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIcon = (iconName) => {
    const IconComponent = ICON_OPTIONS.find((i) => i.name === iconName)?.icon || GraduationCap;
    return <IconComponent className="w-5 h-5" />;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Academic Programs
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage academic programs and descriptions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentProgram ? "Edit Program" : "New Program"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Program Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                >
                  {ICON_OPTIONS.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                  placeholder="Brief description of the program..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color Class (Tailwind)
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                  placeholder="e.g. text-blue-600 bg-blue-50"
                />
                <p className="mt-1 text-xs text-gray-500">Provide Tailwind classes for text and background color.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (Visible to public)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Program
              </button>
            </div>
          </form>
          </div>
        </motion.div>
      )}

      {/* Programs List */}
      <div className="glass rounded-2xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 dark:border-white/5 bg-white/50 dark:bg-gray-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program) => (
              <motion.div
                key={program._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 transition-all card-hover border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${program.color}`}>
                    {renderIcon(program.icon)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                       {program.name}
                       {!program.isActive && (
                         <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                           Inactive
                         </span>
                       )}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {program.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(program)}
                    className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(program._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No programs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Programs;
