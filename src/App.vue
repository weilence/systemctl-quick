<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { isDark } from './composables'

const route = useRoute()
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : undefined">
    <n-message-provider>
      <main font-sans>
        <n-layout>
          <n-layout-header>
            <div flex>
              <div flex-1 />
              <router-link to="/systemctl">
                <div text-lg px-6 py-3 hover:bg="blue-500" cursor-pointer :class="{ 'bg-blue-500/80': route.path === '/systemctl' }">
                  <span>SystemCtl</span>
                </div>
              </router-link>
              <router-link to="/nginx">
                <div text-lg px-6 py-3 hover:bg="blue-500" cursor-pointer :class="{ 'bg-blue-500/80': route.path === '/nginx' }">
                  <span>Nginx</span>
                </div>
              </router-link>
            </div>
          </n-layout-header>
          <n-layout-content>
            <div bg="gray-500/15" p-6>
              <router-view />
            </div>
          </n-layout-content>
          <n-layout-footer text="center">
            <Footer />
          </n-layout-footer>
        </n-layout>
      </main>
    </n-message-provider>
  </n-config-provider>
</template>
