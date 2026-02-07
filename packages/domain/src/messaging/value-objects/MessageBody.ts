import { ValueObject } from "../../shared/ValueObject.js";
import { InvalidMessageBodyError } from "../../shared/DomainError.js";

/** 최소/최대 길이 */
const MIN = 1;
const MAX = 5000;

interface MessageBodyProps {
  value: string;
}

/**
 * 메시지 본문 값 객체 — 1~5000자, trim
 */
export class MessageBody extends ValueObject<MessageBodyProps> {
  private constructor(props: MessageBodyProps) {
    super(props);
  }

  /** 새 MessageBody 생성 — trim + 길이 검증 */
  static create(value: string): MessageBody {
    const trimmed = value.trim();

    if (trimmed.length < MIN) {
      throw new InvalidMessageBodyError("메시지 본문은 비어 있을 수 없습니다");
    }
    if (trimmed.length > MAX) {
      throw new InvalidMessageBodyError(
        `메시지 본문은 ${MAX}자 이하여야 합니다`,
      );
    }

    return new MessageBody({ value: trimmed });
  }

  /** DB 복원용 */
  static reconstruct(value: string): MessageBody {
    return new MessageBody({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
