import { describe, it, expect } from "vitest";
import { Entity } from "../../shared/Entity.js";

/** 테스트용 구체 엔티티 */
class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

/** 다른 타입의 테스트 엔티티 */
class OtherEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

describe("Entity", () => {
  it("id를 반환한다", () => {
    const entity = new TestEntity("abc");
    expect(entity.id).toBe("abc");
  });

  it("같은 ID를 가진 같은 타입의 엔티티는 동일하다", () => {
    const a = new TestEntity("id-1");
    const b = new TestEntity("id-1");
    expect(a.equals(b)).toBe(true);
  });

  it("다른 ID를 가진 엔티티는 다르다", () => {
    const a = new TestEntity("id-1");
    const b = new TestEntity("id-2");
    expect(a.equals(b)).toBe(false);
  });

  it("다른 타입의 엔티티는 같은 ID라도 다르다", () => {
    const a = new TestEntity("id-1");
    const b = new OtherEntity("id-1");
    expect(a.equals(b)).toBe(false);
  });
});
