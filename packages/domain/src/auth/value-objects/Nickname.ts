import { ValueObject } from "../../shared/ValueObject.js";
import { InvalidNicknameError } from "../../shared/DomainError.js";

/** 닉네임 최소 길이 */
const MIN_LENGTH = 1;
/** 닉네임 최대 길이 */
const MAX_LENGTH = 30;

interface NicknameProps {
  value: string;
}

/**
 * 닉네임 값 객체 — trim, 1~30자 제한
 */
export class Nickname extends ValueObject<NicknameProps> {
  private constructor(props: NicknameProps) {
    super(props);
  }

  /** 새 Nickname 생성 — trim + 길이 검증 */
  static create(value: string): Nickname {
    const trimmed = value.trim();
    if (trimmed.length < MIN_LENGTH) {
      throw new InvalidNicknameError("닉네임은 비어 있을 수 없습니다");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidNicknameError(`닉네임은 ${MAX_LENGTH}자 이하여야 합니다`);
    }
    return new Nickname({ value: trimmed });
  }

  /** DB 복원용 */
  static reconstruct(value: string): Nickname {
    return new Nickname({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
