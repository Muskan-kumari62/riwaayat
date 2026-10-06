"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-foreground">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-t-amber-400 border-r-amber-400 border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="font-serif text-xl tracking-widest text-amber-400 font-bold">
        RIWAAYAT
      </p>
      <p className="text-xs text-stone-400 mt-1">Where Tradition Meets Taste</p>
    </div>
  );
}
