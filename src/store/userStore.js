import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

/**
 * 用户状态管理 — Supabase 邮箱认证版
 */
export const useUserStore = create(
  persist(
    (set, get) => ({
      // 用户信息
      user: null,
      isLoggedIn: false,
      isAuthReady: false, // 标记 Supabase 会话恢复是否完成

      // 情绪记录列表（仍本地缓存，后续可迁移到 Supabase）
      emotionRecords: [],

      // ===== 初始化：恢复 Supabase 会话 =====
      initAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({
            user: {
              id: session.user.id,
              email: session.user.email,
              nickname: profile?.nickname || session.user.email?.split('@')[0],
              avatarEmoji: profile?.avatar_emoji || '😎',
              avatarColor: profile?.avatar_color || 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
            },
            isLoggedIn: true,
            isAuthReady: true,
          })
        } else {
          set({ isAuthReady: true })
        }
      },

      // ===== 监听认证状态变化 =====
      subscribeAuth: () => {
        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              set({
                user: {
                  id: session.user.id,
                  email: session.user.email,
                  nickname: profile?.nickname || session.user.email?.split('@')[0],
                  avatarEmoji: profile?.avatar_emoji || '😎',
                  avatarColor: profile?.avatar_color || 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
                },
                isLoggedIn: true,
              })
            }
            if (event === 'SIGNED_OUT') {
              set({ user: null, isLoggedIn: false })
            }
          }
        )
        return listener
      },

      // ===== 邮箱注册 =====
      signUp: async (email, password, nickname) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nickname },
          },
        })
        if (error) throw error

        // profile 由数据库 trigger 自动创建，这里手动更新昵称
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ nickname })
            .eq('id', data.user.id)
        }

        return data
      },

      // ===== 邮箱登录 =====
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        return data
      },

      // ===== 登出 =====
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, isLoggedIn: false, emotionRecords: [] })
      },

      // ===== 更新用户信息 =====
      updateUser: async (updates) => {
        const { user } = get()
        if (!user) return

        const dbUpdates = {}
        if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname
        if (updates.avatarEmoji !== undefined) dbUpdates.avatar_emoji = updates.avatarEmoji
        if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor

        if (Object.keys(dbUpdates).length > 0) {
          await supabase.from('profiles').update(dbUpdates).eq('id', user.id)
        }

        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },

      // ===== 从 Supabase 获取情绪记录 =====
      fetchEmotionRecords: async () => {
        const { user } = get()
        if (!user) return
        const { data, error } = await supabase
          .from('emotion_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_date', { ascending: false })
        if (!error && data) {
          set({ emotionRecords: data })
        }
      },

      // ===== 添加情绪记录到 Supabase =====
      addEmotionRecord: async (record) => {
        const { user } = get()
        if (!user) return
        const { data, error } = await supabase
          .from('emotion_records')
          .insert({
            user_id: user.id,
            emoji: record.emoji,
            note: record.note,
            message: record.message,
            recorded_date: record.date,
          })
          .select()
          .single()
        if (!error && data) {
          set((state) => ({
            emotionRecords: [data, ...state.emotionRecords],
          }))
        }
      },
    }),
    {
      name: 'inmyf-user-storage',
      partialize: (state) => ({
        // 不再持久化 emotionRecords，改从 Supabase 获取
      }),
    }
  )
)
