"use client";

import React from "react";
import Image from "next/image";
import {
  Crown,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AboutPage() {
  const stats = [
    { value: "25+", label: "Years of Culinary Legacy" },
    { value: "100%", label: "Pure Desi Ghee & Saffron" },
    { value: "65,000+", label: "Cherished Diners Served" },
    { value: "15", label: "Regional Indian Specialties" },
  ];

  const chefs = [
    {
      name: "Chef Aditi Sharma",
      role: "Executive Culinary Director & Founder",
      bio: "Rooted in royal Rajputana and Awadhi cooking lineages, Chef Aditi harmonizes centuries-old grandmother recipes with modern precision.",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Ustad Raghuveer Singh",
      role: "Master Khansama & Dum Biryani Specialist",
      bio: "A third-generation royal bawarchi from Lucknow, Ustad Raghuveer oversees slow dum cooking in sealed earthen handis and authentic charcoal tandoors.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Maharaj Shambhu Lal",
      role: "Principal Halwai & Mithai Artisan",
      bio: "Master confectioner from Bikaner specializing in traditional reduced khoya sweets, saffron-soaked jalebis, and pure pistachio kulfis.",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>The Heritage of Riwaayat</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">
            A Symphony of Indian Heritage, Flavour & Warmth
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
            Where Tradition Meets Taste. Created to celebrate the timeless rituals, royal recipes, and generous hospitality of India.
          </p>
        </div>

        {/* Narrative & Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Our Origin: Reviving Royal Indian Culinary Legacies
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Riwaayat was born out of a profound reverence for India&apos;s regional culinary masteries. From the aromatic slow-cooked Awadhi handis to the robust desert savories of Rajasthan and the vibrant tandoori kitchens of Punjab, every dish tells a story of heritage and patient craft.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We reject modern shortcuts. Our dals simmer for 18 hours over charcoal embers, our whole spices are stone-pounded every morning, and our breads are freshly slapped onto clay tandoor walls and brushed with golden desi ghee.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/80">
                <span className="font-serif text-sm font-bold text-amber-300 block mb-1">
                  Our Mission
                </span>
                <p className="text-xs text-muted-foreground">
                  To honor authentic Indian culinary traditions while delivering five-star hospitality and seamless food ordering.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/80">
                <span className="font-serif text-sm font-bold text-amber-300 block mb-1">
                  Our Vision
                </span>
                <p className="text-xs text-muted-foreground">
                  To be the quintessential home for authentic Indian fine dining, celebrated for purity, flavor, and warmth.
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[440px] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl">
            <Image
              src="/images/hero.jpg"
              alt="Riwaayat Haveli Courtyard"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-500/30">
              <span className="text-xs font-semibold text-amber-300">
                The Haveli Courtyard at Riwaayat
              </span>
              <p className="text-[11px] text-stone-300 mt-1">
                Hand-carved jharokhas, brass dinnerware, soft sitar recitals, and warm royal hospitality.
              </p>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((st, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 text-center border border-border/80 hover:border-amber-500/40 transition-colors"
            >
              <div className="font-serif text-3xl sm:text-4xl font-bold text-amber-400">
                {st.value}
              </div>
              <div className="text-xs text-muted-foreground mt-2 font-medium">
                {st.label}
              </div>
            </div>
          ))}
        </div>

        {/* Master Chefs Ensemble */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              The Khansamas
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-2">
              Meet Our Culinary Masters
            </h2>
            <p className="text-xs text-muted-foreground mt-2">
              Guided by generational wisdom and uncompromising pride in Indian hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {chefs.map((chef, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-border/80 bg-card overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-lg"
              >
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={chef.image}
                    alt={chef.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif text-xl font-bold text-white">
                      {chef.name}
                    </h3>
                    <span className="text-xs font-semibold text-amber-400">
                      {chef.role}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {chef.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The 5 Quality Promises */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-amber-500/30">
          <h3 className="font-serif text-2xl font-bold text-foreground mb-6 text-center">
            Our Five Sacred Quality Promises
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">100% Desi Ghee & Fresh Makkhan</h4>
                <p className="text-xs text-muted-foreground mt-1">Prepared using pure farm ghee and white butter with zero artificial adulterants.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Kashmiri Mongra Saffron</h4>
                <p className="text-xs text-muted-foreground mt-1">Hand-picked Grade A saffron strands that lend natural golden hue and fragrance.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Stone-Ground Spices Daily</h4>
                <p className="text-xs text-muted-foreground mt-1">Whole spices roasted and ground every morning in granite sil-battas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Authentic Clay Oven Tandoors</h4>
                <p className="text-xs text-muted-foreground mt-1">Charcoal fired clay ovens that impart the unmistakable smoky rustic aroma.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Atithi Devo Bhava Hospitality</h4>
                <p className="text-xs text-muted-foreground mt-1">Treating every diner as an honored guest with respect, warmth, and devotion.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Hot Tamper-Sealed Delivery</h4>
                <p className="text-xs text-muted-foreground mt-1">Food dispatched in thermal insulated bags with verified receiver confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
