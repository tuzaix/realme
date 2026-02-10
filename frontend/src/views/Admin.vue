<template>
  <div class="min-h-screen bg-gray-50 pb-20" style="padding-left: 2%; padding-right: 2%; padding-top: 2rem;">
    <div class="max-w-none mx-auto">
      <!-- Header Area -->
      <div class="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Key class="w-5 h-5 text-red-500 transform -rotate-45" />
            </div>
            <h1 class="text-xl font-bold text-gray-900">
              卡密管理 ({{ store.cards.length }})
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <button 
              v-if="selectedCards.length > 0"
              @click="deleteSelectedCards"
              class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
            >
              <Trash2 class="w-4 h-4" />
              删除选中 ({{ selectedCards.length }})
            </button>
            <button 
              @click="exportAllCards"
              class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              <Download class="w-4 h-4" />
              导出全部
            </button>
            <button 
              @click="handleLogout"
              class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              <LogOut class="w-4 h-4" />
              退出
            </button>
            <button 
              @click="showCreateModal = true"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              <Plus class="w-4 h-4" />
              生成新卡密
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索卡密..."
              class="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div class="flex gap-3">
            <select 
              v-model="statusFilter"
              class="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[120px]"
            >
              <option value="all">所有状态</option>
              <option value="unused">待激活</option>
              <option value="used">已使用</option>
            </select>
            <select 
              v-model="durationFilter"
              class="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[120px]"
            >
              <option value="all">所有效期</option>
              <option value="valid">有效期内</option>
              <option value="expired">已过期</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Card Table -->
      <div class="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-8 py-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
              </th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">卡密</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">有效期至</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">设备状态</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="card in filteredCards" :key="card.code" class="group hover:bg-gray-50/80 transition-colors">
              <td class="px-8 py-6 text-center">
                <input 
                  type="checkbox" 
                  v-model="selectedCards"
                  :value="card.code"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
              </td>
              <td class="px-6 py-6">
                <div class="flex flex-col gap-1.5">
                  <div class="group/copy flex items-center gap-2 cursor-pointer w-fit" @click="copyToClipboard(card.code)">
                    <span 
                      class="font-mono font-bold text-base tracking-wider uppercase transition-colors"
                      :class="card.activatedAt ? 'line-through text-gray-300' : 'text-[#475569] group-hover/copy:text-blue-600'"
                    >
                      {{ card.code }}
                    </span>
                    <Copy class="w-3.5 h-3.5 text-gray-300 group-hover/copy:text-blue-500 opacity-0 group-hover/copy:opacity-100 transition-all" />
                  </div>
                  <div v-if="card.activatedAt">
                    <span class="px-2 py-0.5 bg-blue-50 text-blue-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      已使用
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <template v-if="card.activatedAt">
                  <div class="text-sm font-medium text-gray-500 leading-relaxed">
                    {{ formatDate(getExpireTime(card)) }}
                  </div>
                </template>
                <template v-else>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-orange-400 mb-0.5">待激活</span>
                    <span class="text-[11px] text-gray-400 font-medium">时长: {{ card.durationDays }}天</span>
                  </div>
                </template>
              </td>
              <td class="px-6 py-6">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    <Users class="w-4 h-4 text-gray-300" />
                  </div>
                  <span class="text-sm font-bold text-gray-400">
                    {{ card.usedDevices.length }} / {{ card.maxDevices }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6 text-right">
                <div class="flex justify-end gap-1">
                  <button 
                    @click="confirmDelete(card.code)"
                    class="p-2 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredCards.length === 0">
              <td colspan="5" class="px-6 py-20 text-center text-gray-400">
                未找到匹配的卡密
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-gray-900/90 backdrop-blur text-white text-sm font-bold rounded-2xl shadow-2xl flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-green-400" />
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl transform transition-all">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">生成新卡密</h3>
        
        <div class="space-y-4 mb-8">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">生成数量</label>
            <input 
              v-model="newCardForm.count"
              type="number" 
              min="1"
              max="100"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">有效时长 (天)</label>
            <select 
              v-model="newCardForm.duration"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            >
              <option :value="7">7天</option>
              <option :value="30">30天</option>
              <option :value="365">1年</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">最大可用设备数</label>
            <input 
              v-model="newCardForm.maxDevices"
              type="number" 
              class="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            @click="handleCreate"
            class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
          >
            确认生成
          </button>
          <button 
            @click="showCreateModal = false"
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
import { ref, reactive, computed } from 'vue'
import { useQuizStore } from '../store/quiz'
import { Plus, Trash2, Key, Download, Search, Users, Copy, CheckCircle2, LogOut } from 'lucide-vue-next'

const store = useQuizStore()
const showCreateModal = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const durationFilter = ref('all')
const selectedCards = ref([])

// 初始化加载数据
store.initCards()

const isAllSelected = computed(() => {
  return filteredCards.value.length > 0 && 
         filteredCards.value.every(card => selectedCards.value.includes(card.code))
})

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedCards.value = filteredCards.value.map(card => card.code)
  } else {
    selectedCards.value = []
  }
}

const toast = reactive({
  show: false,
  message: ''
})

const showToast = (msg) => {
  toast.message = msg
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 2000)
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('卡密已复制到剪贴板')
  } catch (err) {
    // Fallback for older browsers or insecure contexts
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showToast('卡密已复制到剪贴板')
    } catch (err) {
      showToast('复制失败，请手动选择复制')
    }
    document.body.removeChild(textArea)
  }
}

const newCardForm = reactive({
  count: 1,
  duration: 7,
  maxDevices: 2
})

const filteredCards = computed(() => {
  return store.cards
    .filter(card => {
      const matchesSearch = card.code.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      const matchesStatus = statusFilter.value === 'all' || 
         (statusFilter.value === 'unused' && !card.activatedAt) ||
         (statusFilter.value === 'used' && card.activatedAt)
        
      const matchesDuration = durationFilter.value === 'all' || (() => {
        if (!card.activatedAt) return durationFilter.value === 'valid' // 待激活视为有效期内
        const expireTime = getExpireTime(card)
        const isExpired = new Date() > expireTime
        return durationFilter.value === 'expired' ? isExpired : !isExpired
      })()
        
      return matchesSearch && matchesStatus && matchesDuration
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const handleCreate = () => {
  store.generateCardsBatch(newCardForm.count, newCardForm.duration, newCardForm.maxDevices)
  showCreateModal.value = false
  newCardForm.count = 1
}

const confirmDelete = (code) => {
  if (confirm('确定要删除这个卡密吗？')) {
    store.deleteCard(code)
    selectedCards.value = selectedCards.value.filter(id => id !== code)
  }
}

const deleteSelectedCards = () => {
  if (confirm(`确定要删除选中的 ${selectedCards.value.length} 个卡密吗？`)) {
    selectedCards.value.forEach(code => {
      store.deleteCard(code)
    })
    selectedCards.value = []
    showToast('已成功删除选中卡密')
  }
}

const getExpireTime = (card) => {
  if (!card.activatedAt) return null
  const activatedDate = new Date(card.activatedAt)
  return new Date(activatedDate.getTime() + card.durationDays * 24 * 60 * 60 * 1000)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

const exportAllCards = async () => {
  const headers = ['卡密', '时长(天)', '最大设备', '状态', '激活时间', '过期时间']
  const csvData = store.cards.map(card => [
    card.code,
    card.durationDays,
    card.maxDevices,
    card.activatedAt ? '已使用' : '待激活',
    card.activatedAt ? formatDate(card.activatedAt) : '-',
    card.activatedAt ? formatDate(getExpireTime(card)) : '-'
  ])
  
  const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n")
  const filename = `cards_export_${new Date().getTime()}.csv`

  // 1. 浏览器下载
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 2. 同步到服务器 (根据 vite.config.js 中的新接口)
  try {
    await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content: csvContent })
    })
    showToast('导出成功并已同步至服务器')
  } catch (error) {
    console.error('同步导出文件失败:', error)
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
