<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { ref } from 'vue'

const inputData = ref<string>('')
const outputData = ref<string>('')
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const message = useMessage()

function encode() {
  const utf8Bytes = encoder.encode(inputData.value)
  try {
    outputData.value = btoa(String.fromCharCode(...utf8Bytes))
  }
  catch (error) {
    message.error('Invalid input')
  }
}

function decode() {
  try {
    const binaryString = atob(inputData.value)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++)
      bytes[i] = binaryString.charCodeAt(i)

    outputData.value = decoder.decode(bytes)
  }
  catch (error) {
    message.error('Invalid input')
  }
}

function copy() {
  navigator.clipboard.writeText(outputData.value)
  message.success('Copied')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <n-input v-model:value="inputData" type="textarea" :rows="10" />
    </div>
    <div class="flex gap-2">
      <n-button type="primary" @click="encode()">
        Encode
      </n-button>
      <n-button type="primary" @click="decode()">
        Decode
      </n-button>
    </div>
    <div v-if="outputData" class="flex items-center">
      <n-text class="break-all">
        {{ outputData }}
      </n-text><button class="i-carbon-copy ml-1" @click="copy()" />
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "menu": "Base64",
    "index": 2
  }
}
</route>
