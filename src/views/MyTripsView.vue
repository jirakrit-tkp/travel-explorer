<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import TripCard from '../components/TripCard.vue'
import { tripsAPI } from '../services/api'
import type { AxiosResponse } from 'axios'

interface Trip {
  id: number
  title: string
  description: string
  photos: string[]
  tags: string[]
}

const trips = ref<Trip[]>([])
const loading = ref(false)
const error = ref('')

const fetchTrips = async () => {
  loading.value = true
  error.value = ''
  try {
    const response: AxiosResponse<Trip[]> = await tripsAPI.getMine()
    trips.value = response.data
  } catch (err) {
    error.value = 'ไม่สามารถโหลดทริปได้'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">ทริปของฉัน</h1>
          <router-link
            to="/trips/create"
            class="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold"
          >
            + สร้างทริปใหม่
          </router-link>
        </div>

        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-600">กำลังโหลด...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600">{{ error }}</p>
        </div>

        <div v-else-if="trips.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">คุณยังไม่มีทริป</p>
          <router-link
            to="/trips/create"
            class="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold"
          >
            สร้างทริปแรกของคุณ
          </router-link>
        </div>

        <div v-else class="flex flex-col gap-10">
          <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

