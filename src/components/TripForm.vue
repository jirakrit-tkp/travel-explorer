<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount, onMounted, watch, computed } from 'vue'
import { tripsAPI, filesAPI } from '../services/api'
import type { AxiosResponse } from 'axios'
import { Bold, Italic, Link, List, Code, X } from 'lucide-vue-next'
import GoogleMap from './GoogleMap.vue'

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

interface Props {
  tripId?: number
  initialData?: Trip
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tripId: undefined,
  initialData: undefined,
  loading: false,
})

const emit = defineEmits<{
  (event: 'submit', data: { id?: number; trip: unknown }): void
  (event: 'error', message: string): void
}>()

const title = ref('')
const description = ref('')
const tags = ref('')
const latitude = ref('')
const longitude = ref('')
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const existingPhotos = ref<string[]>([])
const photosToDelete = ref<string[]>([])
const photoInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const submitting = ref(false)
const error = ref('')
const descriptionTextareaRef = ref<HTMLTextAreaElement | null>(null)

// Validation error states
const errors = ref({
  title: false,
  description: false,
  tags: false,
  photos: false,
  latitude: false,
  longitude: false,
})

// Computed for map coordinates
const mapLatitude = computed(() => {
  const lat = parseFloat(latitude.value)
  return isNaN(lat) ? undefined : lat
})

const mapLongitude = computed(() => {
  const lon = parseFloat(longitude.value)
  return isNaN(lon) ? undefined : lon
})

// Handle location selection from map
const handleLocationSelect = (data: { latitude: number; longitude: number }) => {
  latitude.value = data.latitude.toString()
  longitude.value = data.longitude.toString()
  // Clear errors when location is selected
  if (errors.value.latitude) errors.value.latitude = false
  if (errors.value.longitude) errors.value.longitude = false
}

// Load initial data for edit mode
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      title.value = data.title
      description.value = data.description || ''
      tags.value = data.tags ? data.tags.join(', ') : ''
      latitude.value = data.latitude?.toString() || ''
      longitude.value = data.longitude?.toString() || ''
      existingPhotos.value = data.photos || []
    }
  },
  { immediate: true },
)

// Clear errors when user starts typing
watch(title, () => {
  if (errors.value.title) {
    errors.value.title = false
  }
})

watch(description, () => {
  if (errors.value.description) {
    errors.value.description = false
  }
})

watch(tags, () => {
  if (errors.value.tags) {
    errors.value.tags = false
  }
})

watch(latitude, () => {
  if (errors.value.latitude) {
    errors.value.latitude = false
  }
})

watch(longitude, () => {
  if (errors.value.longitude) {
    errors.value.longitude = false
  }
})

watch([existingPhotos, selectedFiles], () => {
  if (errors.value.photos) {
    errors.value.photos = false
  }
})

const wrapSelection = (before: string, after?: string) => {
  const el = descriptionTextareaRef.value
  if (!el) {
    return
  }

  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const value = description.value
  const hasSelection = start !== end
  const selected = hasSelection ? value.slice(start, end) : 'ข้อความ'
  const suffix = after ?? before

  const next = value.slice(0, start) + before + selected + suffix + value.slice(end)

  description.value = next

  nextTick(() => {
    const from = start + before.length
    const to = from + selected.length
    el.focus()
    el.setSelectionRange(from, to)
  })
}

const formatBold = () => wrapSelection('**')
const formatItalic = () => wrapSelection('*')
const formatCode = () => wrapSelection('`')

const formatLink = () => {
  const el = descriptionTextareaRef.value
  if (!el) {
    return
  }

  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const value = description.value
  const label = value.slice(start, end) || 'ลิงก์'
  const url = 'https://example.com'
  const inserted = `[${label}](${url})`

  description.value = value.slice(0, start) + inserted + value.slice(end)

  nextTick(() => {
    const pos = start + inserted.length
    el.focus()
    el.setSelectionRange(pos, pos)
  })
}

const formatBullet = () => {
  const el = descriptionTextareaRef.value
  if (!el) {
    return
  }

  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const value = description.value
  const selection = value.slice(start, end) || 'รายการ'

  const lines = selection.split('\n').map((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      return ''
    }
    if (trimmed.startsWith('- ')) {
      return trimmed
    }
    return `- ${trimmed}`
  })

  const inserted = lines.join('\n')
  description.value = value.slice(0, start) + inserted + value.slice(end)

  nextTick(() => {
    const from = start
    const to = from + inserted.length
    el.focus()
    el.setSelectionRange(from, to)
  })
}

const revokePreviews = () => {
  previewUrls.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  previewUrls.value = []
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)

    // เพิ่มไฟล์ใหม่ต่อจากของเดิม
    selectedFiles.value = [...selectedFiles.value, ...files]

    const newUrls = files.map((file) => URL.createObjectURL(file))
    previewUrls.value = [...previewUrls.value, ...newUrls]

    // Clear the input so the same file can be selected again
    target.value = ''
  }
}

const openPhotoPicker = () => {
  if (photoInputRef.value) {
    photoInputRef.value.click()
  }
}

const removePhotoAt = (index: number) => {
  const url = previewUrls.value[index]
  if (url) {
    URL.revokeObjectURL(url)
  }
  previewUrls.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

const removeExistingPhoto = (url: string) => {
  existingPhotos.value = existingPhotos.value.filter((p) => p !== url)
  photosToDelete.value.push(url)
}

const setMainPhoto = (index: number) => {
  if (index < 0 || index >= selectedFiles.value.length) {
    return
  }

  const [file] = selectedFiles.value.splice(index, 1)
  const [url] = previewUrls.value.splice(index, 1)

  if (!file || !url) {
    return
  }

  // If there are existing photos, move first existing to end and make new photo main
  if (existingPhotos.value.length > 0) {
    const firstExisting = existingPhotos.value.shift()
    if (firstExisting) {
      existingPhotos.value.push(firstExisting)
    }
    // This new photo will be uploaded first and placed at index 0
    // We'll handle this during upload by putting it first in selectedFiles
    selectedFiles.value.unshift(file)
    previewUrls.value.unshift(url)
    // Mark that we need to reorder after upload
    // For now, we'll just put it first in selectedFiles
  } else {
    // No existing photos, just reorder new photos
    selectedFiles.value.unshift(file)
    previewUrls.value.unshift(url)
  }
}

const setMainExistingPhoto = (index: number) => {
  if (index <= 0 || index >= existingPhotos.value.length) {
    return
  }

  const [url] = existingPhotos.value.splice(index, 1)
  if (!url) {
    return
  }

  existingPhotos.value.unshift(url)
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

const validateForm = () => {
  // Reset all errors
  errors.value = {
    title: false,
    description: false,
    tags: false,
    photos: false,
    latitude: false,
    longitude: false,
  }

  let isValid = true

  // Validate title
  if (!title.value.trim()) {
    errors.value.title = true
    isValid = false
  }

  // Validate description
  if (!description.value.trim()) {
    errors.value.description = true
    isValid = false
  }

  // Validate tags
  if (!tags.value.trim()) {
    errors.value.tags = true
    isValid = false
  }

  // Validate photos (must have at least one photo)
  if (existingPhotos.value.length === 0 && selectedFiles.value.length === 0) {
    errors.value.photos = true
    isValid = false
  }

  // Validate latitude
  const latStr = String(latitude.value || '').trim()
  if (!latStr) {
    errors.value.latitude = true
    isValid = false
  } else {
    const lat = parseFloat(latStr)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.value.latitude = true
      isValid = false
    }
  }

  // Validate longitude
  const lonStr = String(longitude.value || '').trim()
  if (!lonStr) {
    errors.value.longitude = true
    isValid = false
  } else {
    const lon = parseFloat(lonStr)
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errors.value.longitude = true
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  error.value = ''

  // Validate all fields
  if (!validateForm()) {
    error.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  submitting.value = true

  try {
    // Delete removed photos (edit mode only)
    if (props.tripId) {
      await deletePhotos()
    }

    // Upload new photos
    let newPhotoUrls: string[] = []
    if (selectedFiles.value.length > 0) {
      newPhotoUrls = await uploadPhotos()
    }

    // Combine existing and new photos
    // If new photos exist and there are existing photos, the first new photo
    // (which is first in selectedFiles/previewUrls) should become the main photo
    let allPhotos: string[] = []
    if (existingPhotos.value.length > 0 && newPhotoUrls.length > 0) {
      // New photo[0] should be main, so put it first, then existing photos, then rest of new photos
      allPhotos = [newPhotoUrls[0], ...existingPhotos.value, ...newPhotoUrls.slice(1)]
    } else if (existingPhotos.value.length > 0) {
      // Only existing photos
      allPhotos = [...existingPhotos.value]
    } else {
      // Only new photos (or no photos)
      allPhotos = newPhotoUrls
    }

    // Parse tags
    const tagsArray = tags.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Parse coordinates
    const lat = latitude.value ? parseFloat(latitude.value) : undefined
    const lon = longitude.value ? parseFloat(longitude.value) : undefined

    const tripData = {
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      photos: allPhotos.length > 0 ? allPhotos : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      latitude: lat,
      longitude: lon,
    }

    if (props.tripId) {
      // Update trip
      const response = await tripsAPI.update(props.tripId, tripData)
      emit('submit', { id: props.tripId, trip: response.data })
    } else {
      // Create trip
      const response = await tripsAPI.create(tripData)
      emit('submit', { id: response.data.id, trip: response.data })
    }
  } catch (err) {
    const message = props.tripId ? 'ไม่สามารถอัปเดตทริปได้' : 'ไม่สามารถสร้างทริปได้'
    error.value = message
    emit('error', message)
    console.error(err)
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  revokePreviews()
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6 space-y-6">
    <!-- 1. Photos -->
    <section>
      <label for="photos" class="block text-sm font-medium text-gray-700 mb-2">
        รูปภาพ <span class="text-red-500">*</span>
      </label>

      <div class="flex flex-wrap gap-4">
        <button
          type="button"
          :class="[
            'flex items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg text-gray-400 hover:text-sky-500 transition-colors text-sm font-medium cursor-pointer',
            errors.photos
              ? 'border-red-500 hover:border-red-600'
              : 'border-gray-300 hover:border-sky-400',
          ]"
          @click="openPhotoPicker"
        >
          + เพิ่มรูป
        </button>

        <!-- Existing photos (edit mode) -->
        <figure
          v-for="(url, index) in existingPhotos"
          :key="`existing-${url}`"
          class="relative h-32 w-32 rounded-lg bg-gray-100"
        >
          <button
            v-if="index !== 0"
            type="button"
            class="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white cursor-pointer"
            @click.stop="setMainExistingPhoto(index)"
          >
            Main
          </button>
          <span
            v-else
            class="absolute left-1 top-1 z-10 rounded bg-sky-600 px-1.5 py-0.5 text-[10px] text-white"
          >
            Main
          </span>
          <button
            type="button"
            class="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md cursor-pointer"
            @click.stop="removeExistingPhoto(url)"
            aria-label="ลบรูปนี้"
          >
            <X class="h-3 w-3" />
          </button>
          <img :src="url" alt="รูปทริป" class="h-full w-full rounded-lg object-cover" />
        </figure>

        <!-- New photos (preview) -->
        <figure
          v-for="(url, index) in previewUrls"
          :key="`preview-${url}`"
          class="relative h-32 w-32 rounded-lg bg-gray-100"
        >
          <!-- Main badge for new photos -->
          <button
            v-if="index !== 0"
            type="button"
            class="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white cursor-pointer"
            @click.stop="setMainPhoto(index)"
          >
            Main
          </button>
          <span
            v-else
            class="absolute left-1 top-1 z-10 rounded bg-sky-600 px-1.5 py-0.5 text-[10px] text-white"
          >
            Main
          </span>
          <button
            type="button"
            class="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md cursor-pointer"
            @click.stop="removePhotoAt(index)"
            aria-label="ลบรูปนี้"
          >
            <X class="h-3 w-3" />
          </button>
          <img
            :src="url"
            alt="ตัวอย่างรูปทริป"
            class="h-full w-full rounded-lg object-cover"
          />
        </figure>
      </div>

      <input
        id="photos"
        ref="photoInputRef"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        class="sr-only"
      />

      <p v-if="errors.photos" class="mt-2 text-sm text-red-600">
        กรุณาเลือกรูปภาพอย่างน้อย 1 รูป
      </p>
      <p v-else class="mt-2 text-sm text-gray-500">
        เลือกได้หลายไฟล์ ({{ existingPhotos.length + selectedFiles.length }} ไฟล์ที่เลือก)
      </p>
    </section>

    <!-- 2. Title -->
    <section>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
        ชื่อทริป <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        v-model="title"
        type="text"
        required
        :class="[
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
          errors.title
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-sky-500 focus:border-transparent',
        ]"
        placeholder="เช่น เที่ยวเกาะช้าง"
      />
      <p v-if="errors.title" class="mt-1 text-sm text-red-600">
        กรุณากรอกชื่อทริป
      </p>
    </section>

    <!-- 3. Tags -->
    <section>
      <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
        แท็ก (คั่นด้วย comma) <span class="text-red-500">*</span>
      </label>
      <input
        id="tags"
        v-model="tags"
        type="text"
        :class="[
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
          errors.tags
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-sky-500 focus:border-transparent',
        ]"
        placeholder="เช่น เกาะ, ทะเล, ธรรมชาติ"
      />
      <p v-if="errors.tags" class="mt-1 text-sm text-red-600">
        กรุณากรอกแท็ก
      </p>
    </section>

    <!-- 4. Description -->
    <section>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
        คำอธิบาย <span class="text-red-500">*</span>
      </label>

      <!-- Markdown toolbar -->
      <div class="mb-2 flex flex-wrap gap-2 text-xs text-gray-600">
        <button
          type="button"
          class="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 cursor-pointer"
          @click="formatBold"
        >
          <Bold class="h-3 w-3" />
          <span class="font-semibold">ตัวหนา</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 cursor-pointer"
          @click="formatItalic"
        >
          <Italic class="h-3 w-3" />
          <span class="italic">ตัวเอียง</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 cursor-pointer"
          @click="formatCode"
        >
          <Code class="h-3 w-3" />
          <span>โค้ด</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 cursor-pointer"
          @click="formatBullet"
        >
          <List class="h-3 w-3" />
          <span>รายการ</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 cursor-pointer"
          @click="formatLink"
        >
          <Link class="h-3 w-3" />
          <span>ลิงก์</span>
        </button>
      </div>

      <textarea
        id="description"
        ref="descriptionTextareaRef"
        v-model="description"
        rows="12"
        :class="[
          'w-full px-4 py-2 min-h-64 border rounded-lg focus:outline-none focus:ring-2',
          errors.description
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-sky-500 focus:border-transparent',
        ]"
        placeholder="อธิบายเกี่ยวกับทริปนี้... ใช้ Markdown ได้ เช่น **ตัวหนา**, *ตัวเอียง*, [ลิงก์](https://example.com)"
      />

      <p v-if="errors.description" class="mt-1 text-sm text-red-600">
        กรุณากรอกคำอธิบาย
      </p>
      <p v-else class="mt-2 text-xs text-gray-500">
        รองรับ Markdown: **ตัวหนา**, *ตัวเอียง*, <code>`โค้ด`</code>, [ลิงก์](https://example.com),
        รายการด้วย
        <code>- item</code>
      </p>
    </section>

    <!-- 5. Lat / Long -->
    <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="latitude" class="block text-sm font-medium text-gray-700 mb-2">
          Latitude <span class="text-red-500">*</span>
        </label>
        <input
          id="latitude"
          v-model="latitude"
          type="number"
          step="any"
          :class="[
            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
            errors.latitude
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-sky-500 focus:border-transparent',
          ]"
          placeholder="13.7563"
        />
        <p v-if="errors.latitude" class="mt-1 text-sm text-red-600">
          กรุณากรอก Latitude ที่ถูกต้อง (-90 ถึง 90)
        </p>
      </div>
      <div>
        <label for="longitude" class="block text-sm font-medium text-gray-700 mb-2">
          Longitude <span class="text-red-500">*</span>
        </label>
        <input
          id="longitude"
          v-model="longitude"
          type="number"
          step="any"
          :class="[
            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
            errors.longitude
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-sky-500 focus:border-transparent',
          ]"
          placeholder="100.5018"
        />
        <p v-if="errors.longitude" class="mt-1 text-sm text-red-600">
          กรุณากรอก Longitude ที่ถูกต้อง (-180 ถึง 180)
        </p>
      </div>
    </section>

    <!-- Map Picker -->
    <section>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        เลือกตำแหน่งบนแผนที่
      </label>
      <p class="text-sm text-gray-500 mb-2">
        คลิกที่แผนที่เพื่อเลือกตำแหน่ง หรือลาก marker เพื่อย้ายตำแหน่ง
      </p>
      <GoogleMap
        :latitude="mapLatitude"
        :longitude="mapLongitude"
        :clickable="true"
        :zoom="10"
        @location-select="handleLocationSelect"
      />
    </section>

    <div v-if="error" class="text-red-600 text-sm">
      {{ error }}
    </div>

    <div class="flex gap-4">
      <button
        type="submit"
        :disabled="submitting || uploading"
        class="flex-1 px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {{
          submitting
            ? tripId
              ? 'กำลังอัปเดต...'
              : 'กำลังสร้าง...'
            : uploading
              ? 'กำลังอัปโหลด...'
              : tripId
                ? 'บันทึก'
                : 'สร้างทริป'
        }}
      </button>
      <slot name="cancel-button" />
    </div>
  </form>
</template>

