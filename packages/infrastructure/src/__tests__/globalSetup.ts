import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { importJWK, SignJWT } from "jose";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:54321";
const KEY_FILE = join(import.meta.dirname, "helpers", ".service-role-key");

/**
 * GoTrue 컨테이너에서 ES256 JWK를 추출하여 service_role JWT를 동적 생성한다.
 * — Supabase CLI 2.76+ 에서 GoTrue가 ES256을 사용하므로 HS256 키가 무효.
 */
async function generateServiceRoleKey(): Promise<string> {
  const raw = execSync(
    "docker exec supabase_auth_expo-playground printenv GOTRUE_JWT_KEYS",
    { encoding: "utf8" },
  ).trim();
  const keys = JSON.parse(raw) as Array<Record<string, unknown>>;
  const ecKey = keys.find((k) => k.alg === "ES256");
  if (!ecKey) throw new Error("ES256 키를 찾을 수 없습니다");

  // key_ops/use/ext 필드 제거 (Node.js WebCrypto 호환)
  const { key_ops: _, use: __, ext: ___, ...jwk } = ecKey;
  const privateKey = await importJWK(
    jwk as Parameters<typeof importJWK>[0],
    "ES256",
  );

  return new SignJWT({
    iss: "supabase-demo",
    role: "service_role",
    exp: 1983812996,
  })
    .setProtectedHeader({ alg: "ES256", kid: jwk.kid as string, typ: "JWT" })
    .sign(privateKey);
}

/**
 * Vitest globalSetup — ES256 키 생성 + Supabase 연결 확인
 */
export async function setup(): Promise<void> {
  const serviceRoleKey = await generateServiceRoleKey();

  // 파일로 저장하여 test-client에서 동기적으로 읽기
  writeFileSync(KEY_FILE, serviceRoleKey, "utf8");

  const client = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await client.from("profiles").select("user_id").limit(1);
  if (error) {
    throw new Error(
      `Supabase 로컬 인스턴스에 연결할 수 없습니다. 'npx supabase start'를 먼저 실행하세요.\n${error.message}`,
    );
  }
}
