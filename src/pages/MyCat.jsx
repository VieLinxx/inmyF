import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PenLine, History } from 'lucide-react'
import Cat from '../components/Cat'
import EmotionDiary from '../components/EmotionDiary'
import CelebrateAnimation from '../components/CelebrateAnimation'
import { useUserStore } from '../store/userStore'

/* ============================================
   MyCat 页面
   - 视频 absolute 占满全屏（除 TabBar）
   - 文字/按钮 absolute 浮于视频之上
   ============================================ */

export default function MyCat() {
  const [diaryOpen, setDiaryOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [showCelebrateModal, setShowCelebrateModal] = useState(false)
  const [celebrateMessage, setCelebrateMessage] = useState('')
  const [celebrateEmoji, setCelebrateEmoji] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const user = useUserStore((s) => s.user)
  const emotionRecords = useUserStore((s) => s.emotionRecords)
  const addEmotionRecord = useUserStore((s) => s.addEmotionRecord)
  const fetchEmotionRecords = useUserStore((s) => s.fetchEmotionRecords)

  // 登录后从 Supabase 拉取情绪记录
  useEffect(() => {
    if (user?.id) fetchEmotionRecords()
  }, [user?.id, fetchEmotionRecords])

  const today = new Date()
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}`

  //  today's most recent record
  const todayRecord = emotionRecords.find((r) => {
    const d = new Date(r.recorded_date || r.date)
    return (
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate() &&
      d.getFullYear() === today.getFullYear()
    )
  })

  const handleSubmitEmotion = useCallback(
    async (data) => {
      await addEmotionRecord(data)
      setCelebrateMessage(data.message || '')
      setCelebrateEmoji(data.emoji || '')
      setCelebrate(true)
      setShowCelebrateModal(true)
      setDiaryOpen(false)
    },
    [addEmotionRecord]
  )

  const handleCelebrateEnd = useCallback(() => {
    setCelebrate(false)
  }, [])

  const handleCelebrateModalClose = useCallback(() => {
    setShowCelebrateModal(false)
    setCelebrateMessage('')
    setCelebrateEmoji('')
  }, [])

  return (
    <div
      className="relative w-full dream-gradient"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* ===== 视频层：占满整个屏幕（除 TabBar） ===== */}
      <div
        className="absolute inset-0"
        style={{
          top: '3cm',
          bottom: 'calc(64px + env(safe-area-inset-bottom))',
          zIndex: 1,
        }}
      >
        <Cat celebrate={celebrate} onCelebrateEnd={handleCelebrateEnd} />
      </div>

      {/* ===== 亚克力卡片：文字 + 按钮 ===== */}
      <div
        className="absolute left-0 right-0 flex justify-center px-6"
        style={{ zIndex: 20, top: 'calc(12px + env(safe-area-inset-top))' }}
      >
        <div
          className="flex flex-col items-center px-8 py-5 w-full"
          style={{
            maxWidth: 340,
            borderRadius: 24,
            // 亚克力质感：高模糊 + 半透明 + 饱和度
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 8px 32px rgba(120, 160, 200, 0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          {/* 日期 */}
          <p
            className="text-xs font-light tracking-wider mb-1"
            style={{ color: '#7a9aaa' }}
          >
            {dateStr}
          </p>

          {/* 标题 */}
          <h1
            className="text-center font-light mb-1"
            style={{
              fontSize: 'clamp(17px, 4.5vw, 22px)',
              color: '#3a5a6a',
              letterSpacing: '0.5px',
            }}
          >
            今天感觉怎么样？
          </h1>

          {/* 已记录标签 */}
          {todayRecord && (
            <motion.div
              className="mb-3 px-4 py-1 rounded-full"
              style={{
                background: 'rgba(230, 168, 23, 0.18)',
                border: '1px solid rgba(230, 168, 23, 0.4)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="text-sm font-medium" style={{ color: '#b8860b' }}>
                {dateStr} {todayRecord.emoji}
              </span>
            </motion.div>
          )}

          {/* 情绪记录按钮 — 高饱和蓝 + 蓝紫渐变泛光边框 */}
          <div
            className="mt-2"
            style={{
              padding: '2px',
              borderRadius: 22,
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #818cf8, #60a5fa)',
              backgroundSize: '300% 300%',
              animation: 'gradientShift 4s ease infinite',
              boxShadow: '0 0 10px rgba(96, 165, 250, 0.45), 0 0 24px rgba(139, 92, 246, 0.3), 0 0 48px rgba(99, 102, 241, 0.12)',
            }}
          >
            <style>{`@keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }`}</style>
            <motion.button
              className="flex items-center gap-2 px-6 py-2.5"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                borderRadius: 20,
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                width: '100%',
                justifyContent: 'center',
              }}
              onClick={() => setDiaryOpen(true)}
              whileTap={{ scale: 0.96 }}
            >
              <PenLine size={16} strokeWidth={2.5} />
              {todayRecord ? '再记一条' : '记录心情'}
            </motion.button>
          </div>

          {/* 历史记录折叠按钮 */}
          {emotionRecords.length > 0 && (
            <motion.button
              className="flex items-center gap-1.5 mt-3"
              style={{
                fontSize: '13px',
                color: '#7a9aaa',
                background: 'transparent',
                border: 'none',
              }}
              onClick={() => setShowHistory((v) => !v)}
              whileTap={{ scale: 0.95 }}
            >
              <History size={14} />
              {showHistory ? '收起历史' : `历史记录 (${emotionRecords.length})`}
            </motion.button>
          )}

          {/* 历史记录列表 */}
          {showHistory && emotionRecords.length > 0 && (
            <motion.div
              className="w-full mt-2"
              style={{
                maxHeight: 180,
                overflowY: 'auto',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.35)',
                padding: '10px 12px',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.25 }}
            >
              {emotionRecords.slice(0, 20).map((record, idx) => {
                const rDate = new Date(record.recorded_date || record.date)
                const rDateStr = `${rDate.getMonth() + 1}/${rDate.getDate()}`
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-2"
                    style={{
                      borderBottom:
                        idx < emotionRecords.length - 1
                          ? '1px solid rgba(122, 154, 170, 0.12)'
                          : 'none',
                    }}
                  >
                    <span
                      className="text-xs font-medium shrink-0"
                      style={{ color: '#9ab' }}
                    >
                      {rDateStr}
                    </span>
                    <span className="text-base" style={{ marginTop: -2 }}>
                      {record.emoji}
                    </span>
                    <span
                      className="text-sm truncate flex-1"
                      style={{ color: '#5a7a8a' }}
                    >
                      {record.note || '无备注'}
                    </span>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* 情绪日记弹窗 */}
      <EmotionDiary
        isOpen={diaryOpen}
        onClose={() => setDiaryOpen(false)}
        onSubmit={handleSubmitEmotion}
      />

      {/* 记录完成庆祝弹窗 */}
      <CelebrateAnimation
        isActive={showCelebrateModal}
        onComplete={handleCelebrateModalClose}
        message={celebrateMessage}
        emoji={celebrateEmoji}
      />
    </div>
  )
}
