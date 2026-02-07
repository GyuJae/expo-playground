import { ValueObject } from "../../shared/ValueObject.js";
import { InvalidAvatarUrlError } from "../../shared/DomainError.js";

/** URL 최대 길이 */
const MAX_LENGTH = 2048;
/** http(s) 프로토콜 정규식 */
const HTTPS_REGEX = /^https?:\/\//;

interface AvatarUrlProps {
  value: string | null;
}

/**
 * 아바타 URL 값 객체 — nullable, http(s) 검증, 2048자 제한
 */
export class AvatarUrl extends ValueObject<AvatarUrlProps> {
  private constructor(props: AvatarUrlProps) {
    super(props);
  }

  /** 새 AvatarUrl 생성 — 빈 문자열→null, 프로토콜/길이 검증 */
  static create(value: string | null): AvatarUrl {
    if (value === null || value.trim() === "") {
      return new AvatarUrl({ value: null });
    }
    const trimmed = value.trim();
    if (!HTTPS_REGEX.test(trimmed)) {
      throw new InvalidAvatarUrlError("http 또는 https 프로토콜만 허용됩니다");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidAvatarUrlError(`URL은 ${MAX_LENGTH}자 이하여야 합니다`);
    }
    return new AvatarUrl({ value: trimmed });
  }

  /** DB 복원용 */
  static reconstruct(value: string | null): AvatarUrl {
    return new AvatarUrl({ value });
  }

  get value(): string | null {
    return this.props.value;
  }
}
