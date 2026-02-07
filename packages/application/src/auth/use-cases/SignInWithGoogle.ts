import { injectable, inject } from "tsyringe";
import {
  User,
  Email,
  Nickname,
  AvatarUrl,
  type UserId,
} from "@expo-playground/domain";
import type { AuthProvider } from "../ports/AuthProvider.js";
import type { UserRepository } from "../ports/UserRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

/**
 * Google 로그인 유스케이스
 * — 인증 후 기존 사용자 조회, 없으면 신규 생성
 */
@injectable()
export class SignInWithGoogle {
  constructor(
    @inject(DI_TOKENS.AuthProvider) private authProvider: AuthProvider,
    @inject(DI_TOKENS.UserRepository) private userRepo: UserRepository,
  ) {}

  async execute(idToken: string): Promise<User> {
    const authResult = await this.authProvider.signInWithGoogle(idToken);

    const existing = await this.userRepo.findById(authResult.userId);
    if (existing) {
      return existing;
    }

    const email = Email.create(authResult.email);
    const localPart = authResult.email.split("@")[0]!;
    const nickname = Nickname.create(localPart);
    const avatarUrl = AvatarUrl.create(null);
    const now = new Date();

    const user = User.create({
      id: authResult.userId as UserId,
      email,
      nickname,
      avatarUrl,
      createdAt: now,
    });

    await this.userRepo.save(user);
    return user;
  }
}
