-- ============================================
-- 为 profiles 表添加 bio（个性签名）字段
-- ============================================

-- 添加 bio 字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 验证
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles';
