"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Award, ShieldCheck, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ServiceCard } from "@/components/cards/service-card";
import { TableReservationModal } from "@/components/modals/table-reservation-modal";
import { db } from "@/lib/db";
import { ServiceItem } from "@/types";

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState("Table Reservation");

  useEffect(() => {
    async function loadServices() {
      const data = await db.getServices();
      setServices(data);
    }
    loadServices();
  }, []);

  const handleAction = (service: ServiceItem) => {
    setSelectedServiceTitle(service.name);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Signature Experiences</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">
            Our Hospitality & Dining Services
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
            Whether dining in our Haveli courtyard, reserving a confidential Shahi Dastarkhwan salon, or welcoming Riwaayat’s master khansamas to your private event, we deliver authentic Indian hospitality.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onAction={handleAction}
            />
          ))}
        </div>

        {/* Hospitality Guarantees */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl glass-card border border-amber-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-foreground">
                  Punctuality & Instant Booking
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Real-time table allocations, zero hold times, and SMS reminders sent to your mobile.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-foreground">
                  Uncompromising Hygiene & Safety
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  5-star HACCP certified culinary kitchens, temperature-controlled delivery vans, and tamper-proof locks.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-foreground">
                  Bespoke Dietary Customization
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Jain, vegan, gluten-free, and custom allergy menus prepared by our Chef de Cuisine on request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TableReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceTitle={selectedServiceTitle}
      />
    </DashboardLayout>
  );
}
