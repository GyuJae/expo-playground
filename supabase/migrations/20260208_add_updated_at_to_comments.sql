-- comments 테이블에 updated_at 컬럼 + 자동 갱신 트리거 추가
ALTER TABLE public.comments ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER comments_set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
