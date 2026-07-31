"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Heart, Menu, X, Settings, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { SearchBox } from "@/components/site/search-box";
import { ThemeToggle } from "@/components/site/theme-toggle";

const CATEGORIES = [
  { slug: "aromaterapia", label: "Aromaterapia", emoji: "🌿" },
  { slug: "decoracion", label: "Decoración", emoji: "🪷" },
  { slug: "esoterismo", label: "Esoterismo", emoji: "🕯️" },
  { slug: "incienso", label: "Incienso", emoji: "🪔" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, setCartOpen, wishlist, setAdminOpen, openProduct, markupSettings } = useStore();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearchSubmit(query: string) {
    // Navigate to catalog with search query
    window.location.href = `/catalogo?q=${encodeURIComponent(query)}`;
  }

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-[var(--vn-brown)] text-[var(--vn-warm-bg)] text-center text-xs sm:text-sm py-2 px-4">
        <span className="inline-flex items-center gap-2">
          🚚 Envío GRATIS en pedidos superiores a $50.000 · Pago seguro via Webpay
        </span>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-border bg-[var(--vn-warm-bg)]/85 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/logo-vallenar.png"
                alt="Vallenar DecoHogar"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--vn-coral)]/30"
              />
              <span className="hidden sm:inline text-base sm:text-lg font-semibold tracking-tight text-[var(--vn-brown)]">
                Vallenar <span className="text-[var(--vn-coral)]">DecoHogar</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                    : "text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                }`}
              >
                Inicio
              </Link>

              {/* Catálogo with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      pathname.startsWith("/catalogo")
                        ? "text-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                        : "text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                    }`}
                  >
                    Catálogo
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuLabel className="text-[var(--vn-brown-med)]">
                    Explorar por categoría
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/catalogo" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-base">📋</span>
                      <span className="font-medium">Ver todo el catálogo</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {CATEGORIES.map((cat) => (
                    <DropdownMenuItem key={cat.slug} asChild>
                      <Link
                        href={`/catalogo/${cat.slug}`}
                        className={`flex items-center gap-2 cursor-pointer ${
                          pathname === `/catalogo/${cat.slug}`
                            ? "text-[var(--vn-coral)]"
                            : ""
                        }`}
                      >
                        <span className="text-base">{cat.emoji}</span>
                        {cat.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/contacto"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/contacto"
                    ? "text-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                    : "text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                }`}
              >
                Contacto
              </Link>
            </nav>

            {/* Search (desktop) */}
            <SearchBox
              className="hidden lg:flex flex-1 max-w-xs"
              markupSettings={markupSettings}
              onProductSelect={openProduct}
              onSearchSubmit={handleSearchSubmit}
            />

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              {/* Account button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                asChild
                aria-label="Mi cuenta"
                title="Mi cuenta"
              >
                <Link href="/cuenta">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                onClick={() => setAdminOpen(true)}
                aria-label="Panel de administración"
                title="Panel de administración"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                onClick={() =>
                  toast({
                    title: "Favoritos",
                    description: `${wishlist.size} productos guardados`,
                  })
                }
              >
                <Heart className="h-5 w-5" />
                {wishlist.size > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] text-[10px] font-bold px-1">
                    {wishlist.size}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] text-[10px] font-bold px-1">
                    {cartCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)]"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Menú"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3">
              <SearchBox
                className="w-full"
                markupSettings={markupSettings}
                onProductSelect={openProduct}
                onSearchSubmit={(q) => {
                  handleSearchSubmit(q);
                  setMobileMenuOpen(false);
                }}
              />
              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/"
                      ? "text-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                      : "text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  href="/catalogo"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname.startsWith("/catalogo")
                      ? "text-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                      : "text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  }`}
                >
                  Catálogo (ver todo)
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/catalogo/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-6 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                      pathname === `/catalogo/${cat.slug}`
                        ? "text-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                        : "text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </Link>
                ))}
                <Link
                  href="/contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/contacto"
                      ? "text-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                      : "text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  }`}
                >
                  Contacto
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
