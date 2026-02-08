"use client";

import { createContext, useContext, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

/** 브라우저 Supabase 클라이언트 — Realtime 구독 등에 사용 */
export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase는 SupabaseProvider 안에서 사용해야 합니다");
  return ctx;
}
