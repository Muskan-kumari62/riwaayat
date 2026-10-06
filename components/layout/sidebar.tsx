"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  User,
  Layers,
  UtensilsCrossed,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Truck,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin, isDeliveryPerson } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const mainNav = [
    { label: "Dashboard / Home", href: "/home", icon: Home },
    { label: "My Orders", href: "/orders", icon: ShoppingBag },
    { label: "Categories", href: "/categories", icon: Layers },
    { label: "Services", href: "/services", icon: UtensilsCrossed },
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  const adminNav = [
    { label: "Admin Dashboard", href: "/admin", icon: ShieldCheck },
    { label: "Order Management", href: "/admin/orders", icon: ShoppingBag },
    { label: "Delivery Dispatch", href: "/admin/delivery", icon: Truck },
    { label: "Payment Logs", href: "/admin/payments", icon: CreditCard },
    { label: "User Management", href: "/admin/users", icon: User },
    { label: "Category Management", href: "/admin/categories", icon: Layers },
    { label: "Service Management", href: "/admin/services", icon: UtensilsCrossed },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-border/60 bg-card/95 backdrop-blur-md transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } pt-5 pb-6`}
      >
        {/* Top Header / Branding */}
        <div>
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } px-4 mb-8`}
          >
            <a href="/home" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-500/40 p-0.5 shadow-md shrink-0">
                <Image
                  src="/images/logo.jpg"
                  alt="Riwaayat"
                  width={40}
                  height={40}
                  className="object-cover rounded-[10px]"
                />
              </div>
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-serif text-xl font-bold tracking-widest text-amber-400">
                    RIWAAYAT
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                    Indian Heritage Dining
                  </span>
                </div>
              )}
            </a>

            {/* Desktop collapse toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:border-amber-500/40 transition-colors"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                )}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-260px)]">
            <div className="px-3 py-1">
              {!collapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Navigation
                </span>
              )}
            </div>

            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive
                        ? "text-amber-400"
                        : "text-muted-foreground group-hover:text-amber-400"
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                  )}
                </a>
              );
            })}

            {/* Admin Section if User is Admin */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-1 px-3">
                  {!collapsed && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      Executive Panel
                    </span>
                  )}
                </div>

                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                          : "text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon className="w-5 h-5 shrink-0 text-amber-400" />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </a>
                  );
                })}
              </>
            )}

            {/* Courier Dispatch Section if User is Delivery Person */}
            {!isAdmin && isDeliveryPerson && (
              <>
                <div className="pt-4 pb-1 px-3">
                  {!collapsed && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-amber-400" />
                      Courier Fleet
                    </span>
                  )}
                </div>

                <a
                  href="/admin/delivery"
                  onClick={onClose}
                  title={collapsed ? "Delivery Dispatch" : undefined}
                  className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === "/admin/delivery"
                      ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                      : "text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <Truck className="w-5 h-5 shrink-0 text-amber-400" />
                  {!collapsed && (
                    <span className="truncate">Delivery Dispatch</span>
                  )}
                </a>
              </>
            )}
          </nav>
        </div>

        {/* Bottom User Card & Logout */}
        <div className="px-3 border-t border-border/60 pt-4">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-xl bg-secondary/40 border border-border/60">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 shrink-0 bg-muted flex items-center justify-center">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user.full_name}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={collapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl border border-amber-500/30 p-6 shadow-2xl animate-slide-up text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-foreground">
              Sign Out Confirmation
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to end your dining session at RIWAAYAT? You will need to sign in again to access your account.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-border/80 text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-950/40"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
