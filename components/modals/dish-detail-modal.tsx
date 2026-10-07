"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Star,
  Sparkles,
  Flame,
  ChefHat,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Utensils,
  Zap,
} from "lucide-react";
import { Dish } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";

interface DishDetailModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

const SPICE_LEVELS = [
  { id: "mild", label: "Mild & Aromatic", desc: "Subtle cardamom & saffron notes", icon: "🌿" },
  { id: "medium", label: "Khansama Medium", desc: "Classic balanced heritage spice", icon: "🌶️" },
  { id: "spicy", label: "Desi Rajputana", desc: "Fiery Mathania whole chilies", icon: "🔥" },
];

const CURATED_ADDONS = [
  { id: "butter-naan", name: "Clay Oven Butter Naan", price: 45 },
  { id: "garlic-naan", name: "Charcoal Garlic Naan", price: 65 },
  { id: "boondi-raita", name: "Chilled Boondi Raita", price: 55 },
  { id: "pickled-onions", name: "Sirka Pyaz & Mint Dip", price: 0 },
  { id: "gulab-jamun", name: "Warm Desi Ghee Gulab Jamun (1 pc)", price: 60 },
];

export function DishDetailModal({ dish, isOpen, onClose }: DishDetailModalProps) {
  const router = useRouter();
  const { addToCartWithOptions } = useCart();

  const [portion, setPortion] = useState<"standard" | "royal">("standard");
  const [selectedSpice, setSelectedSpice] = useState<string>("medium");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["pickled-onions"]);
  const [chefNotes, setChefNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const targetImage = dish?.image_url || dish?.image || "/images/dishes/indian-food-placeholder.jpg";
  const [imgSrc, setImgSrc] = useState(targetImage);
  const [prevDishId, setPrevDishId] = useState<string | null>(null);

  if (dish && dish.id !== prevDishId) {
    setPrevDishId(dish.id);
    setPortion("standard");
    setSelectedSpice("medium");
    setSelectedAddons(["pickled-onions"]);
    setChefNotes("");
    setQuantity(1);
    setImgSrc(targetImage);
  }

  if (!isOpen || !dish) return null;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Price Calculation
  const isRoyal = portion === "royal";
  const basePrice = isRoyal ? Math.round(dish.price * 1.75) : dish.price;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const item = CURATED_ADDONS.find((a) => a.id === addonId);
    return sum + (item ? item.price : 0);
  }, 0);
  const unitPrice = basePrice + addonsTotal;
  const finalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCartWithOptions(dish, {
      quantity,
      portion,
      spice_level: selectedSpice,
      selected_addons: selectedAddons,
      item_notes: chefNotes.trim() || undefined,
      addOnPrice: (basePrice - dish.price) + addonsTotal,
    });
    onClose();
  };

  const handleOrderNow = () => {
    addToCartWithOptions(dish, {
      quantity,
      portion,
      spice_level: selectedSpice,
      selected_addons: selectedAddons,
      item_notes: chefNotes.trim() || undefined,
      addOnPrice: (basePrice - dish.price) + addonsTotal,
    });
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden animate-slide-up my-6 bg-stone-950/95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all border border-white/10"
          aria-label="Close dish customization"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Section */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-900">
          <Image
            src={imgSrc}
            alt={dish.name}
            fill
            priority
            className="object-cover"
            onError={() => setImgSrc("/images/dishes/indian-food-placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Badges on Top-Left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                dish.is_veg
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/60"
                  : "bg-rose-950/80 text-rose-300 border-rose-500/60"
              }`}
            >
              {dish.is_veg ? "● Pure Vegetarian" : "▲ Non-Vegetarian"}
            </span>

            {dish.is_chef_special && (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                Chef&apos;s Signature
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-md">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{dish.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400 font-normal">
                ({dish.reviews_count || 120}+ reviews)
              </span>
            </div>
            {dish.category_name && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {dish.category_name}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-260px)] overflow-y-auto">
          {/* Title & Description */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {dish.name}
              </h2>
              <div className="text-right shrink-0">
                <span className="font-serif text-2xl font-bold text-amber-400">
                  {formatINR(basePrice)}
                </span>
                {isRoyal && (
                  <span className="block text-[10px] text-amber-300/80 font-medium">
                    (Royal Double Serving)
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {dish.description}
            </p>
          </div>

          {/* Portion Size Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5" />
              <span>Select Serving Size</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPortion("standard")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  portion === "standard"
                    ? "bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/30"
                    : "bg-secondary/40 border-border hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Standard Portion
                  </span>
                  <span className="text-xs font-serif font-semibold text-amber-300">
                    {formatINR(dish.price)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ideal for 1 diner (Single serving)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPortion("royal")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  portion === "royal"
                    ? "bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/30"
                    : "bg-secondary/40 border-border hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span>Royal Feast</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                  <span className="text-xs font-serif font-semibold text-amber-300">
                    {formatINR(Math.round(dish.price * 1.75))}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Abundant double portion for 2–3 diners
                </p>
              </button>
            </div>
          </div>

          {/* Spice Level Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Spice Profile & Tempering</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SPICE_LEVELS.map((spice) => {
                const isSelected = selectedSpice === spice.id;
                return (
                  <button
                    key={spice.id}
                    type="button"
                    onClick={() => setSelectedSpice(spice.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/30"
                        : "bg-secondary/40 border-border hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{spice.icon}</span>
                      <span className="text-xs font-bold text-foreground">
                        {spice.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {spice.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Pairing Add-ons & Accompaniments</span>
              </label>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>

            <div className="space-y-2">
              {CURATED_ADDONS.map((addon) => {
                const checked = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      checked
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-secondary/30 border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          checked
                            ? "bg-amber-500 border-amber-400 text-stone-950"
                            : "border-border bg-card"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {addon.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-300">
                      {addon.price === 0 ? "Complimentary" : `+${formatINR(addon.price)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chef Cooking Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Special Chef Instructions
            </label>
            <textarea
              value={chefNotes}
              onChange={(e) => setChefNotes(e.target.value)}
              placeholder="e.g. Less oil, extra crispy naan, serve gravy mildly warm..."
              rows={2}
              className="w-full p-3 rounded-2xl bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer with Quantity & Add Button */}
        <div className="p-6 border-t border-border/80 bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Counter */}
          <div className="flex items-center border border-border rounded-xl bg-card p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-bold text-foreground">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons: Add to Cart & Order Now */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto flex-1 py-3.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart • {formatINR(finalPrice)}</span>
            </button>

            <button
              onClick={handleOrderNow}
              className="w-full sm:w-auto flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-stone-950" />
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
