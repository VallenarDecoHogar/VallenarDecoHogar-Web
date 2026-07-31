"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, X, ChevronRight, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { products, formatCLP } from "@/lib/products";
import type { Product } from "@/lib/products";
import type { MarkupSettings } from "@/lib/products";
import { applyMarkup } from "@/lib/products";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 6;
const MAX_HISTORY = 8;
const HISTORY_KEY = "vallenar-search-history";
const POPULAR_KEY = "vallenar-popular-searches";

// ============================================================
// localStorage helpers
// ============================================================

function loadHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveHistory(history: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

function addToHistory(query: string) {
  const q = query.trim();
  if (!q || q.length < MIN_QUERY_LENGTH) return;
  const current = loadHistory();
  // Remove if already exists (to move to top)
  const filtered = current.filter((h) => h.toLowerCase() !== q.toLowerCase());
  // Add to front, limit to MAX_HISTORY
  const updated = [q, ...filtered].slice(0, MAX_HISTORY);
  saveHistory(updated);
  // Also track in popular (counter)
  addToPopular(q);
}

function clearHistory() {
  saveHistory([]);
}

function addToPopular(query: string) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(POPULAR_KEY);
    const counts: Record<string, number> = stored ? JSON.parse(stored) : {};
    const key = query.toLowerCase().trim();
    counts[key] = (counts[key] || 0) + 1;
    localStorage.setItem(POPULAR_KEY, JSON.stringify(counts));
  } catch {
    /* ignore */
  }
}

function getPopular(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(POPULAR_KEY);
    if (stored) {
      const counts: Record<string, number> = JSON.parse(stored);
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k);
    }
  } catch {
    /* ignore */
  }
  return [];
}

// Suggested searches (default if user has no history)
const SUGGESTED_SEARCHES = ["ruda", "nag champa", "vela", "palo santo", "lavanda", "ganesh"];

// ============================================================
// Helper: calculate dynamic price
// ============================================================

function getProductPrice(p: Product, settings: MarkupSettings) {
  const base = applyMarkup(p.originalPrice, settings);
  return { price: base.price, oldPrice: base.oldPrice };
}

// ============================================================
// Component
// ============================================================

export function SearchBox({
  className = "",
  placeholder = "Buscar productos...",
  markupSettings,
  onProductSelect,
  onSearchSubmit,
}: {
  className?: string;
  placeholder?: string;
  markupSettings: MarkupSettings;
  onProductSelect: (p: Product) => void;
  onSearchSubmit: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history + popular on mount.
  // localStorage is an external system not available during SSR —
  // this is the canonical "subscribe to external source on mount" pattern.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHistory(loadHistory());
    setPopular(getPopular());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Results based on query
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < MIN_QUERY_LENGTH) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      )
      .slice(0, MAX_RESULTS);
  }, [query]);

  // Open dropdown when typing, and reset highlighted index when query changes.
  // setState here syncs the dropdown UI state to the query.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (query.trim().length >= MIN_QUERY_LENGTH) {
      setIsOpen(true);
    }
    setHighlightedIndex(-1);
  }, [query]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    // If a result is highlighted, open it directly
    if (highlightedIndex >= 0 && results[highlightedIndex]) {
      onProductSelect(results[highlightedIndex]);
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
      return;
    }
    // Otherwise save to history and submit
    addToHistory(query);
    setHistory(loadHistory());
    onSearchSubmit(query.trim());
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  function handleResultClick(p: Product) {
    onProductSelect(p);
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function handleHistoryClick(term: string) {
    setQuery(term);
    setIsOpen(true);
    inputRef.current?.focus();
  }

  function handleClearHistory(e: React.MouseEvent) {
    e.stopPropagation();
    clearHistory();
    setHistory([]);
  }

  function clearSearch() {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleFocus() {
    // Show dropdown if we have a query, or if we have history/suggestions to show
    if (query.trim().length >= MIN_QUERY_LENGTH || history.length > 0 || true) {
      setIsOpen(true);
    }
  }

  // Determine what to show in the dropdown
  const showResults = query.trim().length >= MIN_QUERY_LENGTH;
  const showRecent = !showResults && (history.length > 0 || popular.length > 0 || true);
  const suggestedToShow = history.length > 0 ? history : SUGGESTED_SEARCHES;
  const popularToShow = popular.length > 0 ? popular : [];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vn-brown-med)] pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="pl-9 pr-9 bg-[var(--vn-warm-bg)] border-[var(--vn-brown-med)]/40"
          aria-label="Buscar productos"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] rounded"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--vn-warm-bg)] border border-[var(--vn-cream)] rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {/* RESULTS MODE */}
          {showResults ? (
            results.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[var(--vn-brown-med)]">
                  No se encontraron productos para
                </p>
                <p className="text-sm font-medium text-[var(--vn-brown)] mt-1">"{query}"</p>
                <button
                  onClick={() => {
                    addToHistory(query);
                    setHistory(loadHistory());
                    onSearchSubmit(query.trim());
                    setIsOpen(false);
                    inputRef.current?.blur();
                  }}
                  className="mt-3 text-xs text-[var(--vn-coral)] hover:underline"
                >
                  Ver todos los resultados en el catálogo →
                </button>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 bg-[var(--vn-cream)]/40 border-b border-[var(--vn-cream)]">
                  <p className="text-xs text-[var(--vn-brown-med)] uppercase tracking-wider">
                    {results.length} {results.length === 1 ? "resultado" : "resultados"}
                    {results.length === MAX_RESULTS && " (mostrando primeros 6)"}
                  </p>
                </div>
                <ul className="py-1">
                  {results.map((p, idx) => {
                    const price = getProductPrice(p, markupSettings);
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <li key={p.id} role="option" aria-selected={isHighlighted}>
                        <button
                          type="button"
                          onClick={() => handleResultClick(p)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            isHighlighted ? "bg-[var(--vn-coral)]/10" : "hover:bg-[var(--vn-cream)]/50"
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-[var(--vn-cream)] shrink-0">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--vn-brown)] line-clamp-1">
                              {p.name}
                            </p>
                            <p className="text-xs text-[var(--vn-brown-med)]">{p.category}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-[var(--vn-coral)]">
                              {formatCLP(price.price)}
                            </p>
                            {price.oldPrice > price.price && (
                              <p className="text-[10px] text-[var(--vn-brown-med)] line-through">
                                {formatCLP(price.oldPrice)}
                              </p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-[var(--vn-cream)] p-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToHistory(query);
                      setHistory(loadHistory());
                      onSearchSubmit(query.trim());
                      setIsOpen(false);
                      inputRef.current?.blur();
                    }}
                    className="w-full flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium text-[var(--vn-coral)] hover:bg-[var(--vn-coral)]/10 rounded-md transition-colors"
                  >
                    Ver todos los resultados en el catálogo
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )
          ) : (
            /* RECENT / SUGGESTIONS MODE */
            <div className="py-2">
              {/* Búsquedas recientes */}
              {suggestedToShow.length > 0 && (
                <div className="px-2 pb-2">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--vn-brown-med)] flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {history.length > 0 ? "Búsquedas recientes" : "Búsquedas sugeridas"}
                    </p>
                    {history.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-[var(--vn-brown-med)] hover:text-[var(--vn-coral)] transition-colors"
                      >
                        Borrar historial
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3 py-1">
                    {suggestedToShow.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleHistoryClick(term)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--vn-cream)] hover:bg-[var(--vn-coral)]/15 text-xs text-[var(--vn-brown)] hover:text-[var(--vn-coral)] transition-colors"
                      >
                        <Clock className="h-3 w-3 text-[var(--vn-brown-med)]" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Búsquedas populares (solo si hay historial previo) */}
              {popularToShow.length > 0 && (
                <div className="px-2 pt-2 border-t border-[var(--vn-cream)]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--vn-brown-med)] flex items-center gap-1.5 px-3 py-1.5">
                    <TrendingUp className="h-3 w-3" />
                    Más buscadas
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-3 py-1">
                    {popularToShow.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleHistoryClick(term)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--vn-coral)]/10 hover:bg-[var(--vn-coral)]/20 text-xs text-[var(--vn-coral)] transition-colors"
                      >
                        <TrendingUp className="h-3 w-3" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint */}
              <div className="px-3 py-2 mt-1 border-t border-[var(--vn-cream)]">
                <p className="text-xs text-[var(--vn-brown-med)] text-center">
                  Escribe al menos 2 caracteres para buscar productos
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
