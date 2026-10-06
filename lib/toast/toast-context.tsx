"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message, title }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = (message: string, title: string = "Success") =>
    addToast(message, "success", title);
  const error = (message: string, title: string = "Error") =>
    addToast(message, "error", title);
  const info = (message: string, title: string = "Notice") =>
    addToast(message, "info", title);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-slide-up ${
              t.type === "success"
                ? "bg-stone-900/95 text-stone-100 border-amber-500/50 shadow-amber-950/40"
                : t.type === "error"
                ? "bg-stone-900/95 text-stone-100 border-rose-500/50 shadow-rose-950/40"
                : "bg-stone-900/95 text-stone-100 border-stone-700 shadow-black/50"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1">
              {t.title && (
                <h4 className="text-sm font-semibold text-amber-200">
                  {t.title}
                </h4>
              )}
              <p className="text-xs text-stone-300 leading-relaxed">
                {t.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-stone-400 hover:text-stone-200 p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
