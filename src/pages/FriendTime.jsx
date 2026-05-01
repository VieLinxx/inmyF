import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'
import MomentCard from '../components/MomentCard'
import PublishMoment from '../components/PublishMoment'
import GuessEmotion from '../components/GuessEmotion'
import WolfGame from '../components/WolfGame'

/* ============================================
   FriendTime 页面 — Supabase 版
   ============================================ */

const TABS = [
  { key: 'moments', label: '日常分享' },
  { key: 'challenge', label: '默契挑战' },
]

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

function formatMoment(m) {
  return {
    id: m.id,
    userId: m.user_id,
    userName: m.author?.nickname || '匿名',
    userAvatar: m.author?.avatar_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    emoji: m.emotion,
    correctEmoji: m.emotion,
    content: m.content,
    image: m.image_url,
    time: timeAgo(m.created_at),
    likes: m.moment_likes?.map((l) => l.user_id) || [],
    guesses: m.emotion_guesses?.map((g) => ({
      userId: g.guesser_id,
      userName: g.guesser?.nickname || '匿名',
      emoji: g.guessed_emotion,
    })) || [],
  }
}

export default function FriendTime() {
  const [activeTab, setActiveTab] = useState('moments')
  const [moments, setMoments] = useState([])
  const [publishOpen, setPublishOpen] = useState(false)
  const [guessOpen, setGuessOpen] = useState(false)
  const [guessMoment, setGuessMoment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const user = useUserStore((s) => s.user)
  const currentUserId = user?.id

  // ===== 加载动态列表 =====
  const loadMoments = useCallback(async () => {
    const { data, error } = await supabase
      .from('moments')
      .select(
        `
        *,
        author:profiles!user_id(nickname, avatar_emoji, avatar_color),
        moment_likes(user_id),
        emotion_guesses(guesser_id, guessed_emotion, is_correct, guesser:profiles!guesser_id(nickname))
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('load moments error:', error)
      return
    }

    setMoments((data || []).map(formatMoment))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadMoments()
  }, [loadMoments])

  // ===== 点赞 / 取消点赞 =====
  const handleLike = useCallback(
    async (momentId) => {
      const moment = moments.find((m) => m.id === momentId)
      const isLiked = moment?.likes?.includes(currentUserId)

      if (isLiked) {
        await supabase
          .from('moment_likes')
          .delete()
          .match({ moment_id: momentId, user_id: currentUserId })
      } else {
        await supabase
          .from('moment_likes')
          .insert({ moment_id: momentId, user_id: currentUserId })
      }

      setMoments((prev) =>
        prev.map((m) => {
          if (m.id !== momentId) return m
          const likes = m.likes || []
          if (likes.includes(currentUserId)) {
            return { ...m, likes: likes.filter((id) => id !== currentUserId) }
          }
          return { ...m, likes: [...likes, currentUserId] }
        })
      )
    },
    [currentUserId, moments]
  )

  // ===== 打开猜测弹窗 =====
  const handleGuess = useCallback(
    (momentId) => {
      const moment = moments.find((m) => m.id === momentId)
      if (moment) {
        setGuessMoment(moment)
        setGuessOpen(true)
      }
    },
    [moments]
  )

  // ===== 提交猜测 =====
  const handleSubmitGuess = useCallback(
    async ({ momentId, emoji }) => {
      const moment = moments.find((m) => m.id === momentId)
      if (moment?.guesses?.some((g) => g.userId === currentUserId)) return

      const isCorrect = emoji === moment.correctEmoji

      const { error } = await supabase.from('emotion_guesses').insert({
        moment_id: momentId,
        guesser_id: currentUserId,
        guessed_emotion: emoji,
        is_correct: isCorrect,
      })

      if (error) {
        console.error('guess error:', error)
        throw error
      }

      setMoments((prev) =>
        prev.map((m) =>
          m.id === momentId
            ? {
                ...m,
                guesses: [
                  ...(m.guesses || []),
                  { userId: currentUserId, userName: '我', emoji },
                ],
              }
            : m
        )
      )
    },
    [currentUserId, moments]
  )

  // ===== 发布动态 =====
  const handlePublish = useCallback(
    async ({ emoji, content, image }) => {
      if (!currentUserId) throw new Error('请先登录')

      // 诊断日志
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[FriendTime] session:', session ? 'exists' : 'null')
      console.log('[FriendTime] currentUserId:', currentUserId)

      const { data, error } = await supabase
        .from('moments')
        .insert({
          user_id: currentUserId,
          content,
          emotion: emoji,
          image_url: image || '',
        })
        .select(
          `
          *,
          author:profiles!user_id(nickname, avatar_emoji, avatar_color)
        `
        )

      console.log('[FriendTime] insert result:', { data, error })

      if (error) {
        console.error('publish error:', error)
        throw error
      }
      if (!data || data.length === 0) throw new Error('插入后未返回数据')

      const newMoment = formatMoment({ ...data[0], moment_likes: [], emotion_guesses: [] })
      setMoments((prev) => [newMoment, ...prev])
    },
    [currentUserId]
  )

  return (
    <div
      className="relative w-full"
      style={{
        minHeight: '100dvh',
        background:
          'linear-gradient(180deg, #ffecd2 0%, #fcb69f 15%, #a8edea 40%, #fed6e3 65%, #d299c2 85%, #1a1a2e 100%)',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
      }}
    >
      {/* 标题 */}
      <div className="px-6 mb-4">
        <h1
          className="font-light"
          style={{
            fontSize: 'clamp(22px, 5vw, 28px)',
            color: '#3a4a5a',
            letterSpacing: '0.5px',
          }}
        >
          FriendTime
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#7a8a9a' }}>
          和好友分享日常，猜测彼此情绪
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="px-6 mb-5">
        <div
          className="flex p-1"
          style={{
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <motion.button
                key={tab.key}
                className="flex-1 py-2.5 text-sm font-medium rounded-[12px] relative"
                style={{
                  color: isActive ? '#ffffff' : '#7a8a9a',
                  zIndex: 1,
                }}
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-[12px]"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                    layoutId="friendtime-tab"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        {activeTab === 'moments' && (
          <motion.div
            key="moments"
            className="px-5 pb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
                <p style={{ color: 'rgba(58,74,90,0.5)' }}>加载中...</p>
              </div>
            ) : moments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <PenLine size={48} style={{ color: 'rgba(255,255,255,0.5)' }} />
                <p className="mt-4 text-base" style={{ color: 'rgba(58,74,90,0.5)' }}>
                  还没有动态，来发布第一条吧
                </p>
              </div>
            ) : (
              moments.map((moment) => (
                <MomentCard
                  key={moment.id}
                  moment={moment}
                  onLike={handleLike}
                  onGuess={handleGuess}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'challenge' && (
          <motion.div
            key="challenge"
            className="px-0 pb-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ height: 'calc(100dvh - 200px)' }}
          >
            <WolfGame />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 发布按钮 FAB */}
      {activeTab === 'moments' &&
        createPortal(
          <motion.button
            className="fixed z-30 flex items-center justify-center"
            style={{
              right: 'max(20px, calc(50% - 195px))',
              bottom: 'calc(72px + env(safe-area-inset-bottom))',
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 6px 24px rgba(102, 126, 234, 0.4)',
              color: '#ffffff',
            }}
            onClick={() => setPublishOpen(true)}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              delay: 0.2,
            }}
          >
            <PenLine size={24} strokeWidth={2.5} />
          </motion.button>,
          document.body
        )}

      {/* 发布弹窗 */}
      <PublishMoment
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSubmit={handlePublish}
      />

      {/* 猜测弹窗 */}
      <GuessEmotion
        isOpen={guessOpen}
        onClose={() => setGuessOpen(false)}
        onSubmit={handleSubmitGuess}
        moment={guessMoment}
      />
    </div>
  )
}
