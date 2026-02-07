import { injectable, inject } from "tsyringe";
import {
  Comment,
  CommentBody,
  createCommentId,
  createPostId,
  createUserId,
  type CommentId,
  type PostId,
} from "@expo-playground/domain";
import type { CommentRepository } from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** comments 테이블 행 타입 */
interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** DB 행 → Comment 도메인 엔티티 */
function rowToDomain(row: CommentRow): Comment {
  return Comment.reconstruct({
    id: createCommentId(row.id),
    postId: createPostId(row.post_id),
    authorId: createUserId(row.author_id),
    body: CommentBody.reconstruct(row.body),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  });
}

/** Comment 도메인 엔티티 → DB 행 (updated_at 제외: 트리거 처리) */
function domainToRow(comment: Comment) {
  return {
    id: comment.id as string,
    post_id: comment.postId as string,
    author_id: comment.authorId as string,
    body: comment.body.value,
    deleted_at: comment.deletedAt?.toISOString() ?? null,
  };
}

/**
 * Supabase 기반 CommentRepository 구현
 */
@injectable()
export class SupabaseCommentRepository implements CommentRepository {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  async findById(id: CommentId): Promise<Comment | null> {
    const { data, error } = await this.client
      .from("comments")
      .select("*")
      .eq("id", id as string)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`댓글 조회 실패: ${error.message}`);
    }

    return rowToDomain(data as CommentRow);
  }

  async findByPostId(postId: PostId): Promise<Comment[]> {
    const { data, error } = await this.client
      .from("comments")
      .select("*")
      .eq("post_id", postId as string)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`댓글 목록 조회 실패: ${error.message}`);
    }

    return (data as CommentRow[]).map(rowToDomain);
  }

  async save(comment: Comment): Promise<void> {
    const row = domainToRow(comment);
    const { error } = await this.client
      .from("comments")
      .upsert(row, { onConflict: "id" });

    if (error) {
      throw new Error(`댓글 저장 실패: ${error.message}`);
    }
  }
}
