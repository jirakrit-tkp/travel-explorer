<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Search } from 'lucide-vue-next'
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
}

const trips = ref<Trip[]>([])
const searchQuery = ref('')
const suggestions = ref<Trip[]>([])
const searchContainerRef = ref<HTMLElement | null>(null)
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

const fetchTrips = async (query?: string) => {
  loading.value = true
  error.value = ''
  currentPage.value = 1 // Reset to first page when fetching new data
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

let suggestionTimeoutId: number | null = null

const fetchSuggestions = async (query: string) => {
  if (!query.trim()) {
    suggestions.value = []
    return
  }

  try {
    const response: AxiosResponse<Trip[]> = await tripsAPI.search(query.trim())
    suggestions.value = response.data
  } catch (err) {
    // ไม่ต้องแสดง error แค่ไม่ขึ้น suggestion
    console.error(err)
  }
}

const handleSelectSuggestion = (trip: Trip) => {
  searchQuery.value = trip.title
  suggestions.value = []
  fetchTrips(trip.title)
}

const handleTagSelected = (tag: string) => {
  searchQuery.value = tag
  suggestions.value = []
  fetchTrips(tag)
}

const handleClickOutside = (event: MouseEvent) => {
  if (!searchContainerRef.value) {
    return
  }

  const target = event.target as HTMLElement | null
  if (target && !searchContainerRef.value.contains(target)) {
    suggestions.value = []
  }
}

watch(
  searchQuery,
  (value) => {
    if (suggestionTimeoutId !== null) {
      window.clearTimeout(suggestionTimeoutId)
    }

    suggestionTimeoutId = window.setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  },
)

onMounted(() => {
  fetchTrips()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

onMounted(() => {
  // already handled in onMounted above
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Trips Section -->
      <section class="py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header class="mb-8">
            <div class="flex flex-col sm:flex-row gap-4 items-center">
              <div ref="searchContainerRef" class="relative flex-1 w-full">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="ค้นหาทริป..."
                  class="w-full px-4 py-3 pr-10 border-b-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  @keyup.enter="handleSearch"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-sky-600 transition-colors cursor-pointer"
                  @click="handleSearch"
                  aria-label="ค้นหา"
                >
                  <Search class="h-5 w-5" />
                </button>

                <ul
                  v-if="suggestions.length > 0 && searchQuery.trim()"
                  class="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                >
                  <li
                    v-for="trip in suggestions"
                    :key="trip.id"
                  >
                    <button
                      type="button"
                      class="w-full text-left px-4 py-2 hover:bg-sky-50"
                      @click="handleSelectSuggestion(trip)"
                    >
                      {{ trip.title }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          <div v-if="loading" class="text-center py-12">
            <p class="text-gray-600">กำลังโหลด...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
          </div>

          <div v-else-if="trips.length === 0" class="text-center py-12 kanit-regular">
            <p class="text-gray-600">ไม่พบทริป</p>
          </div>

          <div v-else class="flex flex-col gap-10 kanit-regular">
            <TripCard
              v-for="trip in paginatedTrips"
              :key="trip.id"
              :trip="trip"
              @tagSelected="handleTagSelected"
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
      </section>
    </div>
  </DefaultLayout>
</template>

<style scoped>
/* View styles if needed */
</style>

