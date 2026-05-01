import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ============================================
   CelebrateAnimation 记录完成庆祝弹窗
   - 全屏遮罩 + 居中卡片
   - 大 emoji + 鼓励语 + 粒子背景
   - 点击或 5s 后自动关闭
   ============================================ */

export default function CelebrateAnimation({
  isActive,
  onComplete,
  message,
  emoji,
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && visible && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            setVisible(false)
            setTimeout(() => onComplete?.(), 400)
          }}
        >
          {/* 庆祝卡片 */}
          <motion.div
            className="relative flex flex-col items-center text-center px-8 py-10 w-full"
            style={{
              maxWidth: 320,
              borderRadius: 28,
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow:
                '0 20px 60px rgba(120, 160, 200, 0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 大 emoji */}
            <motion.div
              className="text-6xl mb-5"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
                delay: 0.15,
              }}
            >
              {emoji}
            </motion.div>

            {/* 鼓励语 */}
            <motion.p
              className="font-light leading-relaxed mb-6"
              style={{
                fontSize: '17px',
                color: '#3a5a6a',
                letterSpacing: '0.3px',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              {message}
            </motion.p>

            {/* 小猫装饰 */}
            <motion.div
              className="text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              🐱
            </motion.div>

            {/* 点击关闭提示 */}
            <motion.p
              className="mt-4 text-xs"
              style={{ color: '#a0b0c0' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              点击任意处关闭
            </motion.p>

            {/* 粒子装饰 */}
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0.8],
                  x: (Math.random() - 0.5) * 200,
                  y: -80 - Math.random() * 80,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.2 + i * 0.1,
                  ease: 'easeOut',
                }}
                style={{
                  left: '50%',
                  top: '30%',
                  fontSize: '1.2rem',
                }}
              >
                {i % 3 === 0 ? '✨' : i % 3 === 1 ? '❤️' : '🌟'}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
