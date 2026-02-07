import { Entity } from "../../shared/Entity.js";
import type { PostId, UserId } from "../../shared/types.js";
import { AlreadyDeletedPostError } from "../../shared/DomainError.js";
import { PostContent } from "../value-objects/PostContent.js";

interface CreatePostParams {
  id: PostId;
  authorId: UserId;
  content: PostContent;
  createdAt: Date;
}

interface ReconstructPostParams extends CreatePostParams {
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Post 엔티티 — 소프트 삭제, updatedAt 관리
 */
export class Post extends Entity<PostId> {
  private readonly _authorId: UserId;
  private _content: PostContent;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  private constructor(params: ReconstructPostParams) {
    super(params.id);
    this._authorId = params.authorId;
    this._content = params.content;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
    this._deletedAt = params.deletedAt;
  }

  /** 새 Post 생성 — updatedAt = createdAt, deletedAt = null */
  static create(params: CreatePostParams): Post {
    return new Post({
      ...params,
      updatedAt: params.createdAt,
      deletedAt: null,
    });
  }

  /** DB 복원용 */
  static reconstruct(params: ReconstructPostParams): Post {
    return new Post(params);
  }

  get authorId(): UserId {
    return this._authorId;
  }

  get content(): PostContent {
    return this._content;
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

  /** 삭제된 글인지 확인 — 삭제 시 에러 */
  private guardNotDeleted(): void {
    if (this.isDeleted) {
      throw new AlreadyDeletedPostError();
    }
  }

  /** 콘텐츠 수정 — updatedAt 갱신 */
  updateContent(content: PostContent, now: Date): void {
    this.guardNotDeleted();
    this._content = content;
    this._updatedAt = now;
  }

  /** 소프트 삭제 */
  softDelete(now: Date): void {
    this.guardNotDeleted();
    this._deletedAt = now;
  }
}
