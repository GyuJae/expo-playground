-- read_receipts: 대화별 사용자 읽음 위치 (last_read_at 타임스탬프 방식)
CREATE TABLE public.read_receipts (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_read_receipts_conversation
  ON public.read_receipts(conversation_id, last_read_at);

ALTER TABLE public.read_receipts ENABLE ROW LEVEL SECURITY;

-- 대화 멤버만 조회
CREATE POLICY "read_receipts_select" ON public.read_receipts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = read_receipts.conversation_id
      AND cm.user_id = (SELECT auth.uid())
  ));

-- 자기 자신만 삽입 (멤버 확인)
CREATE POLICY "read_receipts_insert" ON public.read_receipts
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = read_receipts.conversation_id
        AND cm.user_id = (SELECT auth.uid())
    )
  );

-- 자기 자신만 갱신
CREATE POLICY "read_receipts_update" ON public.read_receipts
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.read_receipts;
