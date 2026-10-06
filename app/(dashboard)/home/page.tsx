"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Calendar,
  Utensils,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
  Flame,
  ShoppingBag,
  ChefHat,
  Crown,
  HeartHandshake,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CategoryCard } from "@/components/cards/category-card";
import { DishCard } from "@/components/cards/dish-card";
import { ServiceCard } from "@/components/cards/service-card";
import { TestimonialCard } from "@/components/cards/testimonial-card";
import { TableReservationModal } from "@/components/modals/table-reservation-modal";
import { DishDetailModal } from "@/components/modals/dish-detail-modal";
import { db } from "@/lib/db";
import { Category, Dish, ServiceItem, Testimonial } from "@/types";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationServiceTitle, setReservationServiceTitle] = useState("Table Reservation");

  // Dish Customization Modal
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);

  const handleSelectDish = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  useEffect(() => {
    async function loadData() {
      const [cats, dshs, srvs, tests] = await Promise.all([
        db.getCategories(),
        db.getDishes(),
        db.getServices(),
        db.getTestimonials(),
      ]);
      setCategories(cats);
      setDishes(dshs);
      setServices(srvs);
      setTestimonials(tests);
    }
    loadData();
  }, []);

  const filteredDishes =
    selectedCategoryTab === "all"
      ? dishes
      : dishes.filter((d) => d.category_id === selectedCategoryTab);

  // Filtered highlights for dedicated sections
  const rajasthaniDishes = dishes.filter((d) => d.category_id === "cat-rajasthani");
  const biryaniTandoorDishes = dishes.filter(
    (d) => d.category_id === "cat-biryani" || d.category_id === "cat-tandoor"
  );
  const chefSpecials = dishes.filter((d) => d.is_chef_special);
  const dessertDishes = dishes.filter((d) => d.category_id === "cat-desserts");

  const handleOpenReservation = (title?: string) => {
    setReservationServiceTitle(title || "Haveli Table Reservation");
    setIsReservationOpen(true);
  };

  return (
    <DashboardLayout>
      {/* 1. HERO SECTION (Requirement 15) */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Royal Vignette Gradients */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Riwaayat Royal Heritage Dining"
            fill
            priority
            className="object-cover object-center scale-105 animate-subtle-zoom brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/75 to-black/55" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/45 to-background/95" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          {/* Heritage Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-semibold mb-6 shadow-xl animate-slide-up">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-widest uppercase">
              Authentic Indian Culinary Heritage
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-4xl text-balance drop-shadow-xl animate-slide-up">
            RIWAAYAT
            <span className="block text-2xl sm:text-3xl lg:text-4xl gold-gradient-text italic font-normal mt-2 tracking-normal">
              Where Tradition Meets Taste
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-stone-200 max-w-2xl leading-relaxed text-balance drop-shadow-md animate-slide-up">
            Experience the rich flavours, timeless recipes and warm hospitality of India. From aromatic clay oven tandoors to slow-simmered handi biryanis and authentic Rajasthani thalis.
          </p>

          {/* Location & Hospitality Pill */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-amber-200/90 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Lunch: 11:30 AM – 3:30 PM & Dinner: 7:00 PM – 11:30 PM
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Heritage Haveli, Palace Road, Civil Lines
            </span>
          </div>

          {/* CTAs (Requirement 15: Explore Our Menu, Order Now) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 animate-slide-up">
            <a
              href="#menu"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 hover:shadow-amber-900/80 transition-all duration-300 hover:scale-105"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Our Menu</span>
            </a>

            <a
              href="/checkout"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full glass-card hover:bg-white/10 text-stone-100 hover:text-amber-300 font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-amber-500/30 transition-all duration-300"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Order Now</span>
            </a>

            <button
              onClick={() => handleOpenReservation("Reserve A Royal Table")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-secondary/80 hover:bg-secondary text-stone-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-border/80 transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Book Table</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY & INDIAN HERITAGE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl">
            <div className="relative h-[420px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80"
                alt="Riwaayat Heritage Spices"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Passed Down Generations
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  The Sacred Ritual of Indian Slow Cooking
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              Our Culinary Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              An Authentic Journey Through The Flavours & Traditions of India
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At Riwaayat, food is not merely prepared; it is revered. Rooted in the rich culinary legacies of Awadh, Punjab, Rajasthan, and the ancient coastal ports, every recipe honours age-old methods: slow charcoal simmering (dum), whole spices stone-ground daily, and unhurried roasting in red-hot clay tandoors.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From our 18-hour simmered Dal Makhani to our Dal Baati Churma steeped in pure desi ghee, every plate embodies the timeless warmth of traditional Indian hospitality.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl glass-card border border-border/80 text-center">
                <div className="font-serif text-2xl font-bold text-amber-400">100%</div>
                <div className="text-[11px] font-semibold text-muted-foreground mt-1">
                  Authentic Spices
                </div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-border/80 text-center">
                <div className="font-serif text-2xl font-bold text-amber-400">15+</div>
                <div className="text-[11px] font-semibold text-muted-foreground mt-1">
                  Indian Regions
                </div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-border/80 text-center">
                <div className="font-serif text-2xl font-bold text-amber-400">18 Hrs</div>
                <div className="text-[11px] font-semibold text-muted-foreground mt-1">
                  Slow Dum Simmer
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED INDIAN CATEGORIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Regional Gastronomy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Explore Indian Cuisine Categories
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
              From aromatic Mughlai handis to fragrant Hyderabadi biryanis, crispy South Indian dosas, and rustic Punjabi tandoor breads.
            </p>
          </div>

          <a
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
          >
            <span>Browse All 15 Categories</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.slice(0, 6).map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => {
                setSelectedCategoryTab(cat.id);
                const menuEl = document.getElementById("menu");
                if (menuEl) menuEl.scrollIntoView({ behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </section>

      {/* 4. POPULAR INDIAN DISHES MENU */}
      <section id="menu" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Signature Selections
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mt-2">
            Popular Indian Dishes
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">
            Handcrafted with freshly ground garam masala, creamy makhani gravies, and unhurried charcoal cooking. All prices in Indian Rupees (₹).
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          <button
            onClick={() => setSelectedCategoryTab("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
              selectedCategoryTab === "all"
                ? "bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold"
                : "bg-secondary/60 text-muted-foreground border-border hover:border-amber-500/30"
            }`}
          >
            All Specialties ({dishes.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryTab(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                selectedCategoryTab === cat.id
                  ? "bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold"
                  : "bg-secondary/60 text-muted-foreground border-border hover:border-amber-500/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dish Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onSelect={handleSelectDish} />
          ))}
        </div>
      </section>

      {/* 5. RAJASTHANI SPECIALTIES SECTION (Requirement 15) */}
      {rajasthaniDishes.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Rajputana Royalty
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1">
                Authentic Rajasthani Specialties
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
                Iconic desert delicacies including Dal Baati Churma, Ker Sangri, and Gatte Ki Sabzi prepared in pure cow ghee.
              </p>
            </div>
            <a
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <span>Explore Rajasthani Menu</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rajasthaniDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onSelect={handleSelectDish} />
            ))}
          </div>
        </section>
      )}

      {/* 6. BIRYANI & TANDOOR SPOTLIGHT (Requirement 15) */}
      {biryaniTandoorDishes.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Dum & Charcoal Grills
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1">
                Biryani & Tandoor Masterpieces
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
                Sealed earthen pot biryanis infused with saffron potli, and succulent skewered tikkas roasted over clay tandoor embers.
              </p>
            </div>
            <a
              href="#menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <span>View All Tandoor & Rice</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {biryaniTandoorDishes.slice(0, 6).map((dish) => (
              <DishCard key={dish.id} dish={dish} onSelect={handleSelectDish} />
            ))}
          </div>
        </section>
      )}

      {/* 7. CHEF'S RECOMMENDATIONS & VEGETARIAN FAVOURITES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              Khansama Curations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Chef&apos;s Special Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
              Signature culinary creations beloved by food connoisseurs and families alike.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefSpecials.slice(0, 4).map((dish) => (
            <DishCard key={dish.id} dish={dish} onSelect={handleSelectDish} />
          ))}
        </div>
      </section>

      {/* 8. TRADITIONAL INDIAN DESSERTS (Requirement 15) */}
      {dessertDishes.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Mithaas & Celebrations
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1">
                Traditional Indian Desserts
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
                Warm Gulab Jamuns, delicate saffron Rasmalai, rich Gajar Ka Halwa, and crispy golden Jalebis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {dessertDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onSelect={handleSelectDish} />
            ))}
          </div>
        </section>
      )}

      {/* 9. WHY CHOOSE RIWAAYAT (Requirement 15) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Uncompromising Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Why Choose Riwaayat
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">
            Every dish is an homage to traditional Indian hospitality and authentic royal cooking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-border/80 hover:border-amber-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Master Royal Khansamas
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Our culinary team preserves heirloom spice blends and traditional copper handi techniques practiced across royal courts.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/80 hover:border-amber-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Pure Desi Ghee & Saffron
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              We use 100% farm-sourced desi ghee, certified Kashmiri Mongra saffron, and freshly ground whole spices with zero artificial colors.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/80 hover:border-amber-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Thermal Sealed Delivery
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Hot rotis, curries, and biryanis are packed in insulated containers and verified with compulsory delivery recipient handover.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/80 hover:border-amber-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Atithi Devo Bhava Hospitality
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Experience the ancient Indian tradition of treating every guest as divine with personalised care and warm service.
            </p>
          </div>
        </div>
      </section>

      {/* 10. FIVE-STAR RESTAURANT SERVICES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Indian Hospitality
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Dining Services & Banquet Offerings
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
              From Haveli dine-in courtyards to private Shahi Dastarkhwan salons, event catering, and doorstep delivery.
            </p>
          </div>

          <a
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
          >
            <span>View All Services</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              onAction={() => handleOpenReservation(srv.name)}
            />
          ))}
        </div>
      </section>

      {/* 11. PATRON TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Patron Reflections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Words From Cherished Diners
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">
            Read what culinary enthusiasts say about their gastronomic experiences at Riwaayat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </section>

      {/* 12. ORDER NOW / RESERVATION FINAL CTA (Requirement 15) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 border border-amber-500/40 text-center shadow-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-black">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Authentic Indian Hospitality
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-4 leading-tight">
              An Authentic Royal Feast Awaits You at Riwaayat
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-4 leading-relaxed">
              Order your favourite Indian curries, dum biryanis, and tandoor breads hot to your doorstep, or reserve a table in our Haveli dining courtyard.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/checkout"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order Food Online</span>
              </a>

              <button
                onClick={() => handleOpenReservation("Reserve A Haveli Table at Riwaayat")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full glass-card hover:bg-white/10 text-stone-200 hover:text-amber-300 font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-border/80 transition-all"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Reserve A Table</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Table Reservation Interactive Modal */}
      <TableReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        serviceTitle={reservationServiceTitle}
      />

      {/* Dish Customization Modal */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
      />
    </DashboardLayout>
  );
}
