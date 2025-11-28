<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <router-link to="/" class="flex items-center">
          <h1 class="text-2xl font-bold text-blue-600">เที่ยวไหนดี</h1>
        </router-link>
        <div class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="text-gray-700 hover:text-blue-600 transition-colors">
            หน้าแรก
          </router-link>
          <template v-if="isAuthenticated">
            <router-link to="/my-trips" class="text-gray-700 hover:text-blue-600 transition-colors">
              ทริปของฉัน
            </router-link>
            <router-link to="/trips/create" class="text-gray-700 hover:text-blue-600 transition-colors">
              สร้างทริป
            </router-link>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">{{ user?.displayName || user?.email }}</span>
              <button
                @click="handleLogout"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                ออกจากระบบ
              </button>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="text-gray-700 hover:text-blue-600 transition-colors">
              เข้าสู่ระบบ
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              สมัครสมาชิก
            </router-link>
          </template>
        </div>
        <button class="md:hidden text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Component styles if needed */
</style>

