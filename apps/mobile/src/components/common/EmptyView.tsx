import { View, Text } from "react-native";

interface Props {
  message?: string;
}

export function EmptyView({ message = "항목이 없습니다" }: Props) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-base text-gray-500">{message}</Text>
    </View>
  );
}
