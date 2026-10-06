"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={category.image_url}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        {category.dish_count !== undefined && (
          <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
            {category.dish_count} Specialties
          </span>
        )}
      </div>

      <div className="p-5 relative">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-amber-400 transition-colors">
            {category.name}
          </h3>
          <div className="w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground group-hover:text-black group-hover:bg-amber-400 group-hover:border-amber-400 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>
    </div>
  );
}
