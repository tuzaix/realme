import { defineStore } from 'pinia'
import questionsData from '../data/questions.json'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    questions: [...questionsData.questions].sort(() => Math.random() - 0.5),
    answers: {},
    currentQuestionIndex: 0,
    result: null,
    // 卡密管理
    cards: [],
    activeCard: JSON.parse(localStorage.getItem('active_card') || 'null'),
    deviceId: localStorage.getItem('device_id') || Math.random().toString(36).substring(2, 15)
  }),
  actions: {
    // 从后端初始化卡密数据
    async initCards() {
      try {
        const response = await fetch('/api/cards')
        if (response.ok) {
          this.cards = await response.json()
        }
      } catch (error) {
        console.error('初始化卡密失败，回退到本地存储:', error)
        this.cards = JSON.parse(localStorage.getItem('quiz_cards') || '[]')
      }
    },
    // 保存卡密到后端文件
    async saveCards() {
      try {
        await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.cards)
        })
      } catch (error) {
        console.error('同步卡密到后端失败:', error)
      }
      // 同时保留 localStorage 备份
      localStorage.setItem('quiz_cards', JSON.stringify(this.cards))
    },
    // 生成卡密
    generateCard(durationDays, maxDevices) {
      return this.generateCardsBatch(1, durationDays, maxDevices)[0]
    },
    // 批量生成卡密
    generateCardsBatch(count, durationDays, maxDevices) {
      const newCodes = []
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      for (let i = 0; i < count; i++) {
        let code = ''
        for (let j = 0; j < 12; j++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        const newCard = {
          code,
          durationDays: Number(durationDays),
          maxDevices: Number(maxDevices),
          isActive: true,
          activatedAt: null,
          usedDevices: [],
          createdAt: new Date().toISOString()
        }
        this.cards.push(newCard)
        newCodes.push(code)
      }
      this.saveCards()
      return newCodes
    },
    // 验证卡密
    verifyCard(code) {
      const card = this.cards.find(c => c.code === code)
      if (!card) return { success: false, message: '卡密不存在' }
      if (!card.isActive) return { success: false, message: '卡密已禁用' }

      const now = new Date()
      
      // 如果未激活，进行首次激活
      if (!card.activatedAt) {
        card.activatedAt = now.toISOString()
        card.usedDevices.push(this.deviceId)
        this.activeCard = card
        localStorage.setItem('active_card', JSON.stringify(card))
        localStorage.setItem('device_id', this.deviceId)
        this.saveCards()
        return { success: true }
      }

      // 检查设备限制
      if (!card.usedDevices.includes(this.deviceId)) {
        if (card.usedDevices.length >= card.maxDevices) {
          return { success: false, message: '已达到最大可用设备数量' }
        }
        card.usedDevices.push(this.deviceId)
      }

      // 检查有效期
      const activatedDate = new Date(card.activatedAt)
      const expireDate = new Date(activatedDate.getTime() + card.durationDays * 24 * 60 * 60 * 1000)
      
      if (now > expireDate) {
        card.isActive = false
        this.saveCards()
        return { success: false, message: '卡密已过期' }
      }

      this.activeCard = card
      localStorage.setItem('active_card', JSON.stringify(card))
      this.saveCards()
      return { success: true }
    },
    // 后台管理操作
    updateCardStatus(code, isActive) {
      const card = this.cards.find(c => c.code === code)
      if (card) {
        card.isActive = isActive
        this.saveCards()
      }
    },
    deleteCard(code) {
      this.cards = this.cards.filter(c => c.code !== code)
      this.saveCards()
    },
    setAnswer(questionId, value) {
      this.answers[questionId] = value
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
      }
    },
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },
    calculateResult() {
      let totalScore = 0
      const dimensionScores = {}
      
      this.questions.forEach(q => {
        const answer = this.answers[q.id] || 3 // Default to middle value if missing
        let score = Number(answer)
        
        if (q.is_reverse) {
          score = 6 - score
        }
        
        totalScore += score
        
        const dimKey = q.dimension.key
        if (!dimensionScores[dimKey]) {
          dimensionScores[dimKey] = {
            name: q.dimension.name,
            score: 0,
            count: 0
          }
        }
        dimensionScores[dimKey].score += score
        dimensionScores[dimKey].count++
      })

      const avgScore = totalScore / this.questions.length
      const calculatedAge = Math.round(35 - (avgScore - 3) * 10)
      
      const sortedDimensions = Object.keys(dimensionScores)
        .map(key => ({
          key,
          name: dimensionScores[key].name,
          avg: dimensionScores[key].score / dimensionScores[key].count
        }))
        .sort((a, b) => b.avg - a.avg)

      const strengths = sortedDimensions.slice(0, 2)
      const growthAreas = sortedDimensions.slice(-1)
      
      this.result = {
        totalScore,
        avgScore,
        psychAge: Math.max(18, Math.min(calculatedAge, 80)),
        dimensionScores: sortedDimensions,
        strengths,
        growthAreas
      }
    },
    resetQuiz() {
      this.answers = {}
      this.currentQuestionIndex = 0
      this.result = null
      // 重新开始时再次打乱题目顺序
      this.questions = [...questionsData.questions].sort(() => Math.random() - 0.5)
    }
  }
})
