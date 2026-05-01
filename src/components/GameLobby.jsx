import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Share2, Play, Users } from 'lucide-react'

/* ============================================
   GameLobby 游戏大厅 — Circa 风格
   - 明亮靛蓝主色调 + 薄荷绿点缀
   - 3D 圆角卡片 + 柔和阴影
   - 活泼童趣排版
   ============================================ */

const ANIMAL_EMOJIS = ['🐰', '🦊', '🐼', '🐨', '🐯', '🐷', '🐸', '🦄', '🐥', '🐹']

const AVATAR_COLORS = [
  'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  'linear-gradient(135deg, #4CC9F0 0%, #4361EE 100%)',
  'linear-gradient(135deg, #70E1F5 0%, #FFD194 100%)',
  'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
]

function getRandomAnimal() {
  return ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)]
}

function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export default function GameLobby({ players, roomCode, isHost, onStart, onInvite }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onlinePlayers = players.filter((p) => p.online !== false)
  const canStart = onlinePlayers.length >= 2

  const maxArc = 140
  const radius = 130
  const centerX = 0
  const centerY = 60

  return (
    <div className="flex flex-col items-center h-full px-6 pt-4">
      {/* 标题 */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2
          className="font-bold"
          style={{ fontSize: '28px', color: '#1D3557', letterSpacing: '-0.5px' }}
        >
          默契挑战 · 狼来了
        </h2>
        <p className="text-sm mt-1.5" style={{ color: '#6C757D' }}>
          躲好了 不要被大灰狼抓住哦 🐺
        </p>
      </motion.div>

      {/* 房间码卡片 — 3D 风格 */}
      <motion.div
        className="w-full p-5 mb-6"
        style={{
          borderRadius: 24,
          background: '#FFFFFF',
          boxShadow: '0 8px 32px rgba(67, 97, 238, 0.10), 0 2px 8px rgba(0,0,0,0.04)',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <p className="text-xs text-center mb-3 font-medium" style={{ color: '#6C757D' }}>
          房间号
        </p>
        <div className="flex items-center justify-center gap-3">
          {roomCode.split('').map((digit, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-center font-bold text-xl"
              style={{
                width: 44,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(67, 97, 238, 0.25)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              {digit}
            </motion.div>
          ))}
        </div>
        <motion.button
          className="flex items-center justify-center gap-1.5 mx-auto mt-4 text-xs font-bold"
          style={{ color: copied ? '#2a9d5c' : '#4361EE' }}
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? '已复制 ✓' : <><Copy size={14} /> 复制房间号</>}
        </motion.button>
      </motion.div>

      {/* 玩家半圆排列 */}
      <motion.div
        className="relative w-full flex-1 flex items-start justify-center"
        style={{ minHeight: 180 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {/* 中心装饰 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F48C06 0%, #F72585 100%)',
            boxShadow: '0 6px 24px rgba(247, 37, 133, 0.30)',
          }}
        >
          <span className="text-3xl">🐺</span>
        </div>

        {players.map((player, index) => {
          const total = players.length
          const angleDeg =
            total === 1
              ? -90
              : -maxArc / 2 + (index / Math.max(total - 1, 1)) * maxArc
          const angleRad = (angleDeg * Math.PI) / 180
          const x = centerX + radius * Math.cos(angleRad)
          const y = centerY + radius * Math.sin(angleRad)

          return (
            <motion.div
              key={player.id}
              className="absolute flex flex-col items-center"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `${y}px`,
                transform: 'translate(-50%, 0)',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: player.online === false ? 0.4 : 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 300 }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: player.avatarColor || getRandomColor(),
                  border: player.isHost
                    ? '3px solid #4361EE'
                    : player.online === false
                      ? '2px solid #DEE2E6'
                      : '3px solid #FFFFFF',
                  boxShadow: player.isHost
                    ? '0 4px 16px rgba(67, 97, 238, 0.35)'
                    : '0 4px 12px rgba(0,0,0,0.12)',
                }}
              >
                <span className="text-2xl">{player.avatarEmoji || getRandomAnimal()}</span>
                {player.isHost && (
                  <span
                    className="absolute -top-1.5 -right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: '#4361EE',
                      color: '#fff',
                      boxShadow: '0 2px 6px rgba(67, 97, 238, 0.3)',
                    }}
                  >
                    房主
                  </span>
                )}
              </div>
              <p
                className="text-xs font-bold mt-1.5 truncate max-w-[64px] text-center"
                style={{
                  color: player.online === false ? '#ADB5BD' : '#1D3557',
                }}
              >
                {player.name}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* 玩家数量提示 */}
      <div className="flex items-center gap-1.5 mb-4" style={{ color: '#6C757D' }}>
        <Users size={14} />
        <span className="text-xs font-medium">
          {onlinePlayers.length} / 8 人在线
        </span>
      </div>

      {/* 底部按钮 — 3D 风格 */}
      <motion.div
        className="w-full flex flex-col gap-3 pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          className="w-full flex items-center justify-center gap-2 text-white font-bold"
          style={{
            height: 56,
            borderRadius: 20,
            background: canStart
              ? 'linear-gradient(135deg, #F48C06 0%, #F72585 100%)'
              : '#DEE2E6',
            boxShadow: canStart
              ? '0 8px 24px rgba(247, 37, 133, 0.30)'
              : 'none',
            fontSize: '17px',
            transition: 'all 0.3s ease',
          }}
          onClick={onStart}
          disabled={!canStart}
          whileTap={canStart ? { scale: 0.96 } : {}}
        >
          <Play size={20} fill="#fff" />
          {canStart ? '开始游戏' : '至少需要 2 人'}
        </motion.button>

        <motion.button
          className="w-full flex items-center justify-center gap-2 font-bold"
          style={{
            height: 50,
            borderRadius: 20,
            background: '#FFFFFF',
            border: '2px solid #4361EE',
            color: '#4361EE',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.10)',
          }}
          onClick={onInvite}
          whileTap={{ scale: 0.96 }}
        >
          <Share2 size={18} />
          邀请好友
        </motion.button>
      </motion.div>
    </div>
  )
}
