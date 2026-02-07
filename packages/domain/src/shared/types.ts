/**
 * 브랜디드 타입 유틸리티 — 런타임 비용 없는 타입 안전성
 */

/** 브랜드 심볼 키 */
declare const __brand: unique symbol;

/** 브랜디드 타입: 기존 타입에 브랜드 태그를 부여 */
export type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

/** UUID 정규식 (v4 포함 범용) */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── 브랜디드 ID 타입 ──

export type UserId = Brand<string, "UserId">;
export type PostId = Brand<string, "PostId">;

/** UserId 생성 — UUID 형식 검증 */
export function createUserId(id: string): UserId {
  if (!UUID_REGEX.test(id)) {
    throw new InvalidUuidError("UserId", id);
  }
  return id as UserId;
}

/** PostId 생성 — UUID 형식 검증 */
export function createPostId(id: string): PostId {
  if (!UUID_REGEX.test(id)) {
    throw new InvalidUuidError("PostId", id);
  }
  return id as PostId;
}

// InvalidUuidError를 여기서 직접 import하면 순환 의존 가능성이 있으므로
// 지연 import 대신, DomainError를 여기서 직접 정의하지 않고 import한다.
import { InvalidUuidError } from "./DomainError.js";
