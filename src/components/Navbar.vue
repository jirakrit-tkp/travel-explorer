<script setup lang="ts">
// Navbar component with logo and navigation links
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-blue-600">เที่ยวไหนดี</h1>
        </div>
        <div class="hidden md:flex space-x-8">
          <a href="#" class="text-gray-700 hover:text-blue-600 transition-colors">หน้าแรก</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 transition-colors">สถานที่ท่องเที่ยว</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 transition-colors">เกี่ยวกับเรา</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 transition-colors">ติดต่อ</a>
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

