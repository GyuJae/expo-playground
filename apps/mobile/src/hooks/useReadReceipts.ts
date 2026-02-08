import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import {
  MarkConversationAsRead,
  GetReadPositions,
} from "@expo-playground/application";
import type { ReadPosition } from "@expo-playground/domain";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

/**
 * 읽음처리 훅 — markAsRead + readPositions + realtime 구독
 */
export function useReadReceipts(conversationId: string) {
  const { user } = useAuth();
  const [readPositions, setReadPositions] = useState<ReadPosition[]>([]);

  // 읽음 위치 조회
  const fetchReadPositions = useCallback(async () => {
    if (!user) return;
    try {
      const uc = container.resolve(GetReadPositions);
      const result = await uc.execute({
        conversationId,
        requesterId: user.id,
      });
      setReadPositions(result);
    } catch {
      // fire-and-forget
    }
  }, [user, conversationId]);

  // 대화 진입 시 읽음 처리 + 위치 조회
  useEffect(() => {
    if (!user) return;

    const markAsRead = async () => {
      try {
        const uc = container.resolve(MarkConversationAsRead);
        await uc.execute({ conversationId, userId: user.id });
      } catch {
        // fire-and-forget
      }
    };

    markAsRead();
    fetchReadPositions();
  }, [user, conversationId, fetchReadPositions]);

  // Realtime 구독 — read_receipts 변경 감지
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
        () => {
          fetchReadPositions();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchReadPositions]);

  // 새 메시지 수신 시 호출 — 읽음 갱신
  const markAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const uc = container.resolve(MarkConversationAsRead);
      await uc.execute({ conversationId, userId: user.id });
    } catch {
      // fire-and-forget
    }
  }, [user, conversationId]);

  return { readPositions, markAsRead };
}
