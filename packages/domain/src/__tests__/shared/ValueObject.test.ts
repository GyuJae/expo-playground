import { describe, it, expect } from "vitest";
import { ValueObject } from "../../shared/ValueObject.js";

/** 테스트용 구체 VO */
class TestVO extends ValueObject<{ value: string }> {
  constructor(value: string) {
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

describe("ValueObject", () => {
  it("props를 읽을 수 있다", () => {
    const vo = new TestVO("hello");
    expect(vo.value).toBe("hello");
  });

  it("같은 props를 가진 VO는 동일하다", () => {
    const a = new TestVO("test");
    const b = new TestVO("test");
    expect(a.equals(b)).toBe(true);
  });

  it("다른 props를 가진 VO는 다르다", () => {
    const a = new TestVO("aaa");
    const b = new TestVO("bbb");
    expect(a.equals(b)).toBe(false);
  });

  it("props는 불변이다 (freeze)", () => {
    const vo = new TestVO("immutable");
    expect(() => {
      // @ts-expect-error — freeze 검증
      vo.props.value = "changed";
    }).toThrow();
  });
});
