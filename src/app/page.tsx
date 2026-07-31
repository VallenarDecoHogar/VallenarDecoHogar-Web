"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/site/product-card";
import { useStore, formatCLP } from "@/lib/store";
import { products, getRecentProducts, applyMarkup } from "@/lib/products";

const CATEGORY_CARDS = [
  {
    slug: "aromaterapia",
    title: "Aromaterapia",
    emoji: "🌿",
    accent: "var(--vn-sage)",
    description: "Aceites esenciales Krishna para cuerpo, mente y espíritu.",
  },
  {
    slug: "decoracion",
    title: "Decoración",
    emoji: "🪷",
    accent: "var(--vn-tan)",
    description: "Piezas artesanales Feng Shui para armonizar tus espacios.",
  },
  {
    slug: "esoterismo",
    title: "Esoterismo",
    emoji: "🕯️",
    accent: "var(--vn-coral)",
    description: "Velas rituales para tus prácticas espirituales.",
  },
  {
    slug: "incienso",
    title: "Incienso",
    emoji: "🪔",
    accent: "var(--vn-brown-med)",
    description: "Inciensos Satya originales importados desde India.",
  },
];

export default function HomePage() {
  const { markupSettings } = useStore();
  const recentProducts = getRecentProducts();
  const heroProduct = products.find((p) => p.id === "p28") || recentProducts[0] || products[0];

  // Calculate hero product price dynamically
  const heroPrice = applyMarkup(heroProduct.originalPrice, markupSettings);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-[var(--vn-sage)]/40 via-[var(--vn-cream-yellow)]/30 to-[var(--vn-warm-bg)]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--vn-coral)]/15 text-[var(--vn-brown-dark)] border border-[var(--vn-coral)]/30 hover:bg-[var(--vn-coral)]/20"
              >
                <Sparkles className="h-3 w-3" />
                Aromaterapia, esoterismo y decoración sagrada
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-[var(--vn-brown)]">
                Energía, aroma y{" "}
                <span className="text-[var(--vn-coral)]">belleza para tu hogar.</span>
              </h1>
              <p className="text-lg text-[var(--vn-brown-med)] max-w-md leading-relaxed">
                Aceites esenciales, inciensos Satya, velas rituales y decoración Feng Shui
                importados directamente desde India. Productos seleccionados para armonizar
                tus espacios y tu energía.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)] shadow-sm"
                  asChild
                >
                  <Link href="/catalogo">
                    Ver catálogo
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  asChild
                >
                  <Link href="/catalogo/aromaterapia">Explorar aromaterapia</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-[var(--vn-brown-med)]">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--vn-coral)]" />
                  Webpay + Mercado Pago
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[var(--vn-coral)]" />
                  Envío a todo Chile
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/5] sm:aspect-[5/4] rounded-3xl overflow-hidden bg-[var(--vn-cream)] shadow-xl ring-1 ring-[var(--vn-brown)]/10">
              <Image
                src={heroProduct.image}
                alt={heroProduct.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[var(--vn-warm-bg)]/95 backdrop-blur p-4 rounded-2xl border border-[var(--vn-cream)] shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--vn-brown-med)]">Oferta destacada</p>
                    <p className="font-semibold text-[var(--vn-brown)]">{heroProduct.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--vn-brown-med)] line-through">
                      {formatCLP(heroPrice.oldPrice)}
                    </p>
                    <p className="text-lg font-bold text-[var(--vn-coral)]">
                      {formatCLP(heroPrice.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm text-[var(--vn-brown-med)] mb-1">Explora por categoría</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--vn-brown)]">
              Nuestras colecciones
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalogo/${cat.slug}`}
                className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className="p-6 sm:p-8 text-center space-y-3"
                  style={{ background: `linear-gradient(135deg, ${cat.accent}33 0%, transparent 100%)` }}
                >
                  <span className="text-5xl block" aria-hidden>
                    {cat.emoji}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--vn-brown)]">{cat.title}</h3>
                  <p className="text-sm text-[var(--vn-brown-med)] leading-relaxed">{cat.description}</p>
                  <p className="inline-flex items-center gap-1 text-sm font-medium text-[var(--vn-coral)] group-hover:gap-2 transition-all">
                    Ver productos <ChevronRight className="h-4 w-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent / New products */}
      <section id="destacados" className="py-16 sm:py-20 border-t border-border bg-[var(--vn-cream)]/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm text-[var(--vn-brown-med)] mb-1 inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[var(--vn-coral)]" />
                Recién llegados
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--vn-brown)]">
                Productos nuevos
              </h2>
              <p className="text-sm text-[var(--vn-brown-med)] mt-2 max-w-xl">
                Las últimas novedades que hemos agregado a nuestro catálogo, importadas recientemente desde India.
              </p>
            </div>
            <Button
              variant="ghost"
              asChild
              className="hidden sm:flex text-[var(--vn-coral)] hover:bg-[var(--vn-coral)]/10"
            >
              <Link href="/catalogo">
                Ver catálogo completo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {recentProducts.length === 0 ? (
            <div className="text-center py-12 text-[var(--vn-brown-med)]">
              <p>No hay productos nuevos en este momento. Visita nuestro catálogo completo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentProducts.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-border bg-gradient-to-br from-[var(--vn-tan)]/30 via-[var(--vn-cream-yellow)]/40 to-[var(--vn-cream)]/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--vn-brown)]">
              Recibe ofertas exclusivas
            </h2>
            <p className="text-[var(--vn-brown-med)]">
              Suscríbete y consigue un 10% de descuento en tu primera compra, además de acceso
              anticipado a flash sales.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                alert("¡Suscripción confirmada! Te enviamos un cupón a tu correo.");
                form.reset();
              }}
            >
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="flex-1 h-10 rounded-md border border-[var(--vn-brown-med)]/40 bg-[var(--vn-warm-bg)] px-3 py-2 text-sm"
              />
              <Button
                type="submit"
                className="bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
              >
                Suscribirme
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
