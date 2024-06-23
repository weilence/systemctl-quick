<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'

const input = ref({
  type: 'text',
  data: '',
  fileList: [] as Array<UploadFileInfo>,
})
const outputData = ref<string>('')
const message = useMessage()

async function encode() {
  try {
    const encoder = new TextEncoder()
    if (input.value.type === 'text') {
      const utf8Bytes = encoder.encode(input.value.data)
      outputData.value = btoa(String.fromCharCode(...utf8Bytes))
    }
    else {
      const file = input.value.fileList[0]?.file
      if (!file)
        return

      if (file.size > 1024 * 1024) {
        message.error('File size must be less than 1MB')
        return
      }

      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result as string)
        }
        reader.onerror = (err) => {
          reject(err)
        }
        reader.readAsDataURL(file)
      })
      navigator.clipboard.writeText(data)
      message.success('Copied')
    }
  }
  catch (error) {
    message.error('Invalid input')
  }
}

function decode() {
  try {
    const decoder = new TextDecoder()
    const binaryString = atob(input.value.data)
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
    <div class="flex flex-col gap-2">
      <n-radio-group v-model:value="input.type">
        <n-radio value="text" label="Text" />
        <n-radio value="file" label="File" />
      </n-radio-group>
      <n-input v-if="input.type === 'text'" v-model:value="input.data" type="textarea" :rows="10" />
      <n-upload v-if="input.type === 'file'" v-model:file-list="input.fileList" :default-upload="false">
        <n-upload-dragger v-if="input.fileList.length === 0" class="flex flex-col items-center gap-4">
          <div class="i-carbon-upload text-6xl" />
          <span class="text-lg">
            Click or drag files to this area to upload
          </span>
          <span class="text-gray-500">
            Do not upload sensitive data such as your bank card number and password, credit card number expiration date and security code
          </span>
        </n-upload-dragger>
      </n-upload>
    </div>
    <div class="flex gap-2">
      <n-button type="primary" @click="encode()">
        Encode
      </n-button>
      <n-button v-if="input.type === 'text'" type="primary" @click="decode()">
        Decode
      </n-button>
    </div>
    <n-text v-if="outputData" class="break-all">
      {{ outputData }}
      <button class="i-carbon-copy ml-1 align-middle" @click="copy()" />
    </n-text>
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
