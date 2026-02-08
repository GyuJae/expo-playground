import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { ConversationSummary } from "@expo-playground/application";

interface Props {
  summary: ConversationSummary;
  currentUserId: string;
}

export function ConversationCard({ summary, currentUserId }: Props) {
  const router = useRouter();
  const other = summary.conversation.members.find(
    (m) => m.userId !== currentUserId,
  );

  return (
    <Pressable
      onPress={() => router.push(`/chat/${summary.conversation.id}`)}
      className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 active:bg-gray-50"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-200">
        <Text className="text-sm font-semibold text-gray-600">
          {(other?.userId ?? "?").charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {other?.userId ?? "알 수 없음"}
        </Text>
        {summary.lastMessage && (
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {summary.lastMessage.body.value}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
