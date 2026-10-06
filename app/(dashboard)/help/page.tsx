"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/lib/toast/toast-context";
import { SupportRequest } from "@/types";
import { formatDate } from "@/lib/utils";

export default function HelpPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);

  // Ticket Form
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      q: "What is the dress code at Riwaayat?",
      a: "Our dress code is Smart Elegant. We kindly request guests to wear traditional Indian attire or collared shirts and trousers with closed footwear. Athletic wear, sportswear, and flip-flops are politely not permitted in the Grand Dining Salon.",
    },
    {
      q: "How far in advance can I book a table?",
      a: "Table reservations can be booked up to 90 days in advance via our portal. For bookings involving more than 8 guests or the VIP Private Salon, please submit a reservation request or contact our head concierge directly.",
    },
    {
      q: "Do you cater to specific dietary requirements and allergies?",
      a: "Yes. Our culinary brigade accommodates Jain, vegan, pescatarian, nut-free, and celiac diets with dedicated preparation stations. Please indicate your dietary preferences when reserving your table.",
    },
    {
      q: "Can I bring my own wine bottle (Corkage Policy)?",
      a: "Patrons may bring rare vintage wine bottles not present on our extensive 350-label wine list. A corkage fee of ₹3,500 per 750ml bottle applies, including tableside decanting and Riedel crystal stemware service.",
    },
    {
      q: "What are your takeaway and white-glove delivery zones?",
      a: "Our temperature-regulated delivery fleet operates across South and Central Mumbai within a 15km radius of Nariman Point. Orders are sealed in tamper-proof thermal containers.",
    },
    {
      q: "What is your cancellation and table hold policy?",
      a: "Tables are held for 20 minutes past your confirmed reservation time. In the event of changes, kindly notify the concierge at least 4 hours in advance.",
    },
  ];

  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      const data = await db.getSupportRequests(user?.id);
      if (isMounted) {
        setSupportRequests(data);
      }
    }
    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      error("Please enter a subject and your message.");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.submitSupportRequest({
        user_id: user?.id || "guest",
        user_name: user?.full_name || "Guest Patron",
        user_email: user?.email || "guest@riwaayat.com",
        subject,
        message,
        priority,
      });

      success("Your support request has been logged. Our concierge will review it.");
      setSubject("");
      setMessage("");
      const updated = await db.getSupportRequests(user?.id);
      setSupportRequests(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit request.";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Concierge Assistance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">
            Help & Patron Support
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
            Find immediate answers regarding reservations, dietary accommodations, private events, or submit a direct ticket to our Guest Relations team.
          </p>

          {/* Search FAQs */}
          <div className="mt-8 max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4 text-amber-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search common questions (e.g. dress code, corkage)..."
              className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-secondary/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400 shadow-md"
            />
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No matching answers found. Feel free to submit a support request below.
              </p>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl border border-border/80 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-serif text-base font-semibold text-foreground">
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Support Ticket & My Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Submit Form */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-8 border border-amber-500/30 shadow-xl">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                Open Concierge Support Ticket
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                Have a specialized request? Our Executive Concierge replies within 2 hours.
              </p>

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Subject / Concern *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Special anniversary decor, custom wine pairing"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "low", label: "General" },
                      { id: "medium", label: "Priority" },
                      { id: "high", label: "Urgent (Today)" },
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPriority(p.id as "low" | "medium" | "high")}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all border ${
                          priority === p.id
                            ? "bg-amber-500 text-stone-950 border-amber-400 shadow-sm"
                            : "bg-secondary/60 text-muted-foreground border-border hover:border-amber-500/30"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Detailed Inquiry *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe your requirement in detail..."
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Ticket to Concierge</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* My Tickets List */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-xl">
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">
                My Support Inquiries ({supportRequests.length})
              </h3>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {supportRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">
                    You have no active support inquiries.
                  </p>
                ) : (
                  supportRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-secondary/40 border border-border/60 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground truncate max-w-[180px]">
                          {req.subject}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            req.status === "resolved"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                              : req.status === "in_progress"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                              : "bg-blue-950/80 text-blue-300 border border-blue-500/50"
                          }`}
                        >
                          {req.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {req.message}
                      </p>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
                        <span>Priority: {req.priority}</span>
                        <span>{formatDate(req.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
