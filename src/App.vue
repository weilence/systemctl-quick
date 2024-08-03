<script setup lang="tsx">
import type { MenuProps } from 'naive-ui'
import { darkTheme } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { isDark } from './composables'

const route = useRoute()
const router = useRouter()

const menus = router.getRoutes().filter(m => m.meta?.menu).sort((a, b) => a.meta.index! - b.meta.index!).map(r => ({
  label: () => <router-link to={r.path}>{r.meta.menu}</router-link>,
  key: r.path,
}))

type MenuThemeOverrides = NonNullable<MenuProps['themeOverrides']>

const menuThemeOverrides: MenuThemeOverrides = {
  itemHeight: '52px',
  fontSize: '18px',
}
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : undefined">
    <n-modal-provider>
      <n-message-provider>
        <main>
          <n-layout>
            <n-layout-header>
              <n-flex :size="0">
                <n-menu :theme-overrides="menuThemeOverrides" :value="route.path" :options="menus" mode="horizontal" responsive />
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
    </n-modal-provider>
  </n-config-provider>
</template>
