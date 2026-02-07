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
} from "./shared/DomainError.js";
export {
  type Brand,
  type UserId,
  type PostId,
  createUserId,
  createPostId,
  UUID_REGEX,
} from "./shared/types.js";

// ── auth ──
export { Email } from "./auth/value-objects/Email.js";
export { Nickname } from "./auth/value-objects/Nickname.js";
export { AvatarUrl } from "./auth/value-objects/AvatarUrl.js";
export { User } from "./auth/entities/User.js";

// ── community ──
export { PostContent } from "./community/value-objects/PostContent.js";
export { Post } from "./community/entities/Post.js";
