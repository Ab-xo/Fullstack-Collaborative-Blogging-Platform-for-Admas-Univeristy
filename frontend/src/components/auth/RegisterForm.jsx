import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Building,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import GoogleSignInButton from "./GoogleSignInButton";
import toast from "react-hot-toast";
import api from "../../services/api";
import { TermsCheckbox, TermsModal } from "../terms";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalType, setTermsModalType] = useState("tos");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const roleApplication = watch("roleApplication");

  // Handle document upload for alumni (supports both click and drag-drop)
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", "graduation_certificate");

      const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setUploadedDocument({
          id: response.data.document.id,
          name: file.name,
          size: file.size,
        });
        toast.success("Document uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploadingDocument(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploadingDocument || !!uploadedDocument,
  });

  const onSubmit = async (data) => {
    // Validate terms acceptance
    if (!termsAccepted) {
      setTermsError("Please accept the Terms of Service and Privacy Policy");
      return;
    }
    setTermsError(null);

    // For alumni, require document upload
    if (data.roleApplication === "alumni" && !uploadedDocument) {
      toast.error("Please upload your graduation certificate");
      return;
    }

    try {
      setLoading(true);

      // Add document ID if alumni
      const registrationData = {
        ...data,
        verificationDocumentId: uploadedDocument?.id,
        termsAccepted: true, // Flag that terms were accepted
      };

      // Remove the old verificationDocument field for alumni
      delete registrationData.verificationDocument;

      await authRegister(registrationData);

      // Show different message for alumni
      if (data.roleApplication === "alumni") {
        toast.success(
          "Registration successful! Your account will be activated after admin verification."
        );
      }

      navigate("/verify-email");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-2.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm";
  const selectClass =
    "w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-white/90 mb-1.5";
  const errorClass = "mt-1 text-xs text-red-500 dark:text-red-400";
  const iconClass = "h-4 w-4 text-blue-500 dark:text-blue-300/60";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className={iconClass} />
            </div>
            <input
              type="text"
              placeholder="John"
              className={inputClass}
              {...register("firstName", {
                required: "First name is required",
                maxLength: { value: 50, message: "Max 50 characters" },
              })}
            />
          </div>
          {errors.firstName && (
            <p className={errorClass}>{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Last Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className={iconClass} />
            </div>
            <input
              type="text"
              placeholder="Doe"
              className={inputClass}
              {...register("lastName", {
                required: "Last name is required",
                maxLength: { value: 50, message: "Max 50 characters" },
              })}
            />
          </div>
          {errors.lastName && (
            <p className={errorClass}>{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className={iconClass} />
          </div>
          <input
            type="email"
            placeholder="your.email@admas.edu.et"
            className={inputClass}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
        </div>
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label className={labelClass}>Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className={iconClass} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            className="w-full pl-11 pr-4 py-2.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Min 6 characters" },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-blue-300/60 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className={errorClass}>{errors.password.message}</p>
        )}
      </div>

      {/* Account Type Selection */}
      <div>
        <label className={labelClass}>
          Account Type <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`relative flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
              watch("accountType") === "reader"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-white/10 hover:border-blue-300"
            }`}
          >
            <input
              type="radio"
              value="reader"
              {...register("accountType", {
                required: "Please select account type",
              })}
              className="sr-only"
            />
            <div className="text-center">
              <span className="text-lg">📖</span>
              <p className="text-sm font-medium text-gray-700 dark:text-white">
                Reader
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Read & comment
              </p>
            </div>
          </label>
          <label
            className={`relative flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
              watch("accountType") === "author"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-white/10 hover:border-blue-300"
            }`}
          >
            <input
              type="radio"
              value="author"
              {...register("accountType", {
                required: "Please select account type",
              })}
              className="sr-only"
            />
            <div className="text-center">
              <span className="text-lg">✍️</span>
              <p className="text-sm font-medium text-gray-700 dark:text-white">
                Author
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Write & publish
              </p>
            </div>
          </label>
        </div>
        {errors.accountType && (
          <p className={errorClass}>{errors.accountType.message}</p>
        )}
      {watch("accountType") === "author" && (
        <div className="flex items-start gap-2 p-3 mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Note: Author accounts allow you to create and publish posts immediately after registration and email verification.
          </p>
        </div>
      )}
      </div>

      {/* Role Application (University Affiliation) */}
      <div>
        <label className={labelClass}>
          University Affiliation{" "}
          <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            {...register("roleApplication", {
              required: "Please select your affiliation",
            })}
            className={selectClass}
            style={{ backgroundImage: "none" }}
          >
            <option value="" className="bg-white dark:bg-slate-800">
              Select your affiliation
            </option>
            <option value="student" className="bg-white dark:bg-slate-800">
              Student
            </option>
            <option value="faculty" className="bg-white dark:bg-slate-800">
              Faculty
            </option>
            <option value="alumni" className="bg-white dark:bg-slate-800">
              Alumni
            </option>
            <option value="staff" className="bg-white dark:bg-slate-800">
              Staff
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400 dark:text-blue-300/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {errors.roleApplication && (
          <p className={errorClass}>{errors.roleApplication.message}</p>
        )}
      </div>

      {/* University ID - User enters their ID */}
      {roleApplication && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className={labelClass}>
            University ID{" "}
            <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-blue-500 dark:text-blue-300/60 text-sm">
                🎫
              </span>
            </div>
            <input
              type="text"
              placeholder={
                roleApplication === "student"
                  ? "e.g., ADMS 5020/14"
                  : roleApplication === "faculty"
                  ? "e.g., ADMF 1234/19"
                  : roleApplication === "staff"
                  ? "e.g., ADMT 0045/21"
                  : roleApplication === "alumni"
                  ? "e.g., ADME 3456/18"
                  : "Enter your university ID"
              }
              className={inputClass}
              {...register("universityId", {
                required: "University ID is required",
                validate: (value) => {
                  // Validate format based on affiliation
                  const prefixMap = {
                    student: "ADMS",
                    faculty: "ADMF",
                    staff: "ADMT",
                    alumni: "ADME",
                  };
                  const expectedPrefix = prefixMap[roleApplication];
                  // Pattern: PREFIX XXXX/YY (with space, 4 digits, slash, 2 digits)
                  const pattern = new RegExp(
                    `^${expectedPrefix}\\s?\\d{4}/\\d{2}$`,
                    "i"
                  );
                  if (!pattern.test(value.trim())) {
                    return `Invalid format. Expected: ${expectedPrefix} XXXX/YY (e.g., ${expectedPrefix} 5020/14)`;
                  }
                  return true;
                },
              })}
            />
          </div>
          {errors.universityId && (
            <p className={errorClass}>{errors.universityId.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Format:{" "}
            {roleApplication === "student"
              ? "ADMS XXXX/YY"
              : roleApplication === "faculty"
              ? "ADMF XXXX/YY"
              : roleApplication === "staff"
              ? "ADMT XXXX/YY"
              : roleApplication === "alumni"
              ? "ADME XXXX/YY"
              : "PREFIX XXXX/YY"}{" "}
            (e.g., ADMS 5020/14)
          </p>
        </motion.div>
      )}

      {/* Conditional Fields */}
      {(roleApplication === "student" || roleApplication === "faculty") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className={labelClass}>Department</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Building className={iconClass} />
            </div>
            <input
              type="text"
              placeholder="e.g., Computer Science"
              className={inputClass}
              {...register("department", {
                required: "Department is required",
              })}
            />
          </div>
          {errors.department && (
            <p className={errorClass}>{errors.department.message}</p>
          )}
        </motion.div>
      )}

      {roleApplication === "student" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className={labelClass}>Year of Study</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-blue-500 dark:text-blue-300/60 text-sm">
                📚
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g., 3rd Year"
              className={inputClass}
              {...register("yearOfStudy", {
                required: "Year of study is required",
              })}
            />
          </div>
          {errors.yearOfStudy && (
            <p className={errorClass}>{errors.yearOfStudy.message}</p>
          )}
        </motion.div>
      )}

      {roleApplication === "faculty" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className={labelClass}>Position</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-blue-500 dark:text-blue-300/60 text-sm">
                👔
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g., Assistant Professor"
              className={inputClass}
              {...register("position", { required: "Position is required" })}
            />
          </div>
          {errors.position && (
            <p className={errorClass}>{errors.position.message}</p>
          )}
        </motion.div>
      )}

      {roleApplication === "alumni" && (
        <>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className={labelClass}>Graduation Year</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-blue-500 dark:text-blue-300/60 text-sm">
                  🎓
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g., 2020"
                className={inputClass}
                {...register("graduationYear", {
                  required: "Graduation year is required",
                  pattern: {
                    value: /^(19|20)\d{2}$/,
                    message: "Please enter a valid year (e.g., 2020)",
                  },
                })}
              />
            </div>
            {errors.graduationYear && (
              <p className={errorClass}>{errors.graduationYear.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <label className={labelClass}>
              Graduation Certificate (PDF){" "}
              <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Upload your graduation certificate for verification. Max 5MB, PDF
              only.
            </p>

            {/* Drag and Drop Upload Zone */}
            {!uploadedDocument ? (
              <div
                {...getRootProps()}
                className={`w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-white/5"
                } ${uploadingDocument ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input {...getInputProps()} />
                {uploadingDocument ? (
                  <>
                    <svg
                      className="animate-spin h-8 w-8 text-blue-500"
                      viewBox="0 0 24 24"
                    >
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
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Uploading...
                    </span>
                  </>
                ) : isDragActive ? (
                  <>
                    <Upload className="h-8 w-8 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Drop your PDF here
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-blue-500" />
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Drag & drop your PDF here
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        or click to browse files
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      {uploadedDocument.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {(uploadedDocument.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedDocument(null);
                  }}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Your account will be pending until an admin verifies your
                graduation certificate. You will receive a notification once
                approved.
              </p>
            </div>
          </motion.div>
        </>
      )}

      {/* Terms and Conditions Checkbox */}
      <div className="pt-2">
        <TermsCheckbox
          checked={termsAccepted}
          onCheckedChange={(checked) => {
            setTermsAccepted(checked);
            if (checked) setTermsError(null);
          }}
          onTermsClick={() => {
            setTermsModalType("tos");
            setTermsModalOpen(true);
          }}
          onPrivacyClick={() => {
            setTermsModalType("privacy");
            setTermsModalOpen(true);
          }}
          error={termsError}
        />
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        type={termsModalType}
      />

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            <span>Creating Account...</span>
          </>
        ) : (
          "Create Account"
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-transparent text-gray-500 dark:text-white/50">
            Or sign up with
          </span>
        </div>
      </div>

      {/* Google Sign Up */}
      <GoogleSignInButton isRegister={true} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-transparent text-gray-500 dark:text-white/50">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login Link */}
      <Link to="/login">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-white font-semibold rounded-xl transition-all"
        >
          Sign In
        </motion.button>
      </Link>
    </form>
  );
};

export default RegisterForm;
