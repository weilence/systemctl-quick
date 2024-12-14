<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui'
import type { InputEncoding } from '../utils'
import EncodingSelector from './EncodingSelector.vue'

defineProps<{
  type: string
  data: string
  fileList: UploadFileInfo[]
  inputEncoding: InputEncoding
}>()

const emit = defineEmits(['update:type', 'update:data', 'update:fileList', 'update:inputEncoding'])
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-4">
      <n-radio-group
        :value="type"
        class="flex-shrink-0"
        @update:value="val => emit('update:type', val)"
      >
        <n-radio-button value="text">
          <div class="flex items-center gap-1">
            <div class="i-carbon-string-text" />
            文本输入
          </div>
        </n-radio-button>
        <n-radio-button value="file">
          <div class="flex items-center gap-1">
            <div class="i-carbon-document" />
            文件输入
          </div>
        </n-radio-button>
      </n-radio-group>

      <EncodingSelector
        :value="inputEncoding"
        type="input"
        @update:value="val => emit('update:inputEncoding', val)"
      />
    </div>

    <n-input
      v-if="type === 'text'"
      :value="data"
      type="textarea"
      :autosize="{ minRows: 3, maxRows: 10 }"
      placeholder="请输入要处理的文本..."
      @update:value="val => emit('update:data', val)"
    />

    <n-upload
      v-else
      :file-list="fileList"
      :default-upload="false"
      @update:file-list="val => emit('update:fileList', val)"
    >
      <n-upload-dragger
        v-if="fileList.length === 0"
        class="flex flex-col items-center gap-4 py-8"
      >
        <div class="text-primary i-carbon-upload text-6xl" />
        <div class="flex flex-col items-center">
          <span class="text-lg font-medium">点击或拖拽文件到此处</span>
          <span class="mt-1 text-sm text-gray-500">支持单个文件，大小不超过1MB</span>
        </div>
      </n-upload-dragger>
    </n-upload>
  </div>
</template>
