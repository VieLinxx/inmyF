import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/* ============================================
   GuessEmotion 猜测情绪弹窗 — 移动端底部抽屉式
   ============================================ */

const GUESS_EMOJIS = [
  '😊', '😂', '😭', '❤️', '😡',
  '😱', '🥺', '😴', '🎉', '💪',
  '🌧️', '☀️', '🤔', '😎', '🥰',
]

export default function GuessEmotion({ isOpen, onClose, onSubmit, moment }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selected || !moment || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit?.({ momentId: moment.id, emoji: selected })
      const isCorrect = selected === moment.correctEmoji
      setResult({ isCorrect, correctEmoji: moment.correctEmoji })
      setTimeout(() => {
        setResult(null)
        setSelected(null)
        onClose()
      }, 2000)
    } catch (err) {
      alert(err.message || '提交失败，请检查网络或重新登录')
      setIsSubmitting(false)
    }
  }

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

          {/* 弹窗居中容器 */}
          <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none">
            <motion.div
              className="flex flex-col pointer-events-auto"
              style={{
                width: '100%',
                maxWidth: '430px',
                maxHeight: '85dvh',
                borderRadius: '28px 28px 0 0',
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* 顶部拖拽条 + 关闭按钮 */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 relative">
              <div className="w-10 h-1 rounded-full bg-gray-300 absolute left-0 right-0 top-3 mx-auto" />
              <h3
                className="font-medium w-full text-center"
                style={{ fontSize: '17px', color: '#3a4a5a' }}
              >
                猜猜 {moment?.userName} 的真实情绪
              </h3>
              <button
                className="absolute right-4 top-4 p-1"
                style={{ color: '#b0b8c4' }}
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            {/* 可滚动内容区 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p
                className="text-center text-sm mb-5"
                style={{ color: '#7a8a9a' }}
              >
                选择一个 Emoji 代表你觉得对方此刻的心情
              </p>

              {/* Emoji 网格 */}
              <div className="grid grid-cols-5 gap-2.5 mb-6">
                {GUESS_EMOJIS.map((e) => {
                  const isSel = selected === e
                  return (
                    <motion.button
                      key={e}
                      className="flex items-center justify-center aspect-square rounded-2xl"
                      style={{
                        background: isSel
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'rgba(245, 247, 250, 0.8)',
                        fontSize: '1.5rem',
                        border: isSel
                          ? '2px solid #667eea'
                          : '2px solid transparent',
                      }}
                      onClick={() => setSelected(e)}
                      whileTap={{ scale: 0.9 }}
                      animate={{ scale: isSel ? 1.12 : 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      {e}
                    </motion.button>
                  )
                })}
              </div>

              {/* 提交按钮 */}
              <motion.button
                className="w-full text-white font-medium"
                style={{
                  height: 52,
                  borderRadius: 16,
                  background: selected && !isSubmitting
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                  boxShadow: selected && !isSubmitting
                    ? '0 4px 20px rgba(102, 126, 234, 0.3)'
                    : 'none',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleSubmit}
                disabled={!selected || isSubmitting}
                whileTap={selected && !isSubmitting ? { scale: 0.97 } : {}}
              >
                {isSubmitting ? '提交中...' : '确认猜测'}
              </motion.button>
            </div>

            {/* 结果覆盖层 */}
            <AnimatePresence>
              {result && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center z-20"
                  style={{
                    borderRadius: '28px 28px 0 0',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-5xl mb-3"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {result.isCorrect ? '🎉' : '💭'}
                  </motion.div>
                  <motion.p
                    className="font-medium text-lg"
                    style={{
                      color: result.isCorrect ? '#2a9d5c' : '#3a4a5a',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {result.isCorrect ? '猜对了！' : '差一点～'}
                  </motion.p>
                  {!result.isCorrect && (
                    <motion.p
                      className="text-sm mt-1"
                      style={{ color: '#7a8a9a' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      正确答案是 {result.correctEmoji}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
