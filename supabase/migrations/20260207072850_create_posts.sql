-- posts 테이블
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (id)
);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS: 삭제되지 않은 글만 읽기, 자기 글만 CUD
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = author_id);
CREATE POLICY "posts_update" ON public.posts
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = author_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = author_id);
CREATE POLICY "posts_delete" ON public.posts
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = author_id);

-- updated_at 자동 갱신 트리거
CREATE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

CREATE TRIGGER posts_set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
