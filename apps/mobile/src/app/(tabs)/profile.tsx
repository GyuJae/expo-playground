import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { container } from "tsyringe";
import { GetProfile } from "@expo-playground/application";
import type { User } from "@expo-playground/domain";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/google-auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";

export default function ProfileTab() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const useCase = container.resolve(GetProfile);
      const result = await useCase.execute(authUser.id);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={fetch} />;
  if (!profile) return null;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="pt-14">
        <Text className="px-4 text-2xl font-bold">프로필</Text>
      </View>
      <ProfileHeader user={profile} />
      <View className="px-4">
        <Pressable
          onPress={() => router.push("/edit-profile")}
          className="mb-3 items-center rounded-lg border border-gray-300 py-3 active:bg-gray-50"
        >
          <Text className="font-medium">프로필 수정</Text>
        </Pressable>
        <Pressable
          onPress={signOut}
          className="items-center rounded-lg border border-red-300 py-3 active:bg-red-50"
        >
          <Text className="font-medium text-red-600">로그아웃</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
