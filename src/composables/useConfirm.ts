import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
}

const show = ref(false)
const title = ref('')
const message = ref('')
const confirmText = ref('ยืนยัน')
const cancelText = ref('ยกเลิก')
const confirmButtonClass = ref('bg-red-500 hover:bg-red-600')

let resolvePromise: ((value: boolean) => void) | null = null

export const useConfirm = () => {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      title.value = options.title
      message.value = options.message
      confirmText.value = options.confirmText || 'ยืนยัน'
      cancelText.value = options.cancelText || 'ยกเลิก'
      confirmButtonClass.value = options.confirmButtonClass || 'bg-red-500 hover:bg-red-600'
      show.value = true
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    show.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  const handleCancel = () => {
    show.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    show,
    title,
    message,
    confirmText,
    cancelText,
    confirmButtonClass,
    confirm,
    handleConfirm,
    handleCancel,
  }
}

