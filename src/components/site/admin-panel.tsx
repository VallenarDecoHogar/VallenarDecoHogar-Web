"use client";

import { Settings, Percent, Shield, RotateCcw, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, formatCLP } from "@/lib/store";
import { applyMarkup, products, DEFAULT_MARKUP_SETTINGS } from "@/lib/products";

export function AdminPanel() {
  const {
    adminOpen,
    setAdminOpen,
    draftSettings,
    setDraftSettings,
    saveSettings,
    resetSettings,
  } = useStore();

  return (
    <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--vn-brown)]">
            <Settings className="h-5 w-5 text-[var(--vn-coral)]" />
            Panel de Administración
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="bg-[var(--vn-cream)] rounded-lg p-4 border border-[var(--vn-cream)]">
            <p className="text-sm text-[var(--vn-brown-med)] leading-relaxed">
              Ajusta los porcentajes de markup que se aplican a los precios reales de los productos.
              Los cambios se reflejan inmediatamente en todo el catálogo y se guardan en este navegador.
            </p>
          </div>

          {/* Low markup */}
          <div className="space-y-2">
            <Label htmlFor="low-markup" className="flex items-center gap-2 text-[var(--vn-brown)]">
              <Percent className="h-4 w-4 text-[var(--vn-coral)]" />
              Markup para productos menores al umbral
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="low-markup"
                type="number"
                min="0"
                max="500"
                step="5"
                value={draftSettings.lowMarkup}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, lowMarkup: Number(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-[var(--vn-brown-med)]">%</span>
            </div>
            <p className="text-xs text-[var(--vn-brown-med)]">
              Se aplica a productos con precio real &lt; {formatCLP(draftSettings.threshold)}. Multiplicador: ×
              {(1 + draftSettings.lowMarkup / 100).toFixed(2)}
            </p>
          </div>

          {/* High markup */}
          <div className="space-y-2">
            <Label htmlFor="high-markup" className="flex items-center gap-2 text-[var(--vn-brown)]">
              <Percent className="h-4 w-4 text-[var(--vn-coral)]" />
              Markup para productos sobre el umbral
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="high-markup"
                type="number"
                min="0"
                max="300"
                step="5"
                value={draftSettings.highMarkup}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, highMarkup: Number(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-[var(--vn-brown-med)]">%</span>
            </div>
            <p className="text-xs text-[var(--vn-brown-med)]">
              Se aplica a productos con precio real ≥ {formatCLP(draftSettings.threshold)}. Multiplicador: ×
              {(1 + draftSettings.highMarkup / 100).toFixed(2)}
            </p>
          </div>

          {/* Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold" className="flex items-center gap-2 text-[var(--vn-brown)]">
              <Shield className="h-4 w-4 text-[var(--vn-coral)]" />
              Umbral (CLP)
            </Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              step="10000"
              value={draftSettings.threshold}
              onChange={(e) =>
                setDraftSettings({ ...draftSettings, threshold: Number(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-[var(--vn-brown-med)]">
              Productos por debajo de este valor usan el markup bajo; por encima usan el markup alto.
            </p>
          </div>

          {/* Live preview */}
          <div className="bg-[var(--vn-warm-bg)] border border-[var(--vn-cream)] rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--vn-brown-med)]">
              Vista previa con productos reales
            </p>
            {(() => {
              const sorted = [...products].sort((a, b) => a.originalPrice - b.originalPrice);
              const samples = [
                sorted[0],
                sorted[Math.floor(sorted.length / 2)],
                sorted[sorted.length - 1],
              ];
              return samples.map((p) => {
                const calculated = applyMarkup(p.originalPrice, draftSettings);
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--vn-brown)] truncate">{p.name}</p>
                      <p className="text-xs text-[var(--vn-brown-med)]">
                        Real: {formatCLP(p.originalPrice)} · Markup:{" "}
                        {p.originalPrice < draftSettings.threshold
                          ? `${draftSettings.lowMarkup}%`
                          : `${draftSettings.highMarkup}%`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--vn-coral)]">{formatCLP(calculated.price)}</p>
                      <p className="text-xs text-[var(--vn-brown-med)] line-through">
                        {formatCLP(calculated.oldPrice)}
                      </p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              className="flex-1 bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] hover:bg-[var(--vn-coral-light)]"
              onClick={saveSettings}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar y aplicar
            </Button>
            <Button
              variant="outline"
              className="border-[var(--vn-brown-med)] text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
              onClick={resetSettings}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar defaults ({DEFAULT_MARKUP_SETTINGS.lowMarkup}%/{DEFAULT_MARKUP_SETTINGS.highMarkup}%)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
