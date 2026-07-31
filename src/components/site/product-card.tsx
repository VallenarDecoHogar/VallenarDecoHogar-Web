"use client";

import Image from "next/image";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore, getProductPrice, formatCLP } from "@/lib/store";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { openProduct, addToCart, wishlist, toggleWishlist, markupSettings } = useStore();
  const pr = getProductPrice(product, markupSettings, 0);
  const discount = pr.oldPrice > pr.price ? Math.round((1 - pr.price / pr.oldPrice) * 100) : 0;
  const wished = wishlist.has(product.id);

  return (
    <Card className="group overflow-hidden p-0 border-border bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div
        className="relative aspect-square overflow-hidden bg-[var(--vn-cream)] cursor-pointer"
        onClick={() => openProduct(product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral)]">
            -{discount}%
          </Badge>
        )}
        {product.variants && product.variants.length > 1 && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-14 bg-[var(--vn-warm-bg)]/90 text-[var(--vn-brown)] text-[10px]"
          >
            {product.variants.length} variantes
          </Badge>
        )}
        <Button
          size="icon"
          variant="secondary"
          className={`absolute top-3 right-3 h-9 w-9 rounded-full bg-[var(--vn-warm-bg)]/90 backdrop-blur hover:bg-[var(--vn-warm-bg)] shadow-sm ${
            wished ? "text-[var(--vn-coral)]" : "text-[var(--vn-brown)]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Añadir a favoritos"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </Button>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="text-xs bg-[var(--vn-sage)]/30 text-[var(--vn-brown-dark)] hover:bg-[var(--vn-sage)]/40"
          >
            {product.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-[var(--vn-tan)] text-[var(--vn-tan)]" />
            <span className="font-medium text-[var(--vn-brown)]">{product.rating}</span>
            <span className="text-[var(--vn-brown-med)]">({product.reviews})</span>
          </div>
        </div>

        <h3
          className="font-medium leading-snug line-clamp-2 cursor-pointer hover:text-[var(--vn-coral)] transition-colors min-h-[2.5rem] text-[var(--vn-brown)]"
          onClick={() => openProduct(product)}
        >
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[var(--vn-brown)]">{formatCLP(pr.price)}</span>
          {pr.oldPrice > pr.price && (
            <span className="text-sm text-[var(--vn-brown-med)] line-through">
              {formatCLP(pr.oldPrice)}
            </span>
          )}
        </div>

        <Button
          className="w-full bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
          size="sm"
          onClick={() => addToCart(product)}
        >
          <ShoppingBag className="mr-1.5 h-4 w-4" />
          Añadir al carrito
        </Button>
      </div>
    </Card>
  );
}
