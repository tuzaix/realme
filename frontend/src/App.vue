<template>
  <div 
    class="flex-1 flex flex-col mx-auto bg-white shadow-lg min-h-screen"
    :class="route.path.startsWith('/admin') ? 'max-w-none' : 'max-w-md'"
  >
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizStore } from './store/quiz'

const route = useRoute()
const store = useQuizStore()

onMounted(() => {
  store.initCards()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
