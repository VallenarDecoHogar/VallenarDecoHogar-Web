"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { products, formatCLP, applyMarkup, type MarkupSettings } from "@/lib/products";
import { useStore } from "@/lib/store";

type CategoryMeta = {
  label: string;
  emoji: string;
  accent: string;
  subtitle: string;
  description: string;
};

const ALL_CATEGORIES = [
  { slug: "aromaterapia", label: "Aromaterapia", emoji: "🌿" },
  { slug: "decoracion", label: "Decoración", emoji: "🪷" },
  { slug: "esoterismo", label: "Esoterismo", emoji: "🕯️" },
  { slug: "incienso", label: "Incienso", emoji: "🪔" },
];

type SortBy = "relevance" | "price-asc" | "price-desc" | "rating";

export function CategoryView({
  category,
  meta,
}: {
  category: string;
  meta: CategoryMeta;
}) {
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [search, setSearch] = useState("");

  // Use lazy import of useStore inside the component to avoid SSR issues
  const { markupSettings } = useStoreSafe();

  const searchLower = search.toLowerCase().trim();

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat = p.category.toLowerCase() === meta.label.toLowerCase();
      const matchSearch =
        !searchLower ||
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower);
      return matchCat && matchSearch;
    });

    // Use markup settings for sorting
    switch (sortBy) {
      case "price-asc":
        list = [...list].sort(
          (a, b) =>
            applyMarkupDyn(a.originalPrice, markupSettings).price -
            applyMarkupDyn(b.originalPrice, markupSettings).price
        );
        break;
      case "price-desc":
        list = [...list].sort(
          (a, b) =>
            applyMarkupDyn(b.originalPrice, markupSettings).price -
            applyMarkupDyn(a.originalPrice, markupSettings).price
        );
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
    }
    return list;
  }, [meta.label, searchLower, sortBy, markupSettings]);

  // Stats
  const minPrice = filtered.length > 0
    ? Math.min(...filtered.map((p) => applyMarkupDyn(p.originalPrice, markupSettings).price))
    : 0;
  const maxPrice = filtered.length > 0
    ? Math.max(...filtered.map((p) => applyMarkupDyn(p.originalPrice, markupSettings).price))
    : 0;

  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <nav className="flex items-center gap-1 text-sm text-[var(--vn-brown-med)]">
          <Link href="/" className="hover:text-[var(--vn-brown)]">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/catalogo" className="hover:text-[var(--vn-brown)]">
            Catálogo
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[var(--vn-brown)] font-medium">{meta.label}</span>
        </nav>
      </div>

      {/* Category header */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="border-l-4 pl-4 sm:pl-6" style={{ borderColor: meta.accent }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl sm:text-5xl" aria-hidden>
                {meta.emoji}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--vn-brown)]">
                {meta.label}
              </h1>
            </div>
            <p className="text-base sm:text-lg font-medium text-[var(--vn-brown-med)] mb-2">
              {meta.subtitle}
            </p>
            <p className="text-sm text-[var(--vn-brown-med)] leading-relaxed max-w-3xl">
              {meta.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[var(--vn-brown-med)]">
              <span className="inline-flex items-center gap-1">
                <span className="font-semibold text-[var(--vn-brown)]">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "producto" : "productos"}
              </span>
              {filtered.length > 0 && (
                <>
                  <span>·</span>
                  <span>
                    Precios desde <span className="font-semibold text-[var(--vn-brown)]">{formatCLP(minPrice)}</span> hasta{" "}
                    <span className="font-semibold text-[var(--vn-brown)]">{formatCLP(maxPrice)}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="border-t border-b border-border bg-[var(--vn-cream)]/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <input
              type="text"
              placeholder={`Buscar en ${meta.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-md border border-[var(--vn-brown-med)]/40 bg-[var(--vn-warm-bg)] px-3 text-sm w-full sm:w-64"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--vn-brown-med)] mr-1">Ordenar:</span>
              {([
                ["relevance", "Relevancia"],
                ["price-asc", "Precio ↑"],
                ["price-desc", "Precio ↓"],
                ["rating", "Mejor valorado"],
              ] as const).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={sortBy === key ? "default" : "outline"}
                  className={
                    sortBy === key
                      ? "h-8 bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
                      : "h-8 border-[var(--vn-brown-med)]/40 text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  }
                  onClick={() => setSortBy(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-lg">
              <p className="text-[var(--vn-brown-med)]">
                No se encontraron productos en {meta.label}
                {search && ` para "${search}"`}.
              </p>
              {search && (
                <Button
                  variant="outline"
                  className="mt-4 border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  onClick={() => setSearch("")}
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Back to catalog */}
          <div className="mt-12 text-center">
            <Button variant="outline" asChild className="border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]">
              <Link href="/catalogo">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al catálogo completo
              </Link>
            </Button>
          </div>

          {/* Cross-links to other categories */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm font-medium text-[var(--vn-brown)] mb-4 text-center">
              Explora otras categorías
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {ALL_CATEGORIES.filter((c) => c.slug !== category).map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalogo/${c.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-[var(--vn-brown)] hover:border-[var(--vn-coral)] hover:text-[var(--vn-coral)] hover:bg-[var(--vn-coral)]/5 transition-colors"
                >
                  <span aria-hidden>{c.emoji}</span>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================
// Helpers
// ============================================================

function useStoreSafe() {
  try {
    const store = useStore();
    return { markupSettings: store.markupSettings };
  } catch {
    return { markupSettings: { lowMarkup: 150, highMarkup: 75, threshold: 100000 } as MarkupSettings };
  }
}

function applyMarkupDyn(price: number, settings: MarkupSettings) {
  return applyMarkup(price, settings);
}
