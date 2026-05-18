import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, User, FileText } from 'lucide-react'

/* ============================================
   UserSettings 用户设置 — 全屏页面
   ============================================ */

export default function UserSettings({ isOpen, onClose, user, onSave }) {
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      setNickname(user.nickname || '')
      setBio(user.bio || '')
    }
  }, [isOpen, user])

  const handleSave = () => {
    const trimmedNickname = nickname.trim()
    if (!trimmedNickname) return
    onSave?.({ nickname: trimmedNickname, bio: bio.trim() })
    onClose()
  }

  const canSave = nickname.trim().length > 0

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #7a9aaa 0%, #8aa0a0 35%, #a8b880 55%, #d0c050 75%, #f0d040 100%)',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
      }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-6 mb-8">
        <button
          className="p-2 -ml-2"
          style={{ color: '#2a3a4a' }}
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h1
          className="font-medium"
          style={{ fontSize: '18px', color: '#2a3a4a' }}
        >
          个人设置
        </h1>
        <div className="w-8" />
      </div>

      {/* 用户头像预览 */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-3"
          style={{
            background: user?.avatarColor,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {user?.avatarEmoji || user?.nickname?.charAt(0) || '😎'}
        </div>
        <p className="text-base font-medium" style={{ color: '#2a3a4a' }}>
          {user?.nickname || '用户'}
        </p>
        <p className="text-sm mt-1" style={{ color: 'rgba(42,58,74,0.55)' }}>
          {user?.bio || '还没有个性签名'}
        </p>
      </div>

      {/* 表单区域 */}
      <div className="flex-1 px-6 space-y-6">
        {/* 昵称 */}
        <div>
          <label
            className="flex items-center gap-1.5 text-sm font-medium mb-2"
            style={{ color: '#3a4a5a' }}
          >
            <User size={16} />
            昵称
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="给自己取个名字"
            maxLength={16}
            className="w-full px-4"
            style={{
              height: 56,
              borderRadius: 16,
              fontSize: '16px',
              color: '#3a4a5a',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              outline: 'none',
            }}
            autoFocus
          />
          <p
            className="text-right mt-1"
            style={{ fontSize: '12px', color: 'rgba(42,58,74,0.4)' }}
          >
            {nickname.length}/16
          </p>
        </div>

        {/* 个性签名 */}
        <div>
          <label
            className="flex items-center gap-1.5 text-sm font-medium mb-2"
            style={{ color: '#3a4a5a' }}
          >
            <FileText size={16} />
            个性签名
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="写点什么，让好友更了解你..."
            maxLength={60}
            rows={3}
            className="w-full px-4 py-3 resize-none"
            style={{
              borderRadius: 16,
              fontSize: '16px',
              color: '#3a4a5a',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              outline: 'none',
              lineHeight: 1.6,
            }}
          />
          <p
            className="text-right mt-1"
            style={{ fontSize: '12px', color: 'rgba(42,58,74,0.4)' }}
          >
            {bio.length}/60
          </p>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="px-6 pt-4">
        <motion.button
          className="w-full flex items-center justify-center gap-2 text-white font-medium"
          style={{
            height: 56,
            borderRadius: 16,
            background: canSave
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0.4) 100%)',
            boxShadow: canSave
              ? '0 4px 20px rgba(102, 126, 234, 0.3)'
              : 'none',
            fontSize: '16px',
            transition: 'all 0.3s ease',
          }}
          onClick={handleSave}
          disabled={!canSave}
          whileTap={canSave ? { scale: 0.97 } : {}}
        >
          <Save size={18} />
          保存设置
        </motion.button>
      </div>
    </motion.div>
  )
}
