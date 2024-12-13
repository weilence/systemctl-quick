<script setup lang="ts">
import type { InputEncoding, OutputEncoding } from '../utils'

type Encoding = InputEncoding | OutputEncoding

interface Props {
  value: Encoding
  type?: 'input' | 'output'
}

withDefaults(defineProps<Props>(), {
  type: 'input',
})

const emit = defineEmits(['update:value'])

// 支持的编码格式
const encodings: Array<{ label: string, value: Encoding }> = [
  { label: 'UTF-8', value: 'Utf8' },
  { label: 'Base64', value: 'Base64' },
  { label: 'Hex', value: 'Hex' },
  { label: 'Latin1', value: 'Latin1' },
  { label: 'UTF-16', value: 'Utf16' },
]
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-sm text-gray-500">{{ type === 'input' ? '输入' : '输出' }}编码方式：</span>
    <n-radio-group
      :value="value"
      @update:value="val => emit('update:value', val)"
    >
      <n-radio
        v-for="item in encodings"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </n-radio>
    </n-radio-group>
  </div>
</template>
