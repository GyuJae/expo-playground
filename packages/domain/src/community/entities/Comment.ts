import { Entity } from "../../shared/Entity.js";
import type { CommentId, PostId, UserId } from "../../shared/types.js";
import { AlreadyDeletedCommentError } from "../../shared/DomainError.js";
import type { CommentBody } from "../value-objects/CommentBody.js";

interface CreateCommentParams {
  id: CommentId;
  postId: PostId;
  authorId: UserId;
  body: CommentBody;
  createdAt: Date;
}

interface ReconstructCommentParams extends CreateCommentParams {
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Comment 엔티티 — 소프트 삭제, updatedAt 관리
 */
export class Comment extends Entity<CommentId> {
  private readonly _postId: PostId;
  private readonly _authorId: UserId;
  private _body: CommentBody;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  private constructor(params: ReconstructCommentParams) {
    super(params.id);
    this._postId = params.postId;
    this._authorId = params.authorId;
    this._body = params.body;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
    this._deletedAt = params.deletedAt;
  }

  /** 새 Comment 생성 — updatedAt = createdAt, deletedAt = null */
  static create(params: CreateCommentParams): Comment {
    return new Comment({
      ...params,
      updatedAt: params.createdAt,
      deletedAt: null,
    });
  }

  /** DB 복원용 */
  static reconstruct(params: ReconstructCommentParams): Comment {
    return new Comment(params);
  }

  get postId(): PostId {
    return this._postId;
  }

  get authorId(): UserId {
    return this._authorId;
  }

  get body(): CommentBody {
    return this._body;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  /** 삭제된 댓글인지 확인 — 삭제 시 에러 */
  private guardNotDeleted(): void {
    if (this.isDeleted) {
      throw new AlreadyDeletedCommentError();
    }
  }

  /** 본문 수정 — updatedAt 갱신 */
  updateBody(body: CommentBody, now: Date): void {
    this.guardNotDeleted();
    this._body = body;
    this._updatedAt = now;
  }

  /** 소프트 삭제 */
  softDelete(now: Date): void {
    this.guardNotDeleted();
    this._deletedAt = now;
  }
}
