/**
 * 도메인 에러 클래스 — 비즈니스 규칙 위반 시 사용
 */

/** 도메인 에러 베이스 클래스 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** 유효하지 않은 UUID 형식 */
export class InvalidUuidError extends DomainError {
  constructor(typeName: string, value: string) {
    super(`유효하지 않은 ${typeName} 형식입니다: "${value}"`);
  }
}

/** 유효하지 않은 이메일 형식 */
export class InvalidEmailError extends DomainError {
  constructor(value: string) {
    super(`유효하지 않은 이메일 형식입니다: "${value}"`);
  }
}

/** 유효하지 않은 닉네임 */
export class InvalidNicknameError extends DomainError {
  constructor(reason: string) {
    super(`유효하지 않은 닉네임입니다: ${reason}`);
  }
}

/** 유효하지 않은 아바타 URL */
export class InvalidAvatarUrlError extends DomainError {
  constructor(reason: string) {
    super(`유효하지 않은 아바타 URL입니다: ${reason}`);
  }
}

/** 유효하지 않은 게시글 제목 */
export class InvalidPostTitleError extends DomainError {
  constructor(reason: string) {
    super(`유효하지 않은 게시글 제목입니다: ${reason}`);
  }
}

/** 유효하지 않은 게시글 본문 */
export class InvalidPostBodyError extends DomainError {
  constructor(reason: string) {
    super(`유효하지 않은 게시글 본문입니다: ${reason}`);
  }
}

/** 이미 삭제된 게시글 */
export class AlreadyDeletedPostError extends DomainError {
  constructor() {
    super("이미 삭제된 게시글입니다");
  }
}
