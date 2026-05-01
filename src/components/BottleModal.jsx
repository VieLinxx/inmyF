import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, ThumbsDown, MessageCircle, X, Send } from 'lucide-react'

/* ============================================
   BottleModal 漂流瓶详情
   - 底部 70% 毛玻璃弹窗
   - "某个瓶友" + 时间 + 内容
   - 👍👎💬 + 评论区 + 回复框
   - 点赞防重复（本地 state 模拟）
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

export default function BottleModal({ bottle, isOpen, onClose, onLike, onReply }) {
  const [liked, setLiked] = useState(bottle?.likedByMe || false)
  const [likeCount, setLikeCount] = useState(bottle?.likes || 0)
  const [replyText, setReplyText] = useState('')
  const [localReplies, setLocalReplies] = useState(bottle?.replies || [])
  const [isReplying, setIsReplying] = useState(false)

  if (!bottle) return null

  const handleLike = () => {
    if (liked) return
    setLiked(true)
    setLikeCount((c) => c + 1)
    onLike?.(bottle.id)
  }

  const handleReply = async () => {
    const text = replyText.trim()
    if (!text || isReplying) return
    setIsReplying(true)
    try {
      await onReply?.(bottle.id, text)
      const newReply = {
        id: `reply_${Date.now()}`,
        content: text,
        created_at: new Date().toISOString(),
      }
      setLocalReplies((prev) => [...prev, newReply])
      setReplyText('')
    } catch (err) {
      alert(err.message || '回复失败，请检查网络或重新登录')
    } finally {
      setIsReplying(false)
    }
  }

  return createPortal(
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
              height: '70%',
              maxHeight: '600px',
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
              <div className="w-8" />
            </div>

            <div className="flex justify-center pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto px-5">
              {/* 瓶友信息 */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  🧴
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#d0d0e8' }}
                  >
                    某个瓶友
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: '#686888' }}
                  >
                    {timeAgo(bottle.created_at)}
                  </p>
                </div>
              </div>

              {/* 正文 */}
              <p
                className="text-base leading-relaxed mb-5"
                style={{ color: '#e0e0f0' }}
              >
                {bottle.content}
              </p>

              {/* 互动按钮 */}
              <div className="flex items-center gap-5 mb-5 pb-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <motion.button
                  className="flex items-center gap-1.5"
                  onClick={handleLike}
                  whileTap={{ scale: 0.9 }}
                  style={{ color: liked ? '#f0a030' : '#a0a0c0' }}
                >
                  <ThumbsUp size={18} fill={liked ? '#f0a030' : 'none'} />
                  <span className="text-sm">{likeCount}</span>
                </motion.button>

                <div className="flex items-center gap-1.5" style={{ color: '#a0a0c0' }}>
                  <ThumbsDown size={18} />
                </div>

                <div className="flex items-center gap-1.5" style={{ color: '#a0a0c0' }}>
                  <MessageCircle size={18} />
                  <span className="text-sm">{localReplies.length}</span>
                </div>
              </div>

              {/* 评论区 */}
              {localReplies.length > 0 && (
                <div className="mb-4">
                  <p
                    className="text-xs font-medium mb-3"
                    style={{ color: '#686888' }}
                  >
                    回复
                  </p>
                  {localReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className="mb-3 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                      }}
                    >
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
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p
                        className="text-sm"
                        style={{ color: '#c0c0d8' }}
                      >
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 回复输入框 */}
            <div
              className="px-5 pb-5 pt-2 flex items-center gap-2"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                placeholder="回复这个瓶子..."
                className="flex-1 rounded-xl px-4 py-3 text-sm"
                style={{
                  color: '#e0e0f0',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  outline: 'none',
                }}
              />
              <motion.button
                onClick={handleReply}
                disabled={!replyText.trim() || isReplying}
                whileTap={replyText.trim() && !isReplying ? { scale: 0.9 } : {}}
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: replyText.trim() && !isReplying
                    ? 'linear-gradient(135deg, #5b8def 0%, #8b5cf6 100%)'
                    : 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                }}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
