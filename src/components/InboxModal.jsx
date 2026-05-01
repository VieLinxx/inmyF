import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, MailOpen, Mail } from 'lucide-react'

/* ============================================
   InboxModal 漂流瓶回复收件箱
   - 底部 65% 毛玻璃弹窗
   - 显示别人对自己漂流瓶的回复列表
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

export default function InboxModal({ items, isOpen, onClose, onRead }) {
  const [readIds, setReadIds] = useState(new Set())

  const handleItemClick = (id) => {
    if (!readIds.has(id)) {
      setReadIds((prev) => new Set(prev).add(id))
      onRead?.(id)
    }
  }

  const unreadCount = items.filter((item) => !readIds.has(item.id) && !item.read).length

  return (
    <>
      {/* Inbox 入口按钮 — 由父级渲染，这里只渲染弹窗 */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* 遮罩 */}
              <motion.div
                className="fixed inset-0 z-[60]"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
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
                  height: '65%',
                  maxHeight: '520px',
                  background: 'rgba(20, 15, 40, 0.9)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  borderRadius: '24px 24px 0 0',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.35)',
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                {/* 顶部 */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <button onClick={onClose} className="p-1" style={{ color: '#a0a0c0' }}>
                    <X size={22} />
                  </button>
                  <span
                    className="text-sm font-medium"
                    style={{ color: '#d0d0e8' }}
                  >
                    漂流瓶回复
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
                  <div
                    className="w-10 h-1 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  />
                </div>

                {/* 回复列表 */}
                <div className="flex-1 overflow-y-auto px-5">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <MailOpen size={48} style={{ color: '#4a4a6a' }} />
                      <p className="mt-4 text-sm" style={{ color: '#686888' }}>
                        还没有收到回复
                      </p>
                      <p className="mt-1 text-xs" style={{ color: '#555577' }}>
                        扔出更多漂流瓶，等待有缘人
                      </p>
                    </div>
                  ) : (
                    items.map((item) => {
                      const isUnread = !readIds.has(item.id) && !item.read
                      return (
                        <motion.div
                          key={item.id}
                          className="mb-3 p-4 rounded-2xl cursor-pointer"
                          style={{
                            background: isUnread
                              ? 'rgba(91, 141, 239, 0.08)'
                              : 'rgba(255, 255, 255, 0.04)',
                            border: isUnread
                              ? '1px solid rgba(91, 141, 239, 0.2)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                          onClick={() => handleItemClick(item.id)}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{
                                background: isUnread
                                  ? 'linear-gradient(135deg, #5b8def 0%, #8b5cf6 100%)'
                                  : 'linear-gradient(135deg, #4a4a6a 0%, #3a3a5a 100%)',
                              }}
                            >
                              <MessageCircle size={16} color="#fff" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: '#8899cc' }}
                                >
                                  匿名瓶友
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ color: '#555577' }}
                                >
                                  {timeAgo(item.created_at)}
                                </span>
                                {isUnread && (
                                  <span
                                    className="w-2 h-2 rounded-full ml-auto shrink-0"
                                    style={{ backgroundColor: '#e6a817' }}
                                  />
                                )}
                              </div>
                              <p
                                className="text-sm leading-relaxed mb-2"
                                style={{ color: '#c0c0d8' }}
                              >
                                {item.reply}
                              </p>
                              <div
                                className="text-xs px-3 py-1.5 rounded-lg"
                                style={{
                                  color: '#8888aa',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  display: 'inline-block',
                                }}
                              >
                                <span style={{ color: '#686888' }}>原瓶：</span>
                                {item.originalContent}
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
      )}
    </>
  )
}
