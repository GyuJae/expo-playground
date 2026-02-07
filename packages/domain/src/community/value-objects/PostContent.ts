import { ValueObject } from "../../shared/ValueObject.js";
import {
  InvalidPostTitleError,
  InvalidPostBodyError,
} from "../../shared/DomainError.js";

/** 제목 최소/최대 길이 */
const TITLE_MIN = 1;
const TITLE_MAX = 100;
/** 본문 최소/최대 길이 */
const BODY_MIN = 1;
const BODY_MAX = 10000;

interface PostContentProps {
  title: string;
  body: string;
}

/**
 * 게시글 콘텐츠 값 객체 — title(1~100자) + body(1~10000자)
 */
export class PostContent extends ValueObject<PostContentProps> {
  private constructor(props: PostContentProps) {
    super(props);
  }

  /** 새 PostContent 생성 — trim + 길이 검증 */
  static create(title: string, body: string): PostContent {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (trimmedTitle.length < TITLE_MIN) {
      throw new InvalidPostTitleError("제목은 비어 있을 수 없습니다");
    }
    if (trimmedTitle.length > TITLE_MAX) {
      throw new InvalidPostTitleError(`제목은 ${TITLE_MAX}자 이하여야 합니다`);
    }
    if (trimmedBody.length < BODY_MIN) {
      throw new InvalidPostBodyError("본문은 비어 있을 수 없습니다");
    }
    if (trimmedBody.length > BODY_MAX) {
      throw new InvalidPostBodyError(`본문은 ${BODY_MAX}자 이하여야 합니다`);
    }

    return new PostContent({ title: trimmedTitle, body: trimmedBody });
  }

  /** DB 복원용 */
  static reconstruct(title: string, body: string): PostContent {
    return new PostContent({ title, body });
  }

  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }
}
