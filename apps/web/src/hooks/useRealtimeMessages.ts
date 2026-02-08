"use client";

import { useEffect } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { MessageDTO } from "@/lib/dto/types";

/**
 * Supabase Realtime으로 메시지 INSERT 이벤트를 구독한다.
 * — 대화 상대가 보낸 메시지를 실시간으로 받아온다.
 */
export function useRealtimeMessages(
  conversationId: string,
  onNewMessage: (message: MessageDTO) => void,
) {
  const supabase = useSupabase();

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const message: MessageDTO = {
            id: row.id as string,
            conversationId: row.conversation_id as string,
            senderId: row.sender_id as string,
            body: row.body as string,
            createdAt: row.created_at as string,
          };
          onNewMessage(message);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, onNewMessage]);
}
