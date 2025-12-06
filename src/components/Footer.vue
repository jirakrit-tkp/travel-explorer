<script setup lang="ts">
import { Github, Linkedin, Mail } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <section class="text-center md:text-left">
          <h3 class="text-xl font-bold mb-2">เที่ยวไหนดี</h3>
          <p class="text-gray-400 text-sm">
            ค้นหาสถานที่ท่องเที่ยวที่คุณชื่นชอบ และวางแผนการเดินทางของคุณ
          </p>
        </section>

        <section class="flex flex-col items-center md:items-end text-sm text-gray-300 gap-2">
          <h4 class="font-semibold">ติดต่อเรา</h4>
          <nav class="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/jirakrit-takerngpon/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 hover:text-sky-400 transition-colors"
            >
              <Linkedin class="h-5 w-5" />
            </a>
            <a
              href="https://github.com/jirakrit-tkp"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 hover:text-sky-400 transition-colors"
            >
              <Github class="h-5 w-5" />
            </a>
            <a
              href="mailto:jirakrit.tkp@gmail.com"
              class="flex items-center gap-2 hover:text-sky-400 transition-colors"
            >
              <Mail class="h-5 w-5" />
            </a>
          </nav>
        </section>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Component styles if needed */
</style>

