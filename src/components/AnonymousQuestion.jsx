import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, HelpCircle } from 'lucide-react'

/* ============================================
   AnonymousQuestion 匿名提问弹窗
   - 选择预设问题或自定义输入
   - 每日最多提问 3 次
   - 提交后显示成功提示
   ============================================ */

const PRESET_QUESTIONS = [
  '你最近开心吗？',
  '有没有什么想对我说的？',
  '最近有什么烦恼吗？',
  '你觉得我们默契吗？',
  '最近在看什么书/电影？',
  '有什么想一起做的事吗？',
]

export default function AnonymousQuestion({
  isOpen,
  onClose,
  friend,
  onSubmit,
  remaining = 3,
}) {
  const [selected, setSelected] = useState(null)
  const [custom, setCustom] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (q) => {
    setSelected(q)
    setCustom('')
  }

  const handleCustomChange = (e) => {
    setCustom(e.target.value)
    setSelected(null)
  }

  const handleSubmit = () => {
    const content = selected || custom.trim()
    if (!content || remaining <= 0) return
    onSubmit?.({ friendId: friend?.id, content })
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSelected(null)
      setCustom('')
      onClose()
    }, 1500)
  }

  const canSubmit = (selected || custom.trim().length > 0) && remaining > 0

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
              height: '65%',
              maxHeight: 540,
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
                向 {friend?.nickname || '好友'} 匿名提问
              </h3>
              <button
                className="absolute right-4 top-4 p-1"
                style={{ color: '#b0b8c4' }}
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            {/* 剩余次数 */}
            <div className="px-6 pb-2">
              <div
                className="flex items-center justify-center gap-2 py-2 rounded-full"
                style={{
                  background:
                    remaining > 0
                      ? 'rgba(230, 168, 23, 0.12)'
                      : 'rgba(239, 68, 68, 0.1)',
                  border:
                    remaining > 0
                      ? '1px solid rgba(230, 168, 23, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <HelpCircle
                  size={14}
                  style={{ color: remaining > 0 ? '#b8860b' : '#ef4444' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: remaining > 0 ? '#b8860b' : '#ef4444' }}
                >
                  今日还可提问 {remaining} 次
                </span>
              </div>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-3">
              {/* 预设问题 */}
              <p
                className="text-sm font-medium mb-3"
                style={{ color: '#7a8a9a' }}
              >
                快速选择
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {PRESET_QUESTIONS.map((q) => {
                  const isSel = selected === q
                  return (
                    <motion.button
                      key={q}
                      className="px-4 py-2 rounded-xl text-sm font-medium"
                      style={{
                        background: isSel
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'rgba(245, 247, 250, 0.8)',
                        color: isSel ? '#ffffff' : '#5a6a7a',
                        border: isSel
                          ? 'none'
                          : '1px solid rgba(220, 225, 230, 0.5)',
                      }}
                      onClick={() => handleSelect(q)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {q}
                    </motion.button>
                  )
                })}
              </div>

              {/* 自定义输入 */}
              <p
                className="text-sm font-medium mb-3"
                style={{ color: '#7a8a9a' }}
              >
                自定义问题
              </p>
              <textarea
                value={custom}
                onChange={handleCustomChange}
                placeholder="写你想问的问题..."
                maxLength={100}
                rows={3}
                className="w-full resize-none rounded-2xl p-4"
                style={{
                  fontSize: '15px',
                  color: '#3a4a5a',
                  background: 'rgba(245, 247, 250, 0.8)',
                  border: custom.trim()
                    ? '1px solid rgba(102, 126, 234, 0.4)'
                    : '1px solid rgba(220, 225, 230, 0.5)',
                  outline: 'none',
                }}
              />
              <p
                className="text-right mt-1"
                style={{ fontSize: '12px', color: '#b0b8c4' }}
              >
                {custom.length}/100
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="px-6 pb-6 pt-2">
              <motion.button
                className="w-full flex items-center justify-center gap-2 text-white font-medium"
                style={{
                  height: 52,
                  borderRadius: 16,
                  background: canSubmit
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                  boxShadow: canSubmit
                    ? '0 4px 20px rgba(102, 126, 234, 0.3)'
                    : 'none',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleSubmit}
                disabled={!canSubmit}
                whileTap={canSubmit ? { scale: 0.97 } : {}}
              >
                <Send size={16} />
                发送匿名提问
              </motion.button>
            </div>

            {/* 提交成功覆盖层 */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{
                    borderRadius: '28px 28px 0 0',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-5xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    ✉️
                  </motion.div>
                  <motion.p
                    className="font-medium text-lg"
                    style={{ color: '#3a4a5a' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    提问已发送
                  </motion.p>
                  <motion.p
                    className="text-sm mt-1"
                    style={{ color: '#7a8a9a' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    对方回复后会通知你
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
