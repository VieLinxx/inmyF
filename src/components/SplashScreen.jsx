import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ============================================
   SplashScreen 全局启动画面
   - 所有用户首次打开都先看到
   - brand → slogan → 自动消失
   ============================================ */

export default function SplashScreen({ showLoading }) {
  const [phase, setPhase] = useState('brand')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('slogan'), 1200)
    const t2 = setTimeout(() => setPhase('done'), 2700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 w-full h-full dream-gradient flex items-center justify-center z-[100]"
      style={{ height: '100dvh' }}
    >
      <AnimatePresence mode="wait">
        {phase === 'brand' && (
          <motion.p
            key="brand"
            className="text-center font-light"
            style={{
              color: '#3a5a6a',
              fontSize: '42px',
              fontWeight: 300,
              letterSpacing: '2px',
              textShadow: '0 2px 20px rgba(255,255,255,0.9)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            inmyF
          </motion.p>
        )}

        {phase === 'slogan' && (
          <motion.p
            key="slogan"
            className="text-center whitespace-nowrap"
            style={{
              color: '#3a5a6a',
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '0.5px',
              textShadow: '0 2px 20px rgba(255,255,255,0.9)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            我的感受也很重要
          </motion.p>
        )}

        {phase === 'done' && showLoading && (
          <motion.div
            key="loading"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin mb-3" />
            <p style={{ color: 'rgba(90,122,138,0.6)', fontSize: '14px' }}>
              加载中...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
