"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, LogOut, ShoppingBag, Heart, Package } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tab = "login" | "register";

export default function CuentaPage() {
  const router = useRouter();
  const { user, login, register, logout, cartCount, wishlist, toast } = useStore();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);
    if (!result.ok && result.error) {
      toast({ title: "Error", description: result.error });
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await register(regEmail, regPassword, regName, regPhone);
    setLoading(false);
    if (!result.ok && result.error) {
      toast({ title: "Error", description: result.error });
    }
  }

  // If user is logged in, show profile
  if (user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vn-coral)]/15 text-[var(--vn-coral)]">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--vn-brown)]">
                {user.name || "Mi cuenta"}
              </h1>
              <p className="text-sm text-[var(--vn-brown-med)]">{user.email}</p>
              {user.phone && (
                <p className="text-xs text-[var(--vn-brown-med)]">📞 {user.phone}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--vn-cream)]/50 rounded-lg p-4 text-center">
              <ShoppingBag className="h-6 w-6 mx-auto text-[var(--vn-coral)] mb-1" />
              <p className="text-2xl font-bold text-[var(--vn-brown)]">{cartCount}</p>
              <p className="text-xs text-[var(--vn-brown-med)]">En carrito</p>
            </div>
            <div className="bg-[var(--vn-cream)]/50 rounded-lg p-4 text-center">
              <Heart className="h-6 w-6 mx-auto text-[var(--vn-coral)] mb-1" />
              <p className="text-2xl font-bold text-[var(--vn-brown)]">{wishlist.size}</p>
              <p className="text-xs text-[var(--vn-brown-med)]">Favoritos</p>
            </div>
            <div className="bg-[var(--vn-cream)]/50 rounded-lg p-4 text-center">
              <Package className="h-6 w-6 mx-auto text-[var(--vn-coral)] mb-1" />
              <p className="text-2xl font-bold text-[var(--vn-brown)]">0</p>
              <p className="text-xs text-[var(--vn-brown-med)]">Pedidos</p>
            </div>
          </div>

          {/* Account info */}
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-[var(--vn-brown)] mb-2">
              Información de la cuenta
            </h2>
            <div className="flex items-center gap-3 p-3 bg-[var(--vn-cream)]/30 rounded-lg">
              <Mail className="h-4 w-4 text-[var(--vn-brown-med)]" />
              <span className="text-sm text-[var(--vn-brown)]">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[var(--vn-cream)]/30 rounded-lg">
              <Phone className="h-4 w-4 text-[var(--vn-brown-med)]" />
              <span className="text-sm text-[var(--vn-brown)]">
                {user.phone || "No definido"}
              </span>
            </div>
          </div>

          {/* Benefits notice */}
          <div className="bg-[var(--vn-coral)]/10 border border-[var(--vn-coral)]/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-[var(--vn-brown)]">
              ✨ <strong>¡Tu carrito está guardado!</strong> Cuando inicias sesión, tu carrito y
              favoritos se sincronizan automáticamente. No perderás tus productos aunque cambies de dispositivo.
            </p>
          </div>

          {/* Logout */}
          <Button
            onClick={() => logout()}
            variant="outline"
            className="border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  // Login / Register form
  return (
    <div className="container mx-auto max-w-md px-4 sm:px-6 py-12">
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--vn-brown)] text-center mb-6">
          {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-[var(--vn-cream)]/50 rounded-lg">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "login"
                ? "bg-[var(--vn-warm-bg)] text-[var(--vn-coral)] shadow-sm"
                : "text-[var(--vn-brown-med)]"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "register"
                ? "bg-[var(--vn-warm-bg)] text-[var(--vn-coral)] shadow-sm"
                : "text-[var(--vn-brown-med)]"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Benefits banner */}
        <div className="bg-[var(--vn-coral)]/10 border border-[var(--vn-coral)]/30 rounded-lg p-3 mb-6">
          <p className="text-xs text-[var(--vn-brown)]">
            💾 <strong>Guarda tu carrito</strong> y recíbelo en cualquier dispositivo.
            Te enviaremos ofertas exclusivas por email.
          </p>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--vn-brown)]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)]" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--vn-brown)]">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)]" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
            >
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--vn-brown)]">
                Nombre (opcional)
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)]" />
                <Input
                  id="name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="pl-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
                  placeholder="Tu nombre"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-[var(--vn-brown)]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)]" />
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="pl-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone" className="text-[var(--vn-brown)]">
                Teléfono (opcional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)]" />
                <Input
                  id="reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="pl-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-[var(--vn-brown)]">
                Contraseña (mín. 6 caracteres)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)]" />
                <Input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="pl-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
            >
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
