import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/* ============================================
   GuessEmotion 猜测情绪弹窗
   - 选择一个 Emoji 猜测对方的真实情绪
   - 提交后显示是否正确
   ============================================ */

const GUESS_EMOJIS = [
  '😊', '😂', '😭', '❤️', '😡',
  '😱', '🥺', '😴', '🎉', '💪',
  '🌧️', '☀️', '🤔', '😎', '🥰',
]

export default function GuessEmotion({ isOpen, onClose, onSubmit, moment }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  const handleSubmit = () => {
    if (!selected || !moment) return
    const isCorrect = selected === moment.correctEmoji
    setResult({ isCorrect, correctEmoji: moment.correctEmoji })
    onSubmit?.({ momentId: moment.id, emoji: selected })
    setTimeout(() => {
      setResult(null)
      setSelected(null)
      onClose()
    }, 2000)
  }

  return (
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
            className="fixed z-[70] flex flex-col"
            style={{
              maxWidth: 360,
              width: 'calc(100% - 48px)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: 28,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              className="absolute right-4 top-4 p-1 z-10"
              style={{ color: '#b0b8c4' }}
              onClick={onClose}
            >
              <X size={20} />
            </button>

            {/* 内容 */}
            <div className="p-6">
              <p
                className="text-center font-medium mb-1"
                style={{ fontSize: '18px', color: '#3a4a5a' }}
              >
                猜猜 {moment?.userName} 的真实情绪
              </p>
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
                  height: 50,
                  borderRadius: 16,
                  background: selected
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                  boxShadow: selected
                    ? '0 4px 20px rgba(102, 126, 234, 0.3)'
                    : 'none',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleSubmit}
                disabled={!selected}
                whileTap={selected ? { scale: 0.97 } : {}}
              >
                确认猜测
              </motion.button>
            </div>

            {/* 结果覆盖层 */}
            <AnimatePresence>
              {result && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{
                    borderRadius: 28,
                    background: 'rgba(255, 255, 255, 0.96)',
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
        </>
      )}
    </AnimatePresence>
  )
}
