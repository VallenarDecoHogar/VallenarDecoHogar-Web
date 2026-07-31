import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from "@/components/site/app-providers";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { ProductModal } from "@/components/site/product-modal";
import { AdminPanel } from "@/components/site/admin-panel";
import { ThemeProvider } from "@/components/site/theme-provider";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vallenar DecoHogar — Aromaterapia, Esoterismo y Decoración",
    template: "%s · Vallenar DecoHogar",
  },
  description:
    "Tienda online chilena de aromaterapia, esoterismo, inciensos y decoración sagrada importada desde India. Envío gratis desde $50.000 CLP.",
  keywords: [
    "Vallenar DecoHogar",
    "aromaterapia Chile",
    "esoterismo",
    "incienso Satya",
    "velas rituales",
    "decoración Feng Shui",
  ],
  authors: [{ name: "Vallenar DecoHogar" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Vallenar DecoHogar — Aromaterapia, Esoterismo y Decoración",
    description:
      "Aromaterapia, esoterismo, inciensos y decoración sagrada importada desde India. Envío a todo Chile.",
    siteName: "Vallenar DecoHogar",
    type: "website",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vallenar DecoHogar — Aromaterapia y Esoterismo",
    description:
      "Aromaterapia, esoterismo, inciensos y decoración sagrada importada desde India.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <AppProviders>
            <div className="min-h-screen flex flex-col bg-background">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <CartDrawer />
            <ProductModal />
            <AdminPanel />
            <WhatsAppFloat />
          </AppProviders>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
