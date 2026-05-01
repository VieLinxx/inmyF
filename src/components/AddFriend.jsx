import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Link2, UserPlus } from 'lucide-react'
import { useUserStore } from '../store/userStore'

/* ============================================
   AddFriend 添加好友弹窗
   - 展示我的邀请码 + 一键复制
   - 输入对方邀请码添加
   ============================================ */

export default function AddFriend({ isOpen, onClose, onAdd }) {
  const user = useUserStore((s) => s.user)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const myCode = user?.id?.slice(-6).toUpperCase() || 'ABCDEF'
  const inviteLink = `${window.location.origin}/invite/${myCode}`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = inviteLink
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [inviteLink])

  const handleSubmit = () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed || trimmed.length !== 6) return
    onAdd?.(trimmed)
    setCode('')
    onClose()
  }

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
            {/* 顶部条 + 关闭 */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto absolute left-0 right-0 top-3" />
              <h3
                className="font-medium w-full text-center"
                style={{ fontSize: '18px', color: '#3a4a5a' }}
              >
                添加好友
              </h3>
              <button
                className="absolute right-4 top-4 p-1"
                style={{ color: '#b0b8c4' }}
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* 我的邀请码 */}
              <div
                className="flex flex-col items-center p-5 mb-5"
                style={{
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                }}
              >
                <p className="text-white/80 text-sm mb-2">我的邀请码</p>
                <p
                  className="font-bold text-white tracking-[4px] mb-3"
                  style={{ fontSize: '28px' }}
                >
                  {myCode}
                </p>
                <motion.button
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                  onClick={handleCopy}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <>
                      <Link2 size={14} />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      复制邀请链接
                    </>
                  )}
                </motion.button>
              </div>

              {/* 分割线 */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs" style={{ color: '#b0b8c4' }}>
                  输入对方邀请码
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* 输入框 */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                  }
                  placeholder="6位邀请码"
                  maxLength={6}
                  className="flex-1 text-center font-bold tracking-[6px] uppercase"
                  style={{
                    height: 52,
                    borderRadius: 16,
                    fontSize: '20px',
                    color: '#3a4a5a',
                    background: 'rgba(245, 247, 250, 0.8)',
                    border: '1px solid rgba(220, 225, 230, 0.5)',
                    outline: 'none',
                  }}
                />
                <motion.button
                  className="flex items-center justify-center gap-1.5 px-5 font-medium text-white"
                  style={{
                    height: 52,
                    borderRadius: 16,
                    background:
                      code.length === 6
                        ? 'linear-gradient(135deg, #e6a817 0%, #f0c040 100%)'
                        : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                    boxShadow:
                      code.length === 6
                        ? '0 4px 16px rgba(230, 168, 23, 0.3)'
                        : 'none',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={handleSubmit}
                  disabled={code.length !== 6}
                  whileTap={code.length === 6 ? { scale: 0.95 } : {}}
                >
                  <UserPlus size={18} />
                  添加
                </motion.button>
              </div>

              <p
                className="text-center mt-4 text-xs"
                style={{ color: '#b0b8c4' }}
              >
                将邀请链接分享给好友，对方打开后即可自动添加
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
