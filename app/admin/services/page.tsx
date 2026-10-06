"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { db } from "@/lib/db";
import { ServiceItem } from "@/types";
import { useToast } from "@/lib/toast/toast-context";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("UtensilsCrossed");
  const [imageUrl, setImageUrl] = useState("");
  const [badge, setBadge] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSaving, setIsSaving] = useState(false);

  const loadServices = useCallback(async () => {
    const list = await db.getServices();
    setServices(list);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const list = await db.getServices();
      if (isMounted) {
        setServices(list);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("UtensilsCrossed");
    setImageUrl(
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
    );
    setBadge("Premium Service");
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (srv: ServiceItem) => {
    setEditingService(srv);
    setName(srv.name);
    setSlug(srv.slug);
    setDescription(srv.description);
    setIcon(srv.icon);
    setImageUrl(srv.image_url);
    setBadge(srv.badge || "");
    setStatus(srv.status);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingService) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !imageUrl) {
      error("Name, slug, and image URL are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingService) {
        await db.updateService(editingService.id, {
          name,
          slug,
          description,
          icon,
          image_url: imageUrl,
          badge,
          status,
        });
        success(`Service "${name}" updated successfully.`);
      } else {
        await db.createService({
          name,
          slug,
          description,
          icon,
          image_url: imageUrl,
          badge,
          status,
        });
        success(`New service "${name}" added to portal.`);
      }

      setIsModalOpen(false);
      await loadServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save service.";
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, srvName: string) => {
    if (!confirm(`Are you sure you want to remove service "${srvName}"?`)) {
      return;
    }
    await db.deleteService(id);
    await loadServices();
    success(`Service "${srvName}" has been removed.`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Service Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure hospitality offerings, reservation types, and private banquet options.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="group relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={srv.image_url}
                  alt={srv.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    srv.status === "active"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                      : "bg-stone-900 text-stone-400 border border-stone-700"
                  }`}
                >
                  {srv.status}
                </span>

                <div className="absolute bottom-3 left-3">
                  <h3 className="font-serif text-lg font-bold text-white">
                    {srv.name}
                  </h3>
                  <span className="text-[10px] text-amber-300">
                    Badge: {srv.badge || "Standard"} • Icon: {srv.icon}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => openEditModal(srv)}
                className="p-2 rounded-lg text-stone-300 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                title="Edit service"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(srv.id, srv.name)}
                className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg glass-card rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl animate-slide-up relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-foreground mb-1">
              {editingService ? "Edit Service" : "Add Dining Service"}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Configure hospitalities presented on the customer services page.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g. Skyline Rooftop Lounge"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="e.g. rooftop-lounge"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Icon Theme
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                  >
                    <option value="UtensilsCrossed">UtensilsCrossed</option>
                    <option value="CalendarCheck">CalendarCheck</option>
                    <option value="Crown">Crown (VIP)</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="ShoppingBag">ShoppingBag</option>
                    <option value="Truck">Truck (Delivery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Promotional Badge
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Exclusive Experience"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Visibility Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
                >
                  <option value="active">Active (Live on Website)</option>
                  <option value="inactive">Inactive (Disabled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Detailed Service Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Highlight service features and arrangements..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs border border-border text-foreground hover:bg-muted/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
