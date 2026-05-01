import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

/* ============================================
   TabBar 底部导航栏
   - 固定底部 64px + 安全区
   - 毛玻璃背景
   - 4 标签等宽
   - 选中暖金色+scale，未选浅灰
   ============================================ */

const tabs = [
  { path: '/app/ocean', icon: '🌊', label: '漂流瓶' },
  { path: '/app/friendtime', icon: '👥', label: 'FriendTime' },
  { path: '/app/mycat', icon: '🐱', label: 'MyCat' },
  { path: '/app/friends', icon: '👋', label: '好友' },
]

export default function TabBar() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        maxWidth: '430px',
        margin: '0 auto',
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        // 毛玻璃背景
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(40px) saturate(220%)',
        WebkitBackdropFilter: 'blur(40px) saturate(220%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className="flex flex-col items-center justify-center flex-1 h-full"
            style={{
              // 移动端最小触摸区域 44px
              minWidth: '44px',
              minHeight: '44px',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <motion.div
              className="flex flex-col items-center justify-center"
              animate={{
                scale: isActive ? 1.12 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            >
              <span
                className="text-xl mb-0.5"
                style={{
                  filter: isActive
                    ? 'drop-shadow(0 2px 4px rgba(255, 183, 77, 0.4))'
                    : 'none',
                }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[11px] font-medium tracking-wide"
                style={{
                  color: isActive ? '#e6a817' : '#b0b8c4',
                  transition: 'color 0.2s ease',
                }}
              >
                {tab.label}
              </span>
            </motion.div>

            {/* 选中指示器：顶部小圆点 */}
            {isActive && (
              <motion.div
                className="absolute top-2 w-1 h-1 rounded-full"
                style={{ backgroundColor: '#e6a817' }}
                layoutId="tab-indicator"
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
