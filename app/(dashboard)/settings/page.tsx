"use client";

import React, { useState } from "react";
import {
  Settings,
  Bell,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useTheme } from "@/lib/theme/theme-context";
import { useToast } from "@/lib/toast/toast-context";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [newsletter, setNewsletter] = useState(true);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      error("New passwords do not match.");
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      success("Your account password has been updated securely.");
    }, 800);
  };

  const handleSavePreferences = () => {
    success("Notification and dining preferences updated.");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences & Security</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure your dining experience, security credentials, and ambient visual appearance.
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. APPEARANCE SETTINGS */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Appearance & Ambience
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select your preferred interface illumination.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  theme === "dark"
                    ? "bg-amber-500/10 border-amber-400 text-foreground ring-1 ring-amber-400/30"
                    : "bg-secondary/40 border-border text-muted-foreground hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black border border-stone-800 flex items-center justify-center text-amber-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block text-foreground">
                      Nocturne Dark (Signature)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Deep charcoal with warm candlelight gold accents
                    </span>
                  </div>
                </div>
                {theme === "dark" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  theme === "light"
                    ? "bg-amber-500/10 border-amber-400 text-foreground ring-1 ring-amber-400/30"
                    : "bg-secondary/40 border-border text-muted-foreground hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-amber-600">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block text-foreground">
                      Champagne Ivory Light
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Warm cream background with rich bronze accents
                    </span>
                  </div>
                </div>
                {theme === "light" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                )}
              </button>
            </div>
          </div>

          {/* 2. SECURITY & PASSWORD */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Security & Authentication
                </h2>
                <p className="text-xs text-muted-foreground">
                  Update your access password to protect your dining privileges.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Current Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    New Password
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs text-muted-foreground hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPass ? "Hide passwords" : "Show passwords"}</span>
                </button>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isChangingPass ? (
                    <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 3. NOTIFICATION & PRIVILEGE PREFERENCES */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Communication & Privacy
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage how Riwaayat&apos;s hospitality concierge contacts you.
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-lg">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    SMS & WhatsApp Booking Confirmations
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Instant alerts for confirmed table reservations and valet slots.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-400"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Email Invoices & Menu Previews
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Receive detailed dining invoices and chef&apos;s tasting notes.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-400"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Exclusive Seasonal Truffle & Wine Releases
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Be alerted 48 hours prior to public degustation seat releases.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-400"
                />
              </label>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
