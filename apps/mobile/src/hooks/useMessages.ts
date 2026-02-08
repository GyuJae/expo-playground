import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import { ListMessages } from "@expo-playground/application";
import type { Message } from "@expo-playground/domain";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function useMessages(conversationId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const useCase = container.resolve(ListMessages);
      const result = await useCase.execute({
        conversationId,
        requesterId: user.id,
      });
      setMessages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "메시지를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [user, conversationId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime 구독 — 새 메시지 INSERT 감지
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
        () => {
          fetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetch]);

  function addMessage(message: Message) {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }

  return { messages, loading, error, refetch: fetch, addMessage };
}
