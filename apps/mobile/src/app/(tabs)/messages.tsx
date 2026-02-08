import { View, Text } from "react-native";

export default function MessagesTab() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">메시지</Text>
      <Text className="mt-2 text-sm text-gray-500">대화 목록이 여기에 표시됩니다</Text>
    </View>
  );
}
