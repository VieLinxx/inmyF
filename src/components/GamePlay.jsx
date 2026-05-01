import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Send, CheckCircle, Lightbulb, MessageSquareText } from 'lucide-react'

/* ============================================
   GamePlay 核心游戏界面 — 自定义回答模式
   - answering: 羊输入自定义文字回答
   - guessing: 狼从回答卡片中猜是谁写的
   ============================================ */

export default function GamePlay({
  phase,
  players,
  currentWolf,
  currentUser,
  question,
  timer,
  round,
  mistakes,
  sheepAnswers,
  onSubmitAnswer,
  onSubmitGuess,
  onSelectRandomQuestion,
  onUseCustomQuestion,
  judgmentResult,
}) {
  const [answerText, setAnswerText] = useState('')
  const [customQ, setCustomQ] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const isWolf = currentUser?.id === currentWolf?.id
  const isAnswering = phase === 'answering'
  const isGuessing = phase === 'guessing'
  const isJudgment = phase === 'judgment'

  const myAnswer = sheepAnswers?.[currentUser?.id]
  const hasAnswered = !!myAnswer

  // 收集所有羊的回答（用于狼猜测展示）
  const answerEntries = Object.entries(sheepAnswers || {})
    .map(([pid, text]) => {
      const p = players.find((pl) => pl.id === pid)
      return { playerId: pid, text, player: p }
    })
    .filter((e) => e.text)

  useEffect(() => {
    setAnswerText('')
    setSelectedAnswer(null)
    setSelectedPlayer(null)
    setShowCustom(false)
    setCustomQ('')
  }, [phase, round])

  const handleAnswerSubmit = () => {
    if (!answerText.trim()) return
    onSubmitAnswer?.(answerText)
  }

  const handleAnswerCardClick = (entry) => {
    if (isGuessing && isWolf) {
      setSelectedAnswer(entry)
      setSelectedPlayer(null)
    }
  }

  const handlePlayerClick = (player) => {
    if (isGuessing && isWolf && selectedAnswer) {
      setSelectedPlayer(player)
    }
  }

  const handleGuessSubmit = () => {
    if (isGuessing && isWolf && selectedAnswer && selectedPlayer) {
      onSubmitGuess?.({ answerText: selectedAnswer.text, playerId: selectedPlayer.id })
    }
  }

  const handleCustomQuestion = () => {
    if (customQ.trim()) {
      onUseCustomQuestion?.(customQ.trim())
      setCustomQ('')
      setShowCustom(false)
    }
  }

  if (phase === 'roleReveal') return <RoleReveal isWolf={isWolf} />
  if (phase === 'wolfSelectsQuestion') {
    return (
      <WolfSelectsQuestion
        isWolf={isWolf}
        currentWolf={currentWolf}
        onSelectRandomQuestion={onSelectRandomQuestion}
        onUseCustomQuestion={onUseCustomQuestion}
      />
    )
  }
  if (isJudgment) {
    return (
      <JudgmentView
        isWolf={isWolf}
        mistakes={mistakes}
        currentWolf={currentWolf}
        judgmentResult={judgmentResult}
      />
    )
  }

  return (
    <div className="flex flex-col h-full px-5 pt-4 pb-6">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: isWolf ? '#FFF0F3' : '#E0F7FA',
              color: isWolf ? '#F72585' : '#0288D1',
              border: isWolf ? '2px solid #F72585' : '2px solid #4CC9F0',
            }}
          >
            {isWolf ? '🐺 狼人' : '🐑 羊'}
          </span>
          <span className="text-xs font-medium" style={{ color: '#ADB5BD' }}>
            第 {round} 轮
          </span>
        </div>
        {isWolf && (
          <span className="text-xs font-bold" style={{ color: '#F72585' }}>
            失误 {mistakes} / 2
          </span>
        )}
      </div>

      {/* 题目区域 */}
      <AnimatePresence mode="wait">
        {(phase === 'question' || phase === 'answering') && (
          <motion.div
            key="question-area"
            className="mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              className="p-5"
              style={{
                borderRadius: 24,
                background: '#FFFFFF',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-start gap-2.5 mb-3">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #F48C06 0%, #F72585 100%)',
                  }}
                >
                  <Lightbulb size={16} color="#fff" />
                </div>
                <p
                  className="font-bold leading-relaxed"
                  style={{ fontSize: '17px', color: '#1D3557' }}
                >
                  {question?.text || '等待题目...'}
                </p>
              </div>

              {!isWolf && phase === 'question' && (
                <p className="text-xs mt-3 font-medium" style={{ color: '#ADB5BD' }}>
                  🕐 准备开始回答...
                </p>
              )}
            </div>

            {/* 倒计时条 */}
            {isAnswering && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Timer size={16} style={{ color: timer <= 5 ? '#F72585' : '#F48C06' }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: timer <= 5 ? '#F72585' : '#F48C06' }}
                    >
                      {timer}s
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#ADB5BD' }}>
                    {!isWolf
                      ? hasAnswered
                        ? '✓ 已提交，等待其他羊'
                        : '写下你的回答'
                      : '⏳ 等待羊群回答...'}
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full overflow-hidden"
                  style={{ background: '#F1F3F5' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        timer <= 5
                          ? '#F72585'
                          : 'linear-gradient(90deg, #F48C06 0%, #F72585 100%)',
                    }}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timer / 30) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 回答输入区（羊视角） ===== */}
      {isAnswering && !isWolf && !hasAnswered && (
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-bold mb-3" style={{ color: '#6C757D' }}>
            ✍️ 写下你的真实回答
          </p>
          <div
            className="flex-1 flex flex-col"
            style={{
              borderRadius: 24,
              background: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              padding: 16,
            }}
          >
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="随便写，越真实越好..."
              maxLength={50}
              rows={3}
              className="w-full flex-1 resize-none text-sm font-medium"
              style={{
                color: '#1D3557',
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#ADB5BD' }}>
                {answerText.length}/50
              </span>
              <motion.button
                className="px-5 py-2 text-white text-xs font-bold"
                style={{
                  borderRadius: 14,
                  background: answerText.trim()
                    ? 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)'
                    : '#DEE2E6',
                  boxShadow: answerText.trim()
                    ? '0 4px 12px rgba(67, 97, 238, 0.25)'
                    : 'none',
                }}
                onClick={handleAnswerSubmit}
                disabled={!answerText.trim()}
                whileTap={answerText.trim() ? { scale: 0.95 } : {}}
              >
                提交回答
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 羊已提交提示 */}
      {isAnswering && !isWolf && hasAnswered && (
        <motion.div
          className="flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl"
          style={{
            background: '#E0F7FA',
            border: '2px solid #4CC9F0',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle size={18} style={{ color: '#0288D1' }} />
          <span className="text-sm font-bold" style={{ color: '#0288D1' }}>
            已提交：「{myAnswer}」
          </span>
        </motion.div>
      )}

      {/* 狼等待提示 */}
      {isAnswering && isWolf && (
        <motion.div
          className="flex flex-col items-center justify-center flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-5xl mb-3"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🐺
          </motion.div>
          <p className="text-sm font-bold" style={{ color: '#6C757D' }}>
            正在收集羊群回答...
          </p>
          <p className="text-xs mt-1" style={{ color: '#ADB5BD' }}>
            {answerEntries.length} / {players.filter((p) => p.id !== currentWolf?.id).length} 人已回答
          </p>
        </motion.div>
      )}

      {/* ===== 猜测区（狼视角） ===== */}
      {isGuessing && (
        <motion.div
          className="flex-1 flex flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {!isWolf ? (
            /* 羊等待视角 */
            <div className="flex flex-col items-center justify-center flex-1">
              <motion.div
                className="text-5xl mb-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🐺
              </motion.div>
              <p className="text-sm font-bold" style={{ color: '#6C757D' }}>
                狼人正在分析回答...
              </p>
            </div>
          ) : (
            /* 狼猜测视角 */
            <>
              <p className="text-xs font-bold mb-3" style={{ color: '#6C757D' }}>
                📝 所有回答（点击一个，再猜是谁写的）
              </p>

              {/* 回答卡片列表 */}
              <div className="flex-1 overflow-y-auto pb-2">
                <div className="flex flex-col" style={{ gap: 10 }}>
                  {answerEntries.map((entry, idx) => {
                    const isSel = selectedAnswer?.text === entry.text && selectedAnswer?.playerId === entry.playerId
                    return (
                      <motion.button
                        key={`${entry.playerId}-${idx}`}
                        className="flex items-center gap-3 px-4 py-3 text-left"
                        style={{
                          borderRadius: 18,
                          background: isSel ? '#FFF0F3' : '#FFFFFF',
                          border: isSel ? '3px solid #F72585' : '2px solid #F1F3F5',
                          boxShadow: isSel
                            ? '0 4px 16px rgba(247, 37, 133, 0.15)'
                            : '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                        onClick={() => handleAnswerCardClick(entry)}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageSquareText
                          size={18}
                          style={{ color: isSel ? '#F72585' : '#4361EE', flexShrink: 0 }}
                        />
                        <span
                          className="text-sm font-bold flex-1"
                          style={{ color: '#1D3557' }}
                        >
                          {entry.text}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* 选中回答后选择玩家 */}
                {selectedAnswer && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p
                      className="text-xs font-bold mb-3"
                      style={{ color: '#F72585' }}
                    >
                      🎯 「{selectedAnswer.text}」是谁写的？
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {players
                        .filter((p) => p.id !== currentWolf?.id)
                        .map((player) => {
                          const isSel = selectedPlayer?.id === player.id
                          return (
                            <motion.button
                              key={player.id}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl"
                              style={{
                                background: isSel ? '#EEF2FF' : '#FFFFFF',
                                border: isSel ? '3px solid #4361EE' : '2px solid #F1F3F5',
                                boxShadow: isSel
                                  ? '0 4px 12px rgba(67, 97, 238, 0.20)'
                                  : '0 2px 6px rgba(0,0,0,0.04)',
                              }}
                              onClick={() => handlePlayerClick(player)}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="text-lg">{player.avatarEmoji}</span>
                              <span className="text-xs font-bold" style={{ color: '#1D3557' }}>
                                {player.name}
                              </span>
                            </motion.button>
                          )
                        })}
                    </div>

                    {selectedPlayer && (
                      <motion.button
                        className="w-full flex items-center justify-center gap-2 text-white font-bold mt-4"
                        style={{
                          height: 54,
                          borderRadius: 20,
                          background: 'linear-gradient(135deg, #F48C06 0%, #F72585 100%)',
                          boxShadow: '0 8px 24px rgba(247, 37, 133, 0.30)',
                          fontSize: '17px',
                        }}
                        onClick={handleGuessSubmit}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Send size={18} />
                        确认：「{selectedAnswer.text}」是 {selectedPlayer.name} 写的
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ===================== 子组件 ===================== */

function WolfSelectsQuestion({ isWolf, currentWolf, onSelectRandomQuestion, onUseCustomQuestion }) {
  const [customQ, setCustomQ] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleConfirmCustom = () => {
    if (customQ.trim()) {
      onUseCustomQuestion?.(customQ.trim())
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <motion.div
        className="flex flex-col items-center w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div
          className="mb-5 flex items-center justify-center"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4E6 100%)',
            border: '3px solid #F72585',
            boxShadow: '0 8px 24px rgba(247, 37, 133, 0.20)',
          }}
        >
          <span className="text-4xl">🐺</span>
        </div>

        <h2
          className="font-bold text-2xl mb-2 text-center"
          style={{ color: '#1D3557' }}
        >
          {isWolf ? '轮到你了，狼人！' : '狼人正在出题...'}
        </h2>
        <p className="text-sm text-center font-medium mb-6" style={{ color: '#6C757D' }}>
          {isWolf
            ? '选择一道题目或自己出题'
            : `${currentWolf?.name || '狼人'} 正在选择题目，请稍候`}
        </p>

        {isWolf ? (
          <div className="w-full flex flex-col gap-3">
            {!showInput ? (
              <>
                <motion.button
                  className="w-full flex items-center justify-center gap-2 text-white font-bold"
                  style={{
                    height: 56,
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
                    boxShadow: '0 8px 24px rgba(67, 97, 238, 0.30)',
                    fontSize: '17px',
                  }}
                  onClick={onSelectRandomQuestion}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-xl">🎲</span>
                  随机题目
                </motion.button>

                <motion.button
                  className="w-full flex items-center justify-center gap-2 font-bold"
                  style={{
                    height: 56,
                    borderRadius: 20,
                    background: '#FFFFFF',
                    border: '3px solid #F72585',
                    color: '#F72585',
                    fontSize: '17px',
                    boxShadow: '0 4px 12px rgba(247, 37, 133, 0.10)',
                  }}
                  onClick={() => setShowInput(true)}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-xl">✏️</span>
                  自定义问题
                </motion.button>
              </>
            ) : (
              <motion.div
                className="w-full flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <input
                  type="text"
                  value={customQ}
                  onChange={(e) => setCustomQ(e.target.value)}
                  placeholder="输入你的问题..."
                  maxLength={60}
                  className="w-full px-4 py-3.5 text-sm font-bold"
                  style={{
                    background: '#F8F9FA',
                    border: '3px solid #F72585',
                    color: '#1D3557',
                    borderRadius: 20,
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 text-white font-bold"
                    style={{
                      height: 50,
                      borderRadius: 18,
                      background: customQ.trim()
                        ? 'linear-gradient(135deg, #F48C06 0%, #F72585 100%)'
                        : '#DEE2E6',
                      boxShadow: customQ.trim()
                        ? '0 4px 16px rgba(247, 37, 133, 0.25)'
                        : 'none',
                      fontSize: '16px',
                    }}
                    onClick={handleConfirmCustom}
                    disabled={!customQ.trim()}
                    whileTap={customQ.trim() ? { scale: 0.96 } : {}}
                  >
                    确认出题
                  </motion.button>
                  <motion.button
                    className="px-5 font-bold"
                    style={{
                      height: 50,
                      borderRadius: 18,
                      background: '#FFFFFF',
                      border: '2px solid #ADB5BD',
                      color: '#6C757D',
                      fontSize: '15px',
                    }}
                    onClick={() => {
                      setShowInput(false)
                      setCustomQ('')
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    取消
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl mb-2">🐑</span>
            <p className="text-sm font-medium" style={{ color: '#ADB5BD' }}>
              等待中...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function RoleReveal({ isWolf }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="mb-5 flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: isWolf
              ? 'linear-gradient(135deg, #FFF0F3 0%, #FFE4E6 100%)'
              : 'linear-gradient(135deg, #E0F7FA 0%, #E3F2FD 100%)',
            border: isWolf ? '4px solid #F72585' : '4px solid #4CC9F0',
            boxShadow: isWolf
              ? '0 8px 32px rgba(247, 37, 133, 0.20)'
              : '0 8px 32px rgba(76, 201, 240, 0.20)',
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-6xl">{isWolf ? '🐺' : '🐑'}</span>
        </motion.div>

        <motion.h2
          className="font-bold text-3xl mb-2"
          style={{ color: isWolf ? '#F72585' : '#4361EE' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isWolf ? '你是狼人！' : '你是羊'}
        </motion.h2>

        <motion.p
          className="text-sm text-center font-medium"
          style={{ color: '#6C757D' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isWolf
            ? '提出问题，从回答中找出是谁写的'
            : '诚实回答问题，小心别被狼发现你的风格'}
        </motion.p>
      </motion.div>
    </div>
  )
}

function JudgmentView({ isWolf, mistakes, currentWolf, judgmentResult }) {
  const isCorrect = judgmentResult?.isCorrect

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <motion.div
          className="mb-5 flex items-center justify-center"
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: isCorrect
              ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
              : '#FFF3E0',
            border: isCorrect ? '4px solid #43A047' : '4px solid #FF9800',
          }}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <span className="text-5xl">
            {isCorrect ? '🎯' : isWolf ? '💨' : '👀'}
          </span>
        </motion.div>

        <h2 className="font-bold text-2xl mb-2" style={{ color: '#1D3557' }}>
          {isCorrect
            ? '🎉 猜对了！身份转移'
            : isWolf
              ? '😅 猜错了...'
              : '🔍 狼人在行动'}
        </h2>

        {judgmentResult && (
          <p className="text-sm text-center font-medium mt-1" style={{ color: '#6C757D' }}>
            狼猜「{judgmentResult.answerText}」是 {judgmentResult.playerName} 写的
            {isCorrect ? '，完全正确！' : '，其实不对...'}
          </p>
        )}

        {isWolf && !isCorrect && (
          <p className="text-sm font-bold mt-2" style={{ color: '#F72585' }}>
            失误 {mistakes} / 2，再错就换新题
          </p>
        )}

        {!isWolf && (
          <p className="text-sm font-medium" style={{ color: '#6C757D' }}>
            {currentWolf?.name} 正在猜测...
          </p>
        )}
      </motion.div>
    </div>
  )
}
