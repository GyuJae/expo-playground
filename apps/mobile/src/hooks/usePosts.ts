import { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";
import { ListPosts } from "@expo-playground/application";
import type { Post } from "@expo-playground/domain";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const useCase = container.resolve(ListPosts);
      const result = await useCase.execute();
      setPosts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { posts, loading, error, refetch: fetch };
}
