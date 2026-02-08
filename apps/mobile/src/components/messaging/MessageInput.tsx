import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { useSendMessage } from "@/hooks/useSendMessage";
import type { Message } from "@expo-playground/domain";

interface Props {
  conversationId: string;
  onSent: (message: Message) => void;
}

export function MessageInput({ conversationId, onSent }: Props) {
  const [body, setBody] = useState("");
  const { send, loading } = useSendMessage();

  async function handleSubmit() {
    if (!body.trim()) return;
    try {
      const message = await send(conversationId, body);
      onSent(message);
      setBody("");
    } catch {
      // useSendMessage에서 에러 관리
    }
  }

  return (
    <View className="flex-row items-center gap-2 border-t border-gray-200 bg-white px-4 py-2">
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="메시지를 입력하세요..."
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm"
        onSubmitEditing={handleSubmit}
        returnKeyType="send"
      />
      <Pressable
        onPress={handleSubmit}
        disabled={loading || !body.trim()}
        className="h-9 w-9 items-center justify-center rounded-full bg-black active:bg-gray-800"
      >
        <Text className="text-sm text-white">↑</Text>
      </Pressable>
    </View>
  );
}
