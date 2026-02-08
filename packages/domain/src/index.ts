/** 도메인 레이어 — 순수 비즈니스 로직 */

// ── shared ──
export { Entity } from "./shared/Entity.js";
export { ValueObject } from "./shared/ValueObject.js";
export {
  DomainError,
  InvalidUuidError,
  InvalidEmailError,
  InvalidNicknameError,
  InvalidAvatarUrlError,
  InvalidPostTitleError,
  InvalidPostBodyError,
  AlreadyDeletedPostError,
  InvalidCommentBodyError,
  AlreadyDeletedCommentError,
  InvalidMessageBodyError,
} from "./shared/DomainError.js";
export {
  type Brand,
  type UserId,
  type PostId,
  type CommentId,
  type ConversationId,
  type MessageId,
  createUserId,
  createPostId,
  createCommentId,
  createConversationId,
  createMessageId,
  UUID_REGEX,
} from "./shared/types.js";

// ── auth ──
export { Email } from "./auth/value-objects/Email.js";
export { Nickname } from "./auth/value-objects/Nickname.js";
export { AvatarUrl } from "./auth/value-objects/AvatarUrl.js";
export { User } from "./auth/entities/User.js";

// ── community ──
export { PostContent } from "./community/value-objects/PostContent.js";
export { CommentBody } from "./community/value-objects/CommentBody.js";
export { Post } from "./community/entities/Post.js";
export { Comment } from "./community/entities/Comment.js";

// ── messaging ──
export { MessageBody } from "./messaging/value-objects/MessageBody.js";
export { ConversationMember } from "./messaging/value-objects/ConversationMember.js";
export { ReadPosition } from "./messaging/value-objects/ReadPosition.js";
export { Conversation } from "./messaging/entities/Conversation.js";
export { Message } from "./messaging/entities/Message.js";
