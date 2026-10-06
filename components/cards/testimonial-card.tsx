"use client";

import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300">
      <div className="absolute top-6 right-6 text-amber-500/20">
        <Quote className="w-10 h-10" />
      </div>

      <div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-amber-400 text-amber-400"
            />
          ))}
        </div>

        {/* Review Message */}
        <p className="text-xs text-stone-300 italic leading-relaxed pr-6">
          &quot;{testimonial.message}&quot;
        </p>
      </div>

      {/* Author Info */}
      <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 shrink-0">
          <Image
            src={testimonial.image_url}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h4 className="font-serif text-sm font-bold text-foreground">
            {testimonial.name}
          </h4>
          <span className="text-[10px] text-muted-foreground">
            {testimonial.role_or_title}
          </span>
        </div>
      </div>
    </div>
  );
}
