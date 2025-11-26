<script setup lang="ts">
// FeatureSection component with 3-4 features
const features = [
  {
    icon: '🗺️',
    title: 'ค้นหาง่าย',
    description: 'ค้นหาสถานที่ท่องเที่ยวได้อย่างรวดเร็วด้วยระบบค้นหาที่ทันสมัย'
  },
  {
    icon: '📸',
    title: 'ภาพสวยงาม',
    description: 'ชมภาพถ่ายคุณภาพสูงจากสถานที่ท่องเที่ยวจริง'
  },
  {
    icon: '⭐',
    title: 'รีวิวจริง',
    description: 'อ่านรีวิวและคำแนะนำจากผู้ที่เคยไปเยือนจริง'
  },
  {
    icon: '🎯',
    title: 'แนะนำเฉพาะ',
    description: 'รับคำแนะนำสถานที่ท่องเที่ยวที่เหมาะกับคุณ'
  }
]
</script>

<template>
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">ทำไมต้องเลือกเรา</h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          เรามีเครื่องมือและข้อมูลที่ช่วยให้คุณวางแผนการเดินทางได้อย่างสมบูรณ์แบบ
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
        >
          <div class="text-5xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Component styles if needed */
</style>

