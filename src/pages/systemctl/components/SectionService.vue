<script setup lang="ts">
import { restartTypes } from '../data'
import RestartTable from './RestartTable.vue'

const data = defineModel<{
  type: string
  workingDirectory: string
  execStart: string
  execStop: string
  restart: string
  restartSec: string
  environment: { key: string, value: string }[]
}>({ required: true })
</script>

<template>
  <n-h2 mt-0 text-center>
    Service
  </n-h2>
  <n-form-item path="service.type">
    <template #label>
      <n-flex inline :size="0">
        <span>Type</span>
        <a
          href="https://www.freedesktop.org/software/systemd/man/systemd.service.html#Type="
          target="_blank"
        >
          <div i-carbon:help-filled />
        </a>
      </n-flex>
    </template>
    <n-select
      v-model:value="data.type"
      :options="restartTypes"
    />
  </n-form-item>
  <n-form-item label="WorkingDirectory" path="service.workingDirectory">
    <n-input v-model:value="data.workingDirectory" />
  </n-form-item>
  <n-form-item label="ExecStart" path="service.execStart">
    <n-input v-model:value="data.execStart" />
  </n-form-item>
  <n-form-item label="ExecStop" path="service.execStop">
    <n-input v-model:value="data.execStop" />
  </n-form-item>
  <n-form-item path="service.restart">
    <template #label>
      <n-flex inline :size="0">
        <span>Restart</span>
        <n-popover trigger="hover">
          <template #trigger>
            <div i-carbon:help-filled />
          </template>
          <RestartTable />
        </n-popover>
      </n-flex>
    </template>
    <n-select
      v-model:value="data.restart"
      :options="[
        { label: 'no', value: 'no' },
        { label: 'always', value: 'always' },
        { label: 'on-success', value: 'on-success' },
        { label: 'on-failure', value: 'on-failure' },
        { label: 'on-abnormal', value: 'on-abnormal' },
        { label: 'on-abort', value: 'on-abort' },
        { label: 'on-watchdog', value: 'on-watchdog' },
      ]
      "
    />
  </n-form-item>
  <n-form-item label="RestartSec" path="service.restartSec">
    <n-input v-model:value="data.restartSec" placeholder="default 100ms" />
  </n-form-item>
  <n-form-item label="Environment" path="service.environment">
    <n-dynamic-input
      v-model:value="data.environment"
      preset="pair"
      key-placeholder="Environment Key"
      value-placeholder="Environment Value"
    />
  </n-form-item>
</template>
