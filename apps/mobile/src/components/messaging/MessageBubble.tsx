import { View, Text } from "react-native";
import type { Message } from "@expo-playground/domain";

interface Props {
  message: Message;
  isOwn: boolean;
  isRead?: boolean;
}

export function MessageBubble({ message, isOwn, isRead }: Props) {
  return (
    <View className={`mb-2 flex-row ${isOwn ? "justify-end" : "justify-start"}`}>
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn ? "bg-black" : "bg-gray-200"
        }`}
      >
        <Text className={`text-sm ${isOwn ? "text-white" : "text-black"}`}>
          {message.body.value}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Text
            className={`text-xs ${
              isOwn ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {message.createdAt.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isOwn && isRead && (
            <Text className="text-xs text-gray-300">읽음</Text>
          )}
        </View>
      </View>
    </View>
  );
}
