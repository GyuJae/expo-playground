import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { useCreateComment } from "@/hooks/useCreateComment";
import type { Comment } from "@expo-playground/domain";

interface Props {
  postId: string;
  onCreated: (comment: Comment) => void;
}

export function CommentInput({ postId, onCreated }: Props) {
  const [body, setBody] = useState("");
  const { create, loading } = useCreateComment();

  async function handleSubmit() {
    if (!body.trim()) return;
    try {
      const comment = await create(postId, body);
      onCreated(comment);
      setBody("");
    } catch {
      // useCreateComment에서 에러 관리
    }
  }

  return (
    <View className="flex-row items-center gap-2 border-t border-gray-200 bg-white px-4 py-2">
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="댓글을 입력하세요"
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <Pressable
        onPress={handleSubmit}
        disabled={loading || !body.trim()}
        className="rounded-lg bg-black px-4 py-2 active:bg-gray-800"
      >
        <Text className="text-sm font-medium text-white">
          {loading ? "..." : "전송"}
        </Text>
      </Pressable>
    </View>
  );
}
