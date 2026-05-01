/* ============================================
   WolfGame 题库 — 趣味开放问题（无预设选项）
   ============================================ */

export const QUESTIONS = [
  { id: 1, text: '如果流落荒岛，你最想带什么？' },
  { id: 2, text: '周末你最喜欢怎么过？' },
  { id: 3, text: '早餐你通常吃什么？' },
  { id: 4, text: '遇到恐怖片你会怎么做？' },
  { id: 5, text: '下雨天你的心情怎么样？' },
  { id: 6, text: '如果变成动物，你想当什么？' },
  { id: 7, text: '手机没电时你的第一反应是？' },
  { id: 8, text: '你的朋友圈更新频率是？' },
  { id: 9, text: '吵架后通常谁先低头？' },
  { id: 10, text: '你最喜欢的季节是哪个？' },
  { id: 11, text: '面对陌生人搭讪你会？' },
  { id: 12, text: '旅行时你是什么类型？' },
  { id: 13, text: '玩游戏时你的风格是？' },
  { id: 14, text: '收到礼物时最希望是？' },
  { id: 15, text: '深夜饿了你会怎么做？' },
  { id: 16, text: '如果有时光机你想去哪？' },
  { id: 17, text: '聚会时你通常在哪？' },
  { id: 18, text: '你最讨厌的家务是？' },
  { id: 19, text: '如果中了一千万你会？' },
  { id: 20, text: '你的口头禅是什么风格？' },
]

/* AI 羊的预设回答池（按问题类型大致分类） */
export const AI_ANSWERS = [
  // 食物类
  '必须是火锅！', '奶茶续命', '豆浆油条yyds', '泡面解决一切',
  '只爱咖啡', '甜点控', '烧烤绝绝子', '清淡养生',
  // 活动类
  '宅家追剧', '户外暴走', '睡觉至上', '打游戏',
  '看书充电', '运动健身', '逛街购物', '画画创作',
  // 性格类
  '先道歉再说', '冷战到底', '看对方态度', '主动和好',
  // 态度类
  '佛系随缘', '胜负欲爆棚', '随便都行', '必须赢',
  // 情绪类
  'emo了', '超治愈', '没感觉', '想睡觉',
  // 搞怪类
  '笑死', '绝了', '狠狠爱了', '离谱',
  // 通用
  '看心情', '不知道', '都可以', '都行吧',
  '肯定选A', '我全都要', '拒绝回答', '秘密',
]

export function getRandomQuestion(usedIds = new Set()) {
  const available = QUESTIONS.filter((q) => !usedIds.has(q.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

export function getRandomAIAnswer() {
  return AI_ANSWERS[Math.floor(Math.random() * AI_ANSWERS.length)]
}
