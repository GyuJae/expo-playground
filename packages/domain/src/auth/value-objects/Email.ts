import { ValueObject } from "../../shared/ValueObject.js";
import { InvalidEmailError } from "../../shared/DomainError.js";

/** 이메일 형식 정규식 (기본 검증) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailProps {
  value: string;
}

/**
 * 이메일 값 객체 — 소문자 정규화, 형식 검증
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  /** 새 Email 생성 — 정규화 + 검증 */
  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    return new Email({ value: normalized });
  }

  /** DB 복원용 — 이미 검증된 값 */
  static reconstruct(value: string): Email {
    return new Email({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
