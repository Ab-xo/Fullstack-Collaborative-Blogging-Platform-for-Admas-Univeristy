import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { SITE_BRANDING } from "../../constants/branding";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "All Posts", href: "/posts" },
    { name: "Categories", href: "/categories" },
    { name: "Contact", href: "/contact" },
    { name: "Write a Post", href: "/posts/create" },
  ];

  const blogCategories = [
    { name: "Technology", href: "/category/technology" },
    { name: "Research", href: "/category/research" },
    { name: "Campus Life", href: "/category/campus-life" },
    { name: "Innovation", href: "/category/innovation" },
    { name: "Events", href: "/category/events" },
    { name: "Sports", href: "/category/sports" },
  ];

  const resourceLinks = [
    { name: "Privacy", href: "/terms?tab=privacy" },
    { name: "Terms", href: "/terms?tab=tos" },
    { name: "Guidelines", href: "/terms?tab=content-guidelines" },
    { name: "FAQs", href: "/contact#faq" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://www.facebook.com/AdmasUni/",
      color: "hover:bg-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com/AdmasUniversity",
      color: "hover:bg-sky-500",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/admasuniversity",
      color: "hover:bg-pink-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/school/admas-university",
      color: "hover:bg-blue-700",
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com/@admasuniversity",
      color: "hover:bg-red-600",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="container-max section-padding py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 blur-lg opacity-30 rounded-full"></div>
                <img
                  src={SITE_BRANDING.logoPath}
                  alt="Admas University Logo"
                  className="relative w-14 h-14 object-contain rounded-full bg-white p-1.5 shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {SITE_BRANDING.mainTitle}
                </h3>
                <p className="text-sm text-primary-400">
                  {SITE_BRANDING.subTitle}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering the Admas University community through collaborative
              knowledge sharing, academic discourse, and innovative content
              creation.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl bg-gray-800/80 ${social.color} transition-all duration-300 group border border-gray-700/50 hover:border-transparent hover:scale-110`}
                    title={social.name}
                  >
                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Categories
            </h4>
            <ul className="space-y-2.5">
              {blogCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
              Contact Us
            </h4>
            <div className="space-y-3">
              <a
                href="https://maps.google.com/?q=Yabsira+Building+Riche+Addis+Ababa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Visit Us</p>
                  <p className="text-xs text-gray-400">
                    Yabsira Building, Riche, Addis Ababa
                  </p>
                </div>
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+251116671234"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-white">
                      +251 11 667 1234
                    </p>
                  </div>
                </a>
                <a
                  href="mailto:info@admasuniversity.edu.et"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-white truncate">
                      info@admas.edu.et
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800/50">
        <div className="container-max section-padding py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {new Date().getFullYear()}{" "}
              <span className="text-gray-400">{SITE_BRANDING.footerName}</span>.
              All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              {resourceLinks.map((link, index) => (
                <span key={link.name} className="flex items-center">
                  <Link
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-primary-400 transition-colors px-2"
                  >
                    {link.name}
                  </Link>
                  {index < resourceLinks.length - 1 && (
                    <span className="text-gray-700"></span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
