<template>
  <div class="flex-1 flex flex-col p-6 bg-white">
    <!-- Header with Progress -->
    <div class="mb-10 pt-4">
      <div class="flex items-center justify-between mb-3">
        <button 
          @click="router.push('/')"
          class="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
        <div class="flex flex-col items-center">
          <span class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">进度</span>
          <span class="text-sm font-black text-gray-900">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
        </div>
        <div class="w-10"></div> <!-- Spacer -->
      </div>
      <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
        <div 
          class="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out rounded-full shadow-lg"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Question Section -->
    <div class="flex-1">
      <div class="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold mb-4 uppercase tracking-wider">
        {{ currentQuestion.dimension.name }}
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-10 leading-snug min-h-[5rem]">
        {{ currentQuestion.prompt }}
      </h2>

      <div class="space-y-4">
        <button
          v-for="option in currentQuestion.options"
          :key="option.value"
          @click="selectOption(option.value)"
          :class="[
            'w-full py-5 px-6 rounded-2xl text-left transition-all duration-200 border-2 relative overflow-hidden group',
            answers[currentQuestion.id] === option.value
              ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50'
              : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
          ]"
        >
          <div class="flex items-center justify-between relative z-10">
            <span :class="[
              'text-lg font-medium transition-colors',
              answers[currentQuestion.id] === option.value ? 'text-blue-700' : 'text-gray-600'
            ]">
              {{ option.label }}
            </span>
            <div 
              v-if="answers[currentQuestion.id] === option.value"
              class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in duration-300"
            >
              <Check class="w-4 h-4 text-white" />
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Footer Navigation -->
    <div class="mt-10 flex gap-4 pb-4">
      <button
        @click="prevQuestion"
        :disabled="currentQuestionIndex === 0"
        class="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-0"
      >
        <ChevronLeft class="w-6 h-6 mx-auto" />
      </button>
      <button
        @click="handleNext"
        :disabled="!answers[currentQuestion.id]"
        class="flex-[3] py-4 px-6 rounded-2xl bg-gray-900 text-white font-bold shadow-xl active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-2"
      >
        <span>{{ isLastQuestion ? '生成分析报告' : '下一题' }}</span>
        <ChevronRight v-if="!isLastQuestion" class="w-5 h-5" />
        <Sparkles v-else class="w-5 h-5 text-yellow-400" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useQuizStore } from '../store/quiz'
import { ChevronLeft, ChevronRight, Check, X, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const store = useQuizStore()
const { questions, answers, currentQuestionIndex } = storeToRefs(store)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100)
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)

const selectOption = (value) => {
  store.setAnswer(currentQuestion.value.id, value)
  setTimeout(() => {
    handleNext()
  }, 400)
}

const handleNext = () => {
  if (isLastQuestion.value) {
    store.calculateResult()
    router.push('/result')
  } else {
    store.nextQuestion()
  }
}

const prevQuestion = () => {
  store.prevQuestion()
}
</script>
