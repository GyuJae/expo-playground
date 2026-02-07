/**
 * 애플리케이션 에러 클래스 — 유스케이스 레벨 에러
 */

/** 애플리케이션 에러 베이스 클래스 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** 사용자를 찾을 수 없음 */
export class UserNotFoundError extends ApplicationError {
  constructor(userId: string) {
    super(`사용자를 찾을 수 없습니다: "${userId}"`);
  }
}

/** 게시글을 찾을 수 없음 */
export class PostNotFoundError extends ApplicationError {
  constructor(postId: string) {
    super(`게시글을 찾을 수 없습니다: "${postId}"`);
  }
}

/** 댓글을 찾을 수 없음 */
export class CommentNotFoundError extends ApplicationError {
  constructor(commentId: string) {
    super(`댓글을 찾을 수 없습니다: "${commentId}"`);
  }
}

/** 대화를 찾을 수 없음 */
export class ConversationNotFoundError extends ApplicationError {
  constructor(conversationId: string) {
    super(`대화를 찾을 수 없습니다: "${conversationId}"`);
  }
}

/** 권한 없음 */
export class UnauthorizedError extends ApplicationError {
  constructor(reason: string) {
    super(`권한이 없습니다: ${reason}`);
  }
}
