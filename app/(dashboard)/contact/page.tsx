"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { db } from "@/lib/db";
import { useToast } from "@/lib/toast/toast-context";
import { useAuth } from "@/lib/auth/auth-context";

export default function ContactPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.submitContactMessage({
        name,
        email,
        phone,
        subject,
        message,
      });

      setIsSubmitted(true);
      success("Your message has been delivered to the Hospitality Desk.");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit message. Please try again.";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Concierge & Hospitality</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">
            Contact the Riwaayat Concierge
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
            Have questions regarding Shahi banquet bookings, wedding catering, Haveli table reservations, or custom dietary accommodations? Our hospitality team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Hospitality Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-amber-500/30 shadow-xl space-y-6">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Hospitality Desk
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We welcome reservations up to 90 days in advance. For same-day VIP reservations, kindly telephone our head concierge directly.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Restaurant Location</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Heritage Grand Tower, 4th Floor, Skyline Avenue, Nariman Point, Mumbai 400001, India
                    </p>
                    <span className="text-[10px] text-amber-400 font-semibold mt-1 block">
                      Valet Parking Available at Entrance Gate 2
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Telephone Concierge</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      +91 22 8940 3200 / +91 22 8940 3201
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Available daily 10:00 AM – 11:30 PM IST
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Official Inquiries</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      concierge@riwaayat.com
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      events@riwaayat.com (Banquet & Press)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Dining Hours</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lunch Service: 12:00 PM – 3:30 PM
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dinner Service: 7:00 PM – 11:45 PM
                    </p>
                    <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                      Last kitchen order placed 45 mins prior to closing
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylized Architectural Location Map */}
            <div className="relative h-60 rounded-3xl overflow-hidden border border-border/80 bg-stone-900 shadow-xl flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative text-center p-6 glass-card rounded-2xl border border-amber-500/40">
                <MapPin className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-bounce" />
                <h4 className="font-serif text-sm font-bold text-foreground">
                  Riwaayat Heritage Dining Haveli
                </h4>
                <p className="text-[10px] text-stone-300 mt-0.5">
                  18.9220° N, 72.8228° E • Mumbai Skyline
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
                >
                  View in Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-8 sm:p-10 border border-amber-500/30 shadow-xl">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Direct Inquiry Submission
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-6">
                Your message is directly logged into our guest relations dashboard.
              </p>

              {isSubmitted ? (
                <div className="py-12 text-center animate-slide-up">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    Message Dispatched
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                    Thank you, <span className="text-amber-300 font-semibold">{name}</span>. Our hospitality desk has received your dispatch and will reply within 3 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-all shadow-md"
                  >
                    Send Another Dispatch
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="diner@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Inquiry Subject *
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        placeholder="e.g. Private Banquet / Tasting Inquiry"
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Your Message or Specification *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="Please specify your request, guest counts, dietary notes, or preferred dates..."
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Inquiry to Concierge</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
