import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, FileText } from 'lucide-react'

/* ============================================
   UserSettings 用户设置弹窗
   - 编辑昵称
   - 编辑个性签名
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

          {/* 弹窗 */}
          <motion.div
            className="fixed left-0 right-0 z-[70] flex flex-col"
            style={{
              maxWidth: '430px',
              margin: '0 auto',
              bottom: 0,
              height: '55%',
              maxHeight: 460,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: '28px 28px 0 0',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 顶部 */}
            <div className="relative flex items-center justify-center px-6 pt-4 pb-2">
              <div
                className="w-10 h-1 rounded-full absolute left-0 right-0 top-3 mx-auto"
                style={{ backgroundColor: '#d1d5db' }}
              />
              <h3
                className="font-medium mt-3"
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
            <div className="flex flex-col items-center py-3">
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

            {/* 输入区 */}
            <div className="flex-1 px-6 py-2 space-y-4">
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
            <div className="px-6 pb-6 pt-2">
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
        </>
      )}
    </AnimatePresence>
  )
}
