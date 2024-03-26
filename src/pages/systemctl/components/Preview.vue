<script setup lang="ts">
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
