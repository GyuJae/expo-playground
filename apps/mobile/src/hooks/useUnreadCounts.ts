import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import { GetUnreadCounts, type UnreadCount } from "@expo-playground/application";
import { useAuth } from "@/context/AuthContext";

/**
 * 모든 대화의 안 읽은 메시지 수를 조회하는 훅
 */
export function useUnreadCounts() {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCount[]>([]);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const uc = container.resolve(GetUnreadCounts);
      const result = await uc.execute(user.id);
      setUnreadCounts(result);
    } catch {
      // fire-and-forget
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const getUnreadCount = useCallback(
    (conversationId: string): number => {
      return unreadCounts.find((u) => u.conversationId === conversationId)?.count ?? 0;
    },
    [unreadCounts],
  );

  return { unreadCounts, getUnreadCount, refetch: fetch };
}
