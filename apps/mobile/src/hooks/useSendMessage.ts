import { useState } from "react";
import { container } from "tsyringe";
import { SendMessage } from "@expo-playground/application";
import { useAuth } from "@/context/AuthContext";

export function useSendMessage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function send(conversationId: string, body: string) {
    if (!user) throw new Error("인증되지 않은 사용자입니다");

    setLoading(true);
    try {
      const useCase = container.resolve(SendMessage);
      return await useCase.execute({
        conversationId,
        senderId: user.id,
        body,
      });
    } finally {
      setLoading(false);
    }
  }

  return { send, loading };
}
