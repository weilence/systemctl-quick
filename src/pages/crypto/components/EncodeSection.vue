<script setup lang="ts">
import { type UploadFileInfo, useMessage } from 'naive-ui'
import type { InputEncoding, OutputEncoding } from '../utils'
import { formatOutput, parseInput, readFileAsText } from '../utils'

const props = defineProps<{
  input: {
    type: string
    data: string
    fileList: Array<UploadFileInfo>
    inputEncoding: InputEncoding
  }
  outputEncoding: OutputEncoding
}>()

const emit = defineEmits(['update:output'])

const message = useMessage()

async function process() {
  try {
    const data = props.input.type === 'text'
      ? props.input.data
      : await readFileAsText(props.input.fileList[0]?.file)

    if (!data)
      return

    const inputWordArray = parseInput(data, props.input.inputEncoding)
    emit('update:output', formatOutput(inputWordArray, props.outputEncoding))
  }
  catch (error: any) {
    console.error(error)
    message.error(error.message || '处理失败')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <n-button type="primary" @click="process">
      转换
    </n-button>
  </div>
</template>
