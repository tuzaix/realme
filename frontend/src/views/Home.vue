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
        @click="startQuiz"
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
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../store/quiz'
import { Brain, ChevronRight, Clock, ShieldCheck, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const store = useQuizStore()

onMounted(() => {
  store.initCards()
})

const startQuiz = () => {
  store.resetQuiz()
  router.push('/quiz')
}
</script>
