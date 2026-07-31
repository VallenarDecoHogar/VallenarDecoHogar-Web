"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore, getProductPrice, formatCLP } from "@/lib/store";

function PaymentBadge({ label, sub, compact }: { label: string; sub?: string; compact?: boolean }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-md border border-[var(--vn-cream)]/30 bg-[var(--vn-warm-bg)]/10 backdrop-blur px-2 ${
        compact ? "py-1" : "py-1.5"
      }`}
    >
      <span className={`font-semibold leading-tight text-[var(--vn-warm-bg)] ${compact ? "text-[10px]" : "text-xs"}`}>
        {label}
      </span>
      {sub && (
        <span className="text-[9px] leading-tight text-[var(--vn-cream)]/60 uppercase tracking-wider">
          {sub}
        </span>
      )}
    </div>
  );
}

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    updateQty,
    removeFromCart,
    clearCart,
    markupSettings,
    toast,
  } = useStore();

  function checkout() {
    toast({
      title: "Redirigiendo a Webpay...",
      description: "Serás llevado a la pasarela segura de Transbank para completar tu pago.",
    });
    setCartOpen(false);
    clearCart();
  }

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-[var(--vn-brown)]">
            <ShoppingBag className="h-5 w-5" />
            Tu carrito ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingBag className="h-12 w-12 text-[var(--vn-brown-med)]/50" />
            <div>
              <p className="font-medium text-[var(--vn-brown)]">Tu carrito está vacío</p>
              <p className="text-sm text-[var(--vn-brown-med)] mt-1">
                Añade productos para continuar con la compra.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCartOpen(false)}
              className="border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
            >
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.map((item) => {
                const itemPrice = getProductPrice(item.product, markupSettings, item.variantIndex).price;
                const variantName = item.product.variants?.[item.variantIndex]?.name;
                return (
                  <div key={`${item.product.id}-${item.variantIndex}`} className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--vn-cream)] shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1 text-[var(--vn-brown)]">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-[var(--vn-brown-med)]">
                        {item.product.category}
                        {variantName && <span className="ml-1">· {variantName}</span>}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-[var(--vn-brown-med)]/40 text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                            onClick={() => updateQty(item.product.id, item.variantIndex, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm text-[var(--vn-brown)]">{item.qty}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-[var(--vn-brown-med)]/40 text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                            onClick={() => updateQty(item.product.id, item.variantIndex, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-semibold text-[var(--vn-brown)]">
                          {formatCLP(itemPrice * item.qty)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-[var(--vn-brown-med)] hover:text-destructive shrink-0"
                      onClick={() => removeFromCart(item.product.id, item.variantIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border px-6 py-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--vn-brown-med)]">Subtotal</span>
                <span className="font-semibold text-[var(--vn-brown)]">{formatCLP(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--vn-brown-med)]">Envío</span>
                <span className="text-[var(--vn-green)] font-medium">
                  {cartTotal >= 50000 ? "GRATIS" : formatCLP(4990)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium text-[var(--vn-brown)]">Total</span>
                <span className="font-bold text-lg text-[var(--vn-coral)]">
                  {formatCLP(cartTotal + (cartTotal >= 50000 ? 0 : 4990))}
                </span>
              </div>
              <Button
                className="w-full bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
                size="lg"
                onClick={checkout}
              >
                Pagar con Webpay
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
                size="sm"
                onClick={checkout}
              >
                Pagar con Mercado Pago
              </Button>
              <div className="flex items-center justify-center gap-2 mt-1">
                <PaymentBadge label="Webpay" sub="Transbank" compact />
                <PaymentBadge label="Mercado Pago" sub="Chile" compact />
              </div>
              <p className="text-xs text-center text-[var(--vn-brown-med)] flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3" />
                Pago seguro encriptado SSL · Transacción procesada en Chile
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
