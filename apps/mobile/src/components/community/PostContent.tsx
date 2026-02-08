import { View, Text } from "react-native";
import type { Post } from "@expo-playground/domain";

interface Props {
  post: Post;
}

export function PostContent({ post }: Props) {
  return (
    <View className="border-b border-gray-200 px-4 py-4">
      <Text className="text-xl font-bold">{post.content.title}</Text>
      <Text className="mt-1 text-xs text-gray-400">
        {post.createdAt.toLocaleDateString("ko-KR")}
      </Text>
      <Text className="mt-3 text-base leading-6">{post.content.body}</Text>
    </View>
  );
}
