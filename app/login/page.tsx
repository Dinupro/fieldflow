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
  Users,
  KeyRound,
  Check,
  Building2,
  ChevronDown,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [role, setRole] = useState<"admin" | "dispatcher" | "technician">("dispatcher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user) {
      const userRole = (session.user as any)?.role;
      const target =
        userRole === "ADMIN"
          ? "/admin/dashboard"
          : userRole === "TECHNICIAN"
            ? "/technician/dashboard"
            : "/dispatcher/dashboard";
      router.push(target);
    }
  }, [session, isPending, router]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address (e.g. name@company.com)";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDirectLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await authClient.signIn.email({
        email: loginEmail.trim(),
        password: loginPass,
        rememberMe: true,
      });

      if (error) {
        setErrors({ general: error.message || "Invalid email or password. Please check your credentials." });
        setIsLoading(false);
        return;
      }

      // Verify the authenticated user's actual registered role
      let actualRole: string | null = (data as any)?.user?.role || null;

      if (!actualRole) {
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            actualRole = json?.role || null;
          }
        } catch {
          // ignore
        }
      }

      const expectedRole =
        role === "admin" ? "ADMIN" : role === "technician" ? "TECHNICIAN" : "DISPATCHER";

      if (actualRole && actualRole !== expectedRole) {
        // Invalidate session immediately to prevent unauthorized portal access
        await authClient.signOut();

        const selectedRoleDisplay =
          role === "admin"
            ? "an Administrator"
            : role === "technician"
              ? "a Technician"
              : "a Dispatcher";

        setErrors({
          general: `This account is not registered as ${selectedRoleDisplay}.`,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setLoginSuccess(true);

      const targetPath =
        actualRole === "ADMIN"
          ? "/admin/dashboard"
          : actualRole === "TECHNICIAN"
            ? "/technician/dashboard"
            : "/dispatcher/dashboard";

      router.push(targetPath);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrors({ general: message });
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await handleDirectLogin(email, password);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail("");
    }, 3500);
  };

  return (
    <main className="min-h-screen bg-slate-50 relative flex flex-col justify-center overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Decor & Ambient Glows */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Return Bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to FieldFlow Home</span>
        </Link>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 grow flex items-center justify-center relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-0 w-full max-w-5xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
          {/* Left Column: Brand & Enterprise Security Showcase */}
          <div className="lg:col-span-5 bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glow */}
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
                    Operations Portal
                  </span>
                </div>
              </Link>

              {/* Pitch */}
              <div className="space-y-3 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enterprise Security Portal</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {role === "admin"
                    ? "Enterprise Administration & RBAC Governance"
                    : role === "dispatcher"
                      ? "Seamless Field Operations & Dispatching"
                      : "Technician Field Operations & Mobile Queue"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {role === "admin"
                    ? "Sign in to oversee organizations, manage user roles & permissions, audit system logs, and configure security controls."
                    : role === "dispatcher"
                      ? "Log in to manage work orders, monitor real-time technician GPS tracking, approve milestone deliverables, and access automated billing."
                      : "Sign in to view your assigned work tickets, submit on-site proof of completion, log notes, and manage your daily field route."}
                </p>
              </div>

              {/* Security & Operational Proof Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Enterprise-Grade Security
                    </span>
                    <span className="text-[11px] text-slate-400">
                      SOC 2 Type II Certified & 256-bit TLS Encryption
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      45,000+ Vetted Field Network
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Average dispatch acceptance in &lt; 14.8 minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quote & Trust */}
            <div className="pt-8 border-t border-slate-800/80 relative z-10">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Need assistance?</span>
                <Link
                  href="/#contact"
                  className="text-blue-400 hover:text-blue-300 font-bold underline"
                >
                  24/7 Dispatch Desk
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Select your role and enter your verified credentials to access your FieldFlow workspace.
                </p>
              </div>

              {/* Select Your Role Section */}
              <div className="mb-3 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Administrator Card */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setRole("admin");
                      setErrors({});
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setRole("admin");
                        setErrors({});
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-left focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                      role === "admin"
                        ? "border-purple-600 bg-purple-50/50 shadow-xs ring-2 ring-purple-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          role === "admin"
                            ? "bg-purple-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      {role === "admin" && (
                        <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Administrator
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Enterprise RBAC & platform control.
                      </p>
                    </div>
                  </div>

                  {/* Dispatcher Card */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setRole("dispatcher");
                      setErrors({});
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setRole("dispatcher");
                        setErrors({});
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      role === "dispatcher"
                        ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          role === "dispatcher"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      {role === "dispatcher" && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Dispatcher
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Work orders, schedules & CRM hub.
                      </p>
                    </div>
                  </div>

                  {/* Technician Card */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setRole("technician");
                      setErrors({});
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setRole("technician");
                        setErrors({});
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      role === "technician"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          role === "technician"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Wrench className="w-4 h-4" />
                      </div>
                      {role === "technician" && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Technician
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Field jobs queue & on-site logs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helper text display indicating selected role */}
              <div className="mb-4">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    role === "admin"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : role === "dispatcher"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      role === "admin"
                        ? "bg-purple-600"
                        : role === "dispatcher"
                          ? "bg-blue-600"
                          : "bg-emerald-600"
                    }`}
                  />
                  <span>
                    Logging in as{" "}
                    <strong>
                      {role === "admin"
                        ? "Administrator"
                        : role === "dispatcher"
                          ? "Dispatcher"
                          : "Technician"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Login Success Notification */}
              {loginSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">Authentication Successful</h3>
                  <p className="text-xs text-emerald-700">
                    Redirecting to your <strong>FieldFlow {role === "admin" ? "Admin" : role === "dispatcher" ? "Dispatcher" : "Technician"} Dashboard</strong>...
                  </p>
                  <div className="pt-2">
                    <Link
                      href={
                        role === "admin"
                          ? "/admin/dashboard"
                          : role === "technician"
                            ? "/technician/dashboard"
                            : "/dispatcher/dashboard"
                      }
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
                    >
                      <span>Proceed to Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* General error message banner if applicable */}
                  {errors.general && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="font-semibold">{errors.general}</span>
                    </div>
                  )}

                  {/* Main Form */}
                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    {/* Work Email Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="email"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Work Email
                        </label>
                      </div>
                      <div className="relative">
                        <Mail
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                            errors.email ? "text-rose-500" : "text-slate-400"
                          }`}
                        />
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          placeholder="name@company.com"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${
                            errors.email
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="password"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                            errors.password ? "text-rose-500" : "text-slate-400"
                          }`}
                        />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                          }}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 bg-white border transition-all focus:outline-none focus:ring-2 ${
                            errors.password
                              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.password}</span>
                        </p>
                      )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                        <div
                          onClick={() => setRememberMe(!rememberMe)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            rememberMe
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {rememberMe && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <span>Remember my device for 30 days</span>
                      </label>
                    </div>

                    {/* Sign In Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <>
                          <span>Sign In to FieldFlow</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Security Notice */}
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Role verification is performed after authentication for secure access.</span>
                    </div>
                  </form>
                </>
              )}

              {/* Collapsible Development Demo Accounts (Dev only, completely hidden in production) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowDevPanel(!showDevPanel)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      Development Demo Accounts (Dev Only)
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        showDevPanel ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDevPanel && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-xs space-y-2 animate-fadeIn">
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Reference credentials for local testing. Manual entry required per security standards.
                      </p>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                          <div>
                            <span className="font-bold text-slate-800">Admin:</span>{" "}
                            <code className="text-purple-600 font-mono">admin@fieldflow.test</code>
                          </div>
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold border border-purple-200">Admin</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                          <div>
                            <span className="font-bold text-slate-800">Dispatcher:</span>{" "}
                            <code className="text-blue-600 font-mono">dispatch@fieldflow.test</code>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-200">Dispatcher</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                          <div>
                            <span className="font-bold text-slate-800">Technician:</span>{" "}
                            <code className="text-emerald-600 font-mono">tech@fieldflow.test</code>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">Technician</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Register Callout */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
              <p className="text-xs text-slate-600">
                Don&apos;t have a FieldFlow account yet?{" "}
                <Link
                  href="/register"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Create an Account / Register
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

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Reset your password
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your verified work email address and we will send a secure password reset link.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reset instructions sent!</span>
                </div>
                <p>Check your inbox at <strong>{forgotEmail}</strong> to reset your password.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}