/** 애플리케이션 레이어 — 유스케이스 / 포트 */
import "reflect-metadata";

// ── shared ──
export {
  ApplicationError,
  UserNotFoundError,
  PostNotFoundError,
  CommentNotFoundError,
  ConversationNotFoundError,
  UnauthorizedError,
} from "./shared/errors.js";
export { DI_TOKENS } from "./shared/tokens.js";

// ── auth 포트 ──
export type { AuthResult, AuthProvider } from "./auth/ports/AuthProvider.js";
export type { UserRepository } from "./auth/ports/UserRepository.js";

// ── auth 유스케이스 ──
export { SignInWithGoogle } from "./auth/use-cases/SignInWithGoogle.js";
export { GetProfile } from "./auth/use-cases/GetProfile.js";
export { UpdateProfile } from "./auth/use-cases/UpdateProfile.js";

// ── community 포트 ──
export type { PostRepository } from "./community/ports/PostRepository.js";
export type { CommentRepository } from "./community/ports/CommentRepository.js";
export type {
  CommentRealtimePort,
  RealtimeSubscription as CommentRealtimeSubscription,
} from "./community/ports/CommentRealtimePort.js";

// ── community 유스케이스 ──
export { CreatePost } from "./community/use-cases/CreatePost.js";
export { ListPosts } from "./community/use-cases/ListPosts.js";
export { GetPostDetail } from "./community/use-cases/GetPostDetail.js";
export { CreateComment } from "./community/use-cases/CreateComment.js";
export { ListComments } from "./community/use-cases/ListComments.js";
export { UpdateComment } from "./community/use-cases/UpdateComment.js";
export { DeleteComment } from "./community/use-cases/DeleteComment.js";

// ── messaging 포트 ──
export type { ConversationRepository } from "./messaging/ports/ConversationRepository.js";
export type { MessageRepository } from "./messaging/ports/MessageRepository.js";
export type {
  MessageRealtimePort,
  RealtimeSubscription,
} from "./messaging/ports/MessageRealtimePort.js";

// ── messaging 유스케이스 ──
export { GetOrCreateConversation } from "./messaging/use-cases/GetOrCreateConversation.js";
export { ListConversations, type ConversationSummary } from "./messaging/use-cases/ListConversations.js";
export { SendMessage } from "./messaging/use-cases/SendMessage.js";
export { ListMessages } from "./messaging/use-cases/ListMessages.js";
export { SubscribeToMessages } from "./messaging/use-cases/SubscribeToMessages.js";

// ── community realtime 유스케이스 ──
export { SubscribeToComments } from "./community/use-cases/SubscribeToComments.js";
