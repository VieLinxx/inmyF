import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'

/* ============================================
   Login 登录页 — 邮箱认证版
   风格：梦幻治愈，动态渐变浅蓝为基调
   功能：邮箱注册 / 邮箱登录
   ============================================ */

export default function Login() {
  const navigate = useNavigate()
  const signIn = useUserStore((s) => s.signIn)
  const signUp = useUserStore((s) => s.signUp)
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)

  // 表单模式：login / register
  const [mode, setMode] = useState('login')

  // 表单字段
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // 状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // 已登录则跳转
  useEffect(() => {
    if (isLoggedIn) navigate('/app/mycat', { replace: true })
  }, [isLoggedIn, navigate])

  // 切换模式时清空错误
  useEffect(() => {
    setError('')
    setMessage('')
  }, [mode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedNickname = nickname.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('请填写邮箱和密码')
      return
    }

    if (mode === 'register' && !trimmedNickname) {
      setError('请填写昵称')
      return
    }

    if (trimmedPassword.length < 6) {
      setError('密码至少需要 6 位')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(trimmedEmail, trimmedPassword)
        // 登录成功由 subscribeAuth 自动更新 store
      } else {
        await signUp(trimmedEmail, trimmedPassword, trimmedNickname)
        setMessage('注册成功！请检查邮箱完成验证，然后登录。')
        setMode('login')
        setPassword('')
      }
    } catch (err) {
      // 翻译常见错误
      const msg = err.message || ''
      if (msg.includes('Invalid login credentials')) {
        setError('邮箱或密码错误')
      } else if (msg.includes('User already registered')) {
        setError('该邮箱已注册，请直接登录')
      } else if (msg.includes('Email not confirmed')) {
        setError('邮箱尚未验证，请检查收件箱')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    email.trim() && password.trim() && (mode === 'login' || nickname.trim())

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full overflow-hidden dream-gradient"
      style={{ height: '100dvh' }}
    >
      {/* ---------- 表单 ---------- */}
      <motion.div
        className="relative z-20 flex flex-col items-center w-full px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        {/* 品牌 */}
        <motion.p
          className="text-center mb-8"
          style={{
            color: '#5a7a8a',
            fontSize: '24px',
            fontWeight: 300,
            letterSpacing: '1px',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          inmyF
        </motion.p>

        {/* 模式切换 Tab */}
        <motion.div
          className="flex items-center mb-6 relative"
          style={{
            background: 'rgba(255,255,255,0.35)',
            borderRadius: 16,
            padding: 4,
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.4)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            className="relative px-6 py-2 text-sm font-medium transition-colors"
            style={{
              color: mode === 'login' ? '#fff' : '#5a7a8a',
              borderRadius: 12,
              zIndex: 2,
            }}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            className="relative px-6 py-2 text-sm font-medium transition-colors"
            style={{
              color: mode === 'register' ? '#fff' : '#5a7a8a',
              borderRadius: 12,
              zIndex: 2,
            }}
            onClick={() => setMode('register')}
          >
            注册
          </button>
          <motion.div
            className="absolute top-1 bottom-1"
            style={{
              background: 'linear-gradient(135deg, #7a9eb1 0%, #9ab5c4 100%)',
              borderRadius: 12,
              zIndex: 1,
            }}
            animate={{
              left: mode === 'login' ? 4 : '50%',
              width: 'calc(50% - 4px)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full"
          style={{ maxWidth: 320 }}
        >
          {/* 错误/成功提示 */}
          <AnimatePresence>
            {(error || message) && (
              <motion.div
                className="w-full flex items-center gap-2 px-4 py-3 mb-4"
                style={{
                  borderRadius: 14,
                  background: error
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(34, 197, 94, 0.08)',
                  border: error
                    ? '1px solid rgba(239, 68, 68, 0.2)'
                    : '1px solid rgba(34, 197, 94, 0.2)',
                  color: error ? '#dc2626' : '#16a34a',
                  fontSize: '13px',
                }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {error && <AlertCircle size={16} />}
                <span>{error || message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 昵称（仅注册） */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                className="w-full mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div
                  className="flex items-center gap-3 px-4"
                  style={{
                    height: 52,
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    borderRadius: 16,
                    boxShadow: '0 4px 24px rgba(120,160,200,0.1)',
                  }}
                >
                  <User size={18} style={{ color: '#9ab5c4', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="给自己取个名字"
                    maxLength={16}
                    className="flex-1 bg-transparent"
                    style={{
                      fontSize: '15px',
                      color: '#3a4a5a',
                      outline: 'none',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 邮箱 */}
          <div
            className="w-full flex items-center gap-3 px-4 mb-3"
            style={{
              height: 52,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(120,160,200,0.1)',
            }}
          >
            <Mail size={18} style={{ color: '#9ab5c4', flexShrink: 0 }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱地址"
              className="flex-1 bg-transparent"
              style={{
                fontSize: '15px',
                color: '#3a4a5a',
                outline: 'none',
              }}
            />
          </div>

          {/* 密码 */}
          <div
            className="w-full flex items-center gap-3 px-4 mb-6"
            style={{
              height: 52,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(120,160,200,0.1)',
            }}
          >
            <Lock size={18} style={{ color: '#9ab5c4', flexShrink: 0 }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? '设置密码（至少6位）' : '密码'}
              className="flex-1 bg-transparent"
              style={{
                fontSize: '15px',
                color: '#3a4a5a',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ color: '#9ab5c4', flexShrink: 0 }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* 提交按钮 */}
          <motion.button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full text-white font-medium tracking-wide"
            style={{
              background:
                isFormValid && !loading
                  ? 'linear-gradient(135deg, #7a9eb1 0%, #9ab5c4 100%)'
                  : 'linear-gradient(135deg, rgba(122,158,177,0.4) 0%, rgba(154,181,196,0.4) 100%)',
              borderRadius: 16,
              height: 52,
              fontSize: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow:
                isFormValid && !loading
                  ? '0 4px 20px rgba(122,158,177,0.3)'
                  : 'none',
              transition: 'all 0.3s ease',
              opacity: !isFormValid || loading ? 0.7 : 1,
            }}
            whileTap={isFormValid && !loading ? { scale: 0.97 } : {}}
          >
            {loading
              ? '请稍候...'
              : mode === 'login'
              ? '进入喵岛'
              : '创建账号'}
          </motion.button>
        </form>

        {/* 底部小字 */}
        <motion.p
          className="mt-10 text-center"
          style={{
            color: 'rgba(90,122,138,0.5)',
            fontSize: '13px',
            fontWeight: 300,
            letterSpacing: '0.5px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          一个安放情绪的小岛
        </motion.p>
      </motion.div>
    </div>
  )
}
