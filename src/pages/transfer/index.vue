<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import JoinRoomModal from './components/JoinRoomModal.vue'
import { Client } from './client'

const client = new Client()

onMounted(async () => {
  await client.start()
})

onUnmounted(async () => {
  await client.stop()
})

const joinRoomModal = ref(false)

const message = useMessage()

async function joinRoom(name: string, password: string) {
  try {
    await client.joinRoom(name, password)
    message.success('加入房间成功')
    joinRoomModal.value = false
  }
  catch (err: any) {
    message.error(err.message)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <span>
        Client: {{ client.currentUser.value }}
      </span>
      <n-button @click="joinRoomModal = true">
        进入房间
      </n-button>
    </div>
    <n-card v-for="r in client.rooms.value" :key="r.name">
      <n-list class="flex-auto">
        <template #header>
          <span>{{ r.name }}</span>
          <n-button>
            设置密码
          </n-button>
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
  </div>
  <JoinRoomModal :show="joinRoomModal" @join-room="joinRoom" />
</template>

<route lang="json">
{
  "meta": {
    "menu": "Transfer",
    "index": 4
  }
}
</route>
