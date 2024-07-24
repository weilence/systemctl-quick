<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { FormInst } from 'naive-ui'
import { Client } from './client'

const client = new Client()

onMounted(async () => {
  await client.start()
})

onUnmounted(async () => {
  await client.stop()
})

const showModal = ref(false)
const formValue = ref({
  name: '',
})
const formRef = ref<FormInst | null>(null)
const rules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
  },
}

async function joinRoom() {
  await formRef.value?.validate()
  client.joinRoom(formValue.value.name)
  showModal.value = false
  formValue.value.name = ''
  formRef.value?.restoreValidation()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <span>
        Client: {{ client.currentUser.value }}
      </span>
      <n-button @click="showModal = true">
        进入房间
      </n-button>
    </div>
    <n-card v-for="r in client.rooms.value" :key="r.name">
      <n-list class="flex-auto">
        <template #header>
          <span>{{ r.name }}</span>
          <n-button @click="client.leaveRoom(r.name)">
            离开房间
          </n-button>
        </template>
        <div v-for="u in r.users" :key="u.id">
          <n-list-item v-if="client.users.value[u.id]">
            <template #suffix>
              <n-button v-if="client.users.value[u.id].connectionState !== 'connected'" @click="client.connect(u.id)">
                连接
              </n-button>
              <n-upload v-else :data="{ userId: u.id }" :custom-request="client.upload">
                <n-button>上传文件</n-button>
              </n-upload>
            </template>
            <span>
              {{ u.id }} <n-tag type="primary">{{ client.users.value[u.id].status }}</n-tag> <n-tag v-if="client.users.value[u.id].connectionState" type="info">{{ client.users.value[u.id].connectionState }}</n-tag>
            </span>
          </n-list-item>
        </div>
      </n-list>
    </n-card>
    <n-modal v-model:show="showModal">
      <n-card
        style="width: 600px"
        title="进入房间"
        preset="card"
        closable
        @close="showModal = false"
      >
        <n-form
          ref="formRef" inline label-placement="left" label-width="auto" :model="formValue" :rules="rules"
        >
          <n-form-item label="房间名" path="name">
            <n-input v-model:value="formValue.name" placeholder="请输入房间名" />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="flex justify-end">
            <n-button type="primary" @click="joinRoom()">
              进入
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "menu": "Transfer",
    "index": 4
  }
}
</route>
