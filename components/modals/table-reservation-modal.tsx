"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { db } from "@/lib/db";
import { useToast } from "@/lib/toast/toast-context";

interface TableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle?: string;
}

export function TableReservationModal({
  isOpen,
  onClose,
  serviceTitle = "Table Reservation",
}: TableReservationModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [guestCount, setGuestCount] = useState(2);
  const [bookingDate, setBookingDate] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [bookingTime, setBookingTime] = useState("08:00 PM");
  const [seatingArea, setSeatingArea] = useState("Grand Dining Hall");
  const [customerName, setCustomerName] = useState(user?.full_name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "+91 ");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const timeSlots = [
    "12:30 PM",
    "01:30 PM",
    "02:15 PM",
    "07:15 PM",
    "08:00 PM",
    "08:45 PM",
    "09:30 PM",
    "10:15 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      error("Please fill in your name, contact phone and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.createReservation({
        user_id: user?.id || "guest",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        guest_count: Number(guestCount),
        booking_date: bookingDate,
        booking_time: `${bookingTime} (${seatingArea})`,
        special_requests: specialRequests,
      });

      setIsConfirmed(true);
      success("Your table has been reserved at Riwaayat – Where Tradition Meets Taste.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reserve table. Please try again.";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl animate-slide-up my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isConfirmed ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Reservation Confirmed at Riwaayat
            </h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              We look forward to welcoming you, <span className="text-amber-300 font-semibold">{customerName}</span>. A confirmation notification and SMS have been issued for {guestCount} guests on {bookingDate} at {bookingTime}.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/80 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area:</span>
                <span className="font-semibold text-foreground">{seatingArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dress Code:</span>
                <span className="text-amber-300 font-medium">Traditional / Smart Elegant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concierge Assistance:</span>
                <span className="text-foreground">+91 141 289 4400</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsConfirmed(false);
                onClose();
              }}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Concierge</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              {serviceTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Reserve your tableside experience in our Michelin-standard dining room.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Guest Count & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Number of Guests
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border/80 text-foreground text-xs focus:outline-none focus:border-amber-400"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border/80 text-foreground text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Select Seating Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setBookingTime(slot)}
                      className={`py-2 px-1 text-center rounded-lg text-[11px] font-semibold transition-all border ${
                        bookingTime === slot
                          ? "bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md"
                          : "bg-secondary/60 text-muted-foreground border-border hover:border-amber-500/40"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Preference */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  Preferred Ambience
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "Grand Dining Hall",
                    "Candlelit Alcove",
                    "VIP Private Salon",
                    "Skyline Veranda",
                  ].map((area) => (
                    <button
                      type="button"
                      key={area}
                      onClick={() => setSeatingArea(area)}
                      className={`p-2.5 text-left rounded-xl border text-[11px] font-medium transition-all ${
                        seatingArea === area
                          ? "bg-amber-500/15 border-amber-400 text-amber-300 font-semibold"
                          : "bg-secondary/40 border-border text-muted-foreground hover:border-amber-500/30"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:border-amber-400 focus:outline-none"
                    placeholder="Guest Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:border-amber-400 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:border-amber-400 focus:outline-none"
                    placeholder="guest@riwaayat.in"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Special Requests / Celebrations / Allergies (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:border-amber-400 focus:outline-none placeholder:text-muted-foreground resize-none"
                  placeholder="e.g. 10th anniversary celebration, nut-free dessert, quiet corner table..."
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Securing Table...</span>
                ) : (
                  <span>Confirm Reservation</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
