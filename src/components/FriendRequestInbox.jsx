import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MailOpen, UserCheck, UserX, UserPlus } from 'lucide-react'

/* ============================================
   FriendRequestInbox 好友申请收件箱
   - 收到的好友申请（可同意/拒绝）
   ============================================ */

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

export default function FriendRequestInbox({ items, isOpen, onClose, onAccept, onReject }) {
  const [processingIds, setProcessingIds] = useState(new Set())

  const handleAccept = async (id) => {
    if (processingIds.has(id)) return
    setProcessingIds((prev) => new Set(prev).add(id))
    try {
      await onAccept?.(id)
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleReject = async (id) => {
    if (processingIds.has(id)) return
    setProcessingIds((prev) => new Set(prev).add(id))
    try {
      await onReject?.(id)
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const unreadCount = items.filter((i) => !i.read).length

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
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
              bottom: 'calc(16px + env(safe-area-inset-bottom))',
              height: '68%',
              maxHeight: '580px',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              borderRadius: '28px 28px 0 0',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 顶部 */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <button onClick={onClose} className="p-1" style={{ color: '#b0b8c4' }}>
                <X size={22} />
              </button>
              <span className="text-sm font-medium" style={{ color: '#3a4a5a' }}>
                好友申请
                {unreadCount > 0 && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background: 'linear-gradient(135deg, #e6a817 0%, #f0c040 100%)',
                      color: '#fff',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </span>
              <div className="w-8" />
            </div>

            <div className="flex justify-center pb-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#d1d5db' }} />
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <MailOpen size={48} style={{ color: '#d1d5db' }} />
                  <p className="mt-4 text-sm" style={{ color: '#b0b8c4' }}>
                    还没有好友申请
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const isProcessing = processingIds.has(item.id)
                  const isUnread = !item.read

                  return (
                    <motion.div
                      key={item.id}
                      className="mb-3 p-4 rounded-2xl"
                      style={{
                        background: isUnread
                          ? 'rgba(102, 126, 234, 0.08)'
                          : 'rgba(245, 247, 250, 0.5)',
                        border: isUnread
                          ? '1px solid rgba(102, 126, 234, 0.25)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                      }}
                      layout
                    >
                      <div className="flex items-start gap-3">
                        {/* 头像 */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                          style={{
                            background: item.senderAvatar || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          {item.senderEmoji || <UserPlus size={18} color="#fff" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* 名称 + 时间 */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium" style={{ color: '#3a4a5a' }}>
                              {item.senderName || '未知用户'}
                            </span>
                            <span className="text-xs" style={{ color: '#b0b8c4' }}>
                              {timeAgo(item.created_at)}
                            </span>
                            {isUnread && (
                              <span
                                className="w-2 h-2 rounded-full ml-auto shrink-0"
                                style={{ backgroundColor: '#e6a817' }}
                              />
                            )}
                          </div>

                          <p className="text-xs mb-3" style={{ color: '#7a8a9a' }}>
                            请求添加你为好友
                          </p>

                          {/* 操作按钮 */}
                          <div className="flex gap-2">
                            <motion.button
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium"
                              style={{
                                background: isProcessing
                                  ? '#d1d5db'
                                  : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: '#fff',
                              }}
                              onClick={() => handleAccept(item.id)}
                              disabled={isProcessing}
                              whileTap={!isProcessing ? { scale: 0.95 } : {}}
                            >
                              <UserCheck size={16} />
                              {isProcessing ? '处理中...' : '同意'}
                            </motion.button>
                            <motion.button
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium"
                              style={{
                                background: 'rgba(220, 225, 230, 0.6)',
                                color: '#7a8a9a',
                              }}
                              onClick={() => handleReject(item.id)}
                              disabled={isProcessing}
                              whileTap={!isProcessing ? { scale: 0.95 } : {}}
                            >
                              <UserX size={16} />
                              拒绝
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
