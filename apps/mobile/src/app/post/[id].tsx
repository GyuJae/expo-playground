import { FlatList, KeyboardAvoidingView, Platform, View, Pressable, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostDetail } from "@/hooks/usePostDetail";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/context/AuthContext";
import { PostContent } from "@/components/community/PostContent";
import { CommentItem } from "@/components/community/CommentItem";
import { CommentInput } from "@/components/community/CommentInput";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";
import { ArrowLeft } from "lucide-react-native";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { post, loading: postLoading, error: postError } = usePostDetail(id!);
  const { comments, loading: commentsLoading, addComment, removeComment } = useComments(id!);

  if (postLoading || commentsLoading) return <LoadingView />;
  if (postError || !post) return <ErrorView message={postError ?? "게시글을 찾을 수 없습니다"} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center gap-3 border-b border-gray-200 px-4 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color="#333" size={24} />
        </Pressable>
        <Text className="text-lg font-bold">게시글</Text>
      </View>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<PostContent post={post} />}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            currentUserId={user?.id ?? ""}
            onDeleted={removeComment}
          />
        )}
      />
      <CommentInput postId={id!} onCreated={addComment} />
    </KeyboardAvoidingView>
  );
}
