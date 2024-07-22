<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Client } from './client'

const client = new Client()

onMounted(async () => {
  await client.start()
})

onUnmounted(async () => {
  await client.stop()
})
</script>

<template>
  <div class="flex gap-4">
    <n-list class="flex-auto">
      <template #header>
        <span>
          Client: {{ client.currentUser.value }}
        </span>
      </template>
      <n-list-item v-for="m in client.users.value" :key="m.id">
        <template #suffix>
          <n-button v-if="m.connectionState !== 'connected'" @click="client.connect(m.id)">
            连接
          </n-button>
          <n-upload v-else :data="{ userId: m.id }" :custom-request="client.upload">
            <n-button>上传文件</n-button>
          </n-upload>
        </template>
        <span>
          {{ m.id }} <n-tag type="primary">{{ m.status }}</n-tag> <n-tag v-if="m.connectionState" type="info">{{ m.connectionState }}</n-tag>
        </span>
      </n-list-item>
    </n-list>
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
