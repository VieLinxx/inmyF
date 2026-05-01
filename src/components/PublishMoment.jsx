import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, ImagePlus, Trash2 } from 'lucide-react'

/* ============================================
   PublishMoment 发布动态弹窗
   - 选择 Emoji（真实情绪）
   - 输入文字内容
   - 选择照片（可选）
   - 发布到日常分享
   ============================================ */

const EMOJIS = [
  '😊', '😂', '😭', '❤️', '😡',
  '😱', '🥺', '😴', '🎉', '💪',
  '🌧️', '☀️', '🤔', '😎', '🥰',
  '🙃', '😰', '🤗', '💔', '✨',
]

export default function PublishMoment({ isOpen, onClose, onSubmit }) {
  const [emoji, setEmoji] = useState(null)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = () => {
    if (!emoji || !content.trim()) return
    onSubmit?.({ emoji, content: content.trim(), image })
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmoji(null)
      setContent('')
      setImage(null)
      onClose()
    }, 1500)
  }

  const canSubmit = emoji && content.trim()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
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
              bottom: 0,
              height: '70%',
              maxHeight: 580,
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
                分享此刻
              </h3>
              <button
                className="absolute right-4 top-4 p-1"
                style={{ color: '#b0b8c4' }}
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* 提示 */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4"
                style={{
                  background: 'rgba(102, 126, 234, 0.08)',
                  border: '1px solid rgba(102, 126, 234, 0.15)',
                }}
              >
                <Sparkles size={14} style={{ color: '#667eea' }} />
                <p className="text-xs" style={{ color: '#667eea' }}>
                  选择一个 Emoji 代表你此刻的真实情绪，好友会来猜测哦
                </p>
              </div>

              {/* Emoji 选择 */}
              <p className="text-sm font-medium mb-3" style={{ color: '#7a8a9a' }}>
                此刻心情
              </p>
              <div className="grid grid-cols-5 gap-2.5 mb-5">
                {EMOJIS.map((e) => {
                  const isSel = emoji === e
                  return (
                    <motion.button
                      key={e}
                      className="flex items-center justify-center aspect-square rounded-2xl"
                      style={{
                        background: isSel
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'rgba(245, 247, 250, 0.8)',
                        fontSize: '1.6rem',
                        border: isSel
                          ? '2px solid #667eea'
                          : '2px solid transparent',
                      }}
                      onClick={() => setEmoji(e)}
                      whileTap={{ scale: 0.9 }}
                      animate={{ scale: isSel ? 1.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      {e}
                    </motion.button>
                  )
                })}
              </div>

              {/* 文字输入 */}
              <p className="text-sm font-medium mb-3" style={{ color: '#7a8a9a' }}>
                想说点什么
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你的心情..."
                maxLength={200}
                rows={3}
                className="w-full resize-none rounded-2xl p-4"
                style={{
                  fontSize: '15px',
                  color: '#3a4a5a',
                  background: 'rgba(245, 247, 250, 0.8)',
                  border: content.trim()
                    ? '1px solid rgba(102, 126, 234, 0.4)'
                    : '1px solid rgba(220, 225, 230, 0.5)',
                  outline: 'none',
                }}
              />
              <p className="text-right mt-1" style={{ fontSize: '12px', color: '#b0b8c4' }}>
                {content.length}/200
              </p>

              {/* 照片区域 */}
              <div className="mt-3">
                <p className="text-sm font-medium mb-3" style={{ color: '#7a8a9a' }}>
                  照片（可选）
                </p>
                {image ? (
                  <div className="relative inline-block">
                    <img
                      src={image}
                      alt="preview"
                      className="rounded-2xl"
                      style={{ maxHeight: 160, objectFit: 'cover' }}
                    />
                    <button
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(239, 68, 68, 0.9)',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                      }}
                      onClick={handleRemoveImage}
                    >
                      <Trash2 size={14} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    className="flex items-center justify-center gap-2 w-full py-6 rounded-2xl border-2 border-dashed"
                    style={{
                      borderColor: 'rgba(180, 190, 200, 0.4)',
                      color: '#b0b8c4',
                      background: 'rgba(245, 247, 250, 0.5)',
                    }}
                    onClick={() => fileRef.current?.click()}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ImagePlus size={20} />
                    <span className="text-sm">添加照片</span>
                  </motion.button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
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
                发布动态
              </motion.button>
            </div>

            {/* 成功提示 */}
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
                    ✨
                  </motion.div>
                  <motion.p
                    className="font-medium text-lg"
                    style={{ color: '#3a4a5a' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    发布成功
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
