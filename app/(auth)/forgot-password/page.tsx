"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/lib/toast/toast-context";

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      success("Password reset instructions dispatched.", "Email Sent");
    }, 900);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black text-foreground relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl border border-amber-500/30 p-8 sm:p-10 shadow-2xl shadow-black/80">
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
            <h1 className="font-serif text-2xl font-bold tracking-widest text-amber-400">
              Password Recovery
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Enter your registered email to receive secure recovery access.
            </p>
          </div>

          {isSent ? (
            <div className="py-6 text-center animate-slide-up">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">
                Recovery Link Dispatched
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                If an account exists for <span className="text-amber-300 font-semibold">{email}</span>, a secure password reset link has been dispatched with 15-minute validity.
              </p>

              <a
                href="/login"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-all shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="diner@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-400 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
