import { defineStore } from 'pinia'
import questionsData from '../data/questions.json'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    questions: questionsData.questions,
    answers: {},
    currentQuestionIndex: 0,
    result: null
  }),
  actions: {
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
    }
  }
})
