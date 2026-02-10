<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 font-sans">
    <!-- Header -->
    <h1 class="text-2xl font-bold text-slate-800 mb-6">心理年龄测试结果</h1>

    <div v-if="result" class="w-full max-w-3xl space-y-6">
      <!-- Age Hero Card -->
      <div class="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-[2rem] p-8 text-center text-white shadow-2xl shadow-blue-200 overflow-hidden">
        <!-- Decorative bubbles -->
        <div class="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-baseline justify-center gap-1 mb-2">
            <span class="text-7xl font-black tracking-tight">{{ psychAge }}</span>
            <span class="text-2xl font-bold opacity-90">岁</span>
          </div>
          <p class="text-blue-100 text-sm font-medium tracking-widest uppercase mb-4">你的心理年龄</p>
          <div class="inline-flex items-center px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-sm font-semibold">
            画像：{{ ageStatus }}
          </div>
        </div>
      </div>

      <!-- Analysis Section -->
      <div class="flex flex-col gap-6">
        <!-- Radar Chart Card -->
        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center">
          <h3 class="text-lg font-bold text-slate-800 mb-2 self-start px-2">维度分布</h3>
          <RadarChart :data="result.dimensionScores" />
        </div>

        <!-- Interpretation Card -->
        <div class="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
          <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            维度解读
          </h3>
          <ul class="space-y-5">
            <li v-for="s in result.strengths" :key="s.key" class="flex items-start gap-3">
              <div class="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-lg shadow-blue-200"></div>
              <p class="text-slate-700 leading-tight">
                <span class="font-bold">优势：</span>{{ s.name }}表现突出，心态非常积极。
              </p>
            </li>
            <li v-for="g in result.growthAreas" :key="g.key" class="flex items-start gap-3">
              <div class="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-lg shadow-indigo-200"></div>
              <p class="text-slate-700 leading-tight">
                <span class="font-bold">成长建议：</span>可多关注{{ g.name }}的培养与提升。
              </p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 pt-4">
        <button 
          @click="restart"
          class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-full font-bold text-lg hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw class="w-5 h-5" />
          再测一次
        </button>
        <button 
          @click="generateShareCard"
          :disabled="isGenerating"
          class="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <component :is="isGenerating ? Loader2 : Share2" :class="['w-5 h-5', isGenerating ? 'animate-spin' : '']" />
          {{ isGenerating ? '生成中...' : '生成分享卡片' }}
        </button>
      </div>

      <!-- Footer Disclaimer -->
      <p class="text-center text-slate-400 text-xs mt-8">
        仅供自我探索参考，不构成心理诊断
      </p>
    </div>

    <!-- Full-screen Loading Overlay -->
    <div v-if="isGenerating" class="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div class="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/20 flex flex-col items-center gap-4 scale-90 animate-pulse">
        <div class="relative">
          <Loader2 class="w-12 h-12 text-blue-600 animate-spin" />
          <Brain class="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div class="text-center">
          <p class="text-slate-800 font-bold text-lg">正在绘制画像...</p>
          <p class="text-slate-400 text-xs mt-1">请稍候，即将呈现分享卡片</p>
        </div>
      </div>
    </div>

    <!-- Share Modal (The Floating Layer) -->
    <div v-if="shareImage" class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500" @click.self="shareImage = null">
      <div class="relative w-full max-w-[320px] flex flex-col items-center gap-5 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <!-- Close Button -->
        <button @click="shareImage = null" class="absolute -top-12 right-0 p-2 text-white/30 hover:text-white transition-colors">
          <X class="w-8 h-8" />
        </button>

        <!-- Tip Text (Floating Badge) -->
        <div class="shrink-0">
          <div class="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 rounded-full border border-blue-400/30 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <span class="flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <p class="text-blue-100 text-sm font-bold tracking-wide">长按下方图片保存</p>
          </div>
        </div>
        
        <!-- Preview Container (Glassmorphism Frame) -->
        <div class="group relative bg-white/10 p-1 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 w-full overflow-hidden">
          <div class="max-h-[60vh] overflow-y-auto scrollbar-hide rounded-[2.2rem]">
            <img :src="shareImage" class="w-full block shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]" alt="分享卡片" @contextmenu.prevent />
          </div>
          
          <!-- Subtle Inner Glow -->
          <div class="absolute inset-0 pointer-events-none rounded-[2.5rem] border border-white/5 ring-1 ring-white/10"></div>
        </div>

        <div class="flex flex-col items-center gap-1 opacity-40">
          <p class="text-white text-[10px] tracking-[0.2em] uppercase font-medium">Scroll to view full report</p>
          <div class="w-1 h-4 rounded-full bg-gradient-to-b from-white/60 to-transparent animate-bounce mt-1"></div>
        </div>
      </div>
    </div>

    <!-- Hidden Capture Target (optimized for share card) -->
    <div v-if="isGenerating" class="fixed -left-[9999px] top-0" style="color-scheme: light;">
      <div id="share-card-target" class="w-[375px] flex flex-col items-center" style="background-color: #f8fafc; padding: 24px 12px; font-family: sans-serif;">
        <h1 style="font-size: 20px; font-bold: 700; font-weight: 700; color: #1e293b; margin-bottom: 24px;">心理年龄测试报告</h1>
        
        <!-- Age Card -->
        <div style="width: 100%; background: linear-gradient(to bottom right, #3b82f6, #4338ca); border-radius: 32px; padding: 32px 16px; text-align: center; color: white; margin-bottom: 24px;">
          <div style="display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: 8px;">
            <span style="font-size: 72px; font-weight: 900; letter-spacing: -0.05em;">{{ psychAge }}</span>
            <span style="font-size: 24px; font-weight: 700; opacity: 0.9;">岁</span>
          </div>
          <p style="color: #dbeafe; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">心理年龄</p>
          <div style="width: 100%; margin-top: 12px; text-align: center; line-height: 0;">
            <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 6px 20px 18px 20px; color: white; font-size: 14px; font-weight: 600; white-space: nowrap; line-height: 1; text-align: center; vertical-align: middle;">画像：{{ ageStatus }}</span>
          </div>
        </div>

        <!-- Radar Chart -->
        <div style="width: 100%; background-color: white; border-radius: 24px; padding: 16px 8px; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px; align-self: flex-start; padding-left: 8px;">维度分布</h3>
          <RadarChart :data="result.dimensionScores" />
        </div>

        <!-- Interpretation -->
        <div style="width: 100%; background-color: white; border-radius: 24px; padding: 20px 12px; margin-bottom: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">维度解读</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div v-for="s in result.strengths" :key="s.key" style="display: flex; align-items: flex-start; gap: 8px;">
              <div style="margin-top: 6px; width: 6px; height: 6px; border-radius: 50%; background-color: #3b82f6; flex-shrink: 0;"></div>
              <p style="font-size: 13px; color: #475569; line-height: 1.4; margin: 0;">
                <span style="font-weight: 700; color: #1e293b;">优势：</span>{{ s.name }}表现突出，心态非常积极。
              </p>
            </div>
            <div v-for="g in result.growthAreas" :key="g.key" style="display: flex; align-items: flex-start; gap: 8px;">
              <div style="margin-top: 6px; width: 6px; height: 6px; border-radius: 50%; background-color: #818cf8; flex-shrink: 0;"></div>
              <p style="font-size: 13px; color: #475569; line-height: 1.4; margin: 0;">
                <span style="font-weight: 700; color: #1e293b;">建议：</span>可多关注{{ g.name }}的培养与提升。
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 8px; color: #94a3b8;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; background-color: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <Brain style="width: 20px; height: 20px; color: white;" />
            </div>
            <span style="font-size: 12px; font-weight: 700; color: #475569;">心理年龄测试</span>
          </div>
          <p style="font-size: 10px;">长按保存图片</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useQuizStore } from '../store/quiz'
import RadarChart from '../components/RadarChart.vue'
import html2canvas from 'html2canvas'
import { 
  RotateCcw, Share2, Loader2, X, Brain
} from 'lucide-vue-next'

const router = useRouter()
const store = useQuizStore()
const { result } = storeToRefs(store)

const isGenerating = ref(false)
const shareImage = ref(null)

const psychAge = computed(() => result.value?.psychAge ?? 0)

onMounted(() => {
  if (!result.value) {
    router.replace('/')
  }
})

const ageStatus = computed(() => {
  if (!result.value) return ""
  const age = psychAge.value
  if (age < 25) return "赤子之心的探索者"
  if (age < 35) return "乘风破浪的智者"
  if (age < 50) return "稳重深邃的远见家"
  return "通透圆融的觉悟者"
})

const restart = () => {
  store.resetQuiz()
  router.push('/')
}

const generateShareCard = async () => {
  if (isGenerating.value) return
  
  isGenerating.value = true
  
  // Wait for the hidden target to be rendered
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 500)) // Ensure styles and SVG are ready

  try {
    const target = document.querySelector('#share-card-target')
    const canvas = await html2canvas(target, {
      useCORS: true,
      scale: 2, // Higher quality
      backgroundColor: '#f8fafc' // bg-slate-50
    })
    
    shareImage.value = canvas.toDataURL('image/png')
    
    // Auto-scroll to top to ensure modal content is visible if page was scrolled
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Failed to generate image:', error)
    alert('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}
</script>
