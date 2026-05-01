-- ============================================
-- inmyF 剩余数据表 + RLS（一次性执行）
-- 执行前确认：profiles、emotion_records 已存在
-- ============================================

-- ========== 漂流瓶系统 ==========

CREATE TABLE IF NOT EXISTS bottles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 200),
  pos_x NUMERIC DEFAULT 0,
  pos_z NUMERIC DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bottle_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_id UUID NOT NULL REFERENCES bottles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bottle_id, user_id)
);

CREATE TABLE IF NOT EXISTS bottle_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_id UUID NOT NULL REFERENCES bottles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottle_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottle_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bottles are viewable by everyone" ON bottles FOR SELECT USING (true);
CREATE POLICY "Users can create own bottles" ON bottles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bottles" ON bottles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone" ON bottle_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON bottle_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Replies are viewable by everyone" ON bottle_replies FOR SELECT USING (true);
CREATE POLICY "Users can manage own replies" ON bottle_replies FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bottles_user ON bottles(user_id);
CREATE INDEX IF NOT EXISTS idx_bottle_likes_bottle ON bottle_likes(bottle_id);
CREATE INDEX IF NOT EXISTS idx_bottle_replies_bottle ON bottle_replies(bottle_id);

-- ========== 好友系统 ==========

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intimacy INTEGER DEFAULT 0 CHECK (intimacy >= 0 AND intimacy <= 100),
  remark TEXT DEFAULT '',
  status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS anonymous_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 200),
  reply TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create own friendships" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friendships" ON friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can delete own friendships" ON friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can view questions as sender or receiver" ON anonymous_questions FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Anyone can send anonymous questions" ON anonymous_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Receiver can reply and mark read" ON anonymous_questions FOR UPDATE USING (auth.uid() = receiver_id);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_anon_questions_receiver ON anonymous_questions(receiver_id);

-- 好友双向自动创建 trigger
CREATE OR REPLACE FUNCTION handle_new_friendship()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO friendships (user_id, friend_id, intimacy, status)
  VALUES (NEW.friend_id, NEW.user_id, 0, 'accepted')
  ON CONFLICT (user_id, friend_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_friendship_created ON friendships;
CREATE TRIGGER on_friendship_created
  AFTER INSERT ON friendships
  FOR EACH ROW EXECUTE FUNCTION handle_new_friendship();

-- ========== 日常分享（Moments）==========

CREATE TABLE IF NOT EXISTS moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  emotion TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moment_id, user_id)
);

CREATE TABLE IF NOT EXISTS moment_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emotion_guesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  guesser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guessed_emotion TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moment_id, guesser_id)
);

ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_guesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moments are viewable by everyone" ON moments FOR SELECT USING (true);
CREATE POLICY "Users can manage own moments" ON moments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone" ON moment_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON moment_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Comments are viewable by everyone" ON moment_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON moment_comments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Guesses are viewable by everyone" ON emotion_guesses FOR SELECT USING (true);
CREATE POLICY "Users can create own guesses" ON emotion_guesses FOR INSERT WITH CHECK (auth.uid() = guesser_id);

CREATE INDEX IF NOT EXISTS idx_moments_user ON moments(user_id);
CREATE INDEX IF NOT EXISTS idx_moment_likes_moment ON moment_likes(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_comments_moment ON moment_comments(moment_id);
