import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'
import OceanScene from '../components/OceanScene'
import Bottle from '../components/Bottle'
import FallingBottle from '../components/FallingBottle'
import SplashParticles from '../components/SplashParticles'
import ThrowBottle from '../components/ThrowBottle'
import BottleModal from '../components/BottleModal'
import InboxModal from '../components/InboxModal'

/* ============================================
   Ocean 漂流瓶海洋页面 — Supabase 版
   ============================================ */

export default function Ocean() {
  const user = useUserStore((s) => s.user)
  const userId = user?.id

  const [bottles, setBottles] = useState([])
  const [selectedBottle, setSelectedBottle] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [fallingBottle, setFallingBottle] = useState(null)
  const [splash, setSplash] = useState(null)
  const [inboxOpen, setInboxOpen] = useState(false)
  const [inboxItems, setInboxItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // ===== 加载漂流瓶列表 =====
  const loadBottles = useCallback(async () => {
    const { data, error } = await supabase
      .from('bottles')
      .select(`
        *,
        bottle_replies(id, content, created_at),
        likes:bottle_likes(user_id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('load bottles error:', error)
      return
    }

    const processed = (data || []).map((b) => ({
      ...b,
      likes: b.likes?.length || 0,
      likedByMe: b.likes?.some((l) => l.user_id === userId) || false,
      replies: b.bottle_replies || [],
    }))

    setBottles(processed)
    setIsLoading(false)
  }, [userId])

  // ===== 加载收件箱（别人回复了我的瓶子） =====
  const loadInbox = useCallback(async () => {
    if (!userId) return

    // 先获取我的瓶子 ID
    const { data: myBottles } = await supabase
      .from('bottles')
      .select('id')
      .eq('user_id', userId)

    if (!myBottles?.length) {
      setInboxItems([])
      return
    }

    const bottleIds = myBottles.map((b) => b.id)

    // 获取这些瓶子的回复（排除自己的回复）
    const { data: replies } = await supabase
      .from('bottle_replies')
      .select('*, bottle:bottles(content)')
      .in('bottle_id', bottleIds)
      .neq('user_id', userId)
      .order('created_at', { ascending: false })

    if (replies) {
      setInboxItems(
        replies.map((r) => ({
          id: r.id,
          originalContent: r.bottle?.content || '',
          reply: r.content,
          created_at: r.created_at,
          read: false,
        }))
      )
    }
  }, [userId])

  // 挂载时加载数据
  useEffect(() => {
    loadBottles()
    loadInbox()
  }, [loadBottles, loadInbox])

  const handleSelectBottle = useCallback((bottle) => {
    setSelectedBottle(bottle)
    setModalOpen(true)
  }, [])

  const handleThrow = useCallback(
    async (content) => {
      if (!userId) return

      const { data, error } = await supabase
        .from('bottles')
        .insert({
          user_id: userId,
          content,
          pos_x: (Math.random() - 0.5) * 10,
          pos_z: (Math.random() - 0.5) * 10,
        })
        .select()
        .single()

      if (error) {
        console.error('throw bottle error:', error)
        return
      }

      const newBottle = {
        ...data,
        likes: 0,
        likedByMe: false,
        replies: [],
        isNew: true,
      }

      setFallingBottle(newBottle)
    },
    [userId]
  )

  const handleLand = useCallback((bottle) => {
    setSplash({ x: bottle.x, z: bottle.z, id: Date.now() })
    setFallingBottle(null)
    setBottles((prev) => [bottle, ...prev])
  }, [])

  const handleLike = useCallback(
    async (id) => {
      if (!userId) return
      const bottle = bottles.find((b) => b.id === id)
      if (bottle?.likedByMe) return

      const { error } = await supabase
        .from('bottle_likes')
        .insert({ bottle_id: id, user_id: userId })

      if (error) {
        console.error('like error:', error)
        return
      }

      setBottles((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, likes: (b.likes || 0) + 1, likedByMe: true }
            : b
        )
      )
      if (selectedBottle?.id === id) {
        setSelectedBottle((prev) =>
          prev
            ? { ...prev, likes: (prev.likes || 0) + 1, likedByMe: true }
            : prev
        )
      }
    },
    [userId, bottles, selectedBottle]
  )

  const handleReply = useCallback(
    async (id, content) => {
      if (!userId) return

      const { data, error } = await supabase
        .from('bottle_replies')
        .insert({ bottle_id: id, user_id: userId, content })
        .select()
        .single()

      if (error) {
        console.error('reply error:', error)
        return
      }

      const newReply = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
      }

      setBottles((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, replies: [...(b.replies || []), newReply] } : b
        )
      )
      if (selectedBottle?.id === id) {
        setSelectedBottle((prev) =>
          prev
            ? { ...prev, replies: [...(prev.replies || []), newReply] }
            : prev
        )
      }
    },
    [userId, selectedBottle]
  )

  const handleSplashComplete = useCallback(() => {
    setSplash(null)
  }, [])

  return (
    <div
      className="fixed inset-0 w-full"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        maxWidth: '430px',
        margin: '0 auto',
        zIndex: 1,
      }}
    >
      {/* 3D 场景 */}
      <OceanScene>
        {bottles.map((bottle) => (
          <Bottle
            key={bottle.id}
            data={bottle}
            onSelect={handleSelectBottle}
          />
        ))}

        {fallingBottle && (
          <FallingBottle data={fallingBottle} onLand={handleLand} />
        )}

        {splash && (
          <SplashParticles
            position={[splash.x, 0.3, splash.z]}
            onComplete={handleSplashComplete}
          />
        )}
      </OceanScene>

      {/* 顶部标题 */}
      <div
        className="absolute left-0 right-0 flex justify-center px-6"
        style={{ zIndex: 20, top: 'calc(16px + env(safe-area-inset-top))' }}
      >
        <div
          className="flex flex-col items-center px-6 py-3"
          style={{
            maxWidth: 340,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px) saturate(160%)',
            WebkitBackdropFilter: 'blur(16px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <h1
            className="text-center font-light"
            style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              color: '#d0d0e8',
              letterSpacing: '1px',
            }}
          >
            情绪海洋
          </h1>
          <p className="text-xs mt-1" style={{ color: '#8888aa' }}>
            {isLoading ? '加载中...' : `${bottles.length} 个漂流瓶在海上漂浮`}
          </p>
        </div>
      </div>

      {/* 收件箱按钮 */}
      <motion.button
        className="absolute z-30 flex items-center justify-center"
        style={{
          left: '20px',
          bottom: 'calc(84px + env(safe-area-inset-bottom))',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
          color: '#ffffff',
        }}
        onClick={() => setInboxOpen(true)}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
      >
        <Mail size={20} strokeWidth={2} />
        {inboxItems.some((i) => !i.read) && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #e6a817 0%, #f0c040 100%)',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(230, 168, 23, 0.4)',
            }}
          >
            {inboxItems.filter((i) => !i.read).length}
          </span>
        )}
      </motion.button>

      {/* 扔瓶子按钮 */}
      <ThrowBottle onThrow={handleThrow} />

      {/* 瓶子详情弹窗 */}
      <BottleModal
        bottle={selectedBottle}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLike={handleLike}
        onReply={handleReply}
      />

      {/* 收件箱弹窗 */}
      <InboxModal
        items={inboxItems}
        isOpen={inboxOpen}
        onClose={() => setInboxOpen(false)}
      />
    </div>
  )
}
