<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  mode: string
  algorithm: string
  useHmac: boolean
}>()

const emit = defineEmits(['update:algorithm'])

// 支持的哈希算法
const hashAlgorithms = [
  { label: 'MD5', value: 'md5' },
  { label: 'SHA-1', value: 'sha1' },
  { label: 'SHA-224', value: 'sha224' },
  { label: 'SHA-256', value: 'sha256' },
  { label: 'SHA-384', value: 'sha384' },
  { label: 'SHA-512', value: 'sha512' },
  { label: 'SHA3', value: 'sha3' },
  { label: 'RIPEMD160', value: 'ripemd160' },
  { label: 'PBKDF2', value: 'pbkdf2' },
]

// 支持的加密算法
const cipherAlgorithms = [
  { label: 'AES', value: 'aes' },
  { label: '3DES', value: 'tripledes' },
  { label: 'RC4', value: 'rc4' },
  { label: 'Rabbit', value: 'rabbit' },
  { label: 'Rabbit Legacy', value: 'rabbit-legacy' },
]
</script>

<template>
  <template v-if="mode === 'hash'">
    <n-radio-group
      :value="algorithm"
      @update:value="val => emit('update:algorithm', val)"
    >
      <n-radio
        v-for="item in hashAlgorithms.filter(item => !useHmac || item.value !== 'pbkdf2')"
        :key="item.value"
        :value="useHmac ? `hmac-${item.value}` : item.value"
      >
        {{ useHmac ? `HMAC-${item.label}` : item.label }}
      </n-radio>
    </n-radio-group>
  </template>
  <template v-else-if="mode === 'cipher'">
    <n-radio-group
      :value="algorithm"
      @update:value="val => emit('update:algorithm', val)"
    >
      <n-radio
        v-for="item in cipherAlgorithms"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </n-radio>
    </n-radio-group>
  </template>
</template>
