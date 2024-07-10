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
          Client:
        </span>
      </template>
      <n-list-item v-for="connectionId of client.connectionIds.value" :key="connectionId">
        <template #suffix>
          <n-button @click="client.connect(connectionId)">
            连接
          </n-button>
          <n-upload :data="{ connectionId }" :custom-request="client.upload">
            <n-button>上传文件</n-button>
          </n-upload>
        </template>
        <span>
          {{ connectionId }}
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
