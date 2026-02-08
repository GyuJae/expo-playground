#!/usr/bin/env bash
# Supabase Self-Hosting 배포 스크립트
# 사용법: ./scripts/deploy.sh [--migrate]
#
# 옵션:
#   --migrate    배포 후 마이그레이션 실행

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="${SCRIPT_DIR}/.."
MIGRATE=false

for arg in "$@"; do
  case $arg in
    --migrate)
      MIGRATE=true
      shift
      ;;
  esac
done

# .env 파일 확인
if [ ! -f "${COMPOSE_DIR}/.env" ]; then
  echo "❌ .env 파일이 없습니다. generate-keys.sh를 먼저 실행하세요."
  exit 1
fi

echo "🚀 Supabase Self-Hosting 배포 시작..."
echo ""

# Docker Compose 실행
echo "📦 Docker 컨테이너 시작 중..."
docker compose -f "${COMPOSE_DIR}/docker-compose.yml" --env-file "${COMPOSE_DIR}/.env" up -d

echo ""
echo "⏳ 서비스 헬스체크 대기 중..."

# DB 헬스체크 대기 (최대 60초)
RETRIES=12
until docker compose -f "${COMPOSE_DIR}/docker-compose.yml" exec -T db pg_isready -U postgres -h localhost > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "❌ DB 헬스체크 타임아웃"
    exit 1
  fi
  echo "  DB 대기 중... (${RETRIES}회 남음)"
  sleep 5
done
echo "✅ DB 준비 완료"

# 마이그레이션 실행
if [ "$MIGRATE" = true ]; then
  echo ""
  echo "📋 마이그레이션 실행 중..."
  bash "${SCRIPT_DIR}/migrate.sh"
fi

echo ""
echo "✅ 배포 완료!"
echo ""
echo "서비스 상태 확인:"
docker compose -f "${COMPOSE_DIR}/docker-compose.yml" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
