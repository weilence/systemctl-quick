<script setup lang="ts">
import { computed } from 'vue'
import { useMessage } from 'naive-ui'

interface Props {
  value: string
  filename?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  filename: 'output.txt',
})

const emit = defineEmits(['update:isLargeFile'])

const message = useMessage()

// 64KB
const MAX_DISPLAY_SIZE = 64 * 1024

const isLargeFile = computed(() => {
  const bytes = new TextEncoder().encode(props.value).length
  const isLarge = bytes > MAX_DISPLAY_SIZE
  emit('update:isLargeFile', isLarge)
  return isLarge
})

const displayValue = computed(() => {
  if (isLargeFile.value)
    return '输出结果过大，请直接下载查看'
  return props.value
})

function copy() {
  navigator.clipboard.writeText(props.value)
  message.success('已复制')
}

function download() {
  const blob = new Blob([props.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const fileSize = computed(() => {
  const bytes = new TextEncoder().encode(props.value).length
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="value" class="flex items-center gap-2">
      <n-tag :bordered="false" type="info" size="small">
        {{ fileSize }}
      </n-tag>
      <div class="flex-1" />
      <n-button-group>
        <n-button
          secondary
          type="primary"
          @click="copy"
        >
          <template #icon>
            <div class="i-carbon-copy" />
          </template>
          复制结果
        </n-button>
        <n-button
          secondary
          type="info"
          @click="download"
        >
          <template #icon>
            <div class="i-carbon-download" />
          </template>
          下载文件
        </n-button>
      </n-button-group>
    </div>

    <template v-if="isLargeFile">
      <n-alert
        type="warning"
        :show-icon="true"
      >
        输出结果超过64KB，请使用复制或下载功能查看完整内容
      </n-alert>
    </template>
    <template v-else-if="value">
      <n-input
        :value="displayValue"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        readonly
      />
    </template>
    <template v-else>
      <n-empty description="暂无输出结果" />
    </template>
  </div>
</template>
