/**
 * ValueObject 베이스 클래스 — 값 기반 동등성 비교, 불변
 */
export abstract class ValueObject<T extends object> {
  protected readonly props: Readonly<T>;

  constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  /** 두 VO의 props가 동일한지 비교 (JSON.stringify) */
  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
