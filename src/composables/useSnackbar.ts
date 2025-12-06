import { ref } from 'vue'

interface SnackbarOptions {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

const show = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
const duration = ref(3000)

export const useSnackbar = () => {
  const showSnackbar = (options: SnackbarOptions) => {
    message.value = options.message
    type.value = options.type || 'info'
    duration.value = options.duration || 3000
    show.value = true
  }

  const hideSnackbar = () => {
    show.value = false
  }

  return {
    show,
    message,
    type,
    duration,
    showSnackbar,
    hideSnackbar,
  }
}

