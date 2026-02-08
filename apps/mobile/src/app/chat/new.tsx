import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { container } from "tsyringe";
import { GetOrCreateConversation } from "@expo-playground/application";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react-native";

export default function NewChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!userId.trim() || !user) return;

    setLoading(true);
    try {
      const useCase = container.resolve(GetOrCreateConversation);
      const conversation = await useCase.execute({
        userId1: user.id,
        userId2: userId.trim(),
      });
      router.replace(`/chat/${conversation.id}`);
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "대화를 생성할 수 없습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 border-b border-gray-200 px-4 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color="#333" size={24} />
        </Pressable>
        <Text className="text-lg font-bold">새 대화</Text>
      </View>
      <View className="px-4 py-6">
        <Text className="mb-2 text-sm font-medium">상대방 사용자 ID</Text>
        <TextInput
          value={userId}
          onChangeText={setUserId}
          placeholder="UUID를 입력하세요"
          className="mb-4 rounded-lg border border-gray-300 px-4 py-3 text-base"
        />
        <Pressable
          onPress={handleSubmit}
          disabled={loading || !userId.trim()}
          className="items-center rounded-lg bg-black py-3 active:bg-gray-800"
        >
          <Text className="font-medium text-white">
            {loading ? "생성 중..." : "대화 시작"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
