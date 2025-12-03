<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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
}

const trips = ref<Trip[]>([])
const searchQuery = ref('')
const suggestions = ref<Trip[]>([])
const searchContainerRef = ref<HTMLElement | null>(null)
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
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-sky-600 transition-colors"
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
              v-for="trip in trips"
              :key="trip.id"
              :trip="trip"
              @tagSelected="handleTagSelected"
            />
          </div>
        </div>
      </section>
    </div>
  </DefaultLayout>
</template>

<style scoped>
/* View styles if needed */
</style>

