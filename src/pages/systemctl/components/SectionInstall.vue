<script setup lang="ts">
import { preDefinedTarget } from '../data'

const data = defineModel<{
  wantedBy: string[]
  requiredBy: string[]
}>({ required: true })
</script>

<template>
  <n-h2 mt-0 text-center>
    Install
  </n-h2>
  <n-form-item label="WantedBy" path="install.wantedBy">
    <n-select
      v-model:value="data.wantedBy"

      filterable tag multiple
      :options="preDefinedTarget"
      placeholder="Please Select or Input"
    />
  </n-form-item>
  <n-form-item label="RequiredBy" path="install.requiredBy">
    <n-select
      v-model:value="data.requiredBy"
      filterable
      multiple
      tag
      :options="preDefinedTarget"
      placeholder="Please Select or Input"
    />
  </n-form-item>
</template>
