"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Wrench,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  User,
  Phone,
  Check,
  Briefcase,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyOrTrade: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  // Compute password strength score (0 to 3)
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[0-9]/.test(p) && /[a-zA-Z]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g. name@company.com)";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required for dispatch notifications";
    }

    if (role === "customer" && !formData.companyOrTrade.trim()) {
      newErrors.companyOrTrade = "Company name is required for customer accounts";
    } else if (role === "technician" && !formData.companyOrTrade.trim()) {
      newErrors.companyOrTrade = "Please specify your trade/specialization (e.g. Fiber, Network, CCTV)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.termsAccepted) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await authClient.signUp.email({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.fullName.trim(),
      });

      if (error) {
        setErrors({ general: error.message || "Registration failed. Please check your information." });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setRegisterSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrors({ general: message });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 relative flex flex-col justify-center overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Return Bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to FieldFlow Home</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 grow flex items-center justify-center relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-0 w-full max-w-5xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
          {/* Left Column: Brand & Security Showcase */}
          <div className="lg:col-span-5 bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Brand Logo */}
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5 text-white transform -rotate-45" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    Field<span className="text-blue-400">Flow</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Registration Portal
                  </span>
                </div>
              </Link>

              {/* Tagline & Pitch */}
              <div className="space-y-3 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Free In Under 2 Minutes</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {role === "customer"
                    ? "Dispatch Certified Field Specialists Nationwide"
                    : "Unlock High-Paying On-Demand Field Work Orders"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {role === "customer"
                    ? "Create service requests, get AI-matched with verified technicians in minutes, track live GPS arrivals, and settle invoices with automated escrow."
                    : "Receive high-paying local dispatch tickets matched to your exact trade skills, get guaranteed next-day direct pay, and manage everything from the mobile app."}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      100% Background Checked
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Strict 10-year criminal, credential, and drug screening
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Zero Upfront Commitments
                    </span>
                    <span className="text-[11px] text-slate-400">
                      No credit card required to explore vetted technician coverage
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Link to Login */}
            <div className="pt-8 border-t border-slate-800/80 relative z-10">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Already have an account?</span>
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-bold underline"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Registration Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Create Your FieldFlow Account
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Choose your account role (Customer or Technician) and fill out the details below.
                </p>
              </div>

              {/* Role Selection Tabs (Customer vs Technician) */}
              <div className="mb-6 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Choose Your Role *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Customer Option */}
                  <div
                    onClick={() => {
                      setRole("customer");
                      setErrors({});
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${role === "customer"
                        ? "border-blue-600 bg-blue-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${role === "customer"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 grow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">
                          Customer
                        </span>
                        {role === "customer" && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        I need to hire, dispatch, and manage field technicians.
                      </p>
                    </div>
                  </div>

                  {/* Technician Option */}
                  <div
                    onClick={() => {
                      setRole("technician");
                      setErrors({});
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${role === "technician"
                        ? "border-blue-600 bg-blue-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${role === "technician"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 grow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">
                          Technician
                        </span>
                        {role === "technician" && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        I am a field specialist looking for work orders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Success State */}
              {registerSuccess ? (
                <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold">Account Created Successfully!</h3>
                    <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                      Welcome to FieldFlow, <strong>{formData.fullName}</strong>. We have sent a confirmation email to <strong>{formData.email}</strong> to activate your {role === "customer" ? "Customer Command Center" : "Technician Workspace"}.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4" noValidate>
                  {/* General error message banner if applicable */}
                  {errors.general && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Row 1: Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.fullName ? "text-rose-500" : "text-slate-400"
                            }`}
                        />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => {
                            setFormData({ ...formData, fullName: e.target.value });
                            clearError("fullName");
                          }}
                          placeholder={role === "customer" ? "Marcus Vance" : "Devon Miller"}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${errors.fullName
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {role === "customer" ? "Work Email *" : "Email Address *"}
                      </label>
                      <div className="relative">
                        <Mail
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? "text-rose-500" : "text-slate-400"
                            }`}
                        />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            clearError("email");
                          }}
                          placeholder={
                            role === "customer"
                              ? "dispatcher@company.com"
                              : "technician@email.com"
                          }
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${errors.email
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone & Role-Specific Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.phone ? "text-rose-500" : "text-slate-400"
                            }`}
                        />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            clearError("phone");
                          }}
                          placeholder="+1 (555) 234-5678"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${errors.phone
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Company Name (Customer) or Trade (Technician) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {role === "customer" ? "Company Name *" : "Primary Trade Specialization *"}
                      </label>
                      <div className="relative">
                        {role === "customer" ? (
                          <Building2
                            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.companyOrTrade ? "text-rose-500" : "text-slate-400"
                              }`}
                          />
                        ) : (
                          <Briefcase
                            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.companyOrTrade ? "text-rose-500" : "text-slate-400"
                              }`}
                          />
                        )}
                        <input
                          type="text"
                          value={formData.companyOrTrade}
                          onChange={(e) => {
                            setFormData({ ...formData, companyOrTrade: e.target.value });
                            clearError("companyOrTrade");
                          }}
                          placeholder={
                            role === "customer"
                              ? "Apex Logistics & Retail Hubs"
                              : "Fiber Splicing / Cat6A Cabling / CCNA"
                          }
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${errors.companyOrTrade
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                      </div>
                      {errors.companyOrTrade && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.companyOrTrade}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Password *
                        </label>
                      </div>
                      <div className="relative">
                        <Lock
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? "text-rose-500" : "text-slate-400"
                            }`}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            clearError("password");
                          }}
                          placeholder="Min 8 characters"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${errors.password
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 1 ? "bg-amber-400" : "bg-slate-200"
                                }`}
                            />
                            <div
                              className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 2 ? "bg-blue-500" : "bg-slate-200"
                                }`}
                            />
                            <div
                              className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 3 ? "bg-emerald-500" : "bg-slate-200"
                                }`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>
                              Strength:{" "}
                              <strong>
                                {passwordStrength === 1
                                  ? "Weak"
                                  : passwordStrength === 2
                                    ? "Medium"
                                    : passwordStrength === 3
                                      ? "Strong"
                                      : "Too short"}
                              </strong>
                            </span>
                            <span>Min 8 chars, letters & numbers</span>
                          </div>
                        </div>
                      )}

                      {errors.password && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.password}</span>
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Confirm Password *
                        </label>
                      </div>
                      <div className="relative">
                        <Lock
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? "text-rose-500" : "text-slate-400"
                            }`}
                        />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            clearError("confirmPassword");
                          }}
                          placeholder="Re-enter password"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${errors.confirmPassword
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.confirmPassword}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                      <div
                        onClick={() => {
                          const nextState = !formData.termsAccepted;
                          setFormData({ ...formData, termsAccepted: nextState });
                          if (nextState) clearError("terms");
                        }}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${formData.termsAccepted
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                          }`}
                      >
                        {formData.termsAccepted && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                      <span className="leading-normal">
                        I agree to the{" "}
                        <Link
                          href="/#about"
                          className="text-blue-600 hover:text-blue-700 underline font-semibold"
                        >
                          FieldFlow Terms of Service
                        </Link>
                        ,{" "}
                        <Link
                          href="/#about"
                          className="text-blue-600 hover:text-blue-700 underline font-semibold"
                        >
                          Privacy Policy
                        </Link>
                        , and service quality standards.
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.terms}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Your Account...</span>
                      </div>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Login Callout */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
              <p className="text-xs text-slate-600">
                Already registered with FieldFlow?{" "}
                <Link
                  href="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign In to Portal
                </Link>
              </p>

              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-bit SSL Protection
                </span>
                <span>•</span>
                <Link href="/#about" className="hover:text-slate-600">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link href="/#about" className="hover:text-slate-600">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
