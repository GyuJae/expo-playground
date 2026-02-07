-- profiles 테이블에 email 컬럼 추가
-- PostgREST는 auth.users에 직접 접근 불가하므로 profiles에 email을 복제한다.

-- 1. email 컬럼 추가 (nullable로 시작)
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- 2. 기존 데이터: auth.users에서 email 복사
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id;

-- 3. NOT NULL 제약 추가
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

-- 4. handle_new_user 트리거 함수 수정 — email도 복사
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, nickname, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'User'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;
