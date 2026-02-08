import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import { ListComments } from "@expo-playground/application";
import type { Comment } from "@expo-playground/domain";
import { supabase } from "@/lib/supabase";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const useCase = container.resolve(ListComments);
      const result = await useCase.execute(postId);
      setComments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime 구독 — 새 댓글 INSERT 감지
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetch]);

  function addComment(comment: Comment) {
    setComments((prev) => {
      if (prev.some((c) => c.id === comment.id)) return prev;
      return [...prev, comment];
    });
  }

  function removeComment(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return { comments, loading, error, refetch: fetch, addComment, removeComment };
}
