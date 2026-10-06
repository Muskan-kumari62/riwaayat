"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { db } from "@/lib/db";
import { Category } from "@/types";
import { useToast } from "@/lib/toast/toast-context";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [dishCount, setDishCount] = useState(6);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      const list = await db.getCategories();
      if (isMounted) {
        setCategories(list);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl(
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
    );
    setStatus("active");
    setDishCount(5);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(cat.image_url);
    setStatus(cat.status);
    setDishCount(cat.dish_count || 5);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
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
      if (editingCategory) {
        await db.updateCategory(editingCategory.id, {
          name,
          slug,
          description,
          image_url: imageUrl,
          status,
          dish_count: Number(dishCount),
        });
        success(`Category "${name}" updated successfully.`);
      } else {
        await db.createCategory({
          name,
          slug,
          description,
          image_url: imageUrl,
          status,
          dish_count: Number(dishCount),
        });
        success(`New category "${name}" added to menu catalog.`);
      }

      setIsModalOpen(false);
      const list = await db.getCategories();
      setCategories(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category.";
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to remove category "${catName}"?`)) {
      return;
    }
    await db.deleteCategory(id);
    const list = await db.getCategories();
    setCategories(list);
    success(`Category "${catName}" has been removed.`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Category Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Add, update, or remove menu categories. Changes immediately update the live customer portal.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    cat.status === "active"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                      : "bg-stone-900 text-stone-400 border border-stone-700"
                  }`}
                >
                  {cat.status}
                </span>

                <div className="absolute bottom-3 left-3">
                  <h3 className="font-serif text-lg font-bold text-white">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-amber-300">
                    Slug: /{cat.slug} • {cat.dish_count || 0} Dishes
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 rounded-lg text-stone-300 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                title="Edit category"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
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
              {editingCategory ? "Edit Category" : "Add Cuisine Category"}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Enter category details. Changes will synchronize with the public menu.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g. Royal Awadhi"
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
                  placeholder="e.g. royal-awadhi"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                />
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Specialty Count
                  </label>
                  <input
                    type="number"
                    value={dishCount}
                    onChange={(e) => setDishCount(Number(e.target.value))}
                    min={0}
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
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Short Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief culinary summary..."
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
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
