<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { ref } from 'vue'

const data = ref({
  length: 20,
  types: ['numbers', 'lowercase', 'uppercase'],
  password: '',
})

const message = useMessage()

function generatePassword() {
  if (data.value.types.length === 0) {
    message.error('Please select at least one type')
    data.value.password = ''
    return
  }

  const numbers = '0123456789'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const symbols = '+{}:*!,-()_%=<>[]^?~'
  const types: Record<string, string> = {
    numbers,
    lowercase,
    uppercase,
    symbols,
  }

  let pool = ''
  for (const type of data.value.types)
    pool += types[type]

  let password = ''
  for (let i = 0; i < data.value.length; i++)
    password += pool[Math.floor(Math.random() * pool.length)]

  data.value.password = password
}

function copy() {
  navigator.clipboard.writeText(data.value.password)
  message.success('Copied')
}

generatePassword()
</script>

<template>
  <div class="m-auto max-w-120 flex flex-col gap-4" vertical>
    <div class="flex justify-center">
      <n-text class="font-bord break-all text-2xl font-mono">
        {{ data.password }}
      </n-text>
    </div>
    <div class="flex justify-center gap-4">
      <n-button type="primary" @click="generatePassword()">
        Generate
      </n-button>
      <n-button type="primary" @click="copy()">
        Copy
      </n-button>
    </div>
    <div class="flex flex-wrap items-center gap-2 md:flex-nowrap">
      <n-slider v-model:value="data.length" :min="8" :max="100" :step="1" @update:value="generatePassword()" />
      <n-checkbox-group v-model:value="data.types" @update:value="generatePassword()">
        <n-checkbox value="numbers">
          Numbers
        </n-checkbox>
        <n-checkbox value="lowercase">
          Lowercase
        </n-checkbox>
        <n-checkbox value="uppercase">
          Uppercase
        </n-checkbox>
        <n-checkbox value="symbols">
          Symbols
        </n-checkbox>
      </n-checkbox-group>
    </div>
    <div class="flex justify-center">
      <span class="text-gray-500/80">
        Inspired by <a href="https://1password.com/password-generator/" target="_blank">1password.com</a>
      </span>
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "menu": "Password Generator",
    "index": 1
  }
}
</route>
