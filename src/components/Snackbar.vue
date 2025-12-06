<script setup lang="ts">
import { watch, onMounted } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  show: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  show: false,
})

const emit = defineEmits<{
  (event: 'close'): void
}>()

let timeoutId: number | null = null

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        emit('close')
      }, props.duration)
    } else {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.show) {
    timeoutId = window.setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})

const handleClose = () => {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }
  emit('close')
}

const typeColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="show"
      :class="[
        'fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white flex items-center gap-3 min-w-[300px] max-w-[500px]',
        typeColors[type],
      ]"
    >
      <p class="flex-1">{{ message }}</p>
      <button
        type="button"
        class="text-white hover:text-gray-200 transition-colors cursor-pointer"
        @click="handleClose"
        aria-label="ปิด"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

