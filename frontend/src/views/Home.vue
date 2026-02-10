<template>
  <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-50 to-white">
    <div class="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 transform -rotate-6">
      <Brain class="w-16 h-16 text-blue-500" />
    </div>
    
    <h1 class="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
      心理年龄测试
    </h1>
    
    <div class="flex items-center gap-2 mb-8 bg-blue-100 px-3 py-1 rounded-full">
      <Clock class="w-4 h-4 text-blue-600" />
      <span class="text-sm font-semibold text-blue-700">40 题精选题库</span>
    </div>

    <p class="text-gray-600 mb-12 leading-relaxed text-lg">
      通过科学的计分模型，深度解析你的认知、情绪与活力，发现你真实的内心年龄。
    </p>

    <div class="w-full max-w-xs space-y-4">
      <button 
        @click="showAuthModal = true"
        class="group w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        立即开始
        <ChevronRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
      <div class="flex items-center justify-center gap-4 text-xs text-gray-400 font-medium">
        <span class="flex items-center gap-1"><ShieldCheck class="w-3 h-3" /> 匿名测试</span>
        <span class="flex items-center gap-1"><Sparkles class="w-3 h-3" /> 专业模型</span>
      </div>
    </div>

    <!-- 卡密验证弹窗 -->
    <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl transform transition-all">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">输入卡密开启测试</h3>
        
        <div class="space-y-4 mb-8">
          <input 
            v-model="cardCode"
            type="text" 
            placeholder="请输入您的激活码"
            class="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all text-center text-lg font-mono uppercase tracking-widest"
            @keyup.enter="handleAuth"
          />
          <p v-if="errorMsg" class="text-red-500 text-sm font-medium text-center">{{ errorMsg }}</p>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            @click="handleAuth"
            class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
          >
            验证激活
          </button>
          <button 
            @click="showAuthModal = false; errorMsg = ''"
            class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-lg active:scale-95 transition-all"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../store/quiz'
import { Brain, ChevronRight, Clock, ShieldCheck, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const store = useQuizStore()

onMounted(() => {
  store.initCards()
})

const showAuthModal = ref(false)
const cardCode = ref('')
const errorMsg = ref('')

const handleAuth = () => {
  if (!cardCode.value.trim()) {
    errorMsg.value = '请输入卡密'
    return
  }

  const result = store.verifyCard(cardCode.value.trim().toUpperCase())
  if (result.success) {
    store.resetQuiz()
    router.push('/quiz')
  } else {
    errorMsg.value = result.message
  }
}
</script>
