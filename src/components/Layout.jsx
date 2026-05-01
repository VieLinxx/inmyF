import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TabBar from './TabBar'

/* ============================================
   Layout 应用主布局
   - 包裹 /app/* 下的所有页面
   - 包含 TabBar 底部导航
   - 页面切换 framer-motion fade 0.2s
   ============================================ */

export default function Layout() {
  const location = useLocation()

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '100dvh',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
      }}
    >
      {/* 内容区域：页面切换淡入淡出 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="w-full relative"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {/* 底部导航 */}
      <TabBar />
    </div>
  )
}
