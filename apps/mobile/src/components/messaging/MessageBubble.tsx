import { View, Text } from "react-native";
import type { Message } from "@expo-playground/domain";

interface Props {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: Props) {
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
        <Text
          className={`mt-1 text-xs ${
            isOwn ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {message.createdAt.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}
