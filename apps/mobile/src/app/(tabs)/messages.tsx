import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/context/AuthContext";
import { ConversationCard } from "@/components/messaging/ConversationCard";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";
import { EmptyView } from "@/components/common/EmptyView";
import { Plus } from "lucide-react-native";

export default function MessagesTab() {
  const { conversations, loading, error, refetch } = useConversations();
  const { user } = useAuth();
  const router = useRouter();

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 pb-3 pt-14">
        <Text className="text-2xl font-bold">메시지</Text>
        <Pressable
          onPress={() => router.push("/chat/new")}
          className="flex-row items-center gap-1 rounded-lg bg-black px-3 py-2 active:bg-gray-800"
        >
          <Plus color="white" size={16} />
          <Text className="text-sm font-medium text-white">새 대화</Text>
        </Pressable>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversation.id}
        renderItem={({ item }) => (
          <ConversationCard summary={item} currentUserId={user?.id ?? ""} />
        )}
        onRefresh={refetch}
        refreshing={loading}
        ListEmptyComponent={<EmptyView message="대화가 없습니다" />}
      />
    </View>
  );
}
