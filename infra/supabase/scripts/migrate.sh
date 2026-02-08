#!/usr/bin/env bash
# 모노레포 supabase/migrations/*.sql → Self-Hosted DB 적용
# 사용법: ./scripts/migrate.sh
#
# supabase/migrations/ 디렉토리의 SQL 파일을 타임스탬프 순서대로
# Docker DB 컨테이너에 적용합니다.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="${SCRIPT_DIR}/.."
REPO_ROOT="${COMPOSE_DIR}/../../"
MIGRATIONS_DIR="${REPO_ROOT}/supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "❌ 마이그레이션 디렉토리를 찾을 수 없습니다: ${MIGRATIONS_DIR}"
  exit 1
fi

# .env에서 DB 접속 정보 로드
if [ -f "${COMPOSE_DIR}/.env" ]; then
  set -a
  source "${COMPOSE_DIR}/.env"
  set +a
fi

DB_CONTAINER="supabase-db"
DB_USER="postgres"
DB_NAME="${POSTGRES_DB:-postgres}"

# DB 컨테이너 실행 확인
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "❌ DB 컨테이너(${DB_CONTAINER})가 실행 중이 아닙니다"
  exit 1
fi

echo "📋 마이그레이션 적용 시작..."
echo "  대상: ${DB_CONTAINER} / ${DB_NAME}"
echo ""

# 마이그레이션 기록 테이블 생성 (없으면)
docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
  CREATE TABLE IF NOT EXISTS public._migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
" > /dev/null 2>&1

# SQL 파일을 타임스탬프 순서대로 적용
APPLIED=0
SKIPPED=0

for migration_file in $(ls "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort); do
  filename=$(basename "$migration_file")
  version="${filename%.sql}"

  # 이미 적용된 마이그레이션 건너뛰기
  already_applied=$(docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "
    SELECT COUNT(*) FROM public._migrations WHERE version = '${version}';
  " 2>/dev/null | tr -d ' ')

  if [ "$already_applied" = "1" ]; then
    echo "  ⏭️  ${filename} (이미 적용됨)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "  ▶️  ${filename} 적용 중..."
  if docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "$migration_file" > /dev/null 2>&1; then
    # 적용 기록
    docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
      INSERT INTO public._migrations (version) VALUES ('${version}');
    " > /dev/null 2>&1
    echo "  ✅ ${filename} 적용 완료"
    APPLIED=$((APPLIED + 1))
  else
    echo "  ❌ ${filename} 적용 실패!"
    exit 1
  fi
done

echo ""
echo "📋 마이그레이션 완료: ${APPLIED}개 적용, ${SKIPPED}개 건너뜀"
