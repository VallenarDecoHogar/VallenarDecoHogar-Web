"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  X,
  Plus,
  Minus,
  ChevronRight,
  Truck,
  Shield,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, getProductPrice, formatCLP } from "@/lib/store";

export function ProductModal() {
  const {
    selected,
    closeProduct,
    addToCart,
    markupSettings,
    wishlist,
    toggleWishlist,
  } = useStore();
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);

  // Reset qty + variant whenever a new product is opened.
  // setState here syncs the modal's local UI state when the selected product
  // changes — this is the canonical "sync state to external prop" pattern.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (selected) {
      setQty(1);
      setSelectedVariant(0);
    }
  }, [selected]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!selected) return null;

  const pr = getProductPrice(selected, markupSettings, selectedVariant);
  const discount = pr.oldPrice > pr.price ? Math.round((1 - pr.price / pr.oldPrice) * 100) : 0;
  const wished = wishlist.has(selected.id);

  return (
    <Dialog open={!!selected} onOpenChange={(o) => !o && closeProduct()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{selected.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto bg-[var(--vn-cream)]">
            <Image
              src={selected.image}
              alt={selected.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral)]">
                -{discount}%
              </Badge>
            )}
            <Button
              size="icon"
              variant="secondary"
              className={`absolute top-4 right-4 h-9 w-9 rounded-full bg-[var(--vn-warm-bg)]/90 backdrop-blur hover:bg-[var(--vn-warm-bg)] shadow-sm ${
                wished ? "text-[var(--vn-coral)]" : "text-[var(--vn-brown)]"
              }`}
              onClick={() => toggleWishlist(selected.id)}
              aria-label="Añadir a favoritos"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={wished ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </Button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <Badge variant="secondary" className="bg-[var(--vn-sage)]/30 text-[var(--vn-brown-dark)] hover:bg-[var(--vn-sage)]/40">
                {selected.category}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mt-3 leading-tight text-[var(--vn-brown)]">
                {selected.name}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(selected.rating)
                          ? "fill-[var(--vn-tan)] text-[var(--vn-tan)]"
                          : "text-[var(--vn-cream)]"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1 text-[var(--vn-brown)]">{selected.rating}</span>
                </div>
                <span className="text-sm text-[var(--vn-brown-med)]">
                  ({selected.reviews} reseñas)
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[var(--vn-coral)]">{formatCLP(pr.price)}</span>
              {pr.oldPrice > pr.price && (
                <span className="text-lg text-[var(--vn-brown-med)] line-through">
                  {formatCLP(pr.oldPrice)}
                </span>
              )}
              {pr.variant && pr.variant.priceMultiplier > 1 && (
                <Badge variant="secondary" className="ml-2 bg-[var(--vn-sage)]/30 text-[var(--vn-brown-dark)]">
                  {pr.variant.name}
                </Badge>
              )}
            </div>

            <p className="text-sm text-[var(--vn-brown-med)] leading-relaxed">{selected.description}</p>

            {/* Variant selector */}
            {selected.variants && selected.variants.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-[var(--vn-brown)]">Selecciona una variante:</p>
                <div className="grid grid-cols-3 gap-2">
                  {selected.variants.map((v, idx) => {
                    const vPrice = getProductPrice(selected, markupSettings, idx).price;
                    return (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(idx)}
                        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all text-center ${
                          selectedVariant === idx
                            ? "border-[var(--vn-coral)] bg-[var(--vn-coral)]/10"
                            : "border-border hover:border-[var(--vn-brown-med)]/40 hover:bg-[var(--vn-cream)]"
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${
                            selectedVariant === idx ? "text-[var(--vn-coral)]" : "text-[var(--vn-brown)]"
                          }`}
                        >
                          {v.name}
                        </span>
                        <span className="text-xs text-[var(--vn-brown-med)]">{formatCLP(vPrice)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2 text-[var(--vn-brown)]">Características principales</p>
              <ul className="space-y-1.5">
                {selected.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-[var(--vn-coral)] shrink-0" />
                    <span className="text-[var(--vn-brown)]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-[var(--vn-green)] font-medium">
                <span className="h-2 w-2 rounded-full bg-[var(--vn-green)]" />
                {selected.stock > 20 ? "En stock" : `¡Solo quedan ${selected.stock} unidades!`}
              </span>
            </div>

            {/* Qty selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--vn-brown)]">Cantidad:</span>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-[var(--vn-brown-med)]/40 text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium text-[var(--vn-brown)]">{qty}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-[var(--vn-brown-med)]/40 text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                className="w-full bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
                size="lg"
                onClick={() => {
                  addToCart(selected, qty, selectedVariant);
                  closeProduct();
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Añadir al carrito · {formatCLP(pr.price * qty)}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border text-xs text-center text-[var(--vn-brown-med)]">
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-[var(--vn-coral)]" />
                Envío 24-48h
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-[var(--vn-coral)]" />
                Pago seguro
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="h-4 w-4 text-[var(--vn-coral)]" />
                Producto original
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
