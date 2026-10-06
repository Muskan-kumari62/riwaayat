"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/lib/toast/toast-context";

export function Footer() {
  const [email, setEmail] = useState("");
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    success("You have been enrolled into the exclusive Riwaayat Culinary Circle newsletter.");
    setEmail("");
  };

  return (
    <footer className="w-full border-t border-border/80 bg-card/60 backdrop-blur-md text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Narrative */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-500/40 p-0.5 shadow-lg">
                <Image
                  src="/images/logo.jpg"
                  alt="Riwaayat"
                  width={48}
                  height={48}
                  className="object-cover rounded-[10px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-widest text-amber-400">
                  RIWAAYAT
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Premium Indian Restaurant Portal
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pr-6 max-w-md">
              Where Tradition Meets Taste. Celebrating the timeless heritage of Indian hospitality, authentic regional recipes, fragrant dum biryanis, and rich clay oven tandoori delicacies.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="pt-2 max-w-md">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Join The Riwaayat Royal Circle
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-secondary/80 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-amber-300 tracking-wider">
              Explore Portal
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <a href="/home" className="hover:text-amber-400 transition-colors">
                  Home & Tasting Menu
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-amber-400 transition-colors">
                  Our Culinary Heritage
                </a>
              </li>
              <li>
                <a href="/categories" className="hover:text-amber-400 transition-colors">
                  Cuisine Categories
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-amber-400 transition-colors">
                  Dining Services
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-amber-400 transition-colors">
                  Concierge & Contact
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-amber-400 transition-colors">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-amber-300 tracking-wider">
              Exclusive Services
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <a href="/services#dine-in" className="hover:text-amber-400 transition-colors">
                  Dine-In Salon
                </a>
              </li>
              <li>
                <a href="/services#table-reservation" className="hover:text-amber-400 transition-colors">
                  Table Reservation
                </a>
              </li>
              <li>
                <a href="/services#private-dining" className="hover:text-amber-400 transition-colors">
                  VIP Private Dining
                </a>
              </li>
              <li>
                <a href="/services#catering" className="hover:text-amber-400 transition-colors">
                  Gourmet Banquets & Catering
                </a>
              </li>
              <li>
                <a href="/services#takeaway" className="hover:text-amber-400 transition-colors">
                  Artisanal Curbside Takeaway
                </a>
              </li>
              <li>
                <a href="/services#home-delivery" className="hover:text-amber-400 transition-colors">
                  White-Glove Home Delivery
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Hospitality & Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-amber-300 tracking-wider">
              Hospitality Desk
            </h4>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Heritage Grand Tower, 4th Floor, Skyline Avenue, Mumbai 400001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 22 8940 3200</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>concierge@riwaayat.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Lunch: 12:00 PM – 3:30 PM<br />Dinner: 7:00 PM – 11:45 PM</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:border-amber-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:border-amber-400 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:border-amber-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:border-amber-400 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Riwaayat Indian Restaurant Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors">
              Food Safety & Hygiene Standard
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
