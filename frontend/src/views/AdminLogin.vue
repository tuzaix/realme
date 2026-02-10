<template>
  <div class="min-h-screen bg-gray-50" style="padding-left: 2%; padding-right: 2%; padding-top: 5vh;">
    <div class="max-w-none mx-auto flex flex-col items-center">
      <!-- Top Logo/Title Area -->
      <div class="w-full max-w-xl bg-white rounded-3xl shadow-sm p-12 mt-10">
        <div class="flex flex-col items-center mb-10">
          <div class="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
            <Lock class="w-10 h-10 text-blue-600" />
          </div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">管理后台</h1>
          <p class="text-gray-400 font-medium mt-3">PRO MANAGEMENT SYSTEM</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-8">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 ml-1">管理员账号</label>
            <div class="relative group">
              <User class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                v-model="loginForm.username"
                type="text" 
                required
                class="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
                placeholder="请输入用户名"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 ml-1">登录密码</label>
            <div class="relative group">
              <Key class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                v-model="loginForm.password"
                type="password" 
                required
                class="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="flex items-center gap-2 text-red-500 text-sm font-bold justify-center bg-red-50 py-4 rounded-2xl border border-red-100 animate-shake">
            <div class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            {{ errorMsg }}
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-3 mt-4"
          >
            <Loader2 v-if="loading" class="w-6 h-6 animate-spin" />
            <span>{{ loading ? '验证中...' : '进入系统' }}</span>
          </button>
        </form>
      </div>

      <!-- Footer Info -->
      <p class="mt-8 text-gray-400 text-sm font-medium">
        &copy; 2024 REALME SYSTEM. ALL RIGHTS RESERVED.
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, User, Key, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      localStorage.setItem('admin_token', data.token)
      router.push('/admin')
    } else {
      errorMsg.value = data.message || '登录失败，请稍后重试'
    }
  } catch (error) {
    errorMsg.value = '连接服务器失败'
  } finally {
    loading.value = false
  }
}
</script>
