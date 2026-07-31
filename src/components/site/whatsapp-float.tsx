"use client";

import { useState, useEffect } from "react";

// ============================================================
// CONFIGURACIÓN — Cambia este número cuando tengas el WhatsApp Business
// ============================================================
const WHATSAPP_NUMBER = "56912345678"; // Formato: código país + número sin espacios ni +
const DEFAULT_MESSAGE = "¡Hola! Vengo desde la web de Vallenar DecoHogar y tengo una consulta sobre un producto.";

export function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
    // Show tooltip after 3 seconds, hide after 8
    const showTimer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-end gap-2">
      {/* Tooltip / hint bubble */}
      {showTooltip && (
        <div className="hidden sm:block bg-card border border-border rounded-lg shadow-xl px-4 py-3 max-w-[200px] animate-in fade-in slide-in-from-right-5 duration-300">
          <p className="text-sm font-medium text-foreground">
            💬 ¿Necesitas ayuda?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Escríbenos por WhatsApp y te respondemos al instante
          </p>
          {/* Arrow pointing right */}
          <div className="absolute -right-2 bottom-5 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-card" />
        </div>
      )}

      {/* WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#1eb858] shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-green-500/50"
      >
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 group-hover:opacity-0 transition-opacity" />

        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="relative w-7 h-7 sm:w-8 sm:h-8"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Notification badge (optional) */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-background">
          1
        </span>
      </a>
    </div>
  );
}
