"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/lib/toast/toast-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  // Compute password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { level: 1, text: "Weak", color: "bg-rose-500" };
    if (score === 2 || score === 3)
      return { level: 2, text: "Moderate", color: "bg-amber-400" };
    return { level: 3, text: "Strong", color: "bg-emerald-400" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setFormError("Please fill out all mandatory fields.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Please provide a valid email address.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setFormError("Please agree to the Riwaayat Terms and Dining Policy.");
      return;
    }

    setIsSubmitting(true);
    const result = await register(fullName, email, password, phone);
    setIsSubmitting(false);

    if (result.success) {
      setIsRegistered(true);
      success("Account created successfully. Welcome to Riwaayat.", "Registration Complete");
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    } else {
      setFormError(result.error || "Unable to register account.");
      error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black text-foreground relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-card rounded-3xl border border-amber-500/30 p-8 sm:p-10 shadow-2xl shadow-black/80">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-block relative w-14 h-14 rounded-2xl overflow-hidden border border-amber-500/50 p-0.5 shadow-xl mb-3 gold-border-glow">
              <Image
                src="/images/logo.jpg"
                alt="Riwaayat"
                width={56}
                height={56}
                className="object-cover rounded-[12px]"
                priority
              />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-widest text-amber-400">
              RIWAAYAT
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mt-1">
              Where Tradition Meets Taste
            </p>
          </div>

          {isRegistered ? (
            <div className="py-8 text-center animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Account Created!
              </h2>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                Welcome to the Riwaayat Indian dining family, <span className="text-amber-300 font-semibold">{fullName}</span>. You are being redirected to the portal home...
              </p>
            </div>
          ) : (
            <>
              {formError && (
                <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-slide-up">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Mail className="w-4 h-4 text-amber-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="diner@domain.com"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Phone className="w-4 h-4 text-amber-400" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="w-4 h-4 text-amber-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="w-4 h-4 text-amber-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Password Strength:</span>
                      <span className="font-semibold text-amber-300">
                        {strength.text}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.level / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Terms Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-300">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded border-border text-amber-500 focus:ring-amber-400 bg-secondary"
                    />
                    <span className="leading-snug">
                      I agree to the Riwaayat Indian Restaurant Terms of Service, Privacy Policy, and Dining Code of Conduct.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Experience Riwaayat</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <a
                  href="/login"
                  className="text-amber-400 font-semibold hover:text-amber-300 hover:underline transition-colors"
                >
                  Sign In here
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
