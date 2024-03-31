<script setup lang="ts">
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
  <n-flex class="m-auto w-100" vertical>
    <n-flex justify="center">
      <n-text class="font-bord break-all text-2xl font-mono">
        {{ data.password }}
      </n-text>
    </n-flex>
    <n-flex justify="center">
      <n-button type="primary" @click="generatePassword()">
        Generate
      </n-button>
      <n-button type="primary" @click="copy()">
        Copy
      </n-button>
    </n-flex>
    <n-flex flex="1" align="center">
      <n-slider v-model:value="data.length" class="flex-1" :min="8" :max="100" :step="1" @update:value="generatePassword()" />
      <n-checkbox-group v-model:value="data.types" class="flex-1" @update:value="generatePassword()">
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
    </n-flex>
    <n-flex justify="center">
      <span class="text-gray-500/80">
        Inspired by <a href="https://1password.com/password-generator/" target="_blank">1password.com</a>
      </span>
    </n-flex>
  </n-flex>
</template>

<route lang="json">
{
  "meta": {
    "menu": "Password Generator",
    "index": 1
  }
}
</route>
