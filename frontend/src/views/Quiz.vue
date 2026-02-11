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

    <!-- 卡密验证弹窗 -->
    <Transition name="fade">
      <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
        <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl transform transition-all animate-in zoom-in duration-300">
          <div class="flex flex-col items-center text-center mb-8">
            <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-2">验证卡密查看结果</h3>
            <p class="text-gray-500 text-sm">测试已完成！请输入激活码解锁您的深度心理年龄分析报告</p>
          </div>
          
          <div class="space-y-4 mb-8">
            <div class="relative">
              <input 
                v-model="cardCode"
                type="text" 
                placeholder="请输入您的卡密"
                class="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-center text-xl font-mono uppercase tracking-[0.2em] placeholder:tracking-normal placeholder:text-gray-300"
                @keyup.enter="handleAuth"
                :disabled="isVerifying"
              />
            </div>
            <p v-if="errorMsg" class="text-red-500 text-sm font-bold text-center flex items-center justify-center gap-1 animate-in shake-x">
              <AlertCircle class="w-4 h-4" /> {{ errorMsg }}
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <button 
              @click="handleAuth"
              :disabled="isVerifying"
              class="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Loader2 v-if="isVerifying" class="w-5 h-5 animate-spin" />
              <span v-else>立即解锁报告</span>
            </button>
            <button 
              @click="showAuthModal = false; errorMsg = ''"
              :disabled="isVerifying"
              class="w-full py-4 bg-white text-gray-400 rounded-2xl font-bold text-base hover:text-gray-600 transition-all"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useQuizStore } from '../store/quiz'
import { 
  ChevronLeft, ChevronRight, Check, X, Sparkles, 
  ShieldCheck, AlertCircle, Loader2 
} from 'lucide-vue-next'

const router = useRouter()
const store = useQuizStore()
const { questions, answers, currentQuestionIndex, isCardValid } = storeToRefs(store)

const showAuthModal = ref(false)
const cardCode = ref('')
const errorMsg = ref('')
const isVerifying = ref(false)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100)
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)

const selectOption = (value) => {
  store.setAnswer(currentQuestion.value.id, value)
  // 如果是最后一题，不再自动跳转，等待用户点击“生成分析报告”按钮
  if (!isLastQuestion.value) {
    setTimeout(() => {
      handleNext()
    }, 400)
  }
}

const handleNext = () => {
  if (isLastQuestion.value) {
    if (isCardValid.value) {
      completeQuiz()
    } else {
      showAuthModal.value = true
    }
  } else {
    store.nextQuestion()
  }
}

const handleAuth = async () => {
  if (!cardCode.value.trim()) {
    errorMsg.value = '请输入卡密'
    return
  }

  isVerifying.value = true
  errorMsg.value = ''

  // 模拟一个验证延迟，提升用户体验
  await new Promise(resolve => setTimeout(resolve, 800))

  const result = await store.verifyCard(cardCode.value.trim().toUpperCase())
  isVerifying.value = false

  if (result.success) {
    showAuthModal.value = false
    completeQuiz()
  } else {
    errorMsg.value = result.message
  }
}

const completeQuiz = () => {
  store.calculateResult()
  router.push('/result')
}

const prevQuestion = () => {
  store.prevQuestion()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shake-x {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.shake-x {
  animation: shake-x 0.2s ease-in-out 0s 2;
}
</style>
