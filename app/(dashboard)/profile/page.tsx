"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  Camera,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/lib/toast/toast-context";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateProfile, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);

  const curatedAvatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      error("Full name cannot be blank.");
      return;
    }

    setIsSaving(true);
    const ok = await updateProfile({
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
    });
    setIsSaving(false);

    if (ok) {
      success("Your profile details have been saved to the database.");
    } else {
      error("Failed to update profile. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Patron Credentials</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            My Gastronomy Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your personal dining credentials, contact details, and concierge preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Profile Summary Card */}
          <div className="md:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-amber-500/30 shadow-xl text-center">
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-amber-400 p-1 mb-4 gold-border-glow bg-stone-900 flex items-center justify-center">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <User className="w-12 h-12 text-amber-400" />
                )}
              </div>

              <h3 className="font-serif text-xl font-bold text-foreground">
                {user?.full_name || fullName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {user?.email}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Shield className="w-3.5 h-3.5" />
                <span className="capitalize">
                  {isAdmin ? "Executive Administrator" : "Privileged Diner"}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-border/60 text-left text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Member Since:
                  </span>
                  <span className="font-medium text-foreground">
                    {user?.created_at ? formatDate(user.created_at) : "Jan 2024"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Dining Tier:
                  </span>
                  <span className="font-semibold text-amber-300">
                    Grand Gold Reserve
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Avatar Chooser */}
            <div className="glass-card rounded-2xl p-4 border border-border/80">
              <span className="text-xs font-semibold text-foreground block mb-2">
                Choose Curator Avatar
              </span>
              <div className="flex items-center justify-between gap-2">
                {curatedAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                      avatarUrl === url
                        ? "border-amber-400 scale-110 shadow-md shadow-amber-400/30"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Avatar option ${i}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Editable Form */}
          <div className="md:col-span-8">
            <div className="glass-card rounded-3xl p-8 border border-amber-500/30 shadow-xl">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                Update Account Information
              </h2>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Primary Email (Immutable Identity)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-muted-foreground text-xs cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Contact hospitality admin to modify verified email address.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Mobile Phone (For Reservation SMS Alerts)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Phone className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Custom Avatar Image URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Camera className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
