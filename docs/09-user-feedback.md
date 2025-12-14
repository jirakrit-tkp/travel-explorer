# Feature: User Feedback System (Snackbar & Confirm Modal)

## 1. Overview

The user feedback system provides two types of user interactions: Snackbar notifications for success/error messages and Confirm Modal for destructive action confirmations. Both systems are implemented as reusable composables and components.

**Purpose:**
- Display success/error notifications
- Confirm destructive actions before execution
- Provide consistent user feedback
- Improve user experience with clear messaging
- Prevent accidental deletions

**Key Capabilities:**
- **Snackbar Notifications**: Toast-style messages for success/error/info
- **Auto-dismiss**: Notifications automatically disappear after duration
- **Manual Dismiss**: Users can close notifications manually
- **Confirm Modal**: Modal dialog for action confirmation
- **Backdrop Click**: Close modal by clicking backdrop
- **Multiple Types**: Success, error, and info notification types

---

## 2. Architecture / Flow

### Snackbar Flow
```
Action triggers → showSnackbar({ message, type, duration })
  → Set snackbar state (show, message, type)
  → Display snackbar component
  → Start auto-dismiss timer
  ├─ Timer expires? → Auto-close
  └─ User clicks close? → Manual close
  → Hide snackbar
```

### Confirm Modal Flow
```
Destructive action triggered → showConfirm({ title, message })
  → Display ConfirmModal
  ├─ User clicks "Cancel"? → Return false, close modal
  └─ User clicks "Confirm"? → Return true, close modal
  → Action proceeds or cancels based on result
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Vue 3 Composables** | State management | - Reusable logic<br>- TypeScript support<br>- Reactive state | `useSnackbar()` and `useConfirm()` composables manage state. Components import and use them |
| **Vue Transition** | Animation effects | - Built into Vue<br>- Smooth animations<br>- No dependencies | Transition component wraps modal/snackbar. Provides enter/leave animations |
| **setTimeout** | Auto-dismiss timer | - Native JavaScript<br>- Simple implementation<br>- No dependencies | Sets timer for auto-dismiss. Clears on manual close or new notification |

---

## 4. Core Logic

### 4.1 useSnackbar Composable

**Location:** `src/composables/useSnackbar.ts`

```typescript
const show = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
const duration = ref(3000)

let timeoutId: number | null = null

const showSnackbar = (options: {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}) => {
  message.value = options.message
  type.value = options.type || 'info'
  duration.value = options.duration || 3000
  show.value = true

  // Clear existing timer
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
  }

  // Set new timer
  timeoutId = window.setTimeout(() => {
    show.value = false
    timeoutId = null
  }, duration.value)
}

const closeSnackbar = () => {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }
  show.value = false
}

return { show, message, type, showSnackbar, closeSnackbar }
```

### 4.2 Snackbar Component

**Location:** `src/components/Snackbar.vue`

```vue
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
```

### 4.3 useConfirm Composable

**Location:** `src/composables/useConfirm.ts`

```typescript
const show = ref(false)
const title = ref('')
const message = ref('')
const confirmText = ref('ยืนยัน')
const cancelText = ref('ยกเลิก')
const confirmButtonClass = ref('bg-red-500 hover:bg-red-600')

let resolvePromise: ((value: boolean) => void) | null = null

const confirm = async (options: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
}): Promise<boolean> => {
  title.value = options.title
  message.value = options.message
  confirmText.value = options.confirmText || 'ยืนยัน'
  cancelText.value = options.cancelText || 'ยกเลิก'
  confirmButtonClass.value = options.confirmButtonClass || 'bg-red-500 hover:bg-red-600'
  show.value = true

  return new Promise((resolve) => {
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

return { show, title, message, confirmText, cancelText, confirmButtonClass, confirm, handleConfirm, handleCancel }
```

### 4.4 ConfirmModal Component

**Location:** `src/components/ConfirmModal.vue`

```vue
<script setup lang="ts">
interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
}

withDefaults(defineProps<Props>(), {
  confirmText: 'ยืนยัน',
  cancelText: 'ยกเลิก',
  confirmButtonClass: 'bg-red-500 hover:bg-red-600',
})

const emit = defineEmits<{
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="handleBackdropClick"
    >
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="show"
          class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          @click.stop
        >
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-gray-600 mb-6">{{ message }}</p>
          <div class="flex gap-3 justify-end">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold cursor-pointer"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              :class="[
                'px-4 py-2 text-white rounded-lg transition-colors font-semibold cursor-pointer',
                confirmButtonClass,
              ]"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
```

### 4.5 Usage Examples

**Snackbar Usage:**
```typescript
import { useSnackbar } from '../composables/useSnackbar'

const { showSnackbar } = useSnackbar()

// Success message
showSnackbar({
  message: 'ลบทริปเรียบร้อยแล้ว',
  type: 'success',
})

// Error message
showSnackbar({
  message: 'ไม่สามารถลบทริปได้',
  type: 'error',
})
```

**Confirm Modal Usage:**
```typescript
import { useConfirm } from '../composables/useConfirm'

const { confirm: showConfirm } = useConfirm()

const handleDelete = async () => {
  const confirmed = await showConfirm({
    title: 'ยืนยันการลบ',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการลบทริปนี้?',
  })

  if (!confirmed) {
    return // User cancelled
  }

  // Proceed with deletion
  await deleteTrip()
}
```

---

## 5. Data Model / State Structure

### Snackbar State

```typescript
const show = ref(false)                    // Visibility state
const message = ref('')                    // Message text
const type = ref<'success' | 'error' | 'info'>('info')  // Notification type
const duration = ref(3000)                 // Auto-dismiss duration (ms)
```

### Confirm Modal State

```typescript
const show = ref(false)                    // Visibility state
const title = ref('')                      // Modal title
const message = ref('')                    // Modal message
const confirmText = ref('ยืนยัน')          // Confirm button text
const cancelText = ref('ยกเลิก')            // Cancel button text
const confirmButtonClass = ref('bg-red-500 hover:bg-red-600')  // Button styling
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **Multiple Notifications**: New notification replaces current one
2. **Timer Cleanup**: Clears timer on manual close
3. **Backdrop Click**: Closes modal when clicking outside
4. **Promise Resolution**: Properly resolves promise on confirm/cancel
5. **Component Unmount**: Cleans up timers on unmount
6. **Rapid Clicks**: Handles rapid open/close actions
7. **Long Messages**: Text wraps properly in snackbar

### Current Limitations

1. **Single Snackbar**: Only one snackbar at a time
2. **No Queue**: Cannot queue multiple notifications
3. **No Actions**: Snackbar has no action buttons
4. **No Icons**: No icons for notification types
5. **Fixed Position**: Snackbar always bottom-right
6. **No Persistence**: Notifications don't persist across page reloads
7. **No Sound**: No audio feedback
8. **No Vibration**: No haptic feedback on mobile
9. **No Rich Content**: No HTML or images in notifications
10. **No Progress**: No progress indicator for long operations

### TODO / Future Enhancements

- [ ] **Notification Queue**: Queue multiple notifications
- [ ] **Action Buttons**: Add action buttons to snackbar
- [ ] **Icons**: Add icons for notification types
- [ ] **Position Options**: Configurable snackbar position
- [ ] **Persistence**: Persist notifications across reloads
- [ ] **Sound Effects**: Audio feedback for notifications
- [ ] **Haptic Feedback**: Vibration on mobile
- [ ] **Rich Content**: Support HTML/images in notifications
- [ ] **Progress Indicator**: Show progress for long operations
- [ ] **Notification History**: View notification history
- [ ] **Custom Styling**: More customization options
- [ ] **Animation Options**: More animation variants
- [ ] **Accessibility**: Better ARIA labels and keyboard navigation
- [ ] **Multiple Modals**: Support stacking multiple modals
- [ ] **Modal Sizes**: Small/medium/large modal sizes

### Known Issues

- **Z-index Conflicts**: May be covered by other elements
- **Mobile Layout**: May not work well on very small screens
- **Timer Precision**: setTimeout may not be precise
- **Memory Leaks**: Timers must be cleaned up properly
- **Focus Management**: Modal doesn't trap focus

