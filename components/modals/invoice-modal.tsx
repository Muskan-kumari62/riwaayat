"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  X,
  Printer,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { Order } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

// Number to words converter for INR
function numberToWordsINR(amount: number): string {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertChunk(n: number): string {
    if (n === 0) return "";
    if (n < 20) return units[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + units[n % 10] + " ";
    return units[Math.floor(n / 100)] + " Hundred " + convertChunk(n % 100);
  }

  const rounded = Math.round(amount);
  if (rounded === 0) return "Zero Rupees Only";

  let result = "";
  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remaining = rounded % 1000;

  if (crore > 0) result += convertChunk(crore) + "Crore ";
  if (lakh > 0) result += convertChunk(lakh) + "Lakh ";
  if (thousand > 0) result += convertChunk(thousand) + "Thousand ";
  if (remaining > 0) result += convertChunk(remaining);

  return `Indian Rupees ${result.trim()} Only`;
}

export function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const discountVal = order.discount || 0;
  const taxableSubtotal = Math.max(0, order.subtotal - discountVal);
  const cgst = Math.round(taxableSubtotal * 0.025 * 100) / 100;
  const sgst = Math.round(taxableSubtotal * 0.025 * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl glass-card rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden animate-slide-up my-4 bg-stone-950 text-foreground print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-secondary/40 print:hidden">
          <div className="flex items-center gap-2 text-amber-400">
            <Receipt className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              GST Tax Invoice & Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div ref={printRef} className="p-6 sm:p-10 space-y-8 bg-card print:bg-white print:text-black">
          {/* Header with Emblem & Restaurant Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-amber-500/30 print:border-black">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/40 p-1 bg-stone-900 shrink-0 print:border-black">
                <Image
                  src="/images/logo.jpg"
                  alt="Riwaayat Emblem"
                  width={64}
                  height={64}
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-amber-400 print:text-black">
                  RIWAAYAT
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground print:text-stone-700 font-semibold">
                  Where Tradition Meets Taste • Authentic Indian Dining
                </p>
                <p className="text-xs text-muted-foreground print:text-stone-700 mt-1 max-w-sm">
                  Heritage Haveli, Palace Road, Civil Lines, Jaipur 302006, Rajasthan
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider print:bg-stone-200 print:text-black">
                ORIGINAL TAX INVOICE
              </span>
              <p className="font-mono text-muted-foreground print:text-stone-700">
                GSTIN: <strong className="text-foreground print:text-black">08AABCR9876Q1Z2</strong>
              </p>
              <p className="font-mono text-muted-foreground print:text-stone-700">
                FSSAI Lic: <strong className="text-foreground print:text-black">12224026000189</strong>
              </p>
              <p className="text-muted-foreground print:text-stone-700">
                Phone: +91 141 289 4400
              </p>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-secondary/30 border border-border/80 text-xs print:bg-stone-50 print:border-stone-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 print:text-black block mb-1">
                Billed & Delivered To:
              </span>
              <p className="text-sm font-bold text-foreground print:text-black">
                {order.customer_name}
              </p>
              <p className="text-muted-foreground print:text-stone-700 mt-0.5">
                Phone: {order.customer_phone}
              </p>
              <p className="text-muted-foreground print:text-stone-700">
                Email: {order.customer_email}
              </p>
              <p className="text-muted-foreground print:text-stone-700 mt-1">
                {order.delivery_address.house_number}, {order.delivery_address.street},{" "}
                {order.delivery_address.area}, {order.delivery_address.city} - {order.delivery_address.pincode}
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-amber-400 print:text-black block mb-1">
                Invoice Details:
              </span>
              <p className="font-mono">
                <span className="text-muted-foreground print:text-stone-700">Invoice No: </span>
                <strong className="text-foreground print:text-black">TAX-INV-{order.order_number}</strong>
              </p>
              <p className="text-muted-foreground print:text-stone-700">
                Date & Time: {formatDate(order.created_at)}
              </p>
              <p className="text-muted-foreground print:text-stone-700">
                SAC Service Code: <strong className="text-foreground print:text-black">996331</strong> (Food & Beverage Serving)
              </p>
              <p className="text-muted-foreground print:text-stone-700">
                Payment Mode: <strong className="uppercase text-amber-400 print:text-black">{order.payment.payment_method.replace(/_/g, " ")}</strong>
              </p>
              <p className="font-mono text-[11px] text-muted-foreground print:text-stone-700">
                Txn Ref: {order.payment.transaction_id}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground print:text-stone-800 print:border-black">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Dish / Culinary Specialty</th>
                  <th className="py-2.5 px-3 text-center">Diet</th>
                  <th className="py-2.5 px-3 text-center">SAC</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 print:divide-stone-300">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-secondary/20">
                    <td className="py-3 px-3 text-muted-foreground font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground print:text-black">
                        {item.dish_name}
                      </div>
                      {(item.portion || item.spice_level || item.item_notes) && (
                        <div className="text-[10px] text-muted-foreground print:text-stone-600 mt-0.5">
                          {item.portion && <span className="capitalize">{item.portion} • </span>}
                          {item.spice_level && <span>Spice: {item.spice_level} • </span>}
                          {item.item_notes && <em>&quot;{item.item_notes}&quot;</em>}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          item.is_veg ? "bg-emerald-400" : "bg-rose-500"
                        }`}
                        title={item.is_veg ? "Vegetarian" : "Non-Vegetarian"}
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-muted-foreground print:text-stone-700">
                      996331
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-foreground print:text-black">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {formatINR(item.unit_price)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-foreground print:text-black">
                      {formatINR(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Totals */}
          <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row justify-between gap-6 print:border-black">
            {/* Amount In Words & Special Instructions */}
            <div className="flex-1 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                  Amount Chargeable (in words):
                </span>
                <p className="text-xs font-semibold text-foreground italic print:text-black">
                  {numberToWordsINR(order.total_amount)}
                </p>
              </div>

              {order.cooking_instructions && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border text-xs print:bg-stone-50 print:border-stone-300">
                  <span className="text-[10px] uppercase font-bold text-amber-400 print:text-black block mb-0.5">
                    Chef Notes:
                  </span>
                  <p className="text-muted-foreground print:text-stone-700 italic">
                    &quot;{order.cooking_instructions}&quot;
                  </p>
                </div>
              )}

              {/* Delivery Receipt verification note */}
              {order.delivery_recipient && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs print:bg-stone-50 print:border-stone-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 print:text-black font-bold text-[10px] uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Proof of Delivery Verified</span>
                  </div>
                  <p className="text-muted-foreground print:text-stone-700 mt-0.5">
                    Received by <strong>{order.delivery_recipient.receiver_name}</strong> on{" "}
                    {order.delivery_recipient.delivery_date} at {order.delivery_recipient.delivery_time}.
                  </p>
                </div>
              )}
            </div>

            {/* Numbers Summary */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground print:text-stone-700">
                <span>Items Subtotal:</span>
                <span className="font-mono text-foreground print:text-black font-semibold">
                  {formatINR(order.subtotal)}
                </span>
              </div>

              {discountVal > 0 && (
                <div className="flex items-center justify-between text-emerald-400 print:text-emerald-700 font-semibold">
                  <span>Discount ({order.coupon_code || "Promo"}):</span>
                  <span className="font-mono">-{formatINR(discountVal)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground print:text-stone-700">
                <span>CGST (2.5%):</span>
                <span className="font-mono">{formatINR(cgst)}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground print:text-stone-700">
                <span>SGST (2.5%):</span>
                <span className="font-mono">{formatINR(sgst)}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground print:text-stone-700">
                <span>White-Glove Delivery:</span>
                <span className="font-mono">
                  {order.delivery_fee === 0 ? "FREE" : formatINR(order.delivery_fee)}
                </span>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-base font-bold print:border-black">
                <span className="text-foreground print:text-black">Total Paid:</span>
                <span className="font-serif text-lg text-amber-400 print:text-black">
                  {formatINR(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Seal */}
          <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-muted-foreground print:text-stone-600 print:border-stone-300">
            <div>
              <p className="font-semibold text-foreground print:text-black">
                Thank you for patronizing Riwaayat.
              </p>
              <p>Computer-generated legal tax invoice. No signature required.</p>
            </div>

            <div className="p-3 rounded-xl border border-amber-500/40 text-center bg-amber-500/5 print:border-black">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 print:text-black block">
                RIWAAYAT HERITAGE DINING
              </span>
              <span className="text-[9px] text-muted-foreground print:text-stone-600">
                Executive Chef Aditi Sharma
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
