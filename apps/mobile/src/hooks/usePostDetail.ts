import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import { GetPostDetail } from "@expo-playground/application";
import type { Post } from "@expo-playground/domain";

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const useCase = container.resolve(GetPostDetail);
      const result = await useCase.execute(postId);
      setPost(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { post, loading, error, refetch: fetch };
}
