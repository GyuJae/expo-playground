import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { Post } from "@expo-playground/domain";

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const d = Math.floor(hr / 24);
  return `${d}일 전`;
}

interface Props {
  post: Post;
}

export function PostCard({ post }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}`)}
      className="border-b border-gray-200 bg-white px-4 py-3 active:bg-gray-50"
    >
      <Text className="text-base font-semibold" numberOfLines={1}>
        {post.content.title}
      </Text>
      <Text className="mt-1 text-sm text-gray-500" numberOfLines={2}>
        {post.content.body}
      </Text>
      <View className="mt-2 flex-row items-center">
        <Text className="text-xs text-gray-400">
          {formatRelative(post.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}
