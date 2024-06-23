<script setup lang="ts">
import { preDefinedTarget } from '../data'

const data = defineModel<{
  description: string
  after: string[]
}>({ required: true })
</script>

<template>
  <n-h2 class="mt-0 text-center">
    Unit
  </n-h2>
  <n-form-item label="Description" path="unit.description">
    <n-input v-model:value="data.description" />
  </n-form-item>
  <n-form-item label="After" path="unit.after">
    <n-select
      v-model:value="data.after"
      filterable tag multiple
      :options="preDefinedTarget"
      placeholder="Please Select or Input"
    />
  </n-form-item>
</template>
