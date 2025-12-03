<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { tripsAPI, filesAPI } from '../services/api'
import { useAuth } from '../composables/useAuth'
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
}

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const title = ref('')
const description = ref('')
const tags = ref('')
const latitude = ref('')
const longitude = ref('')
const existingPhotos = ref<string[]>([])
const photosToDelete = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const submitting = ref(false)
const loading = ref(false)
const error = ref('')

const fetchTrip = async () => {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    const response: AxiosResponse<Trip> = await tripsAPI.getById(id)
    const trip = response.data

    // Check if user is owner
    if (user.value && user.value.userId !== trip.authorId) {
      error.value = 'คุณไม่มีสิทธิ์แก้ไขทริปนี้'
      return
    }

    title.value = trip.title
    description.value = trip.description || ''
    tags.value = trip.tags ? trip.tags.join(', ') : ''
    latitude.value = trip.latitude?.toString() || ''
    longitude.value = trip.longitude?.toString() || ''
    existingPhotos.value = trip.photos || []
  } catch (err) {
    error.value = 'ไม่สามารถโหลดทริปได้'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const removePhoto = (url: string) => {
  existingPhotos.value = existingPhotos.value.filter((p) => p !== url)
  photosToDelete.value.push(url)
}

const uploadPhotos = async () => {
  if (selectedFiles.value.length === 0) return []

  uploading.value = true
  try {
    const uploadPromises = selectedFiles.value.map((file) => filesAPI.upload(file))
    const responses = await Promise.all(uploadPromises)
    return responses.map((res: AxiosResponse<{ url: string }>) => res.data.url)
  } catch (err) {
    console.error('Upload failed:', err)
    throw err
  } finally {
    uploading.value = false
  }
}

const deletePhotos = async () => {
  if (photosToDelete.value.length === 0) return

  try {
    const deletePromises = photosToDelete.value.map((url) => filesAPI.delete(url))
    await Promise.all(deletePromises)
  } catch (err) {
    console.error('Delete photos failed:', err)
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!title.value.trim()) {
    error.value = 'กรุณากรอกชื่อทริป'
    return
  }

  submitting.value = true

  try {
    // Delete removed photos
    await deletePhotos()

    // Upload new photos
    let newPhotoUrls: string[] = []
    if (selectedFiles.value.length > 0) {
      newPhotoUrls = await uploadPhotos()
    }

    // Combine existing and new photos
    const allPhotos = [...existingPhotos.value, ...newPhotoUrls]

    // Parse tags
    const tagsArray = tags.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Parse coordinates
    const lat = latitude.value ? parseFloat(latitude.value) : undefined
    const lon = longitude.value ? parseFloat(longitude.value) : undefined

    // Update trip
    const id = Number(route.params.id)
    await tripsAPI.update(id, {
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      photos: allPhotos.length > 0 ? allPhotos : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      latitude: lat,
      longitude: lon,
    })

    router.push(`/trips/${id}`)
  } catch (err) {
    error.value = 'ไม่สามารถอัปเดตทริปได้'
    console.error(err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchTrip()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">แก้ไขทริป</h1>

        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-600">กำลังโหลด...</p>
        </div>

        <div v-else-if="error" class="bg-white rounded-lg shadow-md p-6">
          <p class="text-red-600 mb-4">{{ error }}</p>
          <router-link
            to="/my-trips"
            class="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold"
          >
            กลับไปทริปของฉัน
          </router-link>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              ชื่อทริป <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              id="description"
              v-model="description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
              แท็ก (คั่นด้วย comma)
            </label>
            <input
              id="tags"
              v-model="tags"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="latitude" class="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                id="latitude"
                v-model="latitude"
                type="number"
                step="any"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="longitude" class="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                id="longitude"
                v-model="longitude"
                type="number"
                step="any"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Existing Photos -->
          <div v-if="existingPhotos.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพที่มีอยู่
            </label>
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="(photo, index) in existingPhotos"
                :key="index"
                class="relative aspect-video bg-gray-200 rounded-lg overflow-hidden group"
              >
                <img :src="photo" :alt="`รูปที่ ${index + 1}`" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="removePhoto(photo)"
                  class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- New Photos -->
          <div>
            <label for="photos" class="block text-sm font-medium text-gray-700 mb-2">
              เพิ่มรูปภาพ
            </label>
            <input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p class="mt-2 text-sm text-gray-500">
              เลือกได้หลายไฟล์ ({{ selectedFiles.length }} ไฟล์ที่เลือก)
            </p>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="submitting || uploading"
              class="flex-1 px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'กำลังอัปเดต...' : uploading ? 'กำลังอัปโหลด...' : 'บันทึก' }}
            </button>
            <router-link
              :to="`/trips/${route.params.id}`"
              class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              ยกเลิก
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </DefaultLayout>
</template>

