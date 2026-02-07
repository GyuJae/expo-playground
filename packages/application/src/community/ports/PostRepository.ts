import type { PostId, Post } from "@expo-playground/domain";

/** Post 영속성 추상화 */
export interface PostRepository {
  /** ID로 게시글 조회 — 없으면 null */
  findById(id: PostId): Promise<Post | null>;
  /** 전체 게시글 목록 조회 (삭제 필터링은 구현체 책임) */
  findAll(): Promise<Post[]>;
  /** 게시글 저장 (생성/수정 겸용) */
  save(post: Post): Promise<void>;
}
