<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { tripsAPI, filesAPI } from '../services/api'
import type { AxiosResponse } from 'axios'

const router = useRouter()

const title = ref('')
const description = ref('')
const tags = ref('')
const latitude = ref('')
const longitude = ref('')
const photos = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const submitting = ref(false)
const error = ref('')

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
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

const handleSubmit = async () => {
  error.value = ''

  if (!title.value.trim()) {
    error.value = 'กรุณากรอกชื่อทริป'
    return
  }

  submitting.value = true

  try {
    // Upload photos first
    let photoUrls = photos.value
    if (selectedFiles.value.length > 0) {
      photoUrls = await uploadPhotos()
    }

    // Parse tags
    const tagsArray = tags.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Parse coordinates
    const lat = latitude.value ? parseFloat(latitude.value) : undefined
    const lon = longitude.value ? parseFloat(longitude.value) : undefined

    // Create trip
    const response = await tripsAPI.create({
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      photos: photoUrls.length > 0 ? photoUrls : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      latitude: lat,
      longitude: lon,
    })

    router.push(`/trips/${response.data.id}`)
  } catch (err) {
    error.value = 'ไม่สามารถสร้างทริปได้'
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">สร้างทริปใหม่</h1>

        <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6 space-y-6">
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
              placeholder="เช่น เที่ยวเกาะช้าง"
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
              placeholder="อธิบายเกี่ยวกับทริปนี้..."
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
              placeholder="เช่น เกาะ, ทะเล, ธรรมชาติ"
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
                placeholder="13.7563"
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
                placeholder="100.5018"
              />
            </div>
          </div>

          <div>
            <label for="photos" class="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพ
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
              {{ submitting ? 'กำลังสร้าง...' : uploading ? 'กำลังอัปโหลด...' : 'สร้างทริป' }}
            </button>
            <router-link
              to="/my-trips"
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

