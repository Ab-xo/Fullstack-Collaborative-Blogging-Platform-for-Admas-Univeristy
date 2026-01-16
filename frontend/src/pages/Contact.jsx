/**
 * ============================================================================
 * CONTACT PAGE - ENHANCED VERSION
 * ============================================================================
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  Globe,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Building2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { contactAPI } from "../api/contact";

// Illustration URLs
const ILLUSTRATIONS = {
  contact:
    "https://img.freepik.com/free-vector/contact-us-concept-illustration_114360-2299.jpg",
  support:
    "https://img.freepik.com/free-vector/customer-support-illustration_23-2148890148.jpg",
  faq: "https://img.freepik.com/free-vector/faqs-concept-illustration_114360-5185.jpg",
};

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await contactAPI.submitContactForm(data);
      setIsSubmitted(true);
      toast.success("Message sent successfully!");
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Yabsira Building, Riche\nAddis Ababa, Ethiopia",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      link: "https://maps.google.com/?q=Yabsira+Building+Riche+Addis+Ababa",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+251 11 667 1234\n+251 91 234 5678",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      link: "tel:+251116671234",
    },
    {
      icon: Mail,
      title: "Email Us",
      content: "info@admasuniversity.edu.et\nsupport@admasblog.com",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      link: "mailto:info@admasuniversity.edu.et",
    },
    {
      icon: Clock,
      title: "Office Hours",
      content: "Mon - Fri: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const faqs = [
    {
      question: "How do I get approval to blog on the platform?",
      answer:
        "Register with your university credentials and select 'Author' as your account type. Your account will be activated after email verification.",
    },
    {
      question: "Can alumni contribute to the blog?",
      answer:
        "Yes! Alumni are welcome to share their experiences. Register with your alumni credentials and select 'Author' account type.",
    },
    {
      question: "What types of content are allowed?",
      answer:
        "Academic research, campus life stories, technology insights, and educational content. All posts are reviewed by moderators.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "Use the report button on any post or comment. Our moderation team reviews all reports within 24 hours.",
    },
    {
      question: "How long does it take to get a response?",
      answer:
        "We typically respond within 24-48 business hours. For urgent matters, please call our office directly.",
    },
    {
      question: "Can I request a feature or suggest improvements?",
      answer:
        "Absolutely! Use the contact form with 'Feedback & Suggestions' as the subject.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/30 dark:bg-blue-800/20 rounded-full blur-3xl" />
        </div>

        <div className="container-max section-padding relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <MessageCircle className="w-4 h-4" />
                We'd Love to Hear From You
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Get in
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  Touch
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Have questions about our blogging platform or Admas University?
                We're here to help and would love to hear from you.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Send className="w-5 h-5" /> Send Message
                </a>
                <a
                  href="#faq"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300"
                >
                  <HelpCircle className="w-5 h-5" /> View FAQs
                </a>
              </div>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-[400px]">
                <div
                  className="absolute -inset-8 bg-gradient-to-br from-blue-500/25 via-blue-400/20 to-cyan-500/25 blur-3xl"
                  style={{ borderRadius: "20% 80% 70% 30% / 60% 30% 70% 40%" }}
                />
                <div
                  className="absolute -inset-4 border-4 border-dashed border-blue-300/40 dark:border-blue-500/30"
                  style={{ borderRadius: "30% 70% 60% 40% / 50% 40% 60% 50%" }}
                />
                <div
                  className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800 p-3 shadow-2xl"
                  style={{ borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%" }}
                >
                  <img
                    src={ILLUSTRATIONS.contact}
                    alt="Contact Us"
                    className="w-full h-auto object-cover aspect-square"
                    style={{
                      borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%",
                    }}
                  />
                </div>
                <div className="absolute -top-6 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl rotate-12 opacity-70 shadow-lg" />
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-60 shadow-lg" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white dark:bg-gray-800/50">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Multiple ways to reach us - choose what works best for you
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {info.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line mb-4">
                      {info.content}
                    </p>
                    {info.link && (
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {info.title === "Visit Us"
                          ? "Get Directions"
                          : "Contact Now"}{" "}
                        →
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section id="contact-form" className="py-20">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Send us a Message
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      We'll get back to you within 24-48 hours
                    </p>
                  </div>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Thank you for reaching out. We'll respond soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register("firstName", { required: "Required" })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="John"
                          disabled={isSubmitting}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register("lastName", { required: "Required" })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Doe"
                          disabled={isSubmitting}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email",
                          },
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("subject", { required: "Required" })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Technical Support">
                          Technical Support
                        </option>
                        <option value="Account Issues">Account Issues</option>
                        <option value="Content Moderation">
                          Content Moderation
                        </option>
                        <option value="Partnership">
                          Partnership Opportunity
                        </option>
                        <option value="Feedback">Feedback & Suggestions</option>
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        {...register("message", {
                          required: "Required",
                          minLength: {
                            value: 10,
                            message: "Min 10 characters",
                          },
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Map & Support Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Support Illustration Card */}
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">24/7 Support</h3>
                  </div>
                  <p className="text-white/80 mb-6">
                    Our dedicated support team is always ready to help you with
                    any questions or issues.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
                        >
                          <Users className="w-5 h-5" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-white/80">
                      Support team ready to assist
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Our Location
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Yabsira Building, Riche - Addis Ababa
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63050.30087149212!2d38.71784360303271!3d9.004885285321329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85b326d043b7%3A0xc6174aa09a073516!2zWWFic2lyYSBCdWlsZGluZyB8IFJpY2hlIHwg4Yur4Yml4Yi14YirIOGIheGKleGMuyB8IOGIquGJvA!5e0!3m2!1sen!2set!4v1706531016445!5m2!1sen!2set"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Admas University Location"
                    className="w-full"
                  />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                  <a
                    href="https://maps.google.com/?q=Yabsira+Building+Riche+Addis+Ababa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    <Globe className="w-4 h-4" /> Open in Google Maps
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* FAQ Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center lg:sticky lg:top-24"
            >
              <div className="relative w-full max-w-[350px]">
                <div
                  className="absolute -inset-8 bg-gradient-to-br from-purple-500/25 via-pink-500/20 to-rose-500/25 blur-3xl"
                  style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%" }}
                />
                <div
                  className="absolute -inset-3 border-3 border-dashed border-purple-300/40"
                  style={{ borderRadius: "65% 35% 35% 65% / 55% 45% 55% 45%" }}
                />
                <div
                  className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-2xl p-2"
                  style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%" }}
                >
                  <img
                    src={ILLUSTRATIONS.faq}
                    alt="FAQ"
                    className="w-full h-auto object-cover aspect-square"
                    style={{
                      borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%",
                    }}
                  />
                </div>
                <div className="absolute -top-5 -right-5 w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl rotate-12 opacity-70 shadow-lg" />
                <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-gradient-to-br from-rose-400 to-red-500 rounded-full opacity-60 shadow-lg" />
              </div>
            </motion.div>

            {/* FAQ Accordion */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
                <HelpCircle className="w-4 h-4" />
                Frequently Asked Questions
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                Got Questions? We've Got Answers
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
                        openFaq === index
                          ? "shadow-lg"
                          : "shadow-sm hover:shadow-md"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === index ? null : index)
                        }
                        className="w-full px-6 py-5 flex items-center justify-between text-left"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            openFaq === index
                              ? "bg-primary-100 dark:bg-primary-900/30"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          {openFaq === index ? (
                            <ChevronUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openFaq === index ? "max-h-48" : "max-h-0"
                        }`}
                      >
                        <p className="px-6 pb-5 text-gray-600 dark:text-gray-400">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-3xl"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative p-8 lg:p-16 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Still Have Questions?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Our team is always happy to help. Reach out to us through any of
                our contact channels.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:support@admasblog.com"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  <Mail className="w-5 h-5" /> Email Support
                </a>
                <a
                  href="tel:+251116671234"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  <Phone className="w-5 h-5" /> Call Us Now
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
