import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, CheckCircle, XCircle } from 'lucide-react'

/* ============================================
   MomentCard 动态卡片
   - 用户头像 + 昵称 + 发布时间
   - Emoji + 文字内容 + 照片
   - 猜测情绪按钮 + 点赞
   - 展开显示猜测结果（发布者看对错分组）
   ============================================ */

export default function MomentCard({
  moment,
  onLike,
  onGuess,
  currentUserId,
}) {
  const [showGuesses, setShowGuesses] = useState(false)
  const isOwner = moment.userId === currentUserId
  const hasGuessed = moment.guesses?.some((g) => g.userId === currentUserId)
  const isLiked = moment.likes?.includes(currentUserId)

  const correctGuesses = moment.guesses?.filter(
    (g) => g.emoji === moment.correctEmoji
  ) || []

  const wrongGuesses = moment.guesses?.filter(
    (g) => g.emoji !== moment.correctEmoji
  ) || []

  return (
    <motion.div
      className="mb-4 overflow-hidden"
      style={{
        borderRadius: 24,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* 头部：头像 + 昵称 + 时间 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: moment.userAvatar }}
        >
          {moment.userName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#3a4a5a' }}>
            {moment.userName}
          </p>
          <p className="text-xs" style={{ color: '#b0b8c4' }}>
            {moment.time}
          </p>
        </div>
      </div>

      {/* 内容：Emoji + 文字 + 照片 */}
      <div className="px-5 pb-3">
        <div className="flex items-start gap-3">
          {/* 情绪表情 */}
          {isOwner ? (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-4xl">{moment.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: '#b0b8c4' }}>
                真实情绪
              </span>
            </div>
          ) : hasGuessed ? (
            <motion.div
              className="flex flex-col items-center gap-1 shrink-0"
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
            >
              <span className="text-4xl">{moment.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: '#2a9d5c' }}>
                已揭晓
              </span>
            </motion.div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-1 shrink-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              }}
            >
              <span className="text-2xl">🤫</span>
              <span
                className="text-[9px] font-bold tracking-wider uppercase"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                SECRET
              </span>
            </div>
          )}
          <p className="text-[15px] leading-relaxed flex-1" style={{ color: '#4a5a6a' }}>
            {moment.content}
          </p>
        </div>

        {/* 照片 */}
        {moment.image && (
          <div className="mt-3 rounded-2xl overflow-hidden" style={{ maxHeight: 280 }}>
            <img
              src={moment.image}
              alt="moment"
              className="w-full h-full object-cover"
              style={{ maxHeight: 280 }}
            />
          </div>
        )}
      </div>

      {/* 操作栏 */}
      <div
        className="flex items-center gap-1 px-4 pb-3"
        style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}
      >
        {/* 猜测情绪 */}
        {!isOwner && (
          <motion.button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{
              background: hasGuessed
                ? 'rgba(102, 126, 234, 0.1)'
                : 'rgba(245, 247, 250, 0.8)',
              color: hasGuessed ? '#667eea' : '#7a8a9a',
              border: hasGuessed
                ? '1px solid rgba(102, 126, 234, 0.2)'
                : '1px solid transparent',
            }}
            onClick={() => !hasGuessed && onGuess?.(moment.id)}
            whileTap={{ scale: 0.95 }}
            disabled={hasGuessed}
          >
            <Sparkles size={14} />
            {hasGuessed ? '已猜测' : '猜情绪'}
          </motion.button>
        )}

        {/* 展开猜测结果 */}
        {moment.guesses?.length > 0 && (
          <motion.button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ml-auto"
            style={{
              background: 'rgba(230, 168, 23, 0.1)',
              color: '#b8860b',
            }}
            onClick={() => setShowGuesses((v) => !v)}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={14} />
            {moment.guesses.length} 人猜了
          </motion.button>
        )}

        {/* 点赞 */}
        <motion.button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
          style={{
            background: isLiked
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(245, 247, 250, 0.8)',
            color: isLiked ? '#ef4444' : '#7a8a9a',
          }}
          onClick={() => onLike?.(moment.id)}
          whileTap={{ scale: 0.95 }}
        >
          <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} />
          {moment.likes?.length || 0}
        </motion.button>
      </div>

      {/* 猜测结果展开 */}
      <AnimatePresence>
        {showGuesses && moment.guesses?.length > 0 && (
          <motion.div
            className="px-5 pb-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="p-3 rounded-2xl"
              style={{
                background: 'rgba(245, 247, 250, 0.6)',
              }}
            >
              {/* 发布者视角：对错分组 */}
              {isOwner ? (
                <>
                  {/* 统计 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'rgba(67, 233, 123, 0.15)',
                        color: '#2a9d5c',
                        border: '1px solid rgba(67, 233, 123, 0.25)',
                      }}
                    >
                      <CheckCircle size={12} />
                      {correctGuesses.length} 人猜对
                    </div>
                    {wrongGuesses.length > 0 && (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <XCircle size={12} />
                        {wrongGuesses.length} 人猜错
                      </div>
                    )}
                  </div>

                  {/* 猜对的人 */}
                  {correctGuesses.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-2" style={{ color: '#2a9d5c' }}>
                        猜对了
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {correctGuesses.map((g, i) => (
                          <div
                            key={`c-${i}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                            style={{
                              background: 'rgba(67, 233, 123, 0.12)',
                              color: '#2a9d5c',
                              border: '1px solid rgba(67, 233, 123, 0.25)',
                            }}
                          >
                            <span>{g.emoji}</span>
                            <span className="font-medium">{g.userName}</span>
                            <CheckCircle size={10} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 猜错的人 */}
                  {wrongGuesses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#ef4444' }}>
                        猜错了
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {wrongGuesses.map((g, i) => (
                          <div
                            key={`w-${i}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                          >
                            <span>{g.emoji}</span>
                            <span className="font-medium">{g.userName}</span>
                            <XCircle size={10} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs mt-3" style={{ color: '#b0b8c4' }}>
                    正确答案是 {moment.correctEmoji}
                  </p>
                </>
              ) : (
                /* 非发布者视角：简单列表 */
                <>
                  <p className="text-xs font-medium mb-2" style={{ color: '#7a8a9a' }}>
                    情绪猜测结果
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {moment.guesses.map((g, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                        style={{
                          background:
                            g.emoji === moment.correctEmoji
                              ? 'rgba(67, 233, 123, 0.15)'
                              : 'rgba(245, 247, 250, 0.8)',
                          color:
                            g.emoji === moment.correctEmoji
                              ? '#2a9d5c'
                              : '#7a8a9a',
                          border:
                            g.emoji === moment.correctEmoji
                              ? '1px solid rgba(67, 233, 123, 0.3)'
                              : '1px solid transparent',
                        }}
                      >
                        <span>{g.emoji}</span>
                        <span className="font-medium">{g.userName}</span>
                        {g.emoji === moment.correctEmoji && (
                          <span className="text-[10px]">✓ 猜对</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
