import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/* ============================================
   Cat 视频猫咪组件
   - 占满父容器，视频 object-fit: contain
   - idle 视频循环，celebrate 单次播放
   - 双视频重叠 crossfade 过渡
   - 点击浅白色圆盘涟漪
   ============================================ */

export default function Cat({ celebrate, onCelebrateEnd }) {
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [ripples, setRipples] = useState([])
  const wrapRef = useRef(null)
  const idleRef = useRef(null)
  const celebRef = useRef(null)

  /* 外部触发庆祝（提交情绪日记时） */
  useEffect(() => {
    if (celebrate && !isCelebrating) {
      setIsCelebrating(true)
      idleRef.current?.pause()
      if (celebRef.current) {
        celebRef.current.currentTime = 0
        celebRef.current.play().catch(() => {})
      }
    }
  }, [celebrate, isCelebrating])

  /* 点击猫咪 */
  const handleClick = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // 添加涟漪
    const id = Date.now()
    setRipples((p) => [...p, { id, x, y }])
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 600)

    // 播放庆祝视频
    if (!isCelebrating) {
      setIsCelebrating(true)
      idleRef.current?.pause()
      if (celebRef.current) {
        celebRef.current.currentTime = 0
        celebRef.current.play().catch(() => {})
      }
    }
  }, [isCelebrating])

  /* 庆祝视频结束 → 回到 idle */
  const handleEnded = useCallback(() => {
    setIsCelebrating(false)
    if (idleRef.current) {
      idleRef.current.currentTime = 0
      idleRef.current.play().catch(() => {})
    }
    onCelebrateEnd?.()
  }, [onCelebrateEnd])

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Idle 视频：乖乖坐着，边缘柔化 */}
      <video
        ref={idleRef}
        src="/videos/乖乖坐着的样子.mp4"
        autoPlay
        muted
        playsInline
        loop
        webkit-playsinline="true"
        preload="auto"
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'contain',
          opacity: isCelebrating ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out',
          pointerEvents: 'none',
          // 边缘柔化：从中心向边缘渐变透明，与背景融合
          transform: 'scale(1.15)',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 55%, black 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 72%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 55%, black 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 72%, transparent 90%)',
        }}
      />

      {/* Celebrate 视频：开心打滚，边缘柔化 */}
      <video
        ref={celebRef}
        src="/videos/开心打滚.mp4"
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onEnded={handleEnded}
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'contain',
          opacity: isCelebrating ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
          pointerEvents: 'none',
          transform: 'scale(1.15)',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 55%, black 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 72%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 55%, black 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 72%, transparent 90%)',
        }}
      />

      {/* 触摸涟漪反馈：浅白色圆盘 */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="absolute pointer-events-none"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              width: 56,
              height: 56,
              marginLeft: -28,
              marginTop: -28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              boxShadow: '0 0 20px rgba(255,255,255,0.25)',
            }}
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
