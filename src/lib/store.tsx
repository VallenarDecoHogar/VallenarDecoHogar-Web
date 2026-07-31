"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  products as allProducts,
  applyMarkup,
  DEFAULT_MARKUP_SETTINGS,
  formatCLP,
  type Product,
} from "@/lib/products";

// ============================================================
// Types
// ============================================================

export type CartItem = {
  product: Product;
  qty: number;
  variantIndex: number;
};

export type MarkupSettings = {
  lowMarkup: number;
  highMarkup: number;
  threshold: number;
};

export type ProductPrice = {
  price: number;
  oldPrice: number;
  variant?: { name: string; priceMultiplier: number };
};

// ============================================================
// Storage helpers
// ============================================================

const SETTINGS_KEY = "vallenar-markup-settings";
const CART_KEY = "vallenar-cart";
const WISHLIST_KEY = "vallenar-wishlist";

function loadSettings(): MarkupSettings {
  if (typeof window === "undefined") return DEFAULT_MARKUP_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        lowMarkup: Number(parsed.lowMarkup) || DEFAULT_MARKUP_SETTINGS.lowMarkup,
        highMarkup: Number(parsed.highMarkup) || DEFAULT_MARKUP_SETTINGS.highMarkup,
        threshold: Number(parsed.threshold) || DEFAULT_MARKUP_SETTINGS.threshold,
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_MARKUP_SETTINGS;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CartItem[];
      // Hydrate product references from the catalog (only id + variantIndex + qty are stored)
      return parsed
        .map((item) => {
          const product = allProducts.find((p) => p.id === item.product.id);
          if (!product) return null;
          return {
            product,
            qty: item.qty,
            variantIndex: item.variantIndex || 0,
          } as CartItem;
        })
        .filter(Boolean) as CartItem[];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function loadWishlist(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (stored) {
      return new Set(JSON.parse(stored) as string[]);
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

// ============================================================
// Calculate dynamic price
// ============================================================

export function getProductPrice(
  p: Product,
  settings: MarkupSettings,
  variantIndex: number = 0
): ProductPrice {
  const base = applyMarkup(p.originalPrice, settings);
  const variant = p.variants?.[variantIndex];
  const multiplier = variant ? variant.priceMultiplier : 1;
  return {
    price: Math.round(base.price * multiplier),
    oldPrice: Math.round(base.oldPrice * multiplier),
    variant,
  };
}

// ============================================================
// Context shape
// ============================================================

type StoreContextType = {
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (p: Product, qty?: number, variantIndex?: number) => void;
  removeFromCart: (id: string, variantIndex?: number) => void;
  updateQty: (id: string, variantIndex: number, delta: number) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;

  // User auth
  user: { id: string; email: string; name: string | null; phone: string | null } | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name?: string, phone?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Admin settings
  markupSettings: MarkupSettings;
  draftSettings: MarkupSettings;
  setDraftSettings: (s: MarkupSettings) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;

  // Product modal
  selected: Product | null;
  openProduct: (p: Product) => void;
  closeProduct: () => void;

  // Toast
  toast: (t: { title: string; description?: string }) => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

// ============================================================
// Provider
// ============================================================

export function StoreProvider({
  children,
  toastFn,
}: {
  children: ReactNode;
  toastFn: (t: { title: string; description?: string }) => void;
}) {
  // Cart + wishlist + admin + user
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [markupSettings, setMarkupSettings] = useState<MarkupSettings>(DEFAULT_MARKUP_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<MarkupSettings>(DEFAULT_MARKUP_SETTINGS);
  const [selected, setSelected] = useState<Product | null>(null);
  const [user, setUser] = useState<StoreContextType["user"]>(null);

  // Hydrate from localStorage on mount (client only).
  // setState here is the canonical "subscribe to external source" pattern
  // (localStorage is not available during SSR, so we sync it after mount).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loaded = loadSettings();
    if (
      loaded.lowMarkup !== DEFAULT_MARKUP_SETTINGS.lowMarkup ||
      loaded.highMarkup !== DEFAULT_MARKUP_SETTINGS.highMarkup ||
      loaded.threshold !== DEFAULT_MARKUP_SETTINGS.threshold
    ) {
      setMarkupSettings(loaded);
      setDraftSettings(loaded);
    }
    setCart(loadCart());
    setWishlist(loadWishlist());

    // Check if user is logged in
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // Load server-side cart and merge with local
          fetch("/api/cart")
            .then((r) => r.json())
            .then((cartData) => {
              if (cartData.items && cartData.items.length > 0) {
                const serverItems = cartData.items
                  .map((i: { productId: string; variantIndex: number; quantity: number }) => {
                    const product = allProducts.find((p) => p.id === i.productId);
                    if (!product) return null;
                    return { product, qty: i.quantity, variantIndex: i.variantIndex };
                  })
                  .filter(Boolean) as CartItem[];
                if (serverItems.length > 0) {
                  // Merge: server takes priority but keep local items not on server
                  setCart((prev) => {
                    const merged = [...serverItems];
                    for (const local of prev) {
                      const exists = merged.find(
                        (m) => m.product.id === local.product.id && m.variantIndex === local.variantIndex
                      );
                      if (!exists) merged.push(local);
                    }
                    return merged;
                  });
                }
              }
            })
            .catch(() => {});
          // Load server wishlist
          fetch("/api/wishlist")
            .then((r) => r.json())
            .then((wlData) => {
              if (wlData.items) {
                setWishlist((prev) => {
                  const next = new Set(prev);
                  for (const id of wlData.items) next.add(id);
                  return next;
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sync cart to server when user is logged in (debounced)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      const items = cart.map((i) => ({
        productId: i.product.id,
        variantIndex: i.variantIndex,
        quantity: i.qty,
      }));
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart, user]);

  // Persist cart
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          CART_KEY,
          JSON.stringify(cart.map((i) => ({ product: { id: i.product.id } as Product, qty: i.qty, variantIndex: i.variantIndex })))
        );
      } catch {
        /* ignore */
      }
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(Array.from(wishlist)));
      } catch {
        /* ignore */
      }
    }
  }, [wishlist]);

  // Derived values
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce(
    (s, i) => s + i.qty * getProductPrice(i.product, markupSettings, i.variantIndex).price,
    0
  );

  // Cart actions
  const addToCart = useCallback(
    (p: Product, qty: number = 1, variantIndex: number = 0) => {
      setCart((prev) => {
        const existing = prev.find(
          (i) => i.product.id === p.id && i.variantIndex === variantIndex
        );
        if (existing) {
          return prev.map((i) =>
            i.product.id === p.id && i.variantIndex === variantIndex
              ? { ...i, qty: i.qty + qty }
              : i
          );
        }
        return [...prev, { product: p, qty, variantIndex }];
      });
      const variantName = p.variants?.[variantIndex]?.name;
      toastFn({
        title: "Añadido al carrito",
        description: `${p.name}${variantName ? ` (${variantName})` : ""} ×${qty}`,
      });
    },
    [toastFn]
  );

  const removeFromCart = useCallback((id: string, variantIndex: number = 0) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === id && i.variantIndex === variantIndex)));
  }, []);

  const updateQty = useCallback((id: string, variantIndex: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === id && i.variantIndex === variantIndex
            ? { ...i, qty: Math.max(0, i.qty + delta) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ============================================================
  // Auth actions
  // ============================================================

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error || "Error al iniciar sesión" };
        }
        setUser(data.user);
        toastFn({ title: "Bienvenido de vuelta", description: data.user.email });
        // Reload page to sync server cart
        window.location.reload();
        return { ok: true };
      } catch {
        return { ok: false, error: "Error de conexión" };
      }
    },
    [toastFn]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
      phone?: string
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, phone }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error || "Error al crear la cuenta" };
        }
        setUser(data.user);
        toastFn({ title: "Cuenta creada", description: `Bienvenido ${data.user.name || data.user.email}` });
        window.location.reload();
        return { ok: true };
      } catch {
        return { ok: false, error: "Error de conexión" };
      }
    },
    [toastFn]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    toastFn({ title: "Sesión cerrada", description: "Hasta pronto" });
    window.location.href = "/";
  }, [toastFn]);

  // Wishlist actions
  const toggleWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else {
          next.add(id);
          toastFn({ title: "Añadido a favoritos", description: "Guardado en tu lista" });
        }
        return next;
      });
    },
    [toastFn]
  );

  // Admin actions
  const saveSettings = useCallback(() => {
    setMarkupSettings(draftSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(draftSettings));
    } catch {
      /* ignore */
    }
    toastFn({
      title: "Configuración guardada",
      description: `Markups actualizados: ${draftSettings.lowMarkup}% (bajo) · ${draftSettings.highMarkup}% (alto). Todos los precios se han recalculado.`,
    });
    setAdminOpen(false);
  }, [draftSettings, toastFn]);

  const resetSettings = useCallback(() => {
    setDraftSettings(DEFAULT_MARKUP_SETTINGS);
    toastFn({
      title: "Valores por defecto restaurados",
      description: "150% para productos bajos, 75% para productos altos. Pulsa Guardar para aplicar.",
    });
  }, [toastFn]);

  // Product modal actions
  const openProduct = useCallback((p: Product) => {
    setSelected(p);
  }, []);

  const closeProduct = useCallback(() => {
    setSelected(null);
  }, []);

  const value: StoreContextType = {
    cart,
    cartCount,
    cartTotal,
    cartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    wishlist,
    toggleWishlist,
    user,
    login,
    register,
    logout,
    markupSettings,
    draftSettings,
    setDraftSettings,
    saveSettings,
    resetSettings,
    adminOpen,
    setAdminOpen,
    selected,
    openProduct,
    closeProduct,
    toast: toastFn,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return ctx;
}

// Re-export for convenience
export { formatCLP, getProductPrice as _getProductPrice };
export type { Product };
