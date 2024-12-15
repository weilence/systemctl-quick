<script setup lang="ts">
import { ref, watch } from 'vue'
import { type UploadFileInfo, useMessage } from 'naive-ui'
import CryptoJS from 'crypto-js'
import type { HashAlgorithms, InputEncoding, OutputEncoding } from '../utils'
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

const useHmac = ref(false)
const algorithm = ref<HashAlgorithms>('MD5')
const key = ref('')

// PBKDF2配置
const pbkdf2Config = ref({
  iterations: 1000,
  salt: '',
  keySize: 256,
})

// 处理哈希
function calculateHash(wordArray: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  let salt: CryptoJS.lib.WordArray
  switch (algorithm.value) {
    case 'MD5':
      return CryptoJS.MD5(wordArray)
    case 'SHA1':
      return CryptoJS.SHA1(wordArray)
    case 'SHA224':
      return CryptoJS.SHA224(wordArray)
    case 'SHA256':
      return CryptoJS.SHA256(wordArray)
    case 'SHA384':
      return CryptoJS.SHA384(wordArray)
    case 'SHA512':
      return CryptoJS.SHA512(wordArray)
    case 'SHA3':
      return CryptoJS.SHA3(wordArray)
    case 'RIPEMD160':
      return CryptoJS.RIPEMD160(wordArray)
    case 'PBKDF2':
      salt = pbkdf2Config.value.salt
        ? CryptoJS.enc.Utf8.parse(pbkdf2Config.value.salt)
        : CryptoJS.lib.WordArray.random(128 / 8)
      return CryptoJS.PBKDF2(wordArray, salt, {
        keySize: pbkdf2Config.value.keySize / 32,
        iterations: pbkdf2Config.value.iterations,
      })
    default:
      throw new Error('不支持的哈希算法')
  }
}

// 处理HMAC
function calculateHMAC(wordArray: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  if (!key.value)
    throw new Error('请输入密钥')

  const keyWordArray = CryptoJS.enc.Utf8.parse(key.value)
  const hmacAlgo = algorithm.value.replace('hmac-', '')
  switch (hmacAlgo) {
    case 'MD5':
      return CryptoJS.HmacMD5(wordArray, keyWordArray)
    case 'SHA1':
      return CryptoJS.HmacSHA1(wordArray, keyWordArray)
    case 'SHA224':
      return CryptoJS.HmacSHA224(wordArray, keyWordArray)
    case 'SHA256':
      return CryptoJS.HmacSHA256(wordArray, keyWordArray)
    case 'SHA384':
      return CryptoJS.HmacSHA384(wordArray, keyWordArray)
    case 'SHA512':
      return CryptoJS.HmacSHA512(wordArray, keyWordArray)
    case 'SHA3':
      return CryptoJS.HmacSHA3(wordArray, keyWordArray)
    case 'RIPEMD160':
      return CryptoJS.HmacRIPEMD160(wordArray, keyWordArray)
    default:
      throw new Error('不支持的HMAC算法')
  }
}

const message = useMessage()

// 主处理函数
async function process() {
  try {
    const data = props.input.type === 'text'
      ? props.input.data
      : await readFileAsText(props.input.fileList[0]?.file ?? undefined)

    if (!data)
      return

    const inputWordArray = parseInput(data, props.input.inputEncoding)
    const resultWordArray = useHmac.value
      ? calculateHMAC(inputWordArray)
      : calculateHash(inputWordArray)

    emit('update:output', formatOutput(resultWordArray, props.outputEncoding))
  }
  catch (error: any) {
    console.error(error)
    message.error(error.message || '处理失败')
  }
}

// 添加watch来处理useHmac变化
watch(useHmac, (newVal) => {
  if (newVal)
    algorithm.value = `hmac-${algorithm.value}` as HashAlgorithms
  else
    algorithm.value = algorithm.value.replace('hmac-', '') as HashAlgorithms
})

// 支持的哈希算法
const hashAlgorithms: Array<{ label: string, value: HashAlgorithms }> = [
  { label: 'MD5', value: 'MD5' },
  { label: 'SHA-1', value: 'SHA1' },
  { label: 'SHA-224', value: 'SHA224' },
  { label: 'SHA-256', value: 'SHA256' },
  { label: 'SHA-384', value: 'SHA384' },
  { label: 'SHA-512', value: 'SHA512' },
  { label: 'SHA3', value: 'SHA3' },
  { label: 'RIPEMD160', value: 'RIPEMD160' },
  { label: 'PBKDF2', value: 'PBKDF2' },
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <n-checkbox
      v-model:checked="useHmac"
      :disabled="algorithm === 'PBKDF2'"
    >
      使用 HMAC
    </n-checkbox>

    <n-radio-group
      v-model:value="algorithm"
    >
      <n-radio
        v-for="item in hashAlgorithms.filter(item => !useHmac || item.value !== 'PBKDF2')"
        :key="item.value"
        :value="useHmac ? `hmac-${item.value}` : item.value"
      >
        {{ item.label }}
      </n-radio>
    </n-radio-group>

    <template v-if="algorithm === 'PBKDF2'">
      <n-input
        v-model:value="pbkdf2Config.salt"
        placeholder="请输入盐"
      />
      <n-input-number
        v-model:value="pbkdf2Config.iterations"
        placeholder="请输入迭代次数"
      />
      <n-input-number
        v-model:value="pbkdf2Config.keySize"
        placeholder="请输入密钥长度"
      />
    </template>

    <n-input
      v-if="useHmac"
      v-model:value="key"
      type="password"
      placeholder="请输入密钥"
    />

    <n-button type="primary" @click="process">
      计算
    </n-button>
  </div>
</template>
