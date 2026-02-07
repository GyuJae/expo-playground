import { injectable, inject } from "tsyringe";
import {
  Post,
  PostContent,
  createPostId,
  createUserId,
  type PostId,
} from "@expo-playground/domain";
import type { PostRepository } from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** posts 테이블 행 타입 */
interface PostRow {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** DB 행 → Post 도메인 엔티티 */
function rowToDomain(row: PostRow): Post {
  return Post.reconstruct({
    id: createPostId(row.id),
    authorId: createUserId(row.author_id),
    content: PostContent.reconstruct(row.title, row.body),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  });
}

/** Post 도메인 엔티티 → DB 행 (updated_at 제외: 트리거 처리) */
function domainToRow(post: Post) {
  return {
    id: post.id as string,
    author_id: post.authorId as string,
    title: post.content.title,
    body: post.content.body,
    deleted_at: post.deletedAt?.toISOString() ?? null,
  };
}

/**
 * Supabase 기반 PostRepository 구현
 */
@injectable()
export class SupabasePostRepository implements PostRepository {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  async findById(id: PostId): Promise<Post | null> {
    const { data, error } = await this.client
      .from("posts")
      .select("*")
      .eq("id", id as string)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`게시글 조회 실패: ${error.message}`);
    }

    return rowToDomain(data as PostRow);
  }

  async findAll(): Promise<Post[]> {
    const { data, error } = await this.client
      .from("posts")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`게시글 목록 조회 실패: ${error.message}`);
    }

    return (data as PostRow[]).map(rowToDomain);
  }

  async save(post: Post): Promise<void> {
    const row = domainToRow(post);
    const { error } = await this.client
      .from("posts")
      .upsert(row, { onConflict: "id" });

    if (error) {
      throw new Error(`게시글 저장 실패: ${error.message}`);
    }
  }
}
