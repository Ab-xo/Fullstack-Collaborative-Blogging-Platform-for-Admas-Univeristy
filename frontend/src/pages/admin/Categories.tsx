/**
 * Categories Management Page
 * Clean, polished admin interface for managing blog categories
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Search,
  FileText,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Grid3X3,
  List,
  Hash,
  BookOpen,
  GraduationCap,
  Microscope,
  Calendar,
  Users,
  Cpu,
  Lightbulb,
  Wrench,
  FlaskConical,
  Palette,
  BookMarked,
  Briefcase,
  Award,
  MessageSquare,
  Megaphone,
  Newspaper,
  Layers,
  Code,
  Building,
  Stethoscope,
  Scale,
  School,
  Calculator,
  Globe,
  MoreHorizontal,
  Trophy,
} from 'lucide-react';
// @ts-ignore
import { postsAPI } from '@/api/posts';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { toast } from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  postCount: number;
}

const categoryMeta: Record<string, { icon: React.ElementType; color: string; gradient: string; description: string }> = {
  'academic': { icon: GraduationCap, color: '#3B82F6', gradient: 'from-blue-500 to-blue-600', description: 'Academic content and study resources' },
  'research': { icon: Microscope, color: '#8B5CF6', gradient: 'from-violet-500 to-purple-600', description: 'Research papers and findings' },
  'thesis': { icon: BookMarked, color: '#6366F1', gradient: 'from-indigo-500 to-indigo-600', description: 'Thesis work and dissertations' },
  'tutorials': { icon: BookOpen, color: '#0EA5E9', gradient: 'from-sky-500 to-cyan-600', description: 'Educational tutorials and guides' },
  'campus-life': { icon: Users, color: '#10B981', gradient: 'from-emerald-500 to-green-600', description: 'Student life and experiences' },
  'events': { icon: Calendar, color: '#F59E0B', gradient: 'from-amber-500 to-orange-500', description: 'University events and seminars' },
  'clubs': { icon: Users, color: '#EC4899', gradient: 'from-pink-500 to-rose-500', description: 'Student clubs and organizations' },
  'sports': { icon: Trophy, color: '#EF4444', gradient: 'from-red-500 to-rose-600', description: 'Athletics and sports events' },
  'technology': { icon: Cpu, color: '#06B6D4', gradient: 'from-cyan-500 to-teal-600', description: 'Tech trends and digital tools' },
  'innovation': { icon: Lightbulb, color: '#FBBF24', gradient: 'from-yellow-400 to-amber-500', description: 'Startups and new ideas' },
  'engineering': { icon: Wrench, color: '#64748B', gradient: 'from-slate-500 to-gray-600', description: 'Engineering projects' },
  'science': { icon: FlaskConical, color: '#22C55E', gradient: 'from-green-500 to-emerald-600', description: 'Scientific discoveries' },
  'culture': { icon: Globe, color: '#F97316', gradient: 'from-orange-500 to-red-500', description: 'Cultural events and diversity' },
  'arts': { icon: Palette, color: '#A855F7', gradient: 'from-purple-500 to-fuchsia-600', description: 'Visual arts and creativity' },
  'literature': { icon: BookOpen, color: '#84CC16', gradient: 'from-lime-500 to-green-600', description: 'Creative writing and reviews' },
  'career': { icon: Briefcase, color: '#0D9488', gradient: 'from-teal-500 to-cyan-600', description: 'Career advice and internships' },
  'alumni': { icon: Award, color: '#7C3AED', gradient: 'from-violet-600 to-purple-700', description: 'Alumni success stories' },
  'opinion': { icon: MessageSquare, color: '#6366F1', gradient: 'from-indigo-500 to-blue-600', description: 'Opinion pieces and editorials' },
  'announcements': { icon: Megaphone, color: '#DC2626', gradient: 'from-red-600 to-rose-700', description: 'Official announcements' },
  'news': { icon: Newspaper, color: '#1D4ED8', gradient: 'from-blue-700 to-indigo-700', description: 'Latest news and updates' },
  'general': { icon: Layers, color: '#6B7280', gradient: 'from-gray-500 to-slate-600', description: 'General posts' },
  'computer-science': { icon: Code, color: '#059669', gradient: 'from-emerald-600 to-teal-700', description: 'Computer science topics' },
  'business': { icon: Building, color: '#0369A1', gradient: 'from-sky-700 to-blue-800', description: 'Business and management' },
  'medicine': { icon: Stethoscope, color: '#BE123C', gradient: 'from-rose-700 to-red-800', description: 'Medical and health sciences' },
  'law': { icon: Scale, color: '#78350F', gradient: 'from-amber-800 to-yellow-900', description: 'Legal studies' },
  'education': { icon: School, color: '#4F46E5', gradient: 'from-indigo-600 to-violet-700', description: 'Education and teaching' },
  'mathematics': { icon: Calculator, color: '#7E22CE', gradient: 'from-purple-700 to-violet-800', description: 'Mathematics and statistics' },
  'social-sciences': { icon: Globe, color: '#0891B2', gradient: 'from-cyan-600 to-sky-700', description: 'Social sciences' },
  'other': { icon: MoreHorizontal, color: '#71717A', gradient: 'from-zinc-500 to-gray-600', description: 'Miscellaneous content' },
};


const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getCategories();
      
      if (response.success && response.data) {
        const mappedCategories = response.data.map((cat: any) => ({
          _id: cat._id || cat.slug,
          name: formatCategoryName(cat._id || cat.slug),
          slug: cat._id || cat.slug,
          description: categoryMeta[cat._id || cat.slug]?.description || 'Category description',
          color: categoryMeta[cat._id || cat.slug]?.color || '#6B7280',
          icon: cat._id || cat.slug,
          postCount: cat.count || 0,
        }));
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (slug: string): string => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPosts = categories.reduce((sum, cat) => sum + cat.postCount, 0);
  const topCategory = [...categories].sort((a, b) => b.postCount - a.postCount)[0];
  const activeCategories = categories.filter(cat => cat.postCount > 0).length;

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage and organize blog content</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchCategories}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Refresh</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <StatsCard label="Total Categories" value={categories.length} icon={FolderOpen} gradient="from-violet-500 to-purple-600" />
          <StatsCard label="Total Posts" value={totalPosts} icon={FileText} gradient="from-blue-500 to-indigo-600" />
          <StatsCard label="Active Categories" value={activeCategories} subValue={`${categories.length > 0 ? Math.round((activeCategories / categories.length) * 100) : 0}% with posts`} icon={TrendingUp} gradient="from-emerald-500 to-green-600" />
          <StatsCard label="Top Category" value={topCategory?.name || '-'} subValue={`${topCategory?.postCount || 0} posts`} icon={BarChart3} gradient="from-amber-500 to-orange-600" />
        </motion.div>

        {/* Search and View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-violet-600' : 'text-gray-500'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-violet-600' : 'text-gray-500'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Categories Display */}
        {loading ? (
          <CategoriesSkeleton viewMode={viewMode} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : viewMode === 'grid' ? (
          <CategoriesGrid categories={filteredCategories} />
        ) : (
          <CategoriesList categories={filteredCategories} />
        )}
      </div>
    </DashboardLayout>
  );
};


interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, icon: Icon, gradient }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        {subValue && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subValue}</div>}
      </div>
    </div>
  </motion.div>
);

interface CategoriesGridProps {
  categories: Category[];
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {categories.map((category, index) => {
      const meta = categoryMeta[category.slug] || categoryMeta['other'];
      const IconComponent = meta.icon;
      const maxPosts = Math.max(...categories.map(c => c.postCount), 1);
      
      return (
        <motion.div
          key={category._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
        >
          <div className={`h-24 relative flex items-center justify-center bg-gradient-to-br ${meta.gradient}`}>
            <div className="absolute inset-0 bg-black/10" />
            <IconComponent className="w-12 h-12 text-white relative z-10 drop-shadow-lg" />
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-semibold">
                {category.postCount} posts
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{category.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{category.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Hash className="w-3.5 h-3.5" />
              <span className="font-mono">{category.slug}</span>
            </div>
            <div className="mt-4">
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((category.postCount / maxPosts) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);


interface CategoriesListProps {
  categories: Category[];
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Posts</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {categories.map((category, index) => {
            const meta = categoryMeta[category.slug] || categoryMeta['other'];
            const IconComponent = meta.icon;
            const maxPosts = Math.max(...categories.map(c => c.postCount), 1);
            const percentage = (category.postCount / maxPosts) * 100;
            
            return (
              <motion.tr
                key={category._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${meta.gradient} shadow-md`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{category.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">/{category.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">{category.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{category.postCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: index * 0.03 }}
                        className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                      />
                    </div>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const CategoriesSkeleton: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-6 p-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  );
};

const EmptyState: React.FC<{ searchQuery: string }> = ({ searchQuery }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 text-center">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
      <FolderOpen className="w-10 h-10 text-violet-500" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {searchQuery ? 'No categories found' : 'No categories yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
      {searchQuery ? `No categories match "${searchQuery}". Try a different search term.` : 'Categories will appear here once posts are created.'}
    </p>
  </motion.div>
);

export default Categories;
