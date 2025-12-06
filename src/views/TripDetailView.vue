<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import GoogleMap from '../components/GoogleMap.vue'
import { tripsAPI } from '../services/api'
import { useAuth } from '../composables/useAuth'
import { useSnackbar } from '../composables/useSnackbar'
import { useConfirm } from '../composables/useConfirm'
import { markdownToHtml } from '../utils/markdown'
import type { AxiosResponse } from 'axios'

interface Trip {
  id: number
  title: string
  description: string
  photos: string[]
  tags: string[]
  latitude?: number
  longitude?: number
  authorId: number
  authorEmail: string
  authorDisplayName: string
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { showSnackbar } = useSnackbar()
const { confirm: showConfirm } = useConfirm()

const trip = ref<Trip | null>(null)
const loading = ref(false)
const error = ref('')
const deleting = ref(false)
const currentPhotoIndex = ref(0)
const autoSlideInterval = ref<number | null>(null)

const descriptionHtml = computed(() => {
  if (!trip.value) {
    return ''
  }

  return markdownToHtml(trip.value.description ?? '')
})

const isOwner = computed(() => {
  return isAuthenticated.value && user.value && trip.value && user.value.userId === trip.value.authorId
})

const hasPhotos = computed(() => {
  return trip.value && trip.value.photos && trip.value.photos.length > 0
})

const totalPhotos = computed(() => {
  return trip.value?.photos?.length || 0
})

const nextPhoto = () => {
  if (!trip.value || !trip.value.photos) return
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % trip.value.photos.length
  resetAutoSlide()
}

const prevPhoto = () => {
  if (!trip.value || !trip.value.photos) return
  currentPhotoIndex.value =
    currentPhotoIndex.value === 0 ? trip.value.photos.length - 1 : currentPhotoIndex.value - 1
  resetAutoSlide()
}

const goToPhoto = (index: number) => {
  if (!trip.value || !trip.value.photos) return
  if (index >= 0 && index < trip.value.photos.length) {
    currentPhotoIndex.value = index
    resetAutoSlide()
  }
}

const startAutoSlide = () => {
  if (!trip.value || !trip.value.photos || trip.value.photos.length <= 1) return

  autoSlideInterval.value = window.setInterval(() => {
    nextPhoto()
  }, 8000) // 8 seconds
}

const stopAutoSlide = () => {
  if (autoSlideInterval.value !== null) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}

const resetAutoSlide = () => {
  stopAutoSlide()
  startAutoSlide()
}

const fetchTrip = async () => {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    const response: AxiosResponse<Trip> = await tripsAPI.getById(id)
    trip.value = response.data
  } catch (err) {
    error.value = 'ไม่พบทริปนี้'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (!trip.value) {
    return
  }

  const confirmed = await showConfirm({
    title: 'ยืนยันการลบ',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการลบทริปนี้?',
  })

  if (!confirmed) {
    return
  }

  deleting.value = true
  try {
    await tripsAPI.delete(trip.value.id)
    showSnackbar({
      message: 'ลบทริปเรียบร้อยแล้ว',
      type: 'success',
    })
    router.push('/my-trips')
  } catch (err) {
    showSnackbar({
      message: 'ไม่สามารถลบทริปได้',
      type: 'error',
    })
    console.error(err)
  } finally {
    deleting.value = false
  }
}

watch(
  () => trip.value?.photos,
  () => {
    if (trip.value && trip.value.photos && trip.value.photos.length > 0) {
      currentPhotoIndex.value = 0
      startAutoSlide()
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchTrip()
})

onBeforeUnmount(() => {
  stopAutoSlide()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-600">กำลังโหลด...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600">{{ error }}</p>
          <router-link to="/" class="mt-4 inline-block text-sky-600 hover:text-sky-700">
            กลับหน้าหลัก
          </router-link>
        </div>

        <div v-else-if="trip" class="bg-white rounded-lg shadow-md overflow-hidden">
          <!-- Images Carousel -->
          <div
            v-if="hasPhotos"
            class="relative w-full aspect-video bg-gray-200 overflow-hidden"
            @mouseenter="stopAutoSlide"
            @mouseleave="startAutoSlide"
          >
            <!-- Main Image -->
            <img
              :src="trip.photos[currentPhotoIndex]"
              :alt="`${trip.title} - รูปที่ ${currentPhotoIndex + 1}`"
              class="w-full h-full object-cover transition-opacity duration-500"
            />

            <!-- Navigation Buttons -->
            <button
              v-if="totalPhotos > 1"
              @click="prevPhoto"
              class="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors cursor-pointer"
              aria-label="รูปก่อนหน้า"
            >
              <ChevronLeft class="h-6 w-6" />
            </button>
            <button
              v-if="totalPhotos > 1"
              @click="nextPhoto"
              class="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors cursor-pointer"
              aria-label="รูปถัดไป"
            >
              <ChevronRight class="h-6 w-6" />
            </button>

            <!-- Dot Indicators -->
            <div
              v-if="totalPhotos > 1"
              class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 mb-8"
            >
              <button
                v-for="(_, index) in trip.photos"
                :key="index"
                @click="goToPhoto(index)"
                :class="[
                  'h-2 rounded-full transition-all cursor-pointer',
                  index === currentPhotoIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75',
                ]"
                :aria-label="`ไปที่รูปที่ ${index + 1}`"
              />
            </div>

            <!-- Photo Counter -->
            <div
              v-if="totalPhotos > 1"
              class="absolute bottom-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
            >
              {{ currentPhotoIndex + 1 }} / {{ totalPhotos }}
            </div>
          </div>
          <div v-else class="aspect-video bg-gray-200 flex items-center justify-center">
            <span class="text-gray-400">ไม่มีรูปภาพ</span>
          </div>

          <!-- Content -->
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h1 class="text-3xl font-bold text-gray-900">{{ trip.title }}</h1>
              <div v-if="isOwner" class="flex gap-2">
                <router-link
                  :to="`/trips/${trip.id}/edit`"
                  class="p-2 text-sky-500 rounded-lg hover:text-sky-600 transition-colors cursor-pointer"
                  aria-label="แก้ไขทริป"
                  title="แก้ไขทริป"
                >
                  <Edit class="h-5 w-5" />
                </router-link>
                <button
                  @click="handleDelete"
                  :disabled="deleting"
                  class="p-2 text-red-500 rounded-lg hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="ลบทริป"
                  title="ลบทริป"
                >
                  <Trash2 class="h-5 w-5" />
                </button>
              </div>
            </div>

            <p class="text-gray-700 mb-4" v-html="descriptionHtml" />

            <!-- Tags -->
            <div v-if="trip.tags && trip.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in trip.tags"
                :key="tag"
                class="px-3 py-1 bg-sky-100 text-sky-800 text-sm rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Location Map -->
            <div v-if="trip.latitude && trip.longitude" class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">ตำแหน่ง</h3>
              <GoogleMap
                :latitude="trip.latitude"
                :longitude="trip.longitude"
                :title="trip.title"
                :zoom="14"
              />
            </div>

            <!-- Author Info -->
            <div class="border-t pt-4 mt-4">
              <p class="text-sm text-gray-600">
                <span class="font-semibold">ผู้สร้าง:</span> {{ trip.authorDisplayName || trip.authorEmail }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                สร้างเมื่อ: {{ new Date(trip.createdAt).toLocaleString('th-TH') }}
              </p>
              <p v-if="trip.updatedAt !== trip.createdAt" class="text-sm text-gray-500">
                อัปเดตล่าสุด: {{ new Date(trip.updatedAt).toLocaleString('th-TH') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

