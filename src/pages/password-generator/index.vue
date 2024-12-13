<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, ref } from 'vue'

const data = ref({
  length: 12,
  types: ['numbers', 'lowercase', 'uppercase'],
  password: '',
})

const minLength = 8
const maxLength = 32

const message = useMessage()

// 密码类型选项
const typeOptions = [
  { label: '数字', value: 'numbers', icon: 'i-carbon-number' },
  { label: '小写字母', value: 'lowercase', icon: 'i-carbon-text-font' },
  { label: '大写字母', value: 'uppercase', icon: 'i-carbon-text-font-style' },
  { label: '特殊符号', value: 'symbols', icon: 'i-carbon-string-text' },
]

// 密码强度计算
const passwordStrength = computed(() => {
  if (!data.value.password)
    return 0
  let strength = 0

  // 长度得分
  if (data.value.length >= 12)
    strength += 1
  if (data.value.length >= 16)
    strength += 1

  // 类型得分
  strength += data.value.types.length

  return Math.min(strength, 5)
})

// 密码强度描述
const strengthText = computed(() => {
  const texts = ['极弱', '弱', '一般', '强', '很强', '极强']
  return texts[passwordStrength.value]
})

// 密码强度颜色
const strengthColor = computed(() => {
  const colors = ['#ed3f14', '#ed3f14', '#ff9900', '#19be6b', '#19be6b', '#19be6b']
  return colors[passwordStrength.value]
})

function generatePassword() {
  if (data.value.types.length === 0) {
    message.error('请至少选择一种字符类型')
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
  message.success('密码已复制')
}

generatePassword()
</script>

<template>
  <div class="mx-auto max-w-2xl flex flex-col gap-6">
    <n-card>
      <!-- 密码显示区域 -->
      <div class="flex flex-col gap-4">
        <div class="relative">
          <n-input
            v-model:value="data.password"
            type="text"
            readonly
            class="text-lg font-mono"
          >
            <template #suffix>
              <n-button
                quaternary
                circle
                type="primary"
                @click="copy()"
              >
                <template #icon>
                  <div class="i-carbon-copy text-lg" />
                </template>
              </n-button>
            </template>
          </n-input>
        </div>

        <!-- 密码强度指示器 -->
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <n-progress
              :percentage="passwordStrength * 20"
              :color="strengthColor"
              :height="8"
              :show-indicator="false"
              processing
            />
          </div>
          <n-tag :color="{ color: strengthColor, textColor: '#FFF' }">
            {{ strengthText }}
          </n-tag>
        </div>
      </div>
    </n-card>

    <n-card title="密码设置">
      <div class="flex flex-col gap-6">
        <!-- 长度设置 -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">密码长度</span>
            <n-input-number
              v-model:value="data.length"
              :min="minLength"
              :max="maxLength"
              :step="1"
              size="small"
              @update:value="generatePassword()"
            />
          </div>
          <n-slider
            v-model:value="data.length"
            :min="minLength"
            :max="maxLength"
            :step="1"
            :tooltip="false"
            @update:value="generatePassword()"
          />
        </div>

        <!-- 字符类型选择 -->
        <div class="flex flex-col gap-2">
          <span class="text-sm text-gray-500">字符类型</span>
          <n-space>
            <n-checkbox-group
              v-model:value="data.types"
              @update:value="generatePassword()"
            >
              <n-space>
                <n-checkbox
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  <div class="flex items-center gap-1">
                    <div :class="option.icon" />
                    {{ option.label }}
                  </div>
                </n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-space>
        </div>

        <!-- 生成按钮 -->
        <n-button
          type="primary"
          block
          @click="generatePassword()"
        >
          <template #icon>
            <div class="i-carbon-renew" />
          </template>
          重新生成
        </n-button>
      </div>
    </n-card>

    <div class="flex justify-center">
      <span class="text-sm text-gray-500">
        灵感来自 <a
          href="https://1password.com/password-generator/"
          target="_blank"
          class="text-gray-500 underline decoration-dotted transition-colors hover:text-gray-400"
        >1password.com</a>
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
