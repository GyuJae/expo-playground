import { Entity } from "../../shared/Entity.js";
import type { UserId } from "../../shared/types.js";
import type { Email } from "../value-objects/Email.js";
import type { Nickname } from "../value-objects/Nickname.js";
import type { AvatarUrl } from "../value-objects/AvatarUrl.js";

interface CreateUserParams {
  id: UserId;
  email: Email;
  nickname: Nickname;
  avatarUrl: AvatarUrl;
  createdAt: Date;
}

/**
 * User 엔티티 — email/createdAt 불변, nickname/avatarUrl 변경 가능
 */
export class User extends Entity<UserId> {
  private readonly _email: Email;
  private _nickname: Nickname;
  private _avatarUrl: AvatarUrl;
  private readonly _createdAt: Date;

  private constructor(params: CreateUserParams) {
    super(params.id);
    this._email = params.email;
    this._nickname = params.nickname;
    this._avatarUrl = params.avatarUrl;
    this._createdAt = params.createdAt;
  }

  /** 새 User 생성 */
  static create(params: CreateUserParams): User {
    return new User(params);
  }

  /** DB 복원용 */
  static reconstruct(params: CreateUserParams): User {
    return new User(params);
  }

  get email(): Email {
    return this._email;
  }

  get nickname(): Nickname {
    return this._nickname;
  }

  get avatarUrl(): AvatarUrl {
    return this._avatarUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /** 닉네임 변경 */
  updateNickname(nickname: Nickname): void {
    this._nickname = nickname;
  }

  /** 아바타 URL 변경 */
  updateAvatarUrl(avatarUrl: AvatarUrl): void {
    this._avatarUrl = avatarUrl;
  }
}
