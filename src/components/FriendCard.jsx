import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageCircle, UserX, ChevronDown, ChevronUp, Pencil } from 'lucide-react'

/* ============================================
   FriendCard 好友卡片
   - 圆形彩色头像(首字母) + 昵称 + 默契值
   - 点击展开详情
   - 左滑删除
   ============================================ */

export default function FriendCard({ friend, onDelete, onAskQuestion, onEditRemark }) {
  const [expanded, setExpanded] = useState(false)
  const [swiped, setSwiped] = useState(false)

  const handleTouchStart = (e) => {
    friend._touchStartX = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - (friend._touchStartX || 0)
    if (diff < -60) {
      setSwiped(true)
    } else if (diff > 40) {
      setSwiped(false)
    }
  }

  return (
    <motion.div
      className="relative mb-3 overflow-hidden"
      style={{ borderRadius: 20 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 删除按钮背景层：仅在左滑时显示 */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-6"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: 20,
          opacity: swiped ? 1 : 0,
          pointerEvents: swiped ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          zIndex: 1,
        }}
        onClick={() => onDelete?.(friend.id)}
      >
        <div className="flex flex-col items-center text-white">
          <UserX size={20} />
          <span className="text-xs mt-1">删除</span>
        </div>
      </div>

      {/* 卡片主体 */}
      <motion.div
        className="relative flex items-center gap-4 px-5"
        style={{
          height: 72,
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
          zIndex: 2,
        }}
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) setSwiped(true)
          if (info.offset.x > 20) setSwiped(false)
        }}
        animate={{ x: swiped ? -80 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!swiped) setExpanded((v) => !v)
        }}
      >
        {/* 圆形彩色头像（动物 Emoji） */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: friend.avatarColor }}
        >
          {friend.avatarEmoji || friend.nickname.charAt(0)}
        </div>

        {/* 昵称 + 默契值 */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium truncate" style={{ color: '#3a4a5a' }}>
            {friend.remark || friend.nickname}
          </p>
          {friend.remark ? (
            <p className="text-xs truncate" style={{ color: '#b0b8c4' }}>
              {friend.nickname}
            </p>
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles size={13} style={{ color: '#e6a817' }} />
              <span className="text-sm font-medium" style={{ color: '#b8860b' }}>
                默契值 {friend.intimacy}
              </span>
            </div>
          )}
        </div>

        {/* 展开箭头 */}
        <div style={{ color: '#b0b8c4' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </motion.div>

      {/* 展开详情 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-5 pt-3 pb-4 mx-1"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0 0 20px 20px',
              marginTop: -8,
              paddingTop: 16,
              position: 'relative',
              zIndex: 3,
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* 大号默契值 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={24} style={{ color: '#e6a817' }} />
              <span
                className="font-bold"
                style={{ fontSize: 32, color: '#b8860b' }}
              >
                {friend.intimacy}
              </span>
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-3 gap-2.5">
              <motion.button
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'rgba(102, 126, 234, 0.12)',
                  color: '#667eea',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onEditRemark?.(friend)
                }}
                whileTap={{ scale: 0.96 }}
              >
                <Pencil size={14} />
                备注
              </motion.button>

              <motion.button
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'linear-gradient(135deg, #5b8def 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onAskQuestion?.(friend)
                }}
                whileTap={{ scale: 0.96 }}
              >
                <MessageCircle size={14} />
                提问
              </motion.button>

              <motion.button
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(friend.id)
                }}
                whileTap={{ scale: 0.96 }}
              >
                <UserX size={14} />
                移除
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
