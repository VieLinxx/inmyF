import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUserStore } from '../store/userStore'
import GameLobby from './GameLobby'
import GamePlay from './GamePlay'
import GameResult from './GameResult'
import { getRandomQuestion, getRandomAIAnswer } from './WolfGameQuestions'

/* ============================================
   WolfGame 主游戏状态机容器 — 自定义回答模式
   - 羊输入自定义文字回答
   - 狼从回答中猜是谁写的
   ============================================ */

const PHASES = {
  LOBBY: 'lobby',
  ROLE_REVEAL: 'roleReveal',
  WOLF_SELECTS_QUESTION: 'wolfSelectsQuestion',
  QUESTION: 'question',
  ANSWERING: 'answering',
  GUESSING: 'guessing',
  JUDGMENT: 'judgment',
  RESULT: 'result',
}

const AI_NAMES = ['小雨', '阿杰', '橙子', '小林', '夏天', '阿诺', '七七', '小鹿']
const AI_EMOJIS = ['🐰', '🦊', '🐼', '🐨', '🐯', '🐷', '🐸', '🦄']
const AI_COLORS = [
  'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  'linear-gradient(135deg, #4CC9F0 0%, #4361EE 100%)',
  'linear-gradient(135deg, #70E1F5 0%, #FFD194 100%)',
  'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
]

function generateRoomCode() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
}

function createAIPlayer(index) {
  return {
    id: `ai_${index}_${Date.now()}`,
    name: AI_NAMES[index % AI_NAMES.length],
    avatarEmoji: AI_EMOJIS[index % AI_EMOJIS.length],
    avatarColor: AI_COLORS[index % AI_COLORS.length],
    isHost: false,
    online: true,
    lastSeen: Date.now(),
    wolfCount: 0,
  }
}

export default function WolfGame() {
  const user = useUserStore((s) => s.user)
  const currentUserId = user?.id || 'me'
  const currentUserName = user?.nickname || '我'

  const [phase, setPhase] = useState(PHASES.LOBBY)
  const [players, setPlayers] = useState([])
  const [roomCode, setRoomCode] = useState('')
  const [currentWolf, setCurrentWolf] = useState(null)
  const [round, setRound] = useState(1)
  const [mistakes, setMistakes] = useState(0)
  const [timer, setTimer] = useState(30)
  const [question, setQuestion] = useState(null)
  const [sheepAnswers, setSheepAnswers] = useState({})
  const [usedQuestionIds, setUsedQuestionIds] = useState(new Set())
  const [finalWolf, setFinalWolf] = useState(null)
  const [judgmentResult, setJudgmentResult] = useState(null)

  const timerRef = useRef(null)

  // ===== 初始化 =====
  useEffect(() => {
    const code = generateRoomCode()
    setRoomCode(code)
    const hostPlayer = {
      id: currentUserId,
      name: currentUserName,
      avatarEmoji: '😎',
      avatarColor: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
      isHost: true,
      online: true,
      lastSeen: Date.now(),
      wolfCount: 0,
    }
    setPlayers([hostPlayer])
  }, [currentUserId, currentUserName])

  // ===== AI 玩家自动加入 =====
  useEffect(() => {
    if (phase !== PHASES.LOBBY) return
    if (players.length >= 6) return

    const interval = setInterval(() => {
      setPlayers((prev) => {
        if (prev.length >= 6) return prev
        const nextIndex = prev.filter((p) => p.id.startsWith('ai_')).length
        return [...prev, createAIPlayer(nextIndex)]
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [phase, players.length])

  // ===== 心跳 =====
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === currentUserId
            ? { ...p, lastSeen: Date.now() }
            : Math.random() > 0.1
              ? { ...p, lastSeen: Date.now() }
              : p
        )
      )
    }, 10000)
    return () => clearInterval(interval)
  }, [currentUserId])

  // ===== 离线检测 =====
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          online: now - p.lastSeen < 30000,
        }))
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ===== 开始游戏 =====
  const handleStart = useCallback(() => {
    const onlinePlayers = players.filter((p) => p.online !== false)
    if (onlinePlayers.length < 2) return

    const randomWolf =
      onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)]
    setCurrentWolf({ ...randomWolf, wolfCount: (randomWolf.wolfCount || 0) + 1 })
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === randomWolf.id
          ? { ...p, wolfCount: (p.wolfCount || 0) + 1 }
          : p
      )
    )
    setMistakes(0)
    setRound(1)
    setPhase(PHASES.ROLE_REVEAL)
  }, [players])

  // ===== 角色揭示后进入狼选题阶段 =====
  useEffect(() => {
    if (phase !== PHASES.ROLE_REVEAL) return
    const t = setTimeout(() => setPhase(PHASES.WOLF_SELECTS_QUESTION), 2500)
    return () => clearTimeout(t)
  }, [phase])

  // ===== 开始新题目 =====
  const startNewQuestion = useCallback(() => {
    const q = getRandomQuestion(usedQuestionIds)
    if (!q) {
      endGame()
      return
    }
    setUsedQuestionIds((prev) => new Set(prev).add(q.id))
    setQuestion(q)
    setSheepAnswers({})
    setMistakes(0)
    setPhase(PHASES.QUESTION)
  }, [usedQuestionIds])

  // ===== 狼选择随机题目 =====
  const handleSelectRandomQuestion = useCallback(() => {
    const q = getRandomQuestion(usedQuestionIds)
    if (!q) {
      endGame()
      return
    }
    setUsedQuestionIds((prev) => new Set(prev).add(q.id))
    setQuestion(q)
    setSheepAnswers({})
    setMistakes(0)
    setPhase(PHASES.QUESTION)
  }, [usedQuestionIds])

  // ===== 狼自定义题目 =====
  const handleCustomQuestion = useCallback((text) => {
    setQuestion({ id: `custom_${Date.now()}`, text })
    setSheepAnswers({})
    setPhase(PHASES.QUESTION)
  }, [])

  // ===== Question → Answering =====
  useEffect(() => {
    if (phase !== PHASES.QUESTION) return
    const delay = currentWolf?.id === currentUserId ? 3000 : 1500
    const t = setTimeout(() => {
      setTimer(30)
      setPhase(PHASES.ANSWERING)
    }, delay)
    return () => clearTimeout(t)
  }, [phase, currentWolf, currentUserId])

  // ===== Answering 倒计时 =====
  useEffect(() => {
    if (phase !== PHASES.ANSWERING) return
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setPhase(PHASES.GUESSING)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // ===== AI 羊自动回答（自定义文字） =====
  useEffect(() => {
    if (phase !== PHASES.ANSWERING) return

    const sheepPlayers = players.filter(
      (p) => p.id !== currentWolf?.id && p.online !== false
    )

    sheepPlayers.forEach((p) => {
      const delay = 3000 + Math.random() * 20000
      const t = setTimeout(() => {
        setSheepAnswers((prev) => {
          if (prev[p.id]) return prev
          return { ...prev, [p.id]: getRandomAIAnswer() }
        })
      }, delay)
      return () => clearTimeout(t)
    })
  }, [phase, players, currentWolf])

  // ===== 真人羊提交回答 =====
  const handleSubmitAnswer = useCallback((text) => {
    setSheepAnswers((prev) => ({ ...prev, [currentUserId]: text.trim() }))
  }, [currentUserId])

  // ===== 所有羊回答后进入 guessing =====
  useEffect(() => {
    if (phase !== PHASES.ANSWERING) return
    const sheepIds = players
      .filter((p) => p.id !== currentWolf?.id && p.online !== false)
      .map((p) => p.id)
    const allAnswered = sheepIds.every((id) => sheepAnswers[id])
    if (allAnswered && sheepIds.length > 0) {
      clearInterval(timerRef.current)
      const t = setTimeout(() => setPhase(PHASES.GUESSING), 800)
      return () => clearTimeout(t)
    }
  }, [phase, sheepAnswers, players, currentWolf])

  // ===== 狼猜测 =====
  const handleSubmitGuess = useCallback(
    ({ answerText, playerId }) => {
      const targetPlayer = players.find((p) => p.id === playerId)
      const actualAnswer = sheepAnswers[playerId]
      const isCorrect = actualAnswer === answerText

      setJudgmentResult({
        isCorrect,
        answerText,
        playerId,
        playerName: targetPlayer?.name,
      })

      if (isCorrect) {
        setCurrentWolf((prevWolf) => {
          const newWolf = { ...targetPlayer, wolfCount: (targetPlayer.wolfCount || 0) + 1 }
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === playerId
                ? { ...p, wolfCount: (p.wolfCount || 0) + 1 }
                : p
            )
          )
          return newWolf
        })
        setMistakes(0)
      } else {
        setMistakes((prev) => prev + 1)
      }

      setPhase(PHASES.JUDGMENT)
    },
    [players, sheepAnswers]
  )

  // ===== Judgment 后 =====
  useEffect(() => {
    if (phase !== PHASES.JUDGMENT) return
    const t = setTimeout(() => {
      if (mistakes >= 2) {
        setRound((prev) => prev + 1)
        startNewQuestion()
      } else if (judgmentResult?.isCorrect) {
        setPhase(PHASES.GUESSING)
      } else {
        setPhase(PHASES.GUESSING)
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [phase, mistakes, judgmentResult, startNewQuestion])

  // ===== 结束游戏 =====
  const endGame = useCallback(() => {
    setFinalWolf(currentWolf)
    setPhase(PHASES.RESULT)
  }, [currentWolf])

  // ===== 再来一局 =====
  const handleRestart = useCallback(() => {
    setUsedQuestionIds(new Set())
    setQuestion(null)
    setSheepAnswers({})
    setMistakes(0)
    setRound(1)
    setFinalWolf(null)
    setJudgmentResult(null)
    setCurrentWolf(null)

    const onlinePlayers = players.filter((p) => p.online !== false)
    if (onlinePlayers.length >= 2) {
      const randomWolf =
        onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)]
      setCurrentWolf({ ...randomWolf, wolfCount: (randomWolf.wolfCount || 0) + 1 })
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === randomWolf.id
            ? { ...p, wolfCount: (p.wolfCount || 0) + 1 }
            : { ...p, wolfCount: 0 }
        )
      )
      setPhase(PHASES.ROLE_REVEAL)
    } else {
      setPhase(PHASES.LOBBY)
    }
  }, [players])

  // ===== 返回大厅 =====
  const handleBackToLobby = useCallback(() => {
    setUsedQuestionIds(new Set())
    setQuestion(null)
    setSheepAnswers({})
    setMistakes(0)
    setRound(1)
    setFinalWolf(null)
    setJudgmentResult(null)
    setCurrentWolf(null)
    setPhase(PHASES.LOBBY)
  }, [])

  const currentUser = players.find((p) => p.id === currentUserId) || {
    id: currentUserId,
    name: currentUserName,
    avatarEmoji: '😎',
    avatarColor: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
  }

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {phase === PHASES.LOBBY && (
          <motion.div
            key="lobby"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GameLobby
              players={players}
              roomCode={roomCode}
              isHost={true}
              onStart={handleStart}
              onInvite={() => {}}
            />
          </motion.div>
        )}

        {(phase === PHASES.ROLE_REVEAL ||
          phase === PHASES.WOLF_SELECTS_QUESTION ||
          phase === PHASES.QUESTION ||
          phase === PHASES.ANSWERING ||
          phase === PHASES.GUESSING ||
          phase === PHASES.JUDGMENT) && (
          <motion.div
            key="play"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GamePlay
              phase={phase}
              players={players}
              currentWolf={currentWolf}
              currentUser={currentUser}
              question={question}
              timer={timer}
              round={round}
              mistakes={mistakes}
              sheepAnswers={sheepAnswers}
              onSubmitAnswer={handleSubmitAnswer}
              onSubmitGuess={handleSubmitGuess}
              onSelectRandomQuestion={handleSelectRandomQuestion}
              onUseCustomQuestion={handleCustomQuestion}
              judgmentResult={judgmentResult}
            />
          </motion.div>
        )}

        {phase === PHASES.RESULT && (
          <motion.div
            key="result"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GameResult
              finalWolf={finalWolf}
              roundCount={round}
              players={players}
              onRestart={handleRestart}
              onBack={handleBackToLobby}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
