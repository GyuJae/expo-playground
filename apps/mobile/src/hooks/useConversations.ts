import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import { ListConversations, type ConversationSummary } from "@expo-playground/application";
import { useAuth } from "@/context/AuthContext";

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const useCase = container.resolve(ListConversations);
      const result = await useCase.execute(user.id);
      setConversations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "대화를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { conversations, loading, error, refetch: fetch };
}
