<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import type { FormInst } from 'naive-ui'
import { ref, watchEffect } from 'vue'
import { resetRef } from '~/utils/reset'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  joinRoom: [name: string, password: string]
}>()

const show = useVModel(props, 'show', emit)
const formRef = ref<FormInst | null>(null)
const [formValue, formValueReset] = resetRef({
  name: '',
  password: '',
})
watchEffect(() => {
  if (!show.value)
    return

  formValueReset()
  formRef.value?.restoreValidation()
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

async function joinRoom() {
  await formRef.value?.validate()
  emit('joinRoom', formValue.value.name, formValue.value.password)
}
</script>

<template>
  <n-modal :show="show" preset="card" title="进入房间" style="width: 600px">
    <n-form
      ref="formRef" inline label-placement="left" label-width="auto" :model="formValue" :rules="rules"
    >
      <n-form-item label="房间名" path="name">
        <n-input v-model:value="formValue.name" placeholder="请输入房间名" />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input v-model:value="formValue.password" placeholder="请输入密码" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end">
        <n-button type="primary" @click="joinRoom()">
          进入
        </n-button>
      </div>
    </template>
  </n-modal>
</template>
