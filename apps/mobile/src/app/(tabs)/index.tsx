import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/community/PostCard";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";
import { EmptyView } from "@/components/common/EmptyView";
import { Plus } from "lucide-react-native";

export default function CommunityTab() {
  const { posts, loading, error, refetch } = usePosts();
  const router = useRouter();

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 pb-3 pt-14">
        <Text className="text-2xl font-bold">커뮤니티</Text>
        <Pressable
          onPress={() => router.push("/post/create")}
          className="flex-row items-center gap-1 rounded-lg bg-black px-3 py-2 active:bg-gray-800"
        >
          <Plus color="white" size={16} />
          <Text className="text-sm font-medium text-white">글쓰기</Text>
        </Pressable>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        onRefresh={refetch}
        refreshing={loading}
        ListEmptyComponent={<EmptyView message="아직 게시글이 없습니다" />}
      />
    </View>
  );
}
