#!/usr/bin/env bash
# PostgreSQL 백업 + 7일 자동 정리
# 사용법: ./scripts/backup.sh
#
# crontab 예시 (매일 새벽 3시):
#   0 3 * * * /path/to/infra/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="${SCRIPT_DIR}/.."
BACKUP_DIR="${COMPOSE_DIR}/backups"
RETENTION_DAYS=7

# .env에서 DB 접속 정보 로드
if [ -f "${COMPOSE_DIR}/.env" ]; then
  set -a
  source "${COMPOSE_DIR}/.env"
  set +a
fi

DB_CONTAINER="supabase-db"
DB_USER="postgres"
DB_NAME="${POSTGRES_DB:-postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# 백업 디렉토리 생성
mkdir -p "${BACKUP_DIR}"

# DB 컨테이너 실행 확인
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ❌ DB 컨테이너(${DB_CONTAINER})가 실행 중이 아닙니다"
  exit 1
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') 🗄️ 백업 시작: ${DB_NAME}"

# pg_dump 실행 + gzip 압축
docker exec -t "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" \
  --no-owner --no-privileges --clean --if-exists \
  | gzip > "${BACKUP_FILE}"

# 백업 파일 크기 확인
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
  FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "$(date '+%Y-%m-%d %H:%M:%S') ✅ 백업 완료: ${BACKUP_FILE} (${FILESIZE})"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') ❌ 백업 실패: 파일이 비어있습니다"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

# 오래된 백업 정리 (7일 이상)
DELETED=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l | tr -d ' ')
if [ "$DELETED" -gt 0 ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') 🗑️ ${DELETED}개 오래된 백업 삭제 (${RETENTION_DAYS}일 이상)"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') 📦 현재 백업 목록:"
ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || echo "  (없음)"
