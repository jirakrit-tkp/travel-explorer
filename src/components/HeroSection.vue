<script setup lang="ts">
// HeroSection component with heading, subheading, and CTA button
</script>

<template>
  <section class="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          ค้นหาสถานที่ท่องเที่ยว
          <span class="text-blue-600">ที่คุณชื่นชอบ</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          สำรวจสถานที่ท่องเที่ยวที่น่าสนใจทั่วประเทศไทย พร้อมคำแนะนำและรีวิวจากผู้เชี่ยวชาญ
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
            เริ่มต้นค้นหา
          </button>
          <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-blue-600">
            ดูสถานที่แนะนำ
          </button>
        </div>
      </div>
      <div class="mt-16">
        <div class="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
          <div class="flex items-center gap-4">
            <label class="text-gray-700 font-medium whitespace-nowrap">ค้นหาที่เกี่ยว</label>
            <input
              type="text"
              placeholder="หาที่เกี่ยวแล้วไปกัน.."
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              ค้นหา
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Component styles if needed */
</style>

