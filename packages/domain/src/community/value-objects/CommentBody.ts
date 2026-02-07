import { ValueObject } from "../../shared/ValueObject.js";
import { InvalidCommentBodyError } from "../../shared/DomainError.js";

/** 최소/최대 길이 */
const MIN = 1;
const MAX = 5000;

interface CommentBodyProps {
  value: string;
}

/**
 * 댓글 본문 값 객체 — 1~5000자, trim
 */
export class CommentBody extends ValueObject<CommentBodyProps> {
  private constructor(props: CommentBodyProps) {
    super(props);
  }

  /** 새 CommentBody 생성 — trim + 길이 검증 */
  static create(value: string): CommentBody {
    const trimmed = value.trim();

    if (trimmed.length < MIN) {
      throw new InvalidCommentBodyError("댓글 본문은 비어 있을 수 없습니다");
    }
    if (trimmed.length > MAX) {
      throw new InvalidCommentBodyError(
        `댓글 본문은 ${MAX}자 이하여야 합니다`,
      );
    }

    return new CommentBody({ value: trimmed });
  }

  /** DB 복원용 */
  static reconstruct(value: string): CommentBody {
    return new CommentBody({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
