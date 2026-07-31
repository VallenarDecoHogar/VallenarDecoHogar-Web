"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export function AppProviders({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  return <StoreProvider toastFn={toast}>{children}</StoreProvider>;
}
