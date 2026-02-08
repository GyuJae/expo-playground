#!/usr/bin/env bash
# JWT_SECRET 기반 ANON_KEY, SERVICE_ROLE_KEY 생성 + 기타 시크릿 자동 생성
# 사용법: ./scripts/generate-keys.sh
#
# 의존성: Node.js (v18+), openssl

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"
ENV_EXAMPLE="${SCRIPT_DIR}/../.env.example"

# .env 파일이 없으면 .env.example 복사
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "✅ .env.example → .env 복사 완료"
  else
    echo "❌ .env.example 파일이 없습니다"
    exit 1
  fi
fi

echo "🔑 시크릿 키 생성 중..."
echo ""

# JWT_SECRET 생성 (40자 랜덤)
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n' | head -c 40)
echo "JWT_SECRET=${JWT_SECRET}"

# POSTGRES_PASSWORD 생성
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '\n/+=')
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"

# DASHBOARD_PASSWORD 생성
DASHBOARD_PASSWORD=$(openssl rand -base64 16 | tr -d '\n/+=')
echo "DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}"

# SECRET_KEY_BASE 생성 (64자)
SECRET_KEY_BASE=$(openssl rand -base64 48 | tr -d '\n')
echo "SECRET_KEY_BASE=${SECRET_KEY_BASE}"

# VAULT_ENC_KEY 생성 (32자)
VAULT_ENC_KEY=$(openssl rand -base64 24 | tr -d '\n' | head -c 32)
echo "VAULT_ENC_KEY=${VAULT_ENC_KEY}"

# PG_META_CRYPTO_KEY 생성 (32자)
PG_META_CRYPTO_KEY=$(openssl rand -base64 24 | tr -d '\n' | head -c 32)
echo "PG_META_CRYPTO_KEY=${PG_META_CRYPTO_KEY}"

# LOGFLARE 토큰 생성
LOGFLARE_PUBLIC_ACCESS_TOKEN=$(openssl rand -hex 20)
LOGFLARE_PRIVATE_ACCESS_TOKEN=$(openssl rand -hex 20)
echo "LOGFLARE_PUBLIC_ACCESS_TOKEN=${LOGFLARE_PUBLIC_ACCESS_TOKEN}"
echo "LOGFLARE_PRIVATE_ACCESS_TOKEN=${LOGFLARE_PRIVATE_ACCESS_TOKEN}"

# POOLER_TENANT_ID 생성
POOLER_TENANT_ID=$(openssl rand -hex 8)
echo "POOLER_TENANT_ID=${POOLER_TENANT_ID}"

echo ""
echo "🔑 JWT 키 생성 중 (Node.js 필요)..."

# ANON_KEY 생성
ANON_KEY=$(node -e "
const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
})).toString('base64url');
const signature = crypto.createHmac('sha256', '${JWT_SECRET}')
  .update(header + '.' + payload)
  .digest('base64url');
console.log(header + '.' + payload + '.' + signature);
")
echo "ANON_KEY=${ANON_KEY}"

# SERVICE_ROLE_KEY 생성
SERVICE_ROLE_KEY=$(node -e "
const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
})).toString('base64url');
const signature = crypto.createHmac('sha256', '${JWT_SECRET}')
  .update(header + '.' + payload)
  .digest('base64url');
console.log(header + '.' + payload + '.' + signature);
")
echo "SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}"

echo ""
echo "📝 .env 파일 업데이트 중..."

# .env 파일에 값 치환
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE="sed -i ''"
else
  SED_INPLACE="sed -i"
fi

update_env() {
  local key=$1
  local value=$2
  if grep -q "^${key}=" "$ENV_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
      sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    fi
  fi
}

update_env "JWT_SECRET" "$JWT_SECRET"
update_env "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"
update_env "DASHBOARD_PASSWORD" "$DASHBOARD_PASSWORD"
update_env "SECRET_KEY_BASE" "$SECRET_KEY_BASE"
update_env "VAULT_ENC_KEY" "$VAULT_ENC_KEY"
update_env "PG_META_CRYPTO_KEY" "$PG_META_CRYPTO_KEY"
update_env "LOGFLARE_PUBLIC_ACCESS_TOKEN" "$LOGFLARE_PUBLIC_ACCESS_TOKEN"
update_env "LOGFLARE_PRIVATE_ACCESS_TOKEN" "$LOGFLARE_PRIVATE_ACCESS_TOKEN"
update_env "POOLER_TENANT_ID" "$POOLER_TENANT_ID"
update_env "ANON_KEY" "$ANON_KEY"
update_env "SERVICE_ROLE_KEY" "$SERVICE_ROLE_KEY"

echo ""
echo "✅ 키 생성 완료!"
echo ""
echo "⚠️  다음 항목은 수동으로 설정해야 합니다:"
echo "  - DOMAIN (도메인)"
echo "  - SITE_URL (프론트엔드 URL)"
echo "  - API_EXTERNAL_URL (API 외부 URL)"
echo "  - SUPABASE_PUBLIC_URL (Supabase 공개 URL)"
echo "  - GOOGLE_OAUTH_CLIENT_ID / CLIENT_SECRET"
echo "  - SMTP_* (이메일 설정)"
echo "  - ADDITIONAL_REDIRECT_URLS (OAuth 리디렉션 URL)"
