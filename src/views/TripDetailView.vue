<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { tripsAPI } from '../services/api'
import { useAuth } from '../composables/useAuth'
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

const trip = ref<Trip | null>(null)
const loading = ref(false)
const error = ref('')
const deleting = ref(false)

const descriptionHtml = computed(() => {
  if (!trip.value) {
    return ''
  }

  return markdownToHtml(trip.value.description ?? '')
})

const isOwner = computed(() => {
  return isAuthenticated.value && user.value && trip.value && user.value.userId === trip.value.authorId
})

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
  if (!trip.value || !confirm('คุณแน่ใจหรือไม่ว่าต้องการลบทริปนี้?')) {
    return
  }

  deleting.value = true
  try {
    await tripsAPI.delete(trip.value.id)
    router.push('/my-trips')
  } catch (err) {
    alert('ไม่สามารถลบทริปได้')
    console.error(err)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchTrip()
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
          <!-- Images -->
          <div v-if="trip.photos && trip.photos.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
            <div
              v-for="(photo, index) in trip.photos"
              :key="index"
              class="aspect-video overflow-hidden rounded-lg bg-gray-200"
            >
              <img
                :src="photo"
                :alt="`${trip.title} - รูปที่ ${index + 1}`"
                class="w-full h-full object-cover"
              />
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
                  class="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  แก้ไข
                </router-link>
                <button
                  @click="handleDelete"
                  :disabled="deleting"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {{ deleting ? 'กำลังลบ...' : 'ลบ' }}
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

            <!-- Location -->
            <div v-if="trip.latitude && trip.longitude" class="mb-4 text-sm text-gray-600">
              <p>ตำแหน่ง: {{ trip.latitude }}, {{ trip.longitude }}</p>
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

