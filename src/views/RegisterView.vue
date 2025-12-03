<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { register } = useAuth()

const email = ref('')
const password = ref('')
const displayName = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    loading.value = false
    return
  }

  if (password.value.length < 6) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    loading.value = false
    return
  }

  const result = await register(email.value, password.value, displayName.value || undefined)
  
  if (result.success) {
    router.push('/my-trips')
  } else {
    error.value = result.error || 'สมัครสมาชิกไม่สำเร็จ'
  }
  
  loading.value = false
}
</script>

<template>
  <DefaultLayout>
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-lg px-8 py-10 space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          สมัครสมาชิก
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          หรือ
          <router-link to="/login" class="font-medium text-sky-600 hover:text-sky-500">
            เข้าสู่ระบบ
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="sr-only">อีเมล</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
              placeholder="อีเมล"
            />
          </div>
          <div>
            <label for="password" class="sr-only">รหัสผ่าน</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            />
          </div>
          <div>
            <label for="displayName" class="sr-only">ชื่อแสดง</label>
            <input
              id="displayName"
              v-model="displayName"
              type="text"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
              placeholder="ชื่อแสดง (ไม่บังคับ)"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  </DefaultLayout>
</template>

