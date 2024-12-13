<script setup lang="ts">
import { ref } from 'vue'
import { type UploadFileInfo, useMessage } from 'naive-ui'
import CryptoJS from 'crypto-js'
import type { InputEncoding, OutputEncoding } from '../utils'
import { formatOutput, parseInput, readFileAsText } from '../utils'
import AlgorithmSelector from './AlgorithmSelector.vue'
import CipherConfig from './CipherConfig.vue'

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

const algorithm = ref('aes')
const key = ref('')

// 加密配置
const cryptoConfig = ref({
  // AES 配置
  'aes': {
    mode: 'CBC' as keyof typeof CryptoJS.mode,
    padding: 'Pkcs7' as keyof typeof CryptoJS.pad,
    iv: '',
    keySize: 256, // 128, 192, 或 256
  },
  // 3DES 配置
  'tripledes': {
    mode: 'CBC' as keyof typeof CryptoJS.mode,
    padding: 'Pkcs7' as keyof typeof CryptoJS.pad,
    iv: '',
  },
  // RC4 配置
  'rc4': {
    dropBytes: 768, // RC4-drop, 默认丢弃前768字节
  },
  // Rabbit 配置
  'rabbit': {
    iv: '',
  },
  // Rabbit Legacy 配置
  'rabbit-legacy': {
    iv: '',
  },
})

// 加密函数
function encrypt(wordArray: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  if (!key.value)
    throw new Error('请输入密钥')

  const keyWordArray = CryptoJS.enc.Utf8.parse(key.value)

  switch (algorithm.value) {
    case 'aes': {
      // 确保密钥长度符合要求
      const adjustedKey = keyWordArray.clone()
      adjustedKey.sigBytes = cryptoConfig.value.aes.keySize / 8

      const config = {
        mode: CryptoJS.mode[cryptoConfig.value.aes.mode],
        padding: CryptoJS.pad[cryptoConfig.value.aes.padding],
        iv: undefined as CryptoJS.lib.WordArray | undefined,
      }

      if (cryptoConfig.value.aes.iv)
        config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value.aes.iv)

      return CryptoJS.AES.encrypt(wordArray, adjustedKey, config).ciphertext
    }
    case 'tripledes': {
      const config = {
        mode: CryptoJS.mode[cryptoConfig.value.tripledes.mode],
        padding: CryptoJS.pad[cryptoConfig.value.tripledes.padding],
        iv: undefined as CryptoJS.lib.WordArray | undefined,
      }

      if (cryptoConfig.value.tripledes.iv)
        config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value.tripledes.iv)

      return CryptoJS.TripleDES.encrypt(wordArray, keyWordArray, config).ciphertext
    }
    case 'rc4': {
      const config = {
        drop: cryptoConfig.value.rc4.dropBytes,
      }

      return CryptoJS.RC4.encrypt(wordArray, keyWordArray, config).ciphertext
    }
    case 'rabbit': {
      const config = {
        iv: undefined as CryptoJS.lib.WordArray | undefined,
      }

      if (cryptoConfig.value.rabbit.iv)
        config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value.rabbit.iv)

      return CryptoJS.Rabbit.encrypt(wordArray, keyWordArray, config).ciphertext
    }
    case 'rabbit-legacy': {
      const config = {
        iv: undefined as CryptoJS.lib.WordArray | undefined,
      }

      if (cryptoConfig.value['rabbit-legacy'].iv)
        config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value['rabbit-legacy'].iv)

      return CryptoJS.RabbitLegacy.encrypt(wordArray, keyWordArray, config).ciphertext
    }
    default:
      throw new Error('不支持的加密算法')
  }
}

// 解密函数
function decrypt(wordArray: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  if (!key.value)
    throw new Error('请输入密钥')

  const keyWordArray = CryptoJS.enc.Utf8.parse(key.value)

  try {
    const params = CryptoJS.lib.CipherParams.create({
      ciphertext: wordArray,
    })

    switch (algorithm.value) {
      case 'aes': {
        const adjustedKey = keyWordArray.clone()
        adjustedKey.sigBytes = cryptoConfig.value.aes.keySize / 8

        const config = {
          mode: CryptoJS.mode[cryptoConfig.value.aes.mode],
          padding: CryptoJS.pad[cryptoConfig.value.aes.padding],
          iv: undefined as CryptoJS.lib.WordArray | undefined,
        }

        if (cryptoConfig.value.aes.iv)
          config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value.aes.iv)

        return CryptoJS.AES.decrypt(params, adjustedKey, config)
      }
      case 'tripledes': {
        const config = {
          mode: CryptoJS.mode[cryptoConfig.value.tripledes.mode],
          padding: CryptoJS.pad[cryptoConfig.value.tripledes.padding],
          iv: undefined as CryptoJS.lib.WordArray | undefined,
        }

        if (cryptoConfig.value.tripledes.iv)
          config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value.tripledes.iv)

        return CryptoJS.TripleDES.decrypt(params, keyWordArray, config)
      }
      case 'rc4': {
        const config = {
          drop: cryptoConfig.value.rc4.dropBytes,
        }

        return CryptoJS.RC4.decrypt(params, keyWordArray, config)
      }
      case 'rabbit': {
        const config = {
          iv: undefined as CryptoJS.lib.WordArray | undefined,
        }

        if (cryptoConfig.value.rabbit.iv)
          config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value.rabbit.iv)

        return CryptoJS.Rabbit.decrypt(params, keyWordArray, config)
      }
      case 'rabbit-legacy': {
        const config = {
          iv: undefined as CryptoJS.lib.WordArray | undefined,
        }

        if (cryptoConfig.value['rabbit-legacy'].iv)
          config.iv = CryptoJS.enc.Utf8.parse(cryptoConfig.value['rabbit-legacy'].iv)

        return CryptoJS.RabbitLegacy.decrypt(params, keyWordArray, config)
      }
      default:
        throw new Error('不支持的解密算法')
    }
  }
  catch (error) {
    throw new Error('解密失败，请检查密钥和参数是否正确')
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
</script>

<template>
  <div class="flex flex-col gap-4">
    <AlgorithmSelector
      mode="cipher"
      :algorithm="algorithm"
      :use-hmac="false"
      @update:algorithm="val => algorithm = val"
    />

    <n-input
      v-model:value="key"
      type="password"
      placeholder="请输入密钥"
    />

    <CipherConfig
      :algorithm="algorithm"
      :config="cryptoConfig"
      @update:config="val => cryptoConfig = val"
    />

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
