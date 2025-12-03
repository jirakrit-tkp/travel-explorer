<script setup lang="ts">
import { computed } from 'vue'

interface Trip {
  id: number
  title: string
  description: string
  photos: string[]
  tags: string[]
}

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  (event: 'tagSelected', tag: string): void
}>()

const MAX_PREVIEW_LENGTH = 200

const previewText = computed(() => {
  const raw = props.trip.description ?? ''
  const description = raw.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()
  if (description.length <= MAX_PREVIEW_LENGTH) {
    return description
  }
  return `${description.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}...`
})

const hasMore = computed(() => {
  const description = props.trip.description ?? ''
  return description.length > MAX_PREVIEW_LENGTH
})

const handleTagClick = (tag: string) => {
  emit('tagSelected', tag)
}
</script>

<template>
  <router-link
    :to="`/trips/${trip.id}`"
    class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <section class="flex flex-col md:flex-row">
      <div
        v-if="trip.photos && trip.photos.length > 0"
        class="md:w-1/3 lg:w-1/4 h-56 md:h-64 lg:h-72 overflow-hidden bg-gray-200"
      >
        <img
          :src="trip.photos[0]"
          :alt="trip.title"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="md:w-1/3 lg:w-1/4 h-56 md:h-64 lg:h-72 bg-gray-200 flex items-center justify-center"
      >
        <span class="text-gray-400">ไม่มีรูปภาพ</span>
      </div>

      <article class="flex-1 p-4">
        <h3 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {{ trip.title }}
        </h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">
          {{ previewText }}
          <router-link
            v-if="hasMore"
            :to="`/trips/${trip.id}`"
            class="ml-1 text-sky-600 underline"
          >
            อ่านต่อ
          </router-link>
        </p>

        <section
          v-if="trip.photos && trip.photos.length > 1"
          class="mt-3 flex gap-2 overflow-x-auto pb-1"
        >
          <figure
            v-for="photo in trip.photos.slice(1)"
            :key="photo"
            class="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200"
          >
            <img
              :src="photo"
              :alt="trip.title"
              class="h-full w-full object-cover"
            />
          </figure>
        </section>

        <div v-if="trip.tags && trip.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="tag in trip.tags"
            :key="tag"
            type="button"
            class="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full cursor-pointer hover:bg-sky-200"
            @click.stop.prevent="handleTagClick(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </article>
    </section>
  </router-link>
</template>
