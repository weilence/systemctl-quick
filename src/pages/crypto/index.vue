<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import HashSection from './components/HashSection.vue'
import CipherSection from './components/CipherSection.vue'
import EncodeSection from './components/EncodeSection.vue'
import InputSection from './components/InputSection.vue'
import EncodingSelector from './components/EncodingSelector.vue'
import OutputSection from './components/OutputSection.vue'
import type { InputEncoding, OutputEncoding } from './utils'

const mode = ref('encode') // hash, cipher, encode
const input = ref({
  type: 'text',
  data: '',
  fileList: [] as Array<UploadFileInfo>,
  inputEncoding: 'Utf8' as InputEncoding,
})

const outputData = ref('')
const outputEncoding = ref<OutputEncoding>('Hex')

// 添加模式选项
const modeOptions = [
  { label: '编码转换', value: 'encode', icon: 'i-carbon-code' },
  { label: '哈希计算', value: 'hash', icon: 'i-carbon-data-1' },
  { label: '加密/解密', value: 'cipher', icon: 'i-carbon-locked' },
]

// 添加状态跟踪输出是否过大
const isOutputLarge = ref(false)

// 交换输入和输出的编码方式和值
function swapInputOutput() {
  // 保存当前值
  const tempEncoding = input.value.inputEncoding
  const tempData = input.value.data

  // 交换编码方式
  input.value.inputEncoding = outputEncoding.value as InputEncoding
  outputEncoding.value = tempEncoding as OutputEncoding

  // 交换数据
  input.value.data = outputData.value
  outputData.value = tempData

  // 确保使用文本输入模式
  input.value.type = 'text'
  input.value.fileList = []
}

// 修改交换按钮的禁用逻辑
function canSwap() {
  return !isOutputLarge.value && outputData.value
}
</script>

<template>
  <div class="mx-auto max-w-3xl flex flex-col gap-6">
    <!-- 模式选择器 -->
    <n-card>
      <n-tabs
        v-model:value="mode"
        type="segment"
        animated
      >
        <n-tab-pane
          v-for="item in modeOptions"
          :key="item.value"
          :name="item.value"
        >
          <template #tab>
            <div class="flex items-center gap-2">
              <div :class="item.icon" />
              {{ item.label }}
            </div>
          </template>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 输入区域 -->
    <n-card title="输入">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <InputSection
            v-model:type="input.type"
            v-model:data="input.data"
            v-model:file-list="input.fileList"
            v-model:input-encoding="input.inputEncoding"
            class="flex-1"
          />
          <template v-if="mode !== 'hash'">
            <template v-if="!canSwap()">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button
                    secondary
                    type="primary"
                    class="flex-shrink-0"
                    disabled
                    @click="swapInputOutput"
                  >
                    <template #icon>
                      <div class="i-carbon-arrows-vertical" />
                    </template>
                    交换
                  </n-button>
                </template>
                <span>{{ isOutputLarge ? '输出内容过大，无法交换' : '没有可交换的输出内容' }}</span>
              </n-tooltip>
            </template>

            <n-button
              v-else
              secondary
              type="primary"
              class="flex-shrink-0"
              @click="swapInputOutput"
            >
              <template #icon>
                <div class="i-carbon-arrows-vertical" />
              </template>
              交换
            </n-button>
          </template>
        </div>
      </div>
    </n-card>

    <!-- 配置区域 -->
    <n-card :title="mode === 'encode' ? '编码设置' : mode === 'hash' ? '哈希设置' : '加密设置'">
      <HashSection
        v-if="mode === 'hash'"
        :input="input"
        :output-encoding="outputEncoding"
        @update:output="val => outputData = val"
      />
      <CipherSection
        v-else-if="mode === 'cipher'"
        :input="input"
        :output-encoding="outputEncoding"
        @update:output="val => outputData = val"
      />
      <EncodeSection
        v-else
        :input="input"
        :output-encoding="outputEncoding"
        @update:output="val => outputData = val"
      />
    </n-card>

    <!-- 输出区域 -->
    <n-card title="输出">
      <div class="flex flex-col gap-4">
        <EncodingSelector
          v-model:value="outputEncoding"
          type="output"
        />
        <OutputSection
          :value="outputData"
          :filename="`${mode}-output.txt`"
          @update:is-large-file="val => isOutputLarge = val"
        />
      </div>
    </n-card>
  </div>
</template>

<route lang="json">
{
    "meta": {
        "menu": "编码/加密",
        "index": 3
    }
}
</route>
