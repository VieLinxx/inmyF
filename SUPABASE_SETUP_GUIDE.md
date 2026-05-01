# inmyF — Supabase 完整集成指南

> 本文档总结了项目中所有需要持久化到 Supabase 的模块，并提供从 0 到 1 的详细设置步骤。

---

## 一、数据模块总览

| 模块 | 页面/组件 | 当前状态 | 需要的数据表 |
|------|----------|---------|------------|
| **用户认证** | Login.jsx, userStore.js | 仅本地昵称存储 | `profiles` |
| **情绪日记** | MyCat.jsx, EmotionDiary.jsx | Zustand persist → localStorage | `emotion_records` |
| **漂流瓶** | Ocean.jsx, ThrowBottle.jsx, BottleModal.jsx, InboxModal.jsx | MOCK 数据 | `bottles`, `bottle_likes`, `bottle_replies` |
| **好友系统** | Friends.jsx, FriendCard, AddFriend, AnonymousQuestion, EditRemark, InboxQModal | MOCK 数据 | `friendships`, `anonymous_questions` |
| **日常分享** | FriendTime.jsx, PublishMoment.jsx, MomentCard.jsx, GuessEmotion.jsx | 推测需持久化 | `moments`, `moment_likes`, `moment_comments`, `emotion_guesses` |
| **狼来了游戏** | WolfGame.jsx, GameLobby, GamePlay, GameResult | 纯本地 Demo | `game_rooms`, `game_players`, `game_questions`, `game_answers`, `game_guesses`, `game_results` |

---

## 二、Step-by-Step Supabase 设置

### Step 0：创建项目

1. 访问 https://supabase.com，用 GitHub 登录
2. 点击 **New Project**，选择 Organization
3. 填写 Project name: `inmyf`
4. 设置 Database Password（保存好，后续连接用）
5. Region 选离你用户最近的（国内用户选 `Southeast Asia (Singapore)`）
6. 等待项目创建完成（约 2 分钟）

### Step 1：获取连接信息

项目创建好后，进入 **Project Settings → API**：

- **Project URL**: `https://<your-ref>.supabase.co`
- **anon public** API Key: `eyJ...`（客户端用这个）
- **service_role** Key: `eyJ...`（服务端/管理脚本用，**不要泄露到前端**）

在你的项目根目录创建 `.env`：

```env
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

安装 Supabase 客户端：

```bash
npm install @supabase/supabase-js
```

创建 `src/lib/supabase.js`：

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

### Step 2：创建数据表（SQL Editor）

进入 **SQL Editor → New query**，按顺序执行以下 SQL：

#### 2.1 用户资料表

```sql
-- 使用 Supabase Auth 的 users 表作为基础
-- 只需要创建扩展资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '😎',
  avatar_color TEXT DEFAULT 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', '用户' || substr(NEW.id::text, 1, 4)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 2.2 情绪日记表

```sql
CREATE TABLE emotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  note TEXT DEFAULT '',
  message TEXT DEFAULT '',
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emotion_records_user_date ON emotion_records(user_id, recorded_date DESC);
```

#### 2.3 漂流瓶系统

```sql
-- 漂流瓶主表
CREATE TABLE bottles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 200),
  pos_x NUMERIC DEFAULT 0,
  pos_z NUMERIC DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 漂流瓶点赞表
CREATE TABLE bottle_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_id UUID NOT NULL REFERENCES bottles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bottle_id, user_id) -- 每人只能赞一次
);

-- 漂流瓶回复表
CREATE TABLE bottle_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_id UUID NOT NULL REFERENCES bottles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bottles_user ON bottles(user_id);
CREATE INDEX idx_bottle_likes_bottle ON bottle_likes(bottle_id);
CREATE INDEX idx_bottle_replies_bottle ON bottle_replies(bottle_id);
```

#### 2.4 好友系统

```sql
-- 好友关系表（双向存储）
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intimacy INTEGER DEFAULT 0 CHECK (intimacy >= 0 AND intimacy <= 100),
  remark TEXT DEFAULT '',
  status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 匿名提问表
CREATE TABLE anonymous_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 允许 NULL 保持匿名
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 200),
  reply TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_anon_questions_receiver ON anonymous_questions(receiver_id);
```

#### 2.5 日常分享（Moments）

```sql
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  emotion TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE moment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moment_id, user_id)
);

CREATE TABLE moment_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 情绪猜测（猜情绪小游戏）
CREATE TABLE emotion_guesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  guesser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guessed_emotion TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moment_id, guesser_id) -- 每人只能猜一次
);

CREATE INDEX idx_moments_user ON moments(user_id);
CREATE INDEX idx_moment_likes_moment ON moment_likes(moment_id);
CREATE INDEX idx_moment_comments_moment ON moment_comments(moment_id);
```

#### 2.6 狼来了游戏

```sql
-- 游戏房间
CREATE TABLE game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_wolf_id UUID REFERENCES profiles(id),
  current_question_id UUID,
  round INTEGER DEFAULT 1,
  mistakes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 游戏玩家
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  is_host BOOLEAN DEFAULT FALSE,
  avatar_emoji TEXT DEFAULT '🐰',
  avatar_color TEXT DEFAULT 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  wolf_count INTEGER DEFAULT 0,
  online BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 游戏题目
CREATE TABLE game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 玩家回答
CREATE TABLE game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id),
  answer_text TEXT NOT NULL CHECK (length(answer_text) <= 50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, question_id, player_id)
);

-- 狼的猜测记录
CREATE TABLE game_guesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id),
  wolf_id UUID NOT NULL REFERENCES profiles(id),
  guessed_player_id UUID NOT NULL REFERENCES profiles(id),
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 游戏结果
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  final_wolf_id UUID NOT NULL REFERENCES profiles(id),
  round_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_rooms_code ON game_rooms(room_code);
CREATE INDEX idx_game_players_room ON game_players(room_id);
CREATE INDEX idx_game_questions_room ON game_questions(room_id);
CREATE INDEX idx_game_answers_question ON game_answers(question_id);
```

#### 2.7 实时同步支持（Realtime）

```sql
-- 启用实时功能（用于游戏房间状态同步、好友在线状态等）
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE anonymous_questions;
```

---

### Step 3：设置 RLS（Row Level Security）

RLS 是 Supabase 的安全核心。进入 **Authentication → Policies**，为每个表添加策略。

#### 3.1 profiles

```sql
-- 允许任何人读取所有 profile（昵称、头像公开）
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT USING (true);

-- 用户只能更新自己的 profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);
```

#### 3.2 emotion_records

```sql
-- 用户只能看到自己的情绪记录
CREATE POLICY "Users can CRUD own emotion records"
ON emotion_records FOR ALL USING (auth.uid() = user_id);
```

#### 3.3 bottles / bottle_likes / bottle_replies

```sql
-- bottles：所有人可读，只能创建/删除自己的
CREATE POLICY "Bottles are viewable by everyone"
ON bottles FOR SELECT USING (true);

CREATE POLICY "Users can create own bottles"
ON bottles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bottles"
ON bottles FOR DELETE USING (auth.uid() = user_id);

-- bottle_likes：所有人可读，只能点赞/取消自己的
CREATE POLICY "Likes are viewable by everyone"
ON bottle_likes FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes"
ON bottle_likes FOR ALL USING (auth.uid() = user_id);

-- bottle_replies：所有人可读，只能回复/删除自己的
CREATE POLICY "Replies are viewable by everyone"
ON bottle_replies FOR SELECT USING (true);

CREATE POLICY "Users can manage own replies"
ON bottle_replies FOR ALL USING (auth.uid() = user_id);
```

#### 3.4 friendships / anonymous_questions

```sql
-- friendships：只能看到涉及自己的好友关系
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create own friendships"
ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships"
ON friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendships"
ON friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- anonymous_questions：接收者或发送者可看
CREATE POLICY "Users can view questions as sender or receiver"
ON anonymous_questions FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Anyone can send anonymous questions"
ON anonymous_questions FOR INSERT WITH CHECK (true); -- sender_id 可为 NULL

CREATE POLICY "Receiver can reply and mark read"
ON anonymous_questions FOR UPDATE USING (auth.uid() = receiver_id);
```

#### 3.5 moments / moment_likes / moment_comments / emotion_guesses

```sql
-- moments：所有人可读，只能管理自己的
CREATE POLICY "Moments are viewable by everyone"
ON moments FOR SELECT USING (true);

CREATE POLICY "Users can manage own moments"
ON moments FOR ALL USING (auth.uid() = user_id);

-- moment_likes：所有人可读，只能管理自己的点赞
CREATE POLICY "Likes are viewable by everyone"
ON moment_likes FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes"
ON moment_likes FOR ALL USING (auth.uid() = user_id);

-- moment_comments：所有人可读，只能管理自己的评论
CREATE POLICY "Comments are viewable by everyone"
ON moment_comments FOR SELECT USING (true);

CREATE POLICY "Users can manage own comments"
ON moment_comments FOR ALL USING (auth.uid() = user_id);

-- emotion_guesses：所有人可读，只能猜一次
CREATE POLICY "Guesses are viewable by everyone"
ON emotion_guesses FOR SELECT USING (true);

CREATE POLICY "Users can create own guesses"
ON emotion_guesses FOR INSERT WITH CHECK (auth.uid() = guesser_id);
```

#### 3.6 game_rooms / game_players / game_questions / game_answers / game_guesses / game_results

```sql
-- game_rooms：房间内的玩家可见
CREATE POLICY "Room players can view room"
ON game_rooms FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_players WHERE room_id = game_rooms.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create rooms"
ON game_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update room"
ON game_rooms FOR UPDATE USING (auth.uid() = host_id);

-- game_players：房间内的玩家可见，自己可管理自己的记录
CREATE POLICY "Room players can view players"
ON game_players FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_players gp WHERE gp.room_id = game_players.room_id AND gp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join rooms"
ON game_players FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player state"
ON game_players FOR UPDATE USING (auth.uid() = user_id);

-- game_questions / game_answers / game_guesses / game_results：同 room 内可见
CREATE POLICY "Room players can view game data"
ON game_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_players WHERE room_id = game_questions.room_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Room players can create questions"
ON game_questions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM game_players WHERE room_id = game_questions.room_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Room players can view answers"
ON game_answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_players WHERE room_id = game_answers.room_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can submit own answers"
ON game_answers FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Room players can view guesses"
ON game_guesses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_players WHERE room_id = game_guesses.room_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Wolf can submit guesses"
ON game_guesses FOR INSERT WITH CHECK (auth.uid() = wolf_id);

CREATE POLICY "Room players can view results"
ON game_results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_players WHERE room_id = game_results.room_id AND user_id = auth.uid()
  )
);
```

---

### Step 4：设置 Storage（图片上传）

如果有图片上传需求（漂流瓶背景、Moment 配图、头像）：

1. 进入 **Storage → New bucket**
2. 创建 bucket：`avatars`、`moments`、`bottles`
3. 每个 bucket 的 Policy：
   - `avatars`: 任何人可读，认证用户可上传自己的头像
   - `moments`: 任何人可读，认证用户可上传
   - `bottles`: 任何人可读，认证用户可上传

```sql
-- Storage policies (在 Storage → Policies 界面添加)
-- avatars bucket: 公开读取
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### Step 5：更新前端代码接入 Supabase

#### 5.1 替换 userStore.js

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      emotionRecords: [],
      isLoading: false,

      // 用 Supabase Auth 替代本地登录
      login: async (nickname) => {
        // 生成匿名用户或使用邮箱/手机号登录
        // 方案 A：匿名登录
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) throw error

        // 更新 profile 昵称
        await supabase
          .from('profiles')
          .update({ nickname })
          .eq('id', data.user.id)

        set({ user: { id: data.user.id, nickname }, isLoggedIn: true })
        get().fetchEmotionRecords()
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, isLoggedIn: false, emotionRecords: [] })
      },

      updateUser: async (updates) => {
        const { user } = get()
        if (!user) return
        await supabase.from('profiles').update(updates).eq('id', user.id)
        set({ user: { ...user, ...updates } })
      },

      // 从 Supabase 获取情绪记录
      fetchEmotionRecords: async () => {
        const { user } = get()
        if (!user) return
        const { data } = await supabase
          .from('emotion_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_date', { ascending: false })
        set({ emotionRecords: data || [] })
      },

      // 添加情绪记录到 Supabase
      addEmotionRecord: async (record) => {
        const { user } = get()
        if (!user) return
        const { data, error } = await supabase
          .from('emotion_records')
          .insert({
            user_id: user.id,
            emoji: record.emoji,
            note: record.note,
            message: record.message,
            recorded_date: record.date,
          })
          .select()
          .single()
        if (!error && data) {
          set((state) => ({ emotionRecords: [data, ...state.emotionRecords] }))
        }
      },
    }),
    { name: 'inmyf-user-storage', partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }) }
  )
)
```

#### 5.2 初始化时恢复会话

在 `App.jsx` 或入口文件添加：

```js
useEffect(() => {
  // 恢复已有会话
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      useUserStore.getState().setUser(session.user)
    }
  })

  // 监听登录状态变化
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      useUserStore.getState().setUser(session.user)
    }
    if (event === 'SIGNED_OUT') {
      useUserStore.getState().logout()
    }
  })

  return () => listener.subscription.unsubscribe()
}, [])
```

---

## 三、各模块迁移要点

### 3.1 Ocean（漂流瓶）

| 当前 MOCK | 改为 Supabase |
|-----------|--------------|
| `MOCK_BOTTLES` 数组 | `supabase.from('bottles').select('*, bottle_likes(count), bottle_replies(*)')` |
| `handleThrow(content)` | `supabase.from('bottles').insert({ content, user_id, pos_x, pos_z })` |
| `handleLike(id)` | `supabase.from('bottle_likes').insert({ bottle_id, user_id })` |
| `handleReply(id, content)` | `supabase.from('bottle_replies').insert({ bottle_id, user_id, content })` |
| `MOCK_INBOX` | 通过 `bottle_replies` + `bottles.user_id` 关联查询 |

### 3.2 Friends（好友系统）

| 当前 MOCK | 改为 Supabase |
|-----------|--------------|
| `MOCK_FRIENDS` | `supabase.from('friendships').select('*, friend:profiles(*)')` |
| `handleAddFriend(code)` | 通过 code 查找用户 → `insert into friendships` |
| `handleAskQuestion` | `supabase.from('anonymous_questions').insert({ receiver_id, content })` |
| `handleSaveRemark` | `supabase.from('friendships').update({ remark }).eq('friend_id', id)` |
| `inboxQItems` | `supabase.from('anonymous_questions').select('*').eq('receiver_id', user_id)` |

### 3.3 WolfGame（狼来了）

当前是纯本地 Demo，改为在线多人：

| 功能 | Supabase 实现 |
|------|--------------|
| 创建房间 | `insert into game_rooms` + `insert into game_players` |
| 加入房间 | `insert into game_players` + Realtime 监听 `game_players` |
| 房间状态同步 | `supabase.channel('room:' + roomId).on('postgres_changes', ...)` |
| 提交回答 | `insert into game_answers` + Realtime 广播 |
| 狼猜答案 | `insert into game_guesses` |
| 游戏结果 | `insert into game_results` |

### 3.4 FriendTime（日常分享）

| 功能 | Supabase 实现 |
|------|--------------|
| 发布动态 | `supabase.from('moments').insert({ content, emotion, image_url })` |
| 获取动态流 | `supabase.from('moments').select('*, profiles(nickname, avatar_emoji), moment_likes(count), moment_comments(*)').order('created_at', { ascending: false })` |
| 点赞 | `supabase.from('moment_likes').insert(...)` |
| 评论 | `supabase.from('moment_comments').insert(...)` |
| 猜情绪 | `supabase.from('emotion_guesses').insert(...)` |

---

## 四、可选增强

### 4.1 Edge Functions（如果需要）

- **清理过期游戏房间**：定时删除 24h 前创建且未结束的房间
- **匿名提问通知**：通过 Edge Function 发送推送（配合 FCM/APNs）
- **AI 回答生成**：如果不想暴露 OpenAI API Key，通过 Edge Function 调用

### 4.2 数据库优化

```sql
-- 自动清理旧漂流瓶（保留 30 天）
CREATE OR REPLACE FUNCTION cleanup_old_bottles()
RETURNS void AS $$
BEGIN
  DELETE FROM bottles WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 创建 cron job（需要 pg_cron 扩展）
SELECT cron.schedule('cleanup-bottles', '0 4 * * *', 'SELECT cleanup_old_bottles()');
```

---

## 五、验证清单

设置完成后，按以下顺序验证：

- [ ] 用户可注册/登录，profile 自动创建
- [ ] 用户可记录情绪，刷新后数据保留
- [ ] 用户可扔漂流瓶，其他用户可见
- [ ] 用户可点赞/回复漂流瓶
- [ ] 用户可添加好友，查看好友列表
- [ ] 用户可发送/接收匿名提问
- [ ] 用户可发布 Moment，他人可见
- [ ] 狼来了可创建房间，多人通过房间码加入
- [ ] 游戏过程中实时同步（通过 Realtime）

---

如需我帮你写具体某个模块的 Supabase 接入代码，告诉我即可。
