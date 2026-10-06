"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Shield,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  CheckCheck,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";
import { useCart } from "@/lib/cart/cart-context";
import { db } from "@/lib/db";
import { NotificationItem } from "@/types";
import { useToast } from "@/lib/toast/toast-context";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalItems, setIsCartOpen } = useCart();
  const { success } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load notifications
  useEffect(() => {
    async function fetchNotifications() {
      const data = await db.getNotifications(user?.id);
      setNotifications(data);
    }
    fetchNotifications();
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await db.markAllNotificationsAsRead(user?.id);
    const updated = await db.getNotifications(user?.id);
    setNotifications(updated);
    success("All notifications marked as read");
  };

  const navLinks = [
    { label: "Home", href: "/home" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Categories", href: "/categories" },
    { label: "Contact", href: "/contact" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass-header transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors md:hidden"
            aria-label="Toggle Navigation Sidebar"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-amber-500" />
            ) : (
              <Menu className="w-5 h-5 text-amber-500" />
            )}
          </button>

          <a href="/home" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 p-0.5 shadow-lg group-hover:border-amber-400 transition-all duration-300">
              <Image
                src="/images/logo.jpg"
                alt="Riwaayat Emblem"
                width={44}
                height={44}
                className="object-cover rounded-[10px]"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors">
                RIWAAYAT
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold -mt-1">
                Where Tradition Meets Taste
              </span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  isActive
                    ? "text-amber-400 bg-amber-500/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-400 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-amber-500/40 text-xs flex items-center gap-2 transition-all"
            title="Search dishes & categories"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline font-normal">Search menu...</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Toggle theme"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {/* Dining Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Open Dining Cart"
            title="Your Dining Cart"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-stone-950 bg-amber-400 rounded-full animate-bounce">
                {totalItems}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-black bg-amber-400 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-card border border-amber-500/20 shadow-2xl p-4 z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-3 divide-y divide-border/40 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.slice(0, 4).map((n) => (
                      <div
                        key={n.id}
                        className={`py-3 px-2 flex flex-col gap-1 rounded-lg transition-colors ${
                          !n.is_read ? "bg-amber-500/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              !n.is_read ? "text-amber-300" : "text-foreground"
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-border/60 text-center">
                  <a
                    href="/notifications"
                    onClick={() => setShowNotifMenu(false)}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    View All Notifications →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border/80 hover:border-amber-500/40 bg-secondary/30 transition-all"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 bg-muted flex items-center justify-center">
                {user?.avatar_url ? (
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
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pr-1" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl glass-card border border-amber-500/20 shadow-2xl p-3 z-50 animate-slide-up">
                <div className="px-3 py-2 border-b border-border/60">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.full_name || "Guest Diner"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "diner@riwaayat.com"}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isAdmin
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAdmin ? "Executive Admin" : "Privileged Diner"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 py-1 space-y-1">
                  <a
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-400" />
                    My Profile
                  </a>
                  <a
                    href="/orders"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    My Orders
                  </a>
                  <a
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    Account Settings
                  </a>
                  {isAdmin && (
                    <>
                      <a
                        href="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        Admin Dashboard
                      </a>
                      <a
                        href="/admin/orders"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted/80 text-foreground transition-colors"
                      >
                        <PackageCheck className="w-4 h-4 text-amber-400" />
                        Order Management
                      </a>
                    </>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-border/60">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Interactive Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl glass-card rounded-2xl border border-amber-500/30 p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-amber-400" />
                <input
                  type="text"
                  placeholder="Search dishes (e.g. Biryani, Truffle, Salmon)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex gap-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Links:
                </span>
                <a
                  href="/categories"
                  onClick={() => setShowSearchModal(false)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Categories
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="/services"
                  onClick={() => setShowSearchModal(false)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Services
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="/home#menu"
                  onClick={() => setShowSearchModal(false)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Popular Dishes
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Esc or click close to dismiss.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
