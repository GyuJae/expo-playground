/** 애플리케이션 레이어 — 유스케이스 / 포트 */
import "reflect-metadata";

// ── shared ──
export { ApplicationError, UserNotFoundError, PostNotFoundError } from "./shared/errors.js";
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

// ── community 유스케이스 ──
export { CreatePost } from "./community/use-cases/CreatePost.js";
export { ListPosts } from "./community/use-cases/ListPosts.js";
export { GetPostDetail } from "./community/use-cases/GetPostDetail.js";
