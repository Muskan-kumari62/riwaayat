"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/lib/toast/toast-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please provide both email and password.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      success("Welcome to Riwaayat – Where Tradition Meets Taste.", "Login Successful");
      router.push("/home");
    } else {
      setFormError(result.error || "Invalid credentials.");
      error(result.error || "Authentication failed.");
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError("");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black text-foreground relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="glass-card rounded-3xl border border-amber-500/30 p-8 sm:p-10 shadow-2xl shadow-black/80">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-block relative w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/50 p-0.5 shadow-xl mb-4 gold-border-glow">
              <Image
                src="/images/logo.jpg"
                alt="Riwaayat Emblem"
                width={64}
                height={64}
                className="object-cover rounded-[14px]"
                priority
              />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-widest text-amber-400">
              RIWAAYAT
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mt-1">
              Where Tradition Meets Taste
            </p>
            <p className="text-xs text-stone-400 mt-2">
              Sign in to experience authentic Indian dining, order food & track deliveries
            </p>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-slide-up">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/70 border border-border/80 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary/70 border border-border/80 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-amber-500 focus:ring-amber-400 bg-secondary"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 hover:shadow-amber-900/60 transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In To Riwaayat</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Section for Testing */}
          <div className="mt-6 pt-5 border-t border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2 text-center">
              Quick 1-Click Evaluation Access:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("user@riwaayat.com", "password123")}
                className="p-2 rounded-xl border border-border/80 bg-secondary/40 hover:bg-amber-500/10 hover:border-amber-500/40 text-left transition-all"
              >
                <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Diner
                </div>
                <div className="text-[9px] text-muted-foreground truncate">
                  user@riwaayat.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill("admin@riwaayat.com", "password123")}
                className="p-2 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-left transition-all"
              >
                <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Admin
                </div>
                <div className="text-[9px] text-muted-foreground truncate">
                  admin@riwaayat.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill("delivery@riwaayat.com", "password123")}
                className="p-2 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/15 text-left transition-all"
              >
                <div className="text-[11px] font-semibold text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Courier
                </div>
                <div className="text-[9px] text-muted-foreground truncate">
                  delivery@riwaayat.com
                </div>
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <a
              href="/register"
              className="text-amber-400 font-semibold hover:text-amber-300 hover:underline transition-colors"
            >
              Create Account
            </a>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Encrypted Session • Supabase Auth Ready</span>
        </div>
      </div>
    </div>
  );
}
