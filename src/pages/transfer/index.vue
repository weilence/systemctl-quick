<script setup lang="tsx">
import { onMounted, onUnmounted } from 'vue'
import { useMessage, useModal } from 'naive-ui'
import JoinRoomModal from './components/JoinRoomModal.vue'
import { Client } from './client'
import SetPasswordModal from './components/SetPasswordModal.vue'

const client = new Client()

onMounted(async () => {
  await client.start()
})

onUnmounted(async () => {
  await client.stop()
})

const message = useMessage()
const modal = useModal()

async function joinRoom() {
  const m = modal.create({
    title: '加入房间',
    style: {
      width: '600px',
    },
    preset: 'card',
    content: () => (
      <JoinRoomModal onSubmit={async (name: string, password: string) => {
        try {
          await client.joinRoom(name, password)
          message.success('加入房间成功')
          m.destroy()
        }
        catch (err: any) {
          message.error(err.message)
        }
      }}
      />
    ),
  })
}

function setPassword(roomId: string) {
  const m = modal.create({
    title: '设置密码',
    style: {
      width: '600px',
    },
    preset: 'card',
    content: () => (
      <SetPasswordModal onSubmit={async (password) => {
        try {
          await client.setPassword(roomId, password)
          message.success('设置密码成功')
          m.destroy()
        }
        catch (err: any) {
          message.error(err.message)
        }
      }}
      />
    ),
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="space-x-2">
      <span>
        Client: {{ client.currentUser.value }}
      </span>
      <n-button type="primary" @click="joinRoom">
        进入房间
      </n-button>
    </div>
    <n-card v-for="r in client.rooms.value" :key="r.name">
      <n-list class="flex-auto">
        <template #header>
          <div class="space-x-2">
            <span>{{ r.name }}</span>
            <n-button type="info" @click="setPassword(r.name)">
              设置密码
            </n-button>
            <n-button type="error" @click="client.leaveRoom(r.name)">
              离开房间
            </n-button>
          </div>
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
