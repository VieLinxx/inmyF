import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ============================================
   EmotionDiary 情绪日记
   - 底部滑出 60% 高弹窗
   - Emoji 5列×4行，选中金色边框+放大
   - 50字文字输入
   - mock 提交 → 触发庆祝回调
   ============================================ */

const EMOJIS = [
  '😊', '😂', '😭', '❤️', '😡',
  '😱', '🥺', '😴', '🎉', '💪',
  '🌧️', '☀️', '🤔', '😎', '🥰',
  '🙃', '😰', '🤗', '💔', '✨',
]

/* ============================================
   Emoji 分类 + 鼓励语匹配
   ============================================ */

const EMOJI_CATEGORIES = {
  positive: ['😊', '😂', '🎉', '🥰', '✨', '☀️', '❤️', '😎', '🤗'],
  calm: ['🤔', '☀️'],
  sad: ['😭', '🥺', '🌧️', '💔', '😰', '🙃'],
  tired: ['😴', '😰', '💪'],
  other: ['😡', '😱', '🎉', '💪', '🌧️'],
}

const CATEGORY_MESSAGES = {
  positive: [
    '你的快乐像小猫打滚一样，值得被庆祝一万遍。',
    '这一刻的开心是你的，谁也拿不走。喵~',
    '看你开心，小猫也忍不住摇了摇尾巴。',
    '今天的光，是你自己发出的呀。',
    '记住这种感觉，它是你内心有光的最好证明。',
  ],
  calm: [
    '平静也是一种力量，你在和自己好好相处。',
    '什么都不想，也是一种重要的感受。',
    '你今天看起来像一片温柔的湖。',
  ],
  sad: [
    '眼泪不是软弱，是你心里下了场雨，雨后会有新的东西长出来。',
    '今天辛苦了。你的难过不是负担，是你在乎过的证明。',
    '悲伤也值得被温柔对待，它只是另一种形式的爱。',
    '今晚如果有点难熬，小猫会陪着你，一直到天亮。',
    '你不必逼自己好起来，在这里你可以先做一会儿雨天。',
  ],
  tired: [
    '累了吗？今天的你已经做了很多了，剩下的交给明天吧。',
    '你不需要一直奔跑。停下来也是被允许的，甚至是值得庆祝的。',
  ],
  other: [
    '谢谢你愿意记录这一刻，每一种感受都值得被看见。',
    '你会因快乐而发光，也可以在悲伤里休息。都好。',
    '今天的一切感受，都是你活过的证明。我们明天见。',
    '没有好坏对错，只有真实的你。这儿永远欢迎你。',
    '感受就是感受，不需要被评判，只需要被看见。',
  ],
}

function getCategory(emoji) {
  if (EMOJI_CATEGORIES.positive.includes(emoji)) return 'positive'
  if (EMOJI_CATEGORIES.calm.includes(emoji)) return 'calm'
  if (EMOJI_CATEGORIES.sad.includes(emoji)) return 'sad'
  if (EMOJI_CATEGORIES.tired.includes(emoji)) return 'tired'
  return 'other'
}

function getEncouragementMessage(emoji) {
  const category = getCategory(emoji)
  const messages = CATEGORY_MESSAGES[category]
  return messages[Math.floor(Math.random() * messages.length)]
}

export default function EmotionDiary({ isOpen, onClose, onSubmit }) {
  const [selectedEmoji, setSelectedEmoji] = useState(null)
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    if (!selectedEmoji) return
    const message = getEncouragementMessage(selectedEmoji)
    onSubmit({
      emoji: selectedEmoji,
      note: note.trim(),
      date: new Date().toISOString(),
      message,
    })
    setSelectedEmoji(null)
    setNote('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 弹窗 */}
          <motion.div
            className="fixed left-0 right-0 z-[70] flex flex-col"
            style={{
              maxWidth: '430px',
              margin: '0 auto',
              bottom: 0,
              height: '60%',
              maxHeight: '500px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 顶部拖拽条 */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: '#d1d5db' }}
              />
            </div>

            {/* 标题 */}
            <div className="px-6 pt-2 pb-4">
              <h3
                className="text-center font-medium"
                style={{ fontSize: '18px', color: '#3a4a5a' }}
              >
                今天感觉怎么样？
              </h3>
            </div>

            {/* Emoji 网格 5×4 */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="grid grid-cols-5 gap-3">
                {EMOJIS.map((emoji) => {
                  const isSelected = selectedEmoji === emoji
                  return (
                    <motion.button
                      key={emoji}
                      className="flex items-center justify-center aspect-square rounded-2xl"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, #fff9e6 0%, #fff0c2 100%)'
                          : 'rgba(245, 247, 250, 0.8)',
                        border: isSelected
                          ? '2px solid #e6a817'
                          : '2px solid transparent',
                        fontSize: '1.8rem',
                      }}
                      onClick={() => setSelectedEmoji(emoji)}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: isSelected ? 1.15 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      {emoji}
                    </motion.button>
                  )
                })}
              </div>

              {/* 文字输入 */}
              <div className="mt-5 mb-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="写点什么...（可选）"
                  maxLength={50}
                  rows={3}
                  className="w-full resize-none rounded-2xl p-4"
                  style={{
                    fontSize: '15px',
                    color: '#3a4a5a',
                    background: 'rgba(245, 247, 250, 0.8)',
                    border: '1px solid rgba(220, 225, 230, 0.5)',
                    outline: 'none',
                  }}
                />
                <p
                  className="text-right mt-1"
                  style={{ fontSize: '12px', color: '#b0b8c4' }}
                >
                  {note.length}/50
                </p>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="px-6 pb-6 pt-2">
              <motion.button
                className="w-full text-white font-medium"
                style={{
                  height: '52px',
                  borderRadius: '16px',
                  background: selectedEmoji
                    ? 'linear-gradient(135deg, #e6a817 0%, #f0c040 100%)'
                    : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                  boxShadow: selectedEmoji
                    ? '0 4px 20px rgba(230, 168, 23, 0.3)'
                    : 'none',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleSubmit}
                disabled={!selectedEmoji}
                whileTap={selectedEmoji ? { scale: 0.97 } : {}}
              >
                记录今天的心情
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
