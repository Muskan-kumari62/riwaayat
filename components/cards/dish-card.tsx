"use client";

import React from "react";
import Image from "next/image";
import { Star, Sparkles, Plus, Minus } from "lucide-react";
import { Dish } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";

interface DishCardProps {
  dish: Dish;
  onSelect?: (dish: Dish) => void;
}

export function DishCard({ dish, onSelect }: DishCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(dish.id);
  const [imgSrc, setImgSrc] = React.useState(
    dish.image_url || dish.image || "/images/dishes/indian-food-placeholder.jpg"
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(dish);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(dish.id, quantity - 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(dish.id, quantity + 1);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(dish)}
      className="group relative cursor-pointer flex flex-col justify-between rounded-2xl border border-border/80 bg-card overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1"
    >
      <div>
        {/* Dish Image */}
        <div className="relative h-52 w-full overflow-hidden bg-stone-900">
          <Image
            src={imgSrc}
            alt={dish.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgSrc("/images/dishes/indian-food-placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {dish.is_chef_special && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-black flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                Chef&apos;s Signature
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                dish.is_veg
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                  : "bg-rose-950/80 text-rose-300 border-rose-500/50"
              }`}
            >
              {dish.is_veg ? "● Veg" : "▲ Non-Veg"}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold bg-black/65 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{dish.rating.toFixed(1)}</span>
          </div>

          {/* Category Tag bottom-left of image */}
          {dish.category_name && (
            <span className="absolute bottom-3 left-3 text-[11px] font-semibold tracking-wider uppercase text-amber-300/90 drop-shadow">
              {dish.category_name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-amber-400 transition-colors line-clamp-1">
            {dish.name}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="px-5 pb-5 pt-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Price
          </span>
          <span className="font-serif text-lg font-bold text-amber-400">
            {formatINR(dish.price)}
          </span>
        </div>

        {quantity > 0 ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 p-1 rounded-xl bg-amber-500/10 border border-amber-500/40"
          >
            <button
              onClick={handleDecrease}
              className="w-6 h-6 rounded-lg bg-secondary/80 hover:bg-amber-500 hover:text-stone-950 flex items-center justify-center text-foreground transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center text-xs font-bold text-amber-400">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 flex items-center justify-center transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Add to dining order"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
