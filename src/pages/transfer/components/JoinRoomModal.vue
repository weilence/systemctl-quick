<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [name: string, password: string]
}>()

const formRef = ref<FormInst | null>(null)
const formValue = ref({
  name: '',
  password: '',
})

const rules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
  },
  password: {
    required: true,
    trigger: ['blur', 'input'],
  },
}

async function submit() {
  await formRef.value?.validate()
  emit('submit', formValue.value.name, formValue.value.password)
}
</script>

<template>
  <n-form ref="formRef" inline label-placement="left" label-width="auto" :model="formValue" :rules="rules">
    <n-form-item label="房间名" path="name">
      <n-input v-model:value="formValue.name" placeholder="请输入房间名" />
    </n-form-item>
    <n-form-item label="密码" path="password">
      <n-input v-model:value="formValue.password" type="password" placeholder="请输入密码" />
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="submit()">
        进入
      </n-button>
    </n-form-item>
  </n-form>
</template>
