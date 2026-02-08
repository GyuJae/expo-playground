import type { User, Post, Comment, Message, Conversation } from "@expo-playground/domain";
import type { ConversationSummary } from "@expo-playground/application";
import type {
  UserDTO,
  PostDTO,
  CommentDTO,
  MessageDTO,
  ConversationDTO,
  ConversationSummaryDTO,
} from "./types";

/** 도메인 엔티티 → 직렬화 가능한 DTO 변환 */

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email.value,
    nickname: user.nickname.value,
    avatarUrl: user.avatarUrl.value,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toPostDTO(post: Post): PostDTO {
  return {
    id: post.id,
    authorId: post.authorId,
    title: post.content.title,
    body: post.content.body,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function toCommentDTO(comment: Comment): CommentDTO {
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    body: comment.body.value,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export function toMessageDTO(message: Message): MessageDTO {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    body: message.body.value,
    createdAt: message.createdAt.toISOString(),
  };
}

export function toConversationDTO(conversation: Conversation): ConversationDTO {
  return {
    id: conversation.id,
    members: conversation.members.map((m) => ({
      userId: m.userId,
      joinedAt: m.joinedAt.toISOString(),
    })),
    createdAt: conversation.createdAt.toISOString(),
  };
}

export function toConversationSummaryDTO(
  summary: ConversationSummary,
): ConversationSummaryDTO {
  return {
    conversation: toConversationDTO(summary.conversation),
    lastMessage: summary.lastMessage ? toMessageDTO(summary.lastMessage) : null,
  };
}
