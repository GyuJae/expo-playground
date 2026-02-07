import type { UserId, User } from "@expo-playground/domain";

/** User 영속성 추상화 */
export interface UserRepository {
  /** ID로 사용자 조회 — 없으면 null */
  findById(id: UserId): Promise<User | null>;
  /** 사용자 저장 (생성/수정 겸용) */
  save(user: User): Promise<void>;
}
