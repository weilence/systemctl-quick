<script setup lang="ts">
defineProps<{
  algorithm: string
  config: any
}>()

const emit = defineEmits(['update:config'])

// 加密模式选项
const cryptoModes = [
  { label: 'CBC', value: 'CBC' },
  { label: 'CFB', value: 'CFB' },
  { label: 'OFB', value: 'OFB' },
  { label: 'ECB', value: 'ECB' },
  { label: 'CTR', value: 'CTR' },
]

// 填充方式选项
const paddingModes = [
  { label: 'PKCS7', value: 'Pkcs7' },
  { label: 'ISO/IEC 9797-1', value: 'Iso97971' },
  { label: 'ANSI X.923', value: 'AnsiX923' },
  { label: 'ISO 10126', value: 'Iso10126' },
  { label: 'Zero Padding', value: 'ZeroPadding' },
  { label: 'No Padding', value: 'NoPadding' },
]

// AES 密钥长度选项
const aesKeySizes = [
  { label: '128位', value: 128 },
  { label: '192位', value: 192 },
  { label: '256位', value: 256 },
]
</script>

<template>
  <!-- AES 配置 -->
  <template v-if="algorithm === 'aes'">
    <div class="flex flex-col gap-2">
      <n-select
        :value="config.aes.mode"
        :options="cryptoModes"
        placeholder="选择加密模式"
        label="加密模式"
        @update:value="val => emit('update:config', { ...config, aes: { ...config.aes, mode: val } })"
      />
      <n-select
        :value="config.aes.padding"
        :options="paddingModes"
        placeholder="选择填充方式"
        label="填充方式"
        @update:value="val => emit('update:config', { ...config, aes: { ...config.aes, padding: val } })"
      />
      <n-select
        :value="config.aes.keySize"
        :options="aesKeySizes"
        placeholder="选择密钥长度"
        label="密钥长度"
        @update:value="val => emit('update:config', { ...config, aes: { ...config.aes, keySize: val } })"
      />
      <n-input
        :value="config.aes.iv"
        placeholder="初始化向量（IV）"
        label="初始化向量"
        @update:value="val => emit('update:config', { ...config, aes: { ...config.aes, iv: val } })"
      />
    </div>
  </template>

  <!-- 其他算法配置... -->
</template>
