import { useState } from "react";
import { container } from "tsyringe";
import { CreatePost } from "@expo-playground/application";
import { useAuth } from "@/context/AuthContext";

export function useCreatePost() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(title: string, body: string) {
    if (!user) throw new Error("인증되지 않은 사용자입니다");

    setLoading(true);
    setError(null);
    try {
      const useCase = container.resolve(CreatePost);
      return await useCase.execute({ authorId: user.id, title, body });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "게시글을 작성할 수 없습니다";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { create, loading, error };
}
