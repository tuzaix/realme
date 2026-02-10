<template>
  <div class="relative w-full aspect-square flex items-center justify-center p-2">
    <svg viewBox="-15 -15 130 130" class="w-full h-full overflow-visible">
      <!-- Grid polygons -->
      <polygon v-for="n in 5" :key="n" :points="getGridPoints(n * 8)" fill="none" stroke="#cbd5e1" stroke-width="0.5" />
      
      <!-- Axis lines -->
      <line v-for="(point, i) in axisPoints" :key="i" x1="50" y1="50" :x2="point.x" :y2="point.y" stroke="#cbd5e1" stroke-width="0.5" />
      
      <!-- Data polygon -->
      <polygon :points="dataPointsString" fill="rgba(37, 99, 235, 0.4)" stroke="#2563eb" stroke-width="2" stroke-linejoin="round" />
      
      <!-- Data points -->
      <circle v-for="(point, i) in dataPoints" :key="'p'+i" :cx="point.x" :cy="point.y" r="1.5" fill="#2563eb" stroke="white" stroke-width="0.5" />
      
      <!-- Labels -->
      <text v-for="(point, i) in labelPoints" :key="i" :x="point.x" :y="point.y" font-size="5" font-weight="700" fill="#1e293b" text-anchor="middle" dominant-baseline="middle">
        {{ data[i].name }}
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const getGridPoints = (radius) => {
  return props.data.map((_, i) => {
    const angle = (Math.PI * 2 * i) / props.data.length - Math.PI / 2
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
}

const axisPoints = computed(() => {
  return props.data.map((_, i) => {
    const angle = (Math.PI * 2 * i) / props.data.length - Math.PI / 2
    return {
      x: 50 + 40 * Math.cos(angle),
      y: 50 + 40 * Math.sin(angle)
    }
  })
})

const labelPoints = computed(() => {
  return props.data.map((_, i) => {
    const angle = (Math.PI * 2 * i) / props.data.length - Math.PI / 2
    // 缩短半径，使文字更贴近雷达图边缘
    return {
      x: 50 + 52 * Math.cos(angle),
      y: 50 + 52 * Math.sin(angle)
    }
  })
})

const dataPoints = computed(() => {
  return props.data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / props.data.length - Math.PI / 2
    const radius = ((d.avg - 1) / 4) * 40
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    }
  })
})

const dataPointsString = computed(() => {
  return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})
</script>
