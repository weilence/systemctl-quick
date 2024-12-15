<script setup lang="ts">
import { ref } from 'vue'
import { type UploadFileInfo, useMessage } from 'naive-ui'
import CryptoJS from 'crypto-js'
import type { CipherOption, CryptoAlgorithms, InputEncoding, OutputEncoding } from '../utils'
import { formatOutput, parseInput, readFileAsText } from '../utils'

const props = defineProps<{

  input: {
    type: string
    data: string
    fileList: Array<UploadFileInfo>
    inputEncoding: InputEncoding
  }
  outputEncoding: OutputEncoding
}>()

const emit = defineEmits(['update:output'])

const algorithm = ref<CryptoAlgorithms>('AES')
const key = ref('')

// 加密配置
const cryptoConfig = ref({
  // AES 配置
  aes: {
    mode: 'CBC' as keyof typeof CryptoJS.mode,
    padding: 'Pkcs7' as keyof typeof CryptoJS.pad,
    iv: '',
    keySize: 256, // 128, 192, 或 256
  },
})

function getConfig(wordArray: CryptoJS.lib.WordArray) {
  const config: CipherOption = {}

  switch (algorithm.value) {
    case 'AES': {
      wordArray.sigBytes = cryptoConfig.value.aes.keySize / 8

      config.mode = CryptoJS.mode[cryptoConfig.value.aes.mode]
      config.padding = CryptoJS.pad[cryptoConfig.value.aes.padding]
      if (cryptoConfig.value.aes.iv)
        config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value.aes.iv)
      break
    }
    default:
      throw new Error('不支持的加密算法')
  }

  return config
}

// 加密函数
function encrypt(wordArray: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  if (!key.value)
    throw new Error('请输入密钥')

  const keyWordArray = CryptoJS.enc.Utf8.parse(key.value)
  const config = getConfig(wordArray.clone())

  try {
    return CryptoJS[algorithm.value].encrypt(wordArray, keyWordArray, config).ciphertext
  }
  catch (error) {
    throw new Error('加密失败')
  }
}

// 解密函数
function decrypt(wordArray: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  if (!key.value)
    throw new Error('请输入密钥')

  const keyWordArray = CryptoJS.enc.Utf8.parse(key.value)
  const config = getConfig(wordArray.clone())
  const params = CryptoJS.lib.CipherParams.create({
    ciphertext: wordArray,
  })

  try {
    return CryptoJS[algorithm.value].decrypt(params, keyWordArray, config)
  }
  catch (error) {
    throw new Error('解密失败')
  }
}

const message = useMessage()

async function process(operation: 'encrypt' | 'decrypt') {
  try {
    const data = props.input.type === 'text'
      ? props.input.data
      : await readFileAsText(props.input.fileList[0]?.file)

    if (!data)
      return

    const inputWordArray = parseInput(data, props.input.inputEncoding)
    const resultWordArray = operation === 'encrypt'
      ? encrypt(inputWordArray)
      : decrypt(inputWordArray)

    emit('update:output', formatOutput(resultWordArray, props.outputEncoding))
  }
  catch (error: any) {
    console.error(error)
    message.error(error.message || '处理失败')
  }
}

// 支持的加密算法
const cipherAlgorithms: Array<{ label: string, value: CryptoAlgorithms }> = [
  { label: 'AES', value: 'AES' },
]

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
  <div class="flex flex-col gap-4">
    <n-radio-group
      v-model:value="algorithm"
    >
      <n-radio
        v-for="item in cipherAlgorithms"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </n-radio>
    </n-radio-group>

    <n-input
      v-model:value="key"
      type="password"
      placeholder="请输入密钥"
    />

    <template v-if="algorithm === 'AES'">
      <div class="flex flex-col gap-2">
        <n-select
          v-model:value="cryptoConfig.aes.mode"
          :options="cryptoModes"
          placeholder="选择加密模式"
          label="加密模式"
        />
        <n-select
          v-model:value="cryptoConfig.aes.padding"
          :options="paddingModes"
          placeholder="选择填充方式"
          label="填充方式"
        />
        <n-select
          v-model:value="cryptoConfig.aes.keySize"
          :options="aesKeySizes"
          placeholder="选择密钥长度"
          label="密钥长度"
        />
        <n-input
          v-model:value="cryptoConfig.aes.iv"
          placeholder="初始化向量（IV）"
          label="初始化向量"
        />
      </div>
    </template>

    <div class="flex gap-2">
      <n-button type="primary" @click="process('encrypt')">
        加密
      </n-button>
      <n-button type="info" @click="process('decrypt')">
        解密
      </n-button>
    </div>
  </div>
</template>
