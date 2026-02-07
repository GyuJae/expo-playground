import { injectable, inject } from "tsyringe";
import { createUserId, Nickname, AvatarUrl, type User } from "@expo-playground/domain";
import type { UserRepository } from "../ports/UserRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import { UserNotFoundError } from "../../shared/errors.js";

interface UpdateProfileInput {
  userId: string;
  nickname?: string;
  avatarUrl?: string | null;
}

/**
 * 프로필 수정 유스케이스
 * — nickname, avatarUrl 선택적 업데이트
 */
@injectable()
export class UpdateProfile {
  constructor(
    @inject(DI_TOKENS.UserRepository) private userRepo: UserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<User> {
    const id = createUserId(input.userId);
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    if (input.nickname !== undefined) {
      user.updateNickname(Nickname.create(input.nickname));
    }
    if (input.avatarUrl !== undefined) {
      user.updateAvatarUrl(AvatarUrl.create(input.avatarUrl));
    }

    await this.userRepo.save(user);
    return user;
  }
}
