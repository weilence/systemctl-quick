<script setup lang="ts">
import { isDark, toggleDark } from '~/composables'
</script>

<template>
  <nav class="my-6 inline-flex gap-2 text-xl">
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
  </nav>
</template>
