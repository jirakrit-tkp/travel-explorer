<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { ChevronDown } from 'lucide-vue-next'

const router = useRouter()
const { user, isAuthenticated, logout, fetchUser } = useAuth()

const isProfileOpen = ref(false)
const isMobileMenuOpen = ref(false)

const displayName = computed(() => {
  return user.value?.displayName || user.value?.email || ''
})

const toggleProfileMenu = () => {
  if (!isAuthenticated.value) {
    return
  }
  isProfileOpen.value = !isProfileOpen.value
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleGoToMyTrips = () => {
  isProfileOpen.value = false
  router.push('/my-trips')
}

const handleLogout = async () => {
  isProfileOpen.value = false
  await logout()
  router.push('/')
}

const navbarRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (!navbarRef.value) {
    return
  }

  const target = event.target as HTMLElement | null
  if (target && !navbarRef.value.contains(target)) {
    isProfileOpen.value = false
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    fetchUser()
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav ref="navbarRef" class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <router-link to="/" class="flex items-center cursor-pointer">
          <h1 class="text-2xl font-bold text-sky-600">เที่ยวไหนดี</h1>
        </router-link>
        <div class="hidden md:flex items-center space-x-6">
          <div v-if="isAuthenticated" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm cursor-pointer"
              @click="toggleProfileMenu"
            >
              <span class="font-medium">{{ displayName }}</span>
              <ChevronDown class="h-4 w-4" />
            </button>

            <section
              v-if="isProfileOpen"
              class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20"
            >
              <button
                type="button"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                @click="handleGoToMyTrips"
              >
                ทริปของฉัน
              </button>
              <button
                type="button"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                @click="handleLogout"
              >
                ออกจากระบบ
              </button>
            </section>
          </div>
          <router-link
            v-else
            to="/login"
            class="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm cursor-pointer"
          >
            เข้าสู่ระบบ
          </router-link>
        </div>
        <button
          type="button"
          class="md:hidden text-gray-700 cursor-pointer"
          @click="toggleMobileMenu"
          aria-label="เปิดเมนู"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <section
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-gray-200 pt-4 mt-2 pb-4"
      >
        <div v-if="isAuthenticated" class="space-y-3">
          <p class="text-sm font-medium text-gray-800">
            {{ displayName }}
          </p>
          <button
            type="button"
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
            @click="() => { handleGoToMyTrips() ; isMobileMenuOpen = false }"
          >
            ทริปของฉัน
          </button>
          <button
            type="button"
            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            @click="() => { handleLogout() ; isMobileMenuOpen = false }"
          >
            ออกจากระบบ
          </button>
        </div>
        <div v-else class="space-y-3">
          <router-link
            to="/login"
            class="block w-full text-center px-4 py-2 text-sm text-white bg-sky-500 hover:bg-sky-600 rounded-lg cursor-pointer"
            @click="isMobileMenuOpen = false"
          >
            เข้าสู่ระบบ
          </router-link>
        </div>
      </section>
    </div>
  </nav>
</template>

<style scoped>
/* Component styles if needed */
</style>

