"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/site/product-card";
import { products } from "@/lib/products";

const CATEGORIES = [
  {
    slug: "aromaterapia",
    label: "Aromaterapia",
    emoji: "🌿",
    accent: "var(--vn-sage)",
    subtitle: "Aceites esenciales Krishna para cuerpo, mente y espíritu",
    description:
      "Descubre nuestra colección de aceites aromáticos Krishna, ideales para difusores, baños energéticos, meditación y unción de velas. Cada aroma tiene una propiedad única: relajar, energizar, proteger o atraer abundancia.",
  },
  {
    slug: "decoracion",
    label: "Decoración",
    emoji: "🪷",
    accent: "var(--vn-tan)",
    subtitle: "Piezas artesanales para armonizar tus espacios",
    description:
      "Colgantes, campanas de viento y elementos Feng Shui traídos directamente desde India. Cada pieza es tallada a mano por artesanos locales y cargada con simbolismo sagrado: Ganesh para remover obstáculos, Om para la conexión universal, elefantes para la sabiduría.",
  },
  {
    slug: "esoterismo",
    label: "Esoterismo",
    emoji: "🕯️",
    accent: "var(--vn-coral)",
    subtitle: "Velas rituales para tus prácticas espirituales",
    description:
      "Velas ritualísticas en formas simbólicas para trabajar intenciones específicas: gallina negra para protección, Buda para paz interior, espiga para abundancia, ataúd para cortar energías. Cada vela está elaborada con cera premium y cargada con propósito.",
  },
  {
    slug: "incienso",
    label: "Incienso",
    emoji: "🪔",
    accent: "var(--vn-brown-med)",
    subtitle: "Inciensos Satya originales desde India",
    description:
      "El aclamado incienso Satya Nag Champa y otras fragancias sagradas: Palo Santo para limpieza, Lavanda para relajación, Sándalo para meditación. Cada caja trae 15 gr de varillas premium de combustión lenta.",
  },
];

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialQuery);

  // Sync search with URL query (when user uses header search)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const searchLower = search.toLowerCase().trim();

  const filteredByCategory = useMemo(() => {
    const result: Record<string, typeof products> = {};
    for (const cat of CATEGORIES) {
      const catLabelNormalized = cat.label.toLowerCase();
      result[cat.slug] = products.filter((p) => {
        const matchCat = p.category.toLowerCase() === catLabelNormalized;
        const matchSearch =
          !searchLower ||
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower);
        return matchCat && matchSearch;
      });
    }
    return result;
  }, [searchLower]);

  const totalFiltered = Object.values(filteredByCategory).reduce((s, items) => s + items.length, 0);

  return (
    <>
      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-[var(--vn-cream)]/40 to-[var(--vn-warm-bg)]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--vn-brown-med)] mb-1">Catálogo completo</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--vn-brown)]">
                Nuestro catálogo
              </h1>
              <p className="text-[var(--vn-brown-med)] mt-2 max-w-2xl">
                Explora nuestras 4 categorías de productos importados desde India. {totalFiltered}{" "}
                {totalFiltered === 1 ? "producto" : "productos"} disponibles
                {search && ` para "${search}"`}.
              </p>
            </div>

            {/* Search box */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)]" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)]"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories sections */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {search && totalFiltered === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-lg">
              <p className="text-[var(--vn-brown-med)]">
                No se encontraron productos para <span className="font-medium">"{search}"</span>.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                onClick={() => setSearch("")}
              >
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div className="space-y-16 sm:space-y-20">
              {CATEGORIES.map((cat) => {
                const items = filteredByCategory[cat.slug] || [];
                if (items.length === 0) return null;
                return (
                  <div key={cat.slug} id={cat.slug} className="scroll-mt-24">
                    <div
                      className="mb-6 sm:mb-8 border-l-4 pl-4 sm:pl-6"
                      style={{ borderColor: cat.accent }}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl" aria-hidden>
                            {cat.emoji}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--vn-brown)]">
                            {cat.label}
                          </h2>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-[var(--vn-coral)] hover:bg-[var(--vn-coral)]/10"
                        >
                          <Link href={`/catalogo/${cat.slug}`}>
                            Ver todos
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-[var(--vn-brown-med)] mb-2">
                        {cat.subtitle}
                      </p>
                      <p className="text-sm text-[var(--vn-brown-med)] leading-relaxed max-w-3xl">
                        {cat.description}
                      </p>
                      <p className="text-xs text-[var(--vn-brown-med)]/70 mt-2">
                        {items.length} {items.length === 1 ? "producto" : "productos"} disponibles
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {items.slice(0, 3).map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>

                    {items.length > 3 && (
                      <div className="text-center mt-6">
                        <Button
                          variant="outline"
                          asChild
                          className="border-[var(--vn-coral)] text-[var(--vn-coral)] hover:bg-[var(--vn-coral)]/10"
                        >
                          <Link href={`/catalogo/${cat.slug}`}>
                            Ver los {items.length} productos de {cat.label}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
