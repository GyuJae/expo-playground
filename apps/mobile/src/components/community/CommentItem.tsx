import { View, Text, Pressable, Alert } from "react-native";
import { container } from "tsyringe";
import { DeleteComment } from "@expo-playground/application";
import type { Comment } from "@expo-playground/domain";

interface Props {
  comment: Comment;
  currentUserId: string;
  onDeleted: (commentId: string) => void;
}

export function CommentItem({ comment, currentUserId, onDeleted }: Props) {
  const isOwner = comment.authorId === currentUserId;

  async function handleDelete() {
    Alert.alert("댓글 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          const useCase = container.resolve(DeleteComment);
          await useCase.execute({
            commentId: comment.id,
            requesterId: currentUserId,
          });
          onDeleted(comment.id);
        },
      },
    ]);
  }

  return (
    <View className="border-b border-gray-100 px-4 py-3">
      <Text className="text-sm">{comment.body.value}</Text>
      <View className="mt-1 flex-row items-center gap-3">
        <Text className="text-xs text-gray-400">
          {comment.createdAt.toLocaleDateString("ko-KR")}
        </Text>
        {isOwner && (
          <Pressable onPress={handleDelete}>
            <Text className="text-xs text-red-500">삭제</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
