-- 테스트용 사용자 (auth.users에 직접 삽입 → 트리거로 profiles 자동 생성)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'alice@test.com', crypt('password123', gen_salt('bf')), now(),
   '{"full_name":"Alice Kim","avatar_url":null}'::jsonb, 'authenticated', 'authenticated', now(), now()),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'bob@test.com', crypt('password123', gen_salt('bf')), now(),
   '{"full_name":"Bob Lee","avatar_url":null}'::jsonb, 'authenticated', 'authenticated', now(), now());

-- 테스트 게시글
INSERT INTO public.posts (id, author_id, title, body) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '첫 번째 게시글', '안녕하세요!'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '두 번째 게시글', '반갑습니다!');

-- 테스트 댓글
INSERT INTO public.comments (post_id, author_id, body) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '좋은 글이네요!');

-- 테스트 대화
INSERT INTO public.conversations (id) VALUES ('c0000000-0000-0000-0000-000000000001');
INSERT INTO public.conversation_members (conversation_id, user_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002');
INSERT INTO public.messages (conversation_id, sender_id, body) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '안녕!'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '반가워!');
