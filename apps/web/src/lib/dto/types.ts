/** 클라이언트에 전달할 직렬화 가능한 DTO 타입 */

export interface UserDTO {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PostDTO {
  id: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDTO {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  members: ConversationMemberDTO[];
  createdAt: string;
}

export interface ConversationMemberDTO {
  userId: string;
  joinedAt: string;
}

export interface ConversationSummaryDTO {
  conversation: ConversationDTO;
  lastMessage: MessageDTO | null;
}
