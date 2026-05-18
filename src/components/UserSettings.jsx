import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, FileText } from 'lucide-react'

/* ============================================
   UserSettings 用户设置弹窗 — 居中显示，避免键盘遮挡
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 弹窗 — 外层居中定位，内层负责样式 */}
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center"
            style={{ padding: '16px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            <motion.div
              className="flex flex-col w-full"
              style={{
                maxWidth: '380px',
                maxHeight: '80dvh',
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderRadius: 24,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 顶部 */}
              <div className="relative flex items-center justify-center px-6 pt-5 pb-3">
                <h3
                  className="font-medium"
                  style={{ fontSize: '18px', color: '#3a4a5a' }}
                >
                  个人设置
                </h3>
                <button
                  className="absolute right-4 top-4 p-1"
                  style={{ color: '#b0b8c4' }}
                  onClick={onClose}
                >
                  <X size={22} />
                </button>
              </div>

              {/* 用户头像预览 */}
              <div className="flex flex-col items-center pb-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2"
                  style={{ background: user?.avatarColor }}
                >
                  {user?.avatarEmoji || user?.nickname?.charAt(0) || '😎'}
                </div>
                <p className="text-sm font-medium" style={{ color: '#3a4a5a' }}>
                  {user?.nickname || '用户'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#b0b8c4' }}>
                  {user?.bio || '还没有个性签名'}
                </p>
              </div>

              {/* 输入区 — 可滚动 */}
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
                {/* 昵称 */}
                <div>
                  <label
                    className="flex items-center gap-1.5 text-xs font-medium mb-2"
                    style={{ color: '#7a8a9a' }}
                  >
                    <User size={14} />
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
                      height: 52,
                      borderRadius: 16,
                      fontSize: '16px',
                      color: '#3a4a5a',
                      background: 'rgba(245, 247, 250, 0.8)',
                      border: '1px solid rgba(220, 225, 230, 0.5)',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <p
                    className="text-right mt-1"
                    style={{ fontSize: '12px', color: '#b0b8c4' }}
                  >
                    {nickname.length}/16
                  </p>
                </div>

                {/* 个性签名 */}
                <div>
                  <label
                    className="flex items-center gap-1.5 text-xs font-medium mb-2"
                    style={{ color: '#7a8a9a' }}
                  >
                    <FileText size={14} />
                    个性签名
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="写点什么，让好友更了解你..."
                    maxLength={60}
                    rows={2}
                    className="w-full px-4 py-3 resize-none"
                    style={{
                      borderRadius: 16,
                      fontSize: '15px',
                      color: '#3a4a5a',
                      background: 'rgba(245, 247, 250, 0.8)',
                      border: '1px solid rgba(220, 225, 230, 0.5)',
                      outline: 'none',
                      lineHeight: 1.5,
                    }}
                  />
                  <p
                    className="text-right mt-1"
                    style={{ fontSize: '12px', color: '#b0b8c4' }}
                  >
                    {bio.length}/60
                  </p>
                </div>
              </div>

              {/* 保存按钮 */}
              <div className="px-6 pb-5 pt-3">
                <motion.button
                  className="w-full flex items-center justify-center gap-2 text-white font-medium"
                  style={{
                    height: 52,
                    borderRadius: 16,
                    background: canSave
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
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
                  <Save size={16} />
                  保存设置
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
