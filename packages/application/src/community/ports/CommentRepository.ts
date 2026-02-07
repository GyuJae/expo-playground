import type { CommentId, PostId, Comment } from "@expo-playground/domain";

/** Comment 영속성 추상화 */
export interface CommentRepository {
  /** ID로 댓글 조회 — 없으면 null */
  findById(id: CommentId): Promise<Comment | null>;
  /** 게시글별 댓글 목록 조회 — 삭제 제외, 오래된 순 */
  findByPostId(postId: PostId): Promise<Comment[]>;
  /** 댓글 저장 (생성/수정 겸용) */
  save(comment: Comment): Promise<void>;
}
