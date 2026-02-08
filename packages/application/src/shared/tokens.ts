/**
 * DI 토큰 상수 — tsyringe 컨테이너에서 사용하는 문자열 키
 */
export const DI_TOKENS = {
  AuthProvider: "AuthProvider",
  UserRepository: "UserRepository",
  PostRepository: "PostRepository",
  CommentRepository: "CommentRepository",
  ConversationRepository: "ConversationRepository",
  MessageRepository: "MessageRepository",
  MessageRealtimePort: "MessageRealtimePort",
  CommentRealtimePort: "CommentRealtimePort",
  ReadReceiptRepository: "ReadReceiptRepository",
  ReadReceiptRealtimePort: "ReadReceiptRealtimePort",
} as const;
