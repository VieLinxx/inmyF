import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Eraser } from 'lucide-react'

/* ============================================
   EditRemark 编辑备注弹窗
   - 底部滑出
   - 输入备注 / 清除备注
   ============================================ */

export default function EditRemark({ isOpen, onClose, friend, onSave }) {
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (isOpen && friend) {
      setRemark(friend.remark || '')
    }
  }, [isOpen, friend])

  const handleSave = () => {
    onSave?.({ friendId: friend?.id, remark: remark.trim() })
    onClose()
  }

  const handleClear = () => {
    setRemark('')
    onSave?.({ friendId: friend?.id, remark: '' })
    onClose()
  }

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
              height: '45%',
              maxHeight: 380,
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
                编辑备注
              </h3>
              <button
                className="absolute right-4 top-4 p-1"
                style={{ color: '#b0b8c4' }}
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            {/* 好友信息 */}
            <div className="px-6 py-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: friend?.avatarColor }}
              >
                {friend?.avatarEmoji || friend?.nickname?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#3a4a5a' }}>
                  {friend?.remark || friend?.nickname}
                </p>
                <p className="text-xs" style={{ color: '#b0b8c4' }}>
                  原始昵称：{friend?.nickname}
                </p>
              </div>
            </div>

            {/* 输入区 */}
            <div className="flex-1 px-6 py-2">
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="输入备注名..."
                maxLength={20}
                className="w-full px-4"
                style={{
                  height: 52,
                  borderRadius: 16,
                  fontSize: '16px',
                  color: '#3a4a5a',
                  background: 'rgba(245, 247, 250, 0.8)',
                  border: '1px solid rgba(220, 225, 230, 0.5)',
                  outline: 'none',
                }}
                autoFocus
              />
              <p
                className="text-right mt-1"
                style={{ fontSize: '12px', color: '#b0b8c4' }}
              >
                {remark.length}/20
              </p>
            </div>

            {/* 按钮 */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              {friend?.remark && (
                <motion.button
                  className="flex items-center justify-center gap-2 px-5 font-medium"
                  style={{
                    height: 52,
                    borderRadius: 16,
                    background: 'rgba(220, 225, 230, 0.5)',
                    color: '#7a8a9a',
                    fontSize: '15px',
                  }}
                  onClick={handleClear}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eraser size={16} />
                  清除
                </motion.button>
              )}
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 text-white font-medium"
                style={{
                  height: 52,
                  borderRadius: 16,
                  background: remark.trim()
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                  boxShadow: remark.trim()
                    ? '0 4px 20px rgba(102, 126, 234, 0.3)'
                    : 'none',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleSave}
                disabled={!remark.trim()}
                whileTap={remark.trim() ? { scale: 0.97 } : {}}
              >
                <Save size={16} />
                保存备注
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
