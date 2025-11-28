<script setup lang="ts">
interface Trip {
  id: number
  title: string
  description: string
  photos: string[]
  tags: string[]
}

defineProps<{
  trip: Trip
}>()
</script>

<template>
  <router-link
    :to="`/trips/${trip.id}`"
    class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <div v-if="trip.photos && trip.photos.length > 0" class="aspect-video w-full overflow-hidden bg-gray-200">
      <img
        :src="trip.photos[0]"
        :alt="trip.title"
        class="w-full h-full object-cover"
      />
    </div>
    <div v-else class="aspect-video w-full bg-gray-200 flex items-center justify-center">
      <span class="text-gray-400">ไม่มีรูปภาพ</span>
    </div>
    <div class="p-4">
      <h3 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ trip.title }}
      </h3>
      <p class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ trip.description }}
      </p>
      <div v-if="trip.tags && trip.tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="tag in trip.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          {{ tag }}
        </span>
        <span v-if="trip.tags.length > 3" class="px-2 py-1 text-gray-500 text-xs">
          +{{ trip.tags.length - 3 }}
        </span>
      </div>
    </div>
  </router-link>
</template>

