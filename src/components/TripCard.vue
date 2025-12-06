<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Trash2, Copy } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useSnackbar } from '../composables/useSnackbar'
import { useConfirm } from '../composables/useConfirm'
import { tripsAPI } from '../services/api'

interface Trip {
  id: number
  title: string
  description: string
  photos: string[]
  tags: string[]
  authorId?: number
}

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  (event: 'tagSelected', tag: string): void
  (event: 'deleted', tripId: number): void
}>()

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { showSnackbar } = useSnackbar()
const { confirm: showConfirm } = useConfirm()

const MAX_PREVIEW_LENGTH = 200

const previewText = computed(() => {
  const raw = props.trip.description ?? ''
  const description = raw.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()
  if (description.length <= MAX_PREVIEW_LENGTH) {
    return description
  }
  return `${description.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}...`
})

const hasMore = computed(() => {
  const description = props.trip.description ?? ''
  return description.length > MAX_PREVIEW_LENGTH
})

const isOwner = computed(() => {
  return isAuthenticated.value && user.value && props.trip.authorId && user.value.userId === props.trip.authorId
})

const handleTagClick = (tag: string) => {
  emit('tagSelected', tag)
}

const handleEdit = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  router.push(`/trips/${props.trip.id}/edit`)
}

const handleDelete = async (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  
  const confirmed = await showConfirm({
    title: 'ยืนยันการลบ',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการลบทริปนี้?',
  })

  if (!confirmed) {
    return
  }

  try {
    await tripsAPI.delete(props.trip.id)
    emit('deleted', props.trip.id)
    showSnackbar({
      message: 'ลบทริปเรียบร้อยแล้ว',
      type: 'success',
    })
  } catch (err) {
    showSnackbar({
      message: 'ไม่สามารถลบทริปได้',
      type: 'error',
    })
    console.error(err)
  }
}

const handleCopyLink = async (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  
  const tripUrl = `${window.location.origin}/trips/${props.trip.id}`
  
  try {
    await navigator.clipboard.writeText(tripUrl)
    showSnackbar({
      message: 'คัดลอกลิงก์เรียบร้อยแล้ว',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to copy link:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = tripUrl
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showSnackbar({
        message: 'คัดลอกลิงก์เรียบร้อยแล้ว',
        type: 'success',
      })
    } catch (fallbackErr) {
      showSnackbar({
        message: 'ไม่สามารถคัดลอกลิงก์ได้',
        type: 'error',
      })
    }
    document.body.removeChild(textArea)
  }
}
</script>

<template>
  <router-link
    :to="`/trips/${trip.id}`"
    class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <section class="flex flex-col md:flex-row">
      <div
        v-if="trip.photos && trip.photos.length > 0"
        class="md:w-1/3 lg:w-1/4 h-56 md:h-64 lg:h-72 overflow-hidden bg-gray-200"
      >
        <img
          :src="trip.photos[0]"
          :alt="trip.title"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="md:w-1/3 lg:w-1/4 h-56 md:h-64 lg:h-72 bg-gray-200 flex items-center justify-center"
      >
        <span class="text-gray-400">ไม่มีรูปภาพ</span>
      </div>

      <article class="flex-1 p-4 relative">
        <h3 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {{ trip.title }}
        </h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">
          {{ previewText }}
          <router-link
            v-if="hasMore"
            :to="`/trips/${trip.id}`"
            class="ml-1 text-sky-600 underline"
          >
            อ่านต่อ
          </router-link>
        </p>

        <section
          v-if="trip.photos && trip.photos.length > 1"
          class="mt-3 flex gap-2 overflow-x-auto pb-1"
        >
          <figure
            v-for="photo in trip.photos.slice(1)"
            :key="photo"
            class="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200"
          >
            <img
              :src="photo"
              :alt="trip.title"
              class="h-full w-full object-cover"
            />
          </figure>
        </section>

        <div v-if="trip.tags && trip.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="tag in trip.tags"
            :key="tag"
            type="button"
            class="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full cursor-pointer hover:bg-sky-200"
            @click.stop.prevent="handleTagClick(tag)"
          >
            {{ tag }}
          </button>
        </div>

        <!-- Action buttons at bottom right -->
        <div class="absolute bottom-4 right-4 flex gap-2">
          <button
            v-if="isOwner"
            type="button"
            class="p-2 text-sky-500 rounded-lg hover:text-sky-600 transition-colors cursor-pointer"
            @click.stop.prevent="handleEdit"
            aria-label="แก้ไขทริป"
            title="แก้ไขทริป"
          >
            <Edit class="h-4 w-4" />
          </button>
          <button
            v-if="isOwner"
            type="button"
            class="p-2 text-red-500 rounded-lg hover:text-red-600 transition-colors cursor-pointer"
            @click.stop.prevent="handleDelete"
            aria-label="ลบทริป"
            title="ลบทริป"
          >
            <Trash2 class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="p-2 text-gray-500 rounded-lg hover:text-gray-600 transition-colors cursor-pointer"
            @click.stop.prevent="handleCopyLink"
            aria-label="คัดลอกลิงก์"
            title="คัดลอกลิงก์"
          >
            <Copy class="h-4 w-4" />
          </button>
        </div>
      </article>
    </section>
  </router-link>
</template>
