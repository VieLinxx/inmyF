import { motion } from 'framer-motion'
import { RotateCcw, Home, Crown } from 'lucide-react'

/* ============================================
   GameResult 游戏结算页 — Circa 风格
   - 明亮活泼配色
   - 3D 圆角卡片
   - 大号趣味排版
   ============================================ */

export default function GameResult({ finalWolf, roundCount, players, onRestart, onBack }) {
  const wolfHistory = players.filter((p) => (p.wolfCount || 0) > 0)

  return (
    <div className="flex flex-col items-center h-full px-6 pt-8 pb-6">
      {/* 标题 */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-3 flex items-center justify-center mx-auto"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
            border: '4px solid #F48C06',
            boxShadow: '0 8px 24px rgba(244, 140, 6, 0.20)',
          }}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        >
          <span className="text-4xl">🏆</span>
        </motion.div>
        <h2
          className="font-bold"
          style={{ fontSize: '28px', color: '#1D3557', letterSpacing: '-0.5px' }}
        >
          游戏结束
        </h2>
        <p className="text-sm mt-1 font-medium" style={{ color: '#6C757D' }}>
          共进行了 {roundCount} 轮挑战
        </p>
      </motion.div>

      {/* 最终狼展示 */}
      <motion.div
        className="flex flex-col items-center mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
      >
        <div
          className="relative flex items-center justify-center mb-3"
          style={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: finalWolf?.avatarColor || 'linear-gradient(135deg, #F48C06 0%, #F72585 100%)',
            border: '4px solid #F72585',
            boxShadow: '0 8px 32px rgba(247, 37, 133, 0.30)',
          }}
        >
          <span className="text-5xl">{finalWolf?.avatarEmoji || '🐺'}</span>
          <div
            className="absolute -bottom-1 -right-1 flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F48C06 0%, #F72585 100%)',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(247, 37, 133, 0.30)',
            }}
          >
            <Crown size={18} color="#fff" />
          </div>
        </div>
        <p className="font-bold text-xl" style={{ color: '#F72585' }}>
          {finalWolf?.name || '神秘狼人'}
        </p>
        <p className="text-xs mt-1 font-medium" style={{ color: '#ADB5BD' }}>
          最终狼人
        </p>
      </motion.div>

      {/* 统计卡片 — 3D 白卡 */}
      <motion.div
        className="w-full p-5 mb-5"
        style={{
          borderRadius: 24,
          background: '#FFFFFF',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: '#4361EE' }}>
              {roundCount}
            </p>
            <p className="text-xs mt-1 font-medium" style={{ color: '#6C757D' }}>
              总回合
            </p>
          </div>
          <div className="w-px h-12" style={{ background: '#F1F3F5' }} />
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: '#F72585' }}>
              {wolfHistory.length}
            </p>
            <p className="text-xs mt-1 font-medium" style={{ color: '#6C757D' }}>
              当过狼
            </p>
          </div>
          <div className="w-px h-12" style={{ background: '#F1F3F5' }} />
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: '#4CC9F0' }}>
              {players.length - wolfHistory.length}
            </p>
            <p className="text-xs mt-1 font-medium" style={{ color: '#6C757D' }}>
              一直是羊
            </p>
          </div>
        </div>
      </motion.div>

      {/* 狼人历史 */}
      <motion.div
        className="w-full flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs font-bold mb-3 px-1" style={{ color: '#6C757D' }}>
          📝 狼人更替记录
        </p>
        {wolfHistory.map((p, i) => (
          <motion.div
            key={p.id}
            className="flex items-center gap-3 px-4 py-3 mb-2"
            style={{
              borderRadius: 18,
              background: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.06 }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base"
              style={{
                background: p.avatarColor || '#DEE2E6',
              }}
            >
              {p.avatarEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: '#1D3557' }}>
                {p.name}
              </p>
              <p className="text-[11px] font-medium" style={{ color: '#ADB5BD' }}>
                当过 {p.wolfCount || 0} 次狼
              </p>
            </div>
            {p.id === finalWolf?.id && (
              <span
                className="text-[10px] font-bold px-3 py-1 rounded-full"
                style={{
                  background: '#FFF0F3',
                  color: '#F72585',
                  border: '2px solid #F72585',
                }}
              >
                最终狼
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* 底部按钮 */}
      <motion.div
        className="w-full flex flex-col gap-3 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          className="w-full flex items-center justify-center gap-2 text-white font-bold"
          style={{
            height: 56,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
            boxShadow: '0 8px 24px rgba(67, 97, 238, 0.30)',
            fontSize: '17px',
          }}
          onClick={onRestart}
          whileTap={{ scale: 0.96 }}
        >
          <RotateCcw size={20} />
          再来一局
        </motion.button>

        <motion.button
          className="w-full flex items-center justify-center gap-2 font-bold"
          style={{
            height: 50,
            borderRadius: 20,
            background: '#FFFFFF',
            border: '2px solid #ADB5BD',
            color: '#6C757D',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
          onClick={onBack}
          whileTap={{ scale: 0.96 }}
        >
          <Home size={18} />
          返回大厅
        </motion.button>
      </motion.div>
    </div>
  )
}
