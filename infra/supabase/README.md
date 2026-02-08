# Supabase Self-Hosting

VPS에 Docker Compose로 Supabase를 직접 호스팅하기 위한 구성입니다.

## 최소 요구사항

- VPS: 2 vCPU, 4GB RAM, 40GB SSD
- OS: Ubuntu 22.04+ / Debian 12+
- Docker Engine 24+ & Docker Compose v2
- 도메인 + DNS 설정 (A 레코드)
- Node.js v18+ (키 생성 스크립트용)

## 디렉토리 구조

```
infra/supabase/
├── docker-compose.yml         # 12개 서비스 정의
├── .env.example               # 환경변수 템플릿
├── .gitignore
├── caddy/
│   └── Caddyfile              # Reverse proxy + 자동 SSL
├── volumes/
│   ├── api/kong.yml           # Kong API Gateway 라우팅
│   ├── db/*.sql               # PostgreSQL init 스크립트 (7개)
│   ├── logs/vector.yml        # Vector 로그 수집
│   └── pooler/pooler.exs      # Supavisor 커넥션 풀링
└── scripts/
    ├── generate-keys.sh       # JWT + 시크릿 키 자동 생성
    ├── deploy.sh              # 배포 자동화
    ├── migrate.sh             # 마이그레이션 적용
    └── backup.sh              # 백업 + 7일 정리
```

## 서비스 목록

| 서비스 | 이미지 | 역할 |
|--------|--------|------|
| caddy | caddy:2-alpine | Reverse proxy + 자동 SSL |
| db | supabase/postgres:15.8.1 | PostgreSQL |
| kong | kong:2.8.1 | API Gateway |
| auth | supabase/gotrue:v2.185.0 | 인증 (Google OAuth) |
| rest | postgrest/postgrest:v14.3 | REST API |
| realtime | supabase/realtime:v2.72.0 | WebSocket |
| storage | supabase/storage-api:v1.37.1 | 파일 스토리지 |
| imgproxy | darthsim/imgproxy:v3.30.1 | 이미지 변환 |
| meta | supabase/postgres-meta:v0.95.2 | PG 메타데이터 |
| studio | supabase/studio | 관리 대시보드 |
| analytics | supabase/logflare:1.30.3 | 로그 수집 |
| vector | timberio/vector:0.28.1 | 로그 전송 |
| supavisor | supabase/supavisor:2.7.4 | 커넥션 풀링 |

## 배포 가이드

### 1. VPS 초기 설정

```bash
# Docker 설치
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Node.js 설치 (키 생성용)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. DNS 설정

도메인 DNS에 A 레코드 추가:

```
api.your-domain.com    → VPS IP
studio.your-domain.com → VPS IP
```

### 3. 프로젝트 클론 및 환경 설정

```bash
git clone <repo-url>
cd expo-playgraound/infra/supabase

# 키 자동 생성 (.env.example → .env + 시크릿 채우기)
./scripts/generate-keys.sh
```

### 4. .env 수동 설정

`generate-keys.sh`가 시크릿을 자동 생성하지만, 다음 항목은 수동 설정이 필요합니다:

```bash
# .env 편집
nano .env
```

필수 수동 설정 항목:

```env
# 도메인
DOMAIN=your-domain.com
SITE_URL=https://your-domain.com
API_EXTERNAL_URL=https://api.your-domain.com
SUPABASE_PUBLIC_URL=https://api.your-domain.com

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx

# OAuth 리디렉션 URL
ADDITIONAL_REDIRECT_URLS=https://your-domain.com/**,exp://your-expo-scheme/**

# SMTP (이메일 인증 사용시)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-pass
SMTP_ADMIN_EMAIL=admin@your-domain.com
```

### 5. Google Cloud Console 설정

Google OAuth가 작동하려면 Google Cloud Console에서:

1. **승인된 리디렉션 URI** 추가:
   ```
   https://api.your-domain.com/auth/v1/callback
   ```

2. **승인된 JavaScript 원본** 추가:
   ```
   https://your-domain.com
   ```

### 6. 배포

```bash
# 배포 (마이그레이션 포함)
./scripts/deploy.sh --migrate

# 배포만 (마이그레이션 제외)
./scripts/deploy.sh
```

### 7. 마이그레이션만 실행

```bash
./scripts/migrate.sh
```

### 8. 확인

```bash
# 서비스 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f --tail 100

# API 헬스체크
curl https://api.your-domain.com/auth/v1/health
```

## 클라이언트 코드 설정

클라이언트 코드 변경은 불필요합니다. 환경변수만 교체하면 됩니다:

```env
# Web (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://api.your-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<생성된 ANON_KEY>

# Mobile (app.config.ts / .env)
EXPO_PUBLIC_SUPABASE_URL=https://api.your-domain.com
EXPO_PUBLIC_SUPABASE_ANON_KEY=<생성된 ANON_KEY>
```

## 백업

```bash
# 수동 백업
./scripts/backup.sh

# 자동 백업 (crontab)
crontab -e
# 매일 새벽 3시 백업
0 3 * * * /path/to/infra/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1
```

백업 파일은 `backups/` 디렉토리에 저장되며, 7일 이상 된 백업은 자동 삭제됩니다.

### 복원

```bash
gunzip -c backups/postgres_20260208_030000.sql.gz | docker exec -i supabase-db psql -U postgres -d postgres
```

## 운영

### 서비스 재시작

```bash
docker compose restart          # 전체 재시작
docker compose restart auth     # 특정 서비스만
```

### 업데이트

```bash
docker compose pull             # 최신 이미지 가져오기
docker compose up -d            # 재배포
```

### Studio 접근 제한

프로덕션에서는 Studio 대시보드를 IP로 제한하는 것을 권장합니다.
`caddy/Caddyfile`에서 주석을 해제하고 허용 IP를 설정하세요.

### 로그 확인

```bash
docker compose logs -f auth     # Auth 서비스 로그
docker compose logs -f realtime # Realtime 서비스 로그
docker compose logs -f db       # DB 로그
```

## 도메인 구조

| 서브도메인 | 대상 | 비고 |
|------------|------|------|
| `api.your-domain.com` | Kong → Supabase API | 클라이언트 접근 |
| `studio.your-domain.com` | Kong → Studio | 관리자 전용 (IP 제한 권장) |
