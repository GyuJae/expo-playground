import { View, Text } from "react-native";

export default function ProfileTab() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">프로필</Text>
      <Text className="mt-2 text-sm text-gray-500">프로필 정보가 여기에 표시됩니다</Text>
    </View>
  );
}
