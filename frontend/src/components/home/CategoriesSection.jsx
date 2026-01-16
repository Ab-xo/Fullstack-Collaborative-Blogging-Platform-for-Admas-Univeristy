import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code,
  Microscope,
  GraduationCap,
  Users,
  Calendar,
  Globe,
  Lightbulb,
  BookOpen,
} from "lucide-react";

const CategoriesSection = () => {
  const categories = [
    {
      name: "Technology",
      description: "Latest tech trends, coding tutorials, and innovation",
      icon: Code,
      color: "from-blue-500 to-blue-600",
      posts: 245,
      href: "/category/technology",
    },
    {
      name: "Research",
      description: "Academic research, findings, and publications",
      icon: Microscope,
      color: "from-purple-500 to-purple-600",
      posts: 189,
      href: "/category/research",
    },
    {
      name: "Academic Life",
      description: "Student experiences, study tips, and academic insights",
      icon: GraduationCap,
      color: "from-green-500 to-green-600",
      posts: 312,
      href: "/category/academic",
    },
    {
      name: "Campus Life",
      description: "Events, activities, and university community",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      posts: 156,
      href: "/category/campus-life",
    },
    {
      name: "Events",
      description: "Important updates and university news",
      icon: Calendar,
      color: "from-red-500 to-red-600",
      posts: 78,
      href: "/category/events",
    },
    {
      name: "Culture",
      description: "International insights and cultural exchange",
      icon: Globe,
      color: "from-teal-500 to-teal-600",
      posts: 93,
      href: "/category/culture",
    },
    {
      name: "Innovation",
      description: "Entrepreneurship, startups, and creative solutions",
      icon: Lightbulb,
      color: "from-yellow-500 to-yellow-600",
      posts: 127,
      href: "/category/innovation",
    },
    {
      name: "Literature",
      description: "Creative writing, poetry, and literary analysis",
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-600",
      posts: 84,
      href: "/category/literature",
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Categories
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Dive into diverse topics and discover content that matches your
            interests
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={category.href}
                  className="block card hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.posts} posts
                    </span>
                    <span className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform duration-200">
                      →
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
