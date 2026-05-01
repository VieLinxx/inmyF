import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, MailOpen, Send, CheckCircle, MessageCircle, CornerDownLeft } from 'lucide-react'

/* ============================================
   InboxQModal 匿名提问箱
   - 收到的匿名提问（可回复）
   - 自己发出的提问收到的回复
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

export default function InboxQModal({ items, isOpen, onClose, onRead, onReply }) {
  const [readIds, setReadIds] = useState(new Set())
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [localReplies, setLocalReplies] = useState({})

  const handleItemClick = (item) => {
    if (!readIds.has(item.id)) {
      setReadIds((prev) => new Set(prev).add(item.id))
      onRead?.(item.id)
    }
    if (item.type === 'received') {
      setReplyingId((prev) => (prev === item.id ? null : item.id))
      setReplyText('')
    }
  }

  const handleSendReply = (id) => {
    const text = replyText.trim()
    if (!text) return
    setLocalReplies((prev) => ({ ...prev, [id]: text }))
    onReply?.({ id, reply: text })
    setReplyingId(null)
    setReplyText('')
  }

  const unreadCount = items.filter((item) => !readIds.has(item.id) && !item.read).length

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[60]"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              />

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
                    匿名提问箱
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
                        还没有消息
                      </p>
                    </div>
                  ) : (
                    items.map((item) => {
                      const isUnread = !readIds.has(item.id) && !item.read
                      const isReplying = replyingId === item.id
                      const isReceived = item.type === 'received'
                      const isReply = item.type === 'reply'
                      const hasReply = isReceived && (item.reply || localReplies[item.id])
                      const replyContent = item.reply || localReplies[item.id]

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
                            cursor: isReceived && !hasReply ? 'pointer' : 'default',
                          }}
                          onClick={() => isReceived && !hasReply && handleItemClick(item)}
                          whileTap={isReceived && !hasReply ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-start gap-3">
                            {/* 图标 */}
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{
                                background: isReply
                                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                  : isUnread
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : hasReply
                                      ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                      : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                              }}
                            >
                              {isReply ? (
                                <CornerDownLeft size={16} color="#fff" />
                              ) : hasReply ? (
                                <CheckCircle size={16} color="#fff" />
                              ) : (
                                <HelpCircle size={16} color="#fff" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* 标签 + 时间 */}
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="text-xs font-medium"
                                  style={{
                                    color: isReply
                                      ? '#f5576c'
                                      : hasReply
                                        ? '#2a9d5c'
                                        : '#667eea',
                                  }}
                                >
                                  {isReply ? '收到回复' : hasReply ? '已回复' : '匿名好友'}
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

                              {/* 问题内容 */}
                              <p className="text-sm leading-relaxed mb-2" style={{ color: '#3a4a5a' }}>
                                {isReply && (
                                  <span className="text-xs mr-1" style={{ color: '#b0b8c4' }}>
                                    [我的提问]
                                  </span>
                                )}
                                {item.content}
                              </p>

                              {/* 收到的回复：显示来自谁 */}
                              {isReply && item.reply && (
                                <div
                                  className="p-3 rounded-xl"
                                  style={{
                                    background: 'rgba(240, 208, 64, 0.08)',
                                    border: '1px solid rgba(240, 208, 64, 0.25)',
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-2"
                                  >
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                                      style={{ background: item.toFriendAvatar || '#d1d5db' }}
                                    >
                                      {item.toFriendEmoji || item.toFriendName?.charAt(0)}
                                    </div>
                                    <p className="text-xs font-medium" style={{ color: '#b8860b' }}
                                    >
                                      {item.toFriendName} 的回复
                                    </p>
                                  </div>
                                  <p className="text-sm" style={{ color: '#3a4a5a' }}>
                                    {item.reply}
                                  </p>
                                </div>
                              )}

                              {/* 我的回复（收到的问题） */}
                              {hasReply && (
                                <div
                                  className="p-3 rounded-xl mt-2"
                                  style={{
                                    background: 'rgba(67, 233, 123, 0.08)',
                                    border: '1px solid rgba(67, 233, 123, 0.2)',
                                  }}
                                >
                                  <p className="text-xs mb-1" style={{ color: '#2a9d5c' }}>
                                    我的回复
                                  </p>
                                  <p className="text-sm" style={{ color: '#3a4a5a' }}>
                                    {replyContent}
                                  </p>
                                </div>
                              )}

                              {/* 回复输入区（仅收到的提问） */}
                              <AnimatePresence>
                                {isReplying && isReceived && !hasReply && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-3"
                                  >
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="写下你的回复..."
                                        maxLength={100}
                                        className="flex-1 px-3 py-2 rounded-xl text-sm"
                                        style={{
                                          background: 'rgba(255, 255, 255, 0.8)',
                                          border: '1px solid rgba(102, 126, 234, 0.3)',
                                          color: '#3a4a5a',
                                          outline: 'none',
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                      />
                                      <motion.button
                                        className="flex items-center justify-center px-3 rounded-xl"
                                        style={{
                                          background: replyText.trim()
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : '#d1d5db',
                                          color: '#fff',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleSendReply(item.id)
                                        }}
                                        whileTap={replyText.trim() ? { scale: 0.9 } : {}}
                                        disabled={!replyText.trim()}
                                      >
                                        <Send size={16} />
                                      </motion.button>
                                    </div>
                                    <p
                                      className="text-right mt-1"
                                      style={{ fontSize: '11px', color: '#b0b8c4' }}
                                    >
                                      {replyText.length}/100
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
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
      )}
    </>
  )
}
