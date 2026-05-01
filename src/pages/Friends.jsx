import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, UserPlus, Users, MessageCircleQuestion } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'
import FriendCard from '../components/FriendCard'
import AddFriend from '../components/AddFriend'
import AnonymousQuestion from '../components/AnonymousQuestion'
import EditRemark from '../components/EditRemark'
import InboxQModal from '../components/InboxQModal'

/* ============================================
   Friends 好友页面 — Supabase 版
   ============================================ */

export default function Friends() {
  const user = useUserStore((s) => s.user)
  const userId = user?.id

  const [friends, setFriends] = useState([])
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [questionOpen, setQuestionOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [todayQuestions, setTodayQuestions] = useState(0)
  const [remarkOpen, setRemarkOpen] = useState(false)
  const [inboxQOpen, setInboxQOpen] = useState(false)
  const [inboxQItems, setInboxQItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const remainingQuestions = Math.max(0, 3 - todayQuestions)
  const inboxQUnread = inboxQItems.filter((i) => !i.read).length

  // ===== 加载好友列表 =====
  const loadFriends = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        intimacy,
        remark,
        friend:profiles!friend_id(id, nickname, avatar_emoji, avatar_color)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('load friends error:', error)
      return
    }

    const formatted = (data || []).map((f) => ({
      id: f.friend.id,
      nickname: f.friend.nickname,
      avatarEmoji: f.friend.avatar_emoji,
      avatarColor: f.friend.avatar_color,
      intimacy: f.intimacy,
      remark: f.remark,
    }))

    setFriends(formatted)
    setIsLoading(false)
  }, [userId])

  // ===== 加载匿名提问箱 =====
  const loadInbox = useCallback(async () => {
    if (!userId) return

    // 收到的提问
    const { data: received } = await supabase
      .from('anonymous_questions')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })

    // 我发出的提问（有回复的）
    const { data: sent } = await supabase
      .from('anonymous_questions')
      .select('*, receiver:profiles!receiver_id(nickname, avatar_emoji, avatar_color)')
      .eq('sender_id', userId)
      .not('reply', 'is', null)
      .order('created_at', { ascending: false })

    const items = [
      ...(received || []).map((r) => ({
        id: r.id,
        type: 'received',
        content: r.content,
        reply: r.reply,
        created_at: r.created_at,
        read: r.is_read,
      })),
      ...(sent || []).map((r) => ({
        id: `reply_${r.id}`,
        type: 'reply',
        content: r.content,
        reply: r.reply,
        created_at: r.replied_at || r.created_at,
        read: true,
        toFriendName: r.receiver?.nickname,
        toFriendAvatar: r.receiver?.avatar_color,
        toFriendEmoji: r.receiver?.avatar_emoji,
      })),
    ]

    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setInboxQItems(items)
  }, [userId])

  // ===== 加载今日提问次数 =====
  const loadTodayQuestions = useCallback(async () => {
    if (!userId) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('anonymous_questions')
      .select('id')
      .eq('sender_id', userId)
      .gte('created_at', `${today}T00:00:00Z`)

    setTodayQuestions(data?.length || 0)
  }, [userId])

  useEffect(() => {
    loadFriends()
    loadInbox()
    loadTodayQuestions()
  }, [loadFriends, loadInbox, loadTodayQuestions])

  const filteredFriends = useMemo(() => {
    if (!search.trim()) return friends
    return friends.filter((f) =>
      f.nickname.toLowerCase().includes(search.trim().toLowerCase()) ||
      (f.remark && f.remark.toLowerCase().includes(search.trim().toLowerCase()))
    )
  }, [friends, search])

  // ===== 删除好友 =====
  const handleDelete = useCallback(async (friendId) => {
    // 删除双向记录
    await supabase.from('friendships').delete().match({ user_id: userId, friend_id: friendId })
    await supabase.from('friendships').delete().match({ user_id: friendId, friend_id: userId })
    setFriends((prev) => prev.filter((f) => f.id !== friendId))
  }, [userId])

  // ===== 匿名提问 =====
  const handleAskQuestion = useCallback((friend) => {
    setSelectedFriend(friend)
    setQuestionOpen(true)
  }, [])

  const handleSubmitQuestion = useCallback(async ({ friendId, content }) => {
    if (!userId) return
    await supabase.from('anonymous_questions').insert({
      sender_id: userId,
      receiver_id: friendId,
      content,
    })
    setTodayQuestions((prev) => prev + 1)
  }, [userId])

  // ===== 编辑备注 =====
  const handleEditRemark = useCallback((friend) => {
    setSelectedFriend(friend)
    setRemarkOpen(true)
  }, [])

  const handleSaveRemark = useCallback(async ({ friendId, remark }) => {
    await supabase
      .from('friendships')
      .update({ remark })
      .match({ user_id: userId, friend_id: friendId })

    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, remark } : f))
    )
  }, [userId])

  // ===== 收件箱操作 =====
  const handleInboxQRead = useCallback(async (id) => {
    await supabase.from('anonymous_questions').update({ is_read: true }).eq('id', id)
    setInboxQItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    )
  }, [])

  const handleInboxQReply = useCallback(async ({ id, reply }) => {
    await supabase
      .from('anonymous_questions')
      .update({ reply, replied_at: new Date().toISOString() })
      .eq('id', id)

    setInboxQItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, reply } : i))
    )
  }, [])

  // 当前用户的邀请码（UUID 后6位）
  const myInviteCode = userId ? userId.slice(-6).toLowerCase() : ''

  // ===== 添加好友 =====
  const handleAddFriend = useCallback(async (code) => {
    if (!userId) return
    const suffix = code.toLowerCase().trim()

    if (suffix === myInviteCode) {
      alert('不能添加自己为好友')
      return
    }

    // UUID 类型不支持 ilike，先拉取再过滤（小型应用够用）
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('id, nickname')
      .limit(1000)

    if (error) {
      console.error('search profiles error:', error)
      alert('查找失败，请重试')
      return
    }

    const targets = (allProfiles || []).filter((p) =>
      p.id.toLowerCase().endsWith(suffix)
    )

    if (!targets.length) {
      alert('未找到该用户，请检查邀请码')
      return
    }

    if (targets.length > 1) {
      alert('邀请码冲突，请使用完整用户ID')
      return
    }

    const target = targets[0]

    // 检查是否已经是好友
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .match({ user_id: userId, friend_id: target.id })
      .maybeSingle()

    if (existing) {
      alert('你们已经是好友了')
      return
    }

    // 插入双向好友关系
    const { error: insertError } = await supabase
      .from('friendships')
      .insert([
        { user_id: userId, friend_id: target.id, intimacy: 0 },
        { user_id: target.id, friend_id: userId, intimacy: 0 },
      ])

    if (insertError) {
      console.error('add friend error:', insertError)
      alert('添加失败，请重试')
      return
    }

    loadFriends()
  }, [userId, myInviteCode, loadFriends])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #7a9aaa 0%, #8aa0a0 35%, #a8b880 55%, #d0c050 75%, #f0d040 100%)',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
      }}
    >
      {/* ===== 背景装饰 ===== */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: '8%',
          left: '-8%',
          fontSize: 'clamp(100px, 28vw, 220px)',
          fontWeight: 900,
          lineHeight: 0.85,
          color: 'rgba(240, 208, 64, 0.35)',
          letterSpacing: '-0.04em',
          transform: 'rotate(-6deg)',
          zIndex: 0,
        }}
      >
        FRI
        <br />
        END
      </div>

      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: '35%',
          right: '-5%',
          fontSize: 'clamp(80px, 22vw, 180px)',
          fontWeight: 900,
          lineHeight: 0.9,
          color: 'rgba(255, 255, 255, 0.15)',
          letterSpacing: '-0.02em',
          transform: 'rotate(8deg)',
          zIndex: 0,
        }}
      >
        友
      </div>

      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: '10%',
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        }}
      />

      {/* ===== 内容层 ===== */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* 顶部标题栏 */}
        <div className="flex items-end justify-between px-6 mb-6">
          <div>
            <p
              className="text-xs font-medium tracking-[0.2em] mb-1"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              / MY FRIENDS
            </p>
            <h1
              className="font-light"
              style={{
                fontSize: 'clamp(28px, 6vw, 36px)',
                color: '#2a3a4a',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}
            >
              我的好友
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(42,58,74,0.55)' }}>
              {isLoading ? '加载中...' : `${friends.length} 位好友`}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {/* 匿名提问收件箱 */}
            <motion.button
              className="relative flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px) saturate(160%)',
                WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                color: '#2a3a4a',
              }}
              onClick={() => setInboxQOpen(true)}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircleQuestion size={22} strokeWidth={2} />
              {inboxQUnread > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #e6a817 0%, #f0c040 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 6px rgba(230, 168, 23, 0.4)',
                  }}
                >
                  {inboxQUnread}
                </span>
              )}
            </motion.button>

            {/* 添加好友 */}
            <motion.button
              className="flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px) saturate(160%)',
                WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                color: '#2a3a4a',
              }}
              onClick={() => setAddOpen(true)}
              whileTap={{ scale: 0.9 }}
            >
              <UserPlus size={22} strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="px-6 mb-5">
          <div
            className="flex items-center gap-3 px-4"
            style={{
              height: 48,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(12px) saturate(160%)',
              WebkitBackdropFilter: 'blur(12px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <Search size={18} style={{ color: 'rgba(42,58,74,0.4)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索好友..."
              className="flex-1 bg-transparent"
              style={{
                fontSize: '15px',
                color: '#2a3a4a',
                outline: 'none',
              }}
            />
            {search && (
              <button
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ color: 'rgba(42,58,74,0.4)' }}
                onClick={() => setSearch('')}
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* 好友列表 */}
        <div className="px-5 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
              <p style={{ color: 'rgba(42,58,74,0.5)' }}>加载中...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users size={48} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <p className="mt-4 text-base" style={{ color: 'rgba(42,58,74,0.5)' }}>
                {search ? '没有找到匹配的好友' : '还没有好友，快去添加吧'}
              </p>
            </div>
          ) : (
            filteredFriends.map((friend, idx) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <FriendCard
                  friend={friend}
                  onDelete={handleDelete}
                  onAskQuestion={handleAskQuestion}
                  onEditRemark={handleEditRemark}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* 添加好友弹窗 */}
      <AddFriend
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddFriend}
      />

      {/* 匿名提问弹窗 */}
      <AnonymousQuestion
        isOpen={questionOpen}
        onClose={() => setQuestionOpen(false)}
        friend={selectedFriend}
        onSubmit={handleSubmitQuestion}
        remaining={remainingQuestions}
      />

      {/* 编辑备注弹窗 */}
      <EditRemark
        isOpen={remarkOpen}
        onClose={() => setRemarkOpen(false)}
        friend={selectedFriend}
        onSave={handleSaveRemark}
      />

      {/* 匿名提问收件箱 */}
      <InboxQModal
        items={inboxQItems}
        isOpen={inboxQOpen}
        onClose={() => setInboxQOpen(false)}
        onRead={handleInboxQRead}
        onReply={handleInboxQReply}
      />
    </div>
  )
}
