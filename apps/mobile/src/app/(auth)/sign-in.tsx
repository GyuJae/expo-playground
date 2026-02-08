import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useGoogleAuth } from "@/lib/google-auth";

export default function SignInScreen() {
  const { signIn, loading } = useGoogleAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-3xl font-bold">커뮤니티</Text>
      <Text className="mb-8 text-base text-gray-500">
        Google 계정으로 시작하세요
      </Text>

      <Pressable
        onPress={signIn}
        disabled={loading}
        className="w-full flex-row items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 active:bg-gray-100"
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text className="text-base font-medium text-gray-800">
            Google로 로그인
          </Text>
        )}
      </Pressable>
    </View>
  );
}
