<script setup lang="ts">
import { isDark, toggleDark } from '~/composables'
</script>

<template>
  <nav class="py-4">
    <div class="inline-flex gap-2 text-xl">
      <div class="icon-btn cursor-pointer !outline-none" @click="toggleDark()">
        <div v-if="isDark" class="i-carbon-moon" />
        <div v-else class="i-carbon-sun" />
      </div>

      <a
        class="icon-btn i-carbon-logo-github"
        rel="noreferrer"
        href="https://github.com/Weilence/systemctl-quick"
        target="_blank"
        title="GitHub"
      />
    </div>
    <div class="flex justify-center">
      <span class="text-sm text-gray-500">
        <a href="https://beian.miit.gov.cn/" target="_blank" class="text-gray-500 underline decoration-dotted transition-colors hover:text-gray-400">湘ICP备2022003006号-1</a>
      </span>
    </div>
  </nav>
</template>
