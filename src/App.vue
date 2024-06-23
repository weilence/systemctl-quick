<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { isDark } from './composables'

const route = useRoute()

const router = useRouter()
const routes = router.getRoutes().filter(m => m.meta?.menu).sort((a, b) => a.meta.index! - b.meta.index!)
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : undefined">
    <n-message-provider>
      <main>
        <n-layout>
          <n-layout-header>
            <n-flex :size="0">
              <router-link v-for="r of routes" :key="r.name" :to="r.path">
                <div class="cursor-pointer px-6 py-3 text-lg hover:bg-blue-500" :class="{ 'bg-blue-500/80': route.path === r.path }">
                  <span>{{ r.meta.menu }}</span>
                </div>
              </router-link>
            </n-flex>
          </n-layout-header>
          <n-layout-content>
            <div class="bg-gray-500/15 p-6">
              <router-view />
            </div>
          </n-layout-content>
          <n-layout-footer class="text-center">
            <Footer />
          </n-layout-footer>
        </n-layout>
      </main>
    </n-message-provider>
  </n-config-provider>
</template>
