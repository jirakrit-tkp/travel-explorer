<script setup lang="ts">
import { useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import TripForm from '../components/TripForm.vue'

const router = useRouter()

const handleSubmit = (data: { id?: number; trip: unknown }) => {
  if (data.id) {
    router.push(`/trips/${data.id}`)
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">สร้างทริปใหม่</h1>

        <TripForm @submit="handleSubmit">
          <template #cancel-button>
            <router-link
              to="/my-trips"
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
