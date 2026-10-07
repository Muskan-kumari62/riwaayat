"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Sparkles, Utensils } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DishCard } from "@/components/cards/dish-card";
import { DishDetailModal } from "@/components/modals/dish-detail-modal";
import { db } from "@/lib/db";
import { Category, Dish } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Dish Customization Modal
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cats, dshs] = await Promise.all([
        db.getCategories(),
        db.getDishes(),
      ]);
      setCategories(cats);
      setDishes(dshs);
      setLoading(false);
    }
    loadData();
  }, []);

  const getMatchingDishesCount = (catId: string) => {
    if (catId === "cat-vegetarian") {
      return dishes.filter((d) => d.is_veg === true || d.category_id === "cat-vegetarian").length;
    }
    return dishes.filter((d) => d.category_id === catId).length;
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setTimeout(() => {
      const el = document.getElementById("dish-showcase");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const displayedDishes = dishes.filter((d) => {
    const matchesCat =
      selectedCategory === "all" ||
      (selectedCategory === "cat-vegetarian"
        ? d.is_veg === true || d.category_id === "cat-vegetarian"
        : d.category_id === selectedCategory);

    const catObj = categories.find((c) => c.id === d.category_id);
    const catName = (catObj?.name || d.category_name || "").toLowerCase();
    const q = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      catName.includes(q);

    return matchesCat && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Culinary Directory</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">
            Explore Cuisine Categories
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
            Immerse yourself in our meticulously researched Indian heritage menus, from slow-simmered Awadhi dum pukht and clay-oven kebabs to fragrant biryanis and authentic Rajasthani thalis.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4 text-amber-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or specialty dish..."
              className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-secondary/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400 shadow-md transition-colors"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span>All Categories</span>
            <span className="text-xs text-muted-foreground font-sans font-normal">
              ({filteredCategories.length})
            </span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-72 rounded-2xl bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden bg-card shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                  selectedCategory === cat.id
                    ? "border-amber-400 ring-2 ring-amber-400/20"
                    : "border-border/80 hover:border-amber-500/50"
                }`}
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
                    {getMatchingDishesCount(cat.id)} Dishes
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-amber-400 transition-colors">
                      {cat.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                        selectedCategory === cat.id
                          ? "bg-amber-500 text-stone-950 border-amber-400"
                          : "border-border text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {selectedCategory === cat.id ? "Selected" : "View Dishes"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Category Dish Showcase */}
        <div id="dish-showcase" className="pt-8 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {selectedCategory === "all"
                  ? "All Category Dishes"
                  : `${categories.find((c) => c.id === selectedCategory)?.name || ""} Menu`}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Showing {displayedDishes.length} artisanal dishes
              </p>
            </div>

            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Reset to Show All Specialties
              </button>
            )}
          </div>

          {displayedDishes.length === 0 ? (
            <div className="py-16 text-center glass-card rounded-2xl border border-border">
              <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">
                No dishes found matching your query.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for a different keyword or view another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayedDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onSelect={(d) => {
                    setSelectedDish(d);
                    setIsDishModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dish Customization Modal */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
      />
    </DashboardLayout>
  );
}
