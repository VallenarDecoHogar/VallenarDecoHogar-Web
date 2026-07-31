"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount.
  // setState here syncs to the mount lifecycle (SSR → client).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-[var(--vn-brown-med)]" aria-label="Cambiar tema">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-[var(--vn-brown-med)] hover:text-[var(--vn-brown)] hover:bg-[var(--vn-cream)]"
      aria-label={isDark ? "Activar modo día" : "Activar modo noche"}
      title={isDark ? "Modo día" : "Modo noche"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
