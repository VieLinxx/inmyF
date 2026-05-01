import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import MyCat from './pages/MyCat'
import Ocean from './pages/Ocean'
import FriendTime from './pages/FriendTime'
import Friends from './pages/Friends'
import { useUserStore } from './store/userStore'

/* ============================================
   路由守卫
   ============================================ */

function AuthGuard() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  const isAuthReady = useUserStore((state) => state.isAuthReady)

  if (!isAuthReady) {
    // 等待 Supabase 会话恢复完成
    return (
      <div
        className="flex items-center justify-center w-full dream-gradient"
        style={{ height: '100dvh' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-white/30 border-t-white animate-spin"
          />
          <p style={{ color: 'rgba(90,122,138,0.6)', fontSize: '14px' }}>
            加载中...
          </p>
        </div>
      </div>
    )
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

function GuestGuard() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  const isAuthReady = useUserStore((state) => state.isAuthReady)

  if (!isAuthReady) {
    return (
      <div
        className="flex items-center justify-center w-full dream-gradient"
        style={{ height: '100dvh' }}
      >
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <p style={{ color: 'rgba(90,122,138,0.6)', fontSize: '14px' }}>
            加载中...
          </p>
        </div>
      </div>
    )
  }

  return !isLoggedIn ? <Login /> : <Navigate to="/app/mycat" replace />
}

function App() {
  useEffect(() => {
    // 在 effect 内直接读取 store，避免依赖数组不稳定问题
    const { initAuth, subscribeAuth } = useUserStore.getState()

    // 启动初始化（正确 await）
    const init = async () => {
      try {
        await initAuth()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      }
    }
    init()

    // 订阅认证状态变化
    const listener = subscribeAuth()

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // 独立超时保护：5 秒强制解除 loading，绝不让用户干等
  useEffect(() => {
    const timer = setTimeout(() => {
      const { isAuthReady } = useUserStore.getState()
      if (!isAuthReady) {
        console.warn('Auth init timeout after 5s, forcing ready')
        useUserStore.setState({ isAuthReady: true })
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestGuard />} />

        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/app" element={<Navigate to="/app/mycat" replace />} />
            <Route path="/app/mycat" element={<MyCat />} />
            <Route path="/app/ocean" element={<Ocean />} />
            <Route path="/app/friendtime" element={<FriendTime />} />
            <Route path="/app/friends" element={<Friends />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
