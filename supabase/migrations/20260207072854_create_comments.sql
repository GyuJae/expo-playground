-- comments 테이블
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (id)
);
CREATE INDEX idx_comments_post ON public.comments(post_id);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS: 삭제되지 않은 댓글만 읽기, 자기 댓글만 CUD
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = author_id);
CREATE POLICY "comments_update" ON public.comments
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = author_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = author_id);
CREATE POLICY "comments_delete" ON public.comments
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = author_id);
