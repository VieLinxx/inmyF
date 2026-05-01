# Supabase 邮箱认证配置指南

## 前置条件

你已经在 Supabase 创建了一个项目。如果还没有，先参考 `SUPABASE_SETUP_GUIDE.md` 的 Step 0。

---

## Step 1：开启邮箱认证

1. 打开你的 Supabase 项目控制台
2. 进入左侧菜单 **Authentication → Providers**
3. 找到 **Email** 卡片，确保开关为 **Enabled**
4. 配置如下：
   - **Confirm email**: `true`（推荐，需要验证邮箱）
   - **Secure email change**: `true`
   - **Prevent reuse of recovery token**: `true`
   - **Password Requirements**: 至少 6 位（和密码提示文案保持一致）

### 如果需要关闭邮箱验证（开发阶段）

如果你不想在开发阶段收邮件验证，可以：

1. 将 **Confirm email** 设为 `false`
2. 这样注册后直接可登录，无需验证

> 建议：上线前务必开启邮箱验证！

---

## Step 2：配置邮件模板（中文）

进入 **Authentication → Email Templates**，把模板改成中文：

### Confirm Signup（注册确认）

**Subject**: `验证你的 inmyF 账号`

**Body**:
```html
<h2>欢迎来到 inmyF</h2>
<p>感谢你注册 inmyF！请点击下方按钮验证邮箱：</p>
<p><a href="{{ .ConfirmationURL }}">验证邮箱</a></p>
<p>如果按钮无法点击，可复制以下链接到浏览器：</p>
<p>{{ .ConfirmationURL }}</p>
```

### Magic Link（魔法链接，如需要）

**Subject**: `登录 inmyF`

**Body**:
```html
<h2>登录 inmyF</h2>
<p>点击下方按钮直接登录，无需输入密码：</p>
<p><a href="{{ .ConfirmationURL }}">立即登录</a></p>
```

### Reset Password（重置密码）

**Subject**: `重置你的 inmyF 密码`

**Body**:
```html
<h2>重置密码</h2>
<p>你请求了重置密码，点击下方按钮继续：</p>
<p><a href="{{ .ConfirmationURL }}">重置密码</a></p>
```

---

## Step 3：创建数据库表和 Trigger

进入 **SQL Editor → New query**，粘贴执行以下 SQL：

```sql
-- ========== profiles 表（用户资料扩展）==========
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_emoji TEXT DEFAULT '😎',
  avatar_color TEXT DEFAULT 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可读
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT USING (true);

-- RLS 策略：用户只能更新自己的资料
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- ========== 新用户注册时自动创建 profile ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nickname',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 绑定 trigger（先删除旧的，避免重复）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== emotion_records 表（情绪日记）==========
CREATE TABLE IF NOT EXISTS emotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  note TEXT DEFAULT '',
  message TEXT DEFAULT '',
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE emotion_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own emotion records"
ON emotion_records FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_emotion_records_user_date
ON emotion_records(user_id, recorded_date DESC);
```

点击 **Run**，确认没有报错。

---

## Step 4：获取项目连接信息

1. 进入 **Project Settings → API**
2. 复制以下两项：
   - **Project URL**: `https://<your-ref>.supabase.co`
   - **anon public** API Key（以 `eyJ...` 开头）

在项目根目录创建 `.env` 文件（从 `.env.example` 复制）：

```bash
cp .env.example .env
```

编辑 `.env`，填入你的信息：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Step 5：启动开发服务器测试

```bash
npm run dev
```

1. 打开 `http://localhost:5173`
2. 在登录页切换到 **注册** 模式
3. 输入邮箱、密码、昵称，点击 **创建账号**
4. 去邮箱查收验证邮件（如果没关验证）
5. 验证后切换到 **登录** 模式，输入邮箱密码
6. 登录成功自动跳转到 `/app/mycat`

---

## 常见问题

### Q: 注册后提示 "Email not confirmed"
A: 去邮箱点击验证链接。如果开发阶段不想验证，在 Supabase Authentication → Providers → Email 里把 **Confirm email** 设为 `false`。

### Q: 邮箱没有收到验证邮件
A: 检查垃圾邮件箱。Supabase 免费项目有时邮件会进垃圾箱。也可以去 Supabase Authentication → Users 页面手动确认用户。

### Q: 报错 "Invalid login credentials"
A: 邮箱或密码错误。如果是刚注册的用户，确保已完成邮箱验证。

### Q: 报错 "User already registered"
A: 该邮箱已经注册过，切换到登录模式即可。

---

下一步：完成认证后，可以继续接入其他模块（漂流瓶、好友系统等），参考 `SUPABASE_SETUP_GUIDE.md`。
