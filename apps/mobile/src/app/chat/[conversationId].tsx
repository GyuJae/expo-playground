import { useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
  Pressable,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { MessageBubble } from "@/components/messaging/MessageBubble";
import { MessageInput } from "@/components/messaging/MessageInput";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";
import { ArrowLeft } from "lucide-react-native";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, loading, error, addMessage } = useMessages(conversationId!);
  const flatListRef = useRef<FlatList>(null);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center gap-3 border-b border-gray-200 px-4 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color="#333" size={24} />
        </Pressable>
        <Text className="text-lg font-bold">대화</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.senderId === user?.id} />
        )}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <MessageInput conversationId={conversationId!} onSent={addMessage} />
    </KeyboardAvoidingView>
  );
}
