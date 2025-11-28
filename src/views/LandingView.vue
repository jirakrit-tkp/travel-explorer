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
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')

const fetchTrips = async (query?: string) => {
  loading.value = true
  error.value = ''
  try {
    let response: AxiosResponse<Trip[]>
    if (query && query.trim()) {
      response = await tripsAPI.search(query.trim())
    } else {
      response = await tripsAPI.getAll()
    }
    trips.value = response.data
  } catch (err) {
    error.value = 'ไม่สามารถโหลดทริปได้'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchTrips(searchQuery.value)
}

onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Search Section -->
      <section class="bg-white py-8 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row gap-4 items-center">
            <div class="flex-1 w-full">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาทริป..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @keyup.enter="handleSearch"
              />
            </div>
            <button
              @click="handleSearch"
              class="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ค้นหา
            </button>
          </div>
        </div>
      </section>

      <!-- Trips Section -->
      <section class="py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-8">ทริปทั้งหมด</h2>

          <div v-if="loading" class="text-center py-12">
            <p class="text-gray-600">กำลังโหลด...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
          </div>

          <div v-else-if="trips.length === 0" class="text-center py-12">
            <p class="text-gray-600">ไม่พบทริป</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
          </div>
        </div>
      </section>
    </div>
  </DefaultLayout>
</template>

<style scoped>
/* View styles if needed */
</style>

