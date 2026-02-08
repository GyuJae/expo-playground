import { View, Text, Image } from "react-native";
import type { User } from "@expo-playground/domain";

interface Props {
  user: User;
}

export function ProfileHeader({ user }: Props) {
  return (
    <View className="items-center px-4 py-8">
      {user.avatarUrl.value ? (
        <Image
          source={{ uri: user.avatarUrl.value }}
          className="h-20 w-20 rounded-full"
        />
      ) : (
        <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-200">
          <Text className="text-2xl font-bold text-gray-600">
            {user.nickname.value.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text className="mt-3 text-xl font-bold">{user.nickname.value}</Text>
      <Text className="mt-1 text-sm text-gray-500">{user.email.value}</Text>
    </View>
  );
}
