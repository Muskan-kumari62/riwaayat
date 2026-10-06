"use client";

import React from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  CalendarCheck,
  Crown,
  Sparkles,
  ShoppingBag,
  Truck,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { ServiceItem } from "@/types";

interface ServiceCardProps {
  service: ServiceItem;
  onAction?: (service: ServiceItem) => void;
}

const iconMap: Record<string, React.ElementType> = {
  UtensilsCrossed,
  CalendarCheck,
  Crown,
  Sparkles,
  ShoppingBag,
  Truck,
};

export function ServiceCard({ service, onAction }: ServiceCardProps) {
  const IconComponent = iconMap[service.icon] || UtensilsCrossed;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl">
      <div>
        {/* Service Image Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Floating Icon */}
          <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Badge */}
          {service.badge && (
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-md">
              {service.badge}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="p-6">
          <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-amber-400 transition-colors">
            {service.name}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {service.description}
          </p>

          {/* Feature Highlights */}
          {service.features && service.features.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
              {service.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onAction && onAction(service)}
          className="w-full py-2.5 px-4 rounded-xl bg-secondary/80 hover:bg-amber-500 text-foreground hover:text-stone-950 border border-border/80 hover:border-amber-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
        >
          <span>
            {service.slug === "table-reservation"
              ? "Book a Table Now"
              : service.slug === "private-dining"
              ? "Reserve VIP Salon"
              : service.slug === "catering"
              ? "Inquire Catering"
              : "Explore Experience"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
