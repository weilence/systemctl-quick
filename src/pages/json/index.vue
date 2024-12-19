<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import JsonEditor from './components/JsonEditor.vue'

const content = ref({ text: '' })
const jwtInput = ref('')
const message = useMessage()

// JWT解码函数
function decodeJWT() {
  try {
    const [header, payload] = jwtInput.value.split('.').slice(0, 2)
    const decodedJSON = {
      header: JSON.parse(atob(header)),
      payload: JSON.parse(atob(payload)),
    }
    content.value = { text: JSON.stringify(decodedJSON, null, 2) }
  }
  catch (error) {
    message.error('无效的JWT格式')
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl flex flex-col gap-4">
    <!-- JWT输入区域 -->
    <div class="flex gap-2">
      <n-input-group>
        <n-input
          v-model:value="jwtInput"
          type="text"
          placeholder="请输入JWT令牌"
        />
        <n-button type="primary" @click="decodeJWT">
          解析JWT
        </n-button>
      </n-input-group>
    </div>

    <div class="max-h-1xl">
      <JsonEditor :content="content" />
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "menu": "JSON",
    "index": 5
  }
}
</route>
