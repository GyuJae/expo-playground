/**
 * Entity 베이스 클래스 — ID 기반 동등성 비교
 */
export abstract class Entity<TId> {
  constructor(protected readonly _id: TId) {}

  get id(): TId {
    return this._id;
  }

  /** 두 엔티티가 같은 ID를 가지며 같은 타입인지 비교 */
  equals(other: Entity<TId>): boolean {
    if (!(other instanceof this.constructor)) {
      return false;
    }
    return this._id === other._id;
  }
}
