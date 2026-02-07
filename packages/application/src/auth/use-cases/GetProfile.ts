import { injectable, inject } from "tsyringe";
import { createUserId, type User } from "@expo-playground/domain";
import type { UserRepository } from "../ports/UserRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import { UserNotFoundError } from "../../shared/errors.js";

/**
 * 프로필 조회 유스케이스
 */
@injectable()
export class GetProfile {
  constructor(
    @inject(DI_TOKENS.UserRepository) private userRepo: UserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const id = createUserId(userId);
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new UserNotFoundError(userId);
    }
    return user;
  }
}
