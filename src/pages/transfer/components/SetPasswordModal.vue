<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [string]
}>()

const formRef = ref<FormInst | null>(null)
const formValue = ref({
  password: '',
  confirmPassword: '',
})

const rules = {
  password: {
    required: true,
    trigger: ['blur', 'input'],
  },
  confirmPassword: {
    required: true,
    trigger: ['blur', 'input'],
    validator: (_: any, value: string) => {
      if (value !== formValue.value.password)
        return new Error('两次输入的密码不一致')

      return true
    },
  },
}

async function submit() {
  await formRef?.value?.validate()
  emit('submit', formValue.value.password)
}
</script>

<template>
  <n-form ref="formRef" inline label-placement="left" label-width="auto" :rules="rules" :model="formValue">
    <n-form-item label="密码" path="password">
      <n-input v-model:value="formValue.password" type="password" placeholder="请输入密码" />
    </n-form-item>
    <n-form-item label="确认密码" path="confirmPassword">
      <n-input v-model:value="formValue.confirmPassword" type="password" placeholder="请再次输入密码" />
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="submit">
        确定
      </n-button>
    </n-form-item>
  </n-form>
</template>
