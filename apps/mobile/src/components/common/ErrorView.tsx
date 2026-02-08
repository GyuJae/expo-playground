import { View, Text, Pressable } from "react-native";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({ message = "오류가 발생했습니다", onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-4 text-base text-gray-600">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="rounded-lg bg-black px-6 py-2 active:bg-gray-800"
        >
          <Text className="font-medium text-white">다시 시도</Text>
        </Pressable>
      )}
    </View>
  );
}
