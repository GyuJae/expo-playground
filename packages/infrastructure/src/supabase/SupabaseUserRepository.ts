import { injectable, inject } from "tsyringe";
import {
  User,
  Email,
  Nickname,
  AvatarUrl,
  createUserId,
  type UserId,
} from "@expo-playground/domain";
import type { UserRepository } from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** profiles 테이블 행 타입 */
interface ProfileRow {
  user_id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  created_at: string;
}

/** DB 행 → User 도메인 엔티티 */
function rowToDomain(row: ProfileRow): User {
  return User.reconstruct({
    id: createUserId(row.user_id),
    email: Email.reconstruct(row.email),
    nickname: Nickname.reconstruct(row.nickname),
    avatarUrl: AvatarUrl.reconstruct(row.avatar_url),
    createdAt: new Date(row.created_at),
  });
}

/** User 도메인 엔티티 → DB 행 (created_at 제외: DB 기본값) */
function domainToRow(user: User) {
  return {
    user_id: user.id as string,
    email: user.email.value,
    nickname: user.nickname.value,
    avatar_url: user.avatarUrl.value,
  };
}

/**
 * Supabase 기반 UserRepository 구현
 */
@injectable()
export class SupabaseUserRepository implements UserRepository {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("user_id", id as string)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`프로필 조회 실패: ${error.message}`);
    }

    return rowToDomain(data as ProfileRow);
  }

  async save(user: User): Promise<void> {
    const row = domainToRow(user);
    const { error } = await this.client
      .from("profiles")
      .upsert(row, { onConflict: "user_id" });

    if (error) {
      throw new Error(`프로필 저장 실패: ${error.message}`);
    }
  }
}
