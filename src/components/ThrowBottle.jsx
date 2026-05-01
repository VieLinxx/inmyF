import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Send, X } from 'lucide-react'

/* ============================================
   ThrowBottle 扔漂流瓶
   - 右下毛玻璃 "+" 按钮
   - 弹窗输入 ≤200 字
   - 提交后触发父级 onThrow 回调
   ============================================ */

export default function ThrowBottle({ onThrow }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    const text = content.trim()
    if (!text) return
    onThrow?.(text)
    setContent('')
    setOpen(false)
  }

  return (
    <>
      {/* FAB 按钮 */}
      <motion.button
        className="absolute z-30 flex items-center justify-center"
        style={{
          right: '20px',
          bottom: 'calc(84px + env(safe-area-inset-bottom))',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
          color: '#ffffff',
        }}
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      {/* 扔瓶弹窗 — Portal 到 body，脱离 Ocean 层叠上下文 */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* 遮罩 */}
              <motion.div
                className="fixed inset-0 z-[60]"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />

              {/* 弹窗内容 */}
              <motion.div
                className="fixed left-0 right-0 z-[70] flex flex-col"
                style={{
                  maxWidth: '430px',
                  margin: '0 auto',
                  bottom: 'calc(16px + env(safe-area-inset-bottom))',
                  height: '55%',
                  maxHeight: '420px',
                  background: 'rgba(20, 15, 40, 0.88)',
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
                {/* 顶部条 */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1"
                    style={{ color: '#a0a0c0' }}
                  >
                    <X size={22} />
                  </button>
                  <span
                    className="text-sm font-medium"
                    style={{ color: '#d0d0e8' }}
                  >
                    扔一个漂流瓶
                  </span>
                  <div className="w-8" />
                </div>

                {/* 拖拽条 */}
                <div className="flex justify-center pb-3">
                  <div
                    className="w-10 h-1 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  />
                </div>

                {/* 输入区 */}
                <div className="flex-1 px-5 overflow-y-auto">
                  <textarea
                    value={content}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setContent(e.target.value)
                      }
                    }}
                    placeholder="写下你的心事，扔进大海..."
                    rows={6}
                    className="w-full resize-none rounded-2xl p-4"
                    style={{
                      fontSize: '16px',
                      lineHeight: 1.6,
                      color: '#e8e8f5',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <p
                    className="text-right mt-2"
                    style={{ fontSize: '13px', color: '#686888' }}
                  >
                    {content.length}/200
                  </p>
                </div>

                {/* 提交按钮 */}
                <div className="px-5 pb-6 pt-2">
                  <motion.button
                    className="w-full flex items-center justify-center gap-2 font-medium"
                    style={{
                      height: '52px',
                      borderRadius: '16px',
                      background: content.trim()
                        ? 'linear-gradient(135deg, #5b8def 0%, #8b5cf6 100%)'
                        : 'linear-gradient(135deg, #3a3a5a 0%, #4a4a6a 100%)',
                      color: '#ffffff',
                      fontSize: '16px',
                      boxShadow: content.trim()
                        ? '0 4px 20px rgba(91, 141, 239, 0.3)'
                        : 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    whileTap={content.trim() ? { scale: 0.97 } : {}}
                  >
                    <Send size={18} />
                    扔进大海
                  </motion.button>
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
