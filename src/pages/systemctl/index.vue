<script lang="ts" setup>
import { type UploadFileInfo, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { merge, parse } from './utils'
import Preview from './components/Preview.vue'
import SectionService from './components/SectionService.vue'
import SectionUnit from './components/SectionUnit.vue'
import SectionInstall from './components/SectionInstall.vue'
import { breakpoints } from '~/composables'

const formValue = ref<any>({
  name: '',
  unit: {
    description: '',
    after: ['network.target'],
  },
  service: {
    type: 'simple',
    workingDirectory: '',
    execStart: '',
    execStop: '',
    restart: 'on-failure',
    restartSec: '',
    environment: [],
  },
  install: {
    wantedBy: ['multi-user.target'],
    requiredBy: [],
  },
})

const rules = {
  name: {
    trigger: 'input',
  },
  unit: {
    description: {
      trigger: 'input',
    },
  },
  service: {
    type: {
      required: true,
      trigger: 'input',
    },
  },
}

const message = useMessage()
async function handleChange(options: { file: UploadFileInfo }) {
  try {
    const text = await options.file.file?.text() as string
    const parsedData = parse(formValue.value, text)
    formValue.value.name = options.file.name
    merge(formValue.value, parsedData)
  }
  catch (error) {
    message.error('Please select a valid \'systemctl service\' file')
  }
}
</script>

<template>
  <div class="grid grid-cols-1 m-auto max-w-300 gap-4 md:grid-cols-2">
    <n-form
      :label-width="120" :label-placement="breakpoints.md.value ? 'left' : 'top'" :model="formValue"
      :rules="rules"
    >
      <n-form-item label="Service Name" path="name">
        <n-input v-model:value="formValue.name" />
        <div class="ml-2">
          <n-upload :default-upload="false" :show-file-list="false" @change="handleChange">
            <n-button type="primary">
              Select Exist
            </n-button>
          </n-upload>
        </div>
      </n-form-item>
      <SectionUnit v-model="formValue.unit" />
      <SectionService v-model="formValue.service" />
      <SectionInstall v-model="formValue.install" />
    </n-form>
    <Preview :config="formValue" />
  </div>
</template>

<route lang="json">
{
  "meta": {
    "menu": "SystemCtl",
    "index": 0
  }
}
</route>

<style lang="less" scoped>
.table {
  th,
  td {
    border: 1px solid black;
    padding: 0 8px;
  }
}

.dark .table {
  th,
  td {
    border: 1px solid white;
    padding: 0 8px;
  }
}
</style>
