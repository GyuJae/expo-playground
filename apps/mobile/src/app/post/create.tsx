import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useCreatePost } from "@/hooks/useCreatePost";

export default function CreatePostScreen() {
  const router = useRouter();
  const { create, loading } = useCreatePost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) return;
    try {
      await create(title, body);
      router.back();
    } catch {
      // useCreatePost에서 에러 관리
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-gray-600">취소</Text>
        </Pressable>
        <Text className="text-lg font-bold">새 게시글</Text>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <Text className="text-base font-semibold text-black">
            {loading ? "작성 중..." : "작성"}
          </Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1 px-4 py-4">
        <TextInput
          placeholder="제목"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          className="mb-4 border-b border-gray-200 pb-3 text-lg font-semibold"
        />
        <TextInput
          placeholder="내용을 입력하세요"
          value={body}
          onChangeText={setBody}
          maxLength={10000}
          multiline
          textAlignVertical="top"
          className="min-h-[200px] text-base leading-6"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
