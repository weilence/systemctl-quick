<script setup lang="tsx">
import { computed, onMounted, onUnmounted } from 'vue'
import { useModal } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { Client } from './client'

const client = new Client()

onMounted(async () => {
  await client.start()
})

onUnmounted(async () => {
  await client.stop()
})

const modal = useModal()

function qrcode(userId: string) {
  const url = computed(() => {
    return `${window.location.href}?userId=${userId}`
  })
  modal.create({
    title: '二维码',
    style: {
      width: '600px',
    },
    preset: 'card',
    content: () => (
      <div class="flex flex-col items-center gap-4">
        <n-qr-code value={url.value} size={200} padding={24} />
        <span>{ url.value }</span>
      </div>
    ),
  })
}

const router = useRouter()
const route = useRoute()
const userId = route.query.userId as string | null
if (userId) {
  client.addQrcodeUser(userId)
  const query = { ...route.query }
  delete query.userId
  router.replace({ query })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <n-card>
      <template #header>
        <n-button type="info" @click="qrcode(client.currentUserId.value)">
          二维码
        </n-button>
      </template>
      <n-list class="flex-auto">
        <n-list-item v-for="u of client.users.value" :key="u.id">
          <template #suffix>
            <div class="flex gap-2">
              <n-upload :data="{ userId: u.id }" :custom-request="client.upload">
                <n-button type="primary">
                  发送文件
                </n-button>
              </n-upload>
            </div>
          </template>
          <span>
            {{ u.id }} <n-tag v-if="u.status" type="primary">{{ u.status }}</n-tag>
          </span>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "menu": "Transfer",
    "index": 4
  }
}
</route>
