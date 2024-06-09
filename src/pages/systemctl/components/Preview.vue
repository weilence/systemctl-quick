<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed } from 'vue'
import { generate } from '../utils'

const props = defineProps<{
  config: any
}>()

const message = useMessage()

const serviceData = computed(() => generate(props.config))

function copyContent() {
  navigator.clipboard.writeText(serviceData.value)
  message.success('Copied to clipboard')
}

function copyCommand() {
  if (!props.config.name) {
    message.error('Please provide a name')
    return
  }
  navigator.clipboard.writeText(`cat > /etc/systemd/system/${props.config.name}.service <<EOF\n${serviceData.value}\nEOF\n`)
  message.success('Copied to clipboard')
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <n-button type="primary" @click="copyContent">
        Copy Content
      </n-button>
      <n-button type="primary" @click="copyCommand">
        Copy Command
      </n-button>
    </div>
    <pre>{{ serviceData }}</pre>
  </div>
</template>
