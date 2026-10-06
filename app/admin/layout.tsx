"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Layers,
  UtensilsCrossed,
  ArrowLeft,
  ShoppingBag,
  Truck,
  CreditCard,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/lib/toast/toast-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isDeliveryPerson, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { error } = useToast();

  const isDeliveryOnly = isDeliveryPerson && !isAdmin;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin && !(isDeliveryPerson && pathname.startsWith("/admin/delivery"))) {
        error("Unauthorized: Elevated credentials required.");
        router.push("/home");
      }
    }
  }, [user, isAdmin, isDeliveryPerson, pathname, isLoading, router, error]);

  if (isLoading || (!isAdmin && !(isDeliveryPerson && pathname.startsWith("/admin/delivery")))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-foreground">
            Verifying Administrative Security Credentials...
          </p>
        </div>
      </div>
    );
  }

  const allAdminTabs = [
    { label: "Overview & Analytics", href: "/admin", icon: LayoutDashboard, adminOnly: true },
    { label: "Order Management", href: "/admin/orders", icon: ShoppingBag, adminOnly: true },
    { label: "Delivery Dispatch", href: "/admin/delivery", icon: Truck, adminOnly: false },
    { label: "Payment Audit", href: "/admin/payments", icon: CreditCard, adminOnly: true },
    { label: "User Management", href: "/admin/users", icon: Users, adminOnly: true },
    { label: "Categories Management", href: "/admin/categories", icon: Layers, adminOnly: true },
    { label: "Services Management", href: "/admin/services", icon: UtensilsCrossed, adminOnly: true },
  ];

  const adminTabs = isDeliveryOnly
    ? allAdminTabs.filter((tab) => !tab.adminOnly)
    : allAdminTabs;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  {isDeliveryOnly ? "Courier Logistics Portal" : "Executive Administrative Portal"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950">
                  {isDeliveryOnly ? "Delivery Partner" : "Root Admin"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Live Operations & Management • Riwaayat Indian Restaurant Portal
              </p>
            </div>
          </div>

          <a
            href="/home"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border/80 text-foreground hover:bg-muted/80 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Diner Portal</span>
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 py-4 border-b border-border/60 overflow-x-auto mb-8 scrollbar-none">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold"
                    : "bg-secondary/40 text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </a>
            );
          })}
        </div>

        {children}
      </div>
    </DashboardLayout>
  );
}
