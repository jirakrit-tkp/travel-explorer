<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { tripsAPI } from '../services/api'
import { useAuth } from '../composables/useAuth'
import type { AxiosResponse } from 'axios'
import TripForm from '../components/TripForm.vue'

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

const trip = ref<Trip | null>(null)
const loading = ref(false)
const error = ref('')

const fetchTrip = async () => {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    const response: AxiosResponse<Trip> = await tripsAPI.getById(id)
    const tripData = response.data

    // Check if user is owner
    if (user.value && user.value.userId !== tripData.authorId) {
      error.value = 'คุณไม่มีสิทธิ์แก้ไขทริปนี้'
      return
    }

    trip.value = tripData
  } catch (err) {
    error.value = 'ไม่สามารถโหลดทริปได้'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = (data: { id?: number; trip: unknown }) => {
  if (data.id) {
    router.push(`/trips/${data.id}`)
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

        <TripForm
          v-else
          :trip-id="Number(route.params.id)"
          :initial-data="trip || undefined"
          @submit="handleSubmit"
        >
          <template #cancel-button>
            <router-link
              :to="`/trips/${route.params.id}`"
              class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              ยกเลิก
            </router-link>
          </template>
        </TripForm>
      </div>
    </div>
  </DefaultLayout>
</template>

