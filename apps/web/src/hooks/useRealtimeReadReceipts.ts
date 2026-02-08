"use client";

import { useEffect } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { ReadPositionDTO } from "@/lib/dto/types";

/**
 * Supabase Realtime으로 read_receipts 변경(INSERT/UPDATE)을 구독한다.
 * — 상대가 메시지를 읽으면 즉시 반영.
 */
export function useRealtimeReadReceipts(
  conversationId: string,
  onReadPositionChanged: (rp: ReadPositionDTO) => void,
) {
  const supabase = useSupabase();

  useEffect(() => {
    const channel = supabase
      .channel(`read_receipts:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "read_receipts",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const rp: ReadPositionDTO = {
            conversationId: row.conversation_id as string,
            userId: row.user_id as string,
            lastReadAt: row.last_read_at as string,
          };
          onReadPositionChanged(rp);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, onReadPositionChanged]);
}
