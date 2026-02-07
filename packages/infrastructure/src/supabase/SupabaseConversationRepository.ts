import { injectable, inject } from "tsyringe";
import {
  Conversation,
  ConversationMember,
  createConversationId,
  createUserId,
  type ConversationId,
  type UserId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** conversations 테이블 행 타입 */
interface ConversationRow {
  id: string;
  created_at: string;
  conversation_members?: MemberRow[];
}

/** conversation_members 테이블 행 타입 */
interface MemberRow {
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

/** DB 행 → Conversation 도메인 엔티티 */
function rowToDomain(row: ConversationRow): Conversation {
  const members = (row.conversation_members ?? []).map((m) =>
    ConversationMember.reconstruct(
      createUserId(m.user_id),
      new Date(m.joined_at),
    ),
  );

  return Conversation.reconstruct({
    id: createConversationId(row.id),
    members,
    createdAt: new Date(row.created_at),
  });
}

/**
 * Supabase 기반 ConversationRepository 구현
 */
@injectable()
export class SupabaseConversationRepository implements ConversationRepository {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  async findById(id: ConversationId): Promise<Conversation | null> {
    const { data, error } = await this.client
      .from("conversations")
      .select("*, conversation_members(*)")
      .eq("id", id as string)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`대화 조회 실패: ${error.message}`);
    }

    return rowToDomain(data as ConversationRow);
  }

  async findByMembers(
    userId1: UserId,
    userId2: UserId,
  ): Promise<Conversation | null> {
    // userId1이 멤버인 대화 중 userId2도 멤버인 대화 검색
    const { data: memberRows, error: memberError } = await this.client
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userId1 as string);

    if (memberError) {
      throw new Error(`대화 멤버 검색 실패: ${memberError.message}`);
    }

    const convIds = (memberRows as MemberRow[]).map((r) => r.conversation_id);
    if (convIds.length === 0) return null;

    // 해당 대화 중 userId2도 멤버인 것 찾기
    const { data: matchRows, error: matchError } = await this.client
      .from("conversation_members")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .eq("user_id", userId2 as string);

    if (matchError) {
      throw new Error(`대화 매칭 실패: ${matchError.message}`);
    }

    if (!matchRows || matchRows.length === 0) return null;

    const matchedConvId = (matchRows as MemberRow[])[0]!.conversation_id;
    return this.findById(
      createConversationId(matchedConvId),
    );
  }

  async findAllByUserId(userId: UserId): Promise<Conversation[]> {
    // userId가 멤버인 대화 ID 목록
    const { data: memberRows, error: memberError } = await this.client
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userId as string);

    if (memberError) {
      throw new Error(`대화 목록 검색 실패: ${memberError.message}`);
    }

    const convIds = (memberRows as MemberRow[]).map((r) => r.conversation_id);
    if (convIds.length === 0) return [];

    const { data, error } = await this.client
      .from("conversations")
      .select("*, conversation_members(*)")
      .in("id", convIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`대화 목록 조회 실패: ${error.message}`);
    }

    return (data as ConversationRow[]).map(rowToDomain);
  }

  async save(conversation: Conversation): Promise<void> {
    // 대화 upsert
    const { error: convError } = await this.client
      .from("conversations")
      .upsert(
        {
          id: conversation.id as string,
          created_at: conversation.createdAt.toISOString(),
        },
        { onConflict: "id" },
      );

    if (convError) {
      throw new Error(`대화 저장 실패: ${convError.message}`);
    }

    // 멤버 upsert
    const memberRows = conversation.members.map((m) => ({
      conversation_id: conversation.id as string,
      user_id: m.userId as string,
      joined_at: m.joinedAt.toISOString(),
    }));

    const { error: memberError } = await this.client
      .from("conversation_members")
      .upsert(memberRows, { onConflict: "conversation_id,user_id" });

    if (memberError) {
      throw new Error(`대화 멤버 저장 실패: ${memberError.message}`);
    }
  }
}
