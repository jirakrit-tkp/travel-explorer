<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
  authorId?: number
  createdAt?: string
}

const trips = ref<Trip[]>([])
const loading = ref(false)
const error = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 8

const totalPages = computed(() => {
  return Math.ceil(trips.value.length / itemsPerPage)
})

const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return trips.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleTripDeleted = (tripId: number) => {
  trips.value = trips.value.filter((t) => t.id !== tripId)
  // Reset to first page if current page becomes empty
  if (paginatedTrips.value.length === 0 && currentPage.value > 1) {
    currentPage.value = 1
  }
}

const fetchTrips = async () => {
  loading.value = true
  error.value = ''
  currentPage.value = 1 // Reset to first page when fetching new data
  try {
    const response: AxiosResponse<Trip[]> = await tripsAPI.getMine()
    // Sort by createdAt (newest first) or by id (newest first) if createdAt not available
    trips.value = response.data.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      // Fallback to id (higher id = newer)
      return b.id - a.id
    })
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
            class="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold cursor-pointer"
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
            class="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold cursor-pointer"
          >
            สร้างทริปแรกของคุณ
          </router-link>
        </div>

        <div v-else class="flex flex-col gap-10">
          <TripCard
            v-for="trip in paginatedTrips"
            :key="trip.id"
            :trip="trip"
            @deleted="handleTripDeleted"
          />

          <!-- Pagination -->
          <div class="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              @click="prevPage"
              :disabled="currentPage === 1"
              :class="[
                'px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer',
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-sky-500 text-white hover:bg-sky-600',
              ]"
            >
              Previous
            </button>
            <div class="flex items-center gap-2">
              <span class="text-gray-700 font-medium">หน้า</span>
              <select
                :value="currentPage"
                @change="goToPage(Number(($event.target as HTMLSelectElement).value))"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-700 font-medium cursor-pointer"
              >
                <option v-for="page in totalPages" :key="page" :value="page">
                  {{ page }}
                </option>
              </select>
              <span class="text-gray-700 font-medium">/ {{ totalPages }}</span>
            </div>
            <button
              type="button"
              @click="nextPage"
              :disabled="currentPage === totalPages"
              :class="[
                'px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer',
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-sky-500 text-white hover:bg-sky-600',
              ]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

