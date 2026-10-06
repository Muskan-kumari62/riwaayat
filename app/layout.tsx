import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { ToastProvider } from "@/lib/toast/toast-context";
import { CartProvider } from "@/lib/cart/cart-context";

export const metadata: Metadata = {
  title: "Riwaayat | Premium Indian Restaurant Portal – Where Tradition Meets Taste",
  description:
    "Experience the rich flavours, timeless recipes, and warm hospitality of India at Riwaayat. Authentic North Indian, Mughlai, Rajasthani, Biryanis, and royal tandoor delicacies.",
  keywords: [
    "Riwaayat",
    "Riwaayat restaurant",
    "Indian restaurant portal",
    "authentic Indian cuisine",
    "royal Indian dining",
    "Dal Baati Churma",
    "Butter Chicken",
    "Biryani",
    "food ordering India",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <CartProvider>{children}</CartProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
