import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { container } from "tsyringe";
import { UpdateProfile } from "@expo-playground/application";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nickname.trim() || !user) return;

    setLoading(true);
    try {
      const useCase = container.resolve(UpdateProfile);
      await useCase.execute({ userId: user.id, nickname: nickname.trim() });
      router.back();
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "프로필을 수정할 수 없습니다",
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
        <Text className="text-lg font-bold">프로필 수정</Text>
      </View>
      <View className="px-4 py-6">
        <Text className="mb-2 text-sm font-medium">닉네임</Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="새 닉네임을 입력하세요"
          maxLength={30}
          className="mb-4 rounded-lg border border-gray-300 px-4 py-3 text-base"
        />
        <Pressable
          onPress={handleSubmit}
          disabled={loading || !nickname.trim()}
          className="items-center rounded-lg bg-black py-3 active:bg-gray-800"
        >
          <Text className="font-medium text-white">
            {loading ? "저장 중..." : "저장"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
