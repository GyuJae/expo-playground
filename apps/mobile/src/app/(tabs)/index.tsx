import { View, Text } from "react-native";

export default function CommunityTab() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">커뮤니티</Text>
      <Text className="mt-2 text-sm text-gray-500">게시글 목록이 여기에 표시됩니다</Text>
    </View>
  );
}
