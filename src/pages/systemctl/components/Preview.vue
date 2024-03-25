<script setup lang="ts">
import { useMessage } from 'naive-ui'

const props = defineProps<{
  data: string
}>()

const message = useMessage()

function copy() {
  navigator.clipboard.writeText(props.data)
  message.success('Copied to clipboard')
}
</script>

<template>
  <n-button type="primary" @click="copy">
    Copy
  </n-button>
  <pre>{{ data }}</pre>
</template>
