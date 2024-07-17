import * as signalR from '@microsoft/signalr'
import { type UploadCustomRequestOptions, createDiscreteApi } from 'naive-ui'
import { ref } from 'vue'

interface User {
  id: string
  connectionId: string
  status?: string
  pc?: RTCPeerConnection
}

export class Client {
  private connection: signalR.HubConnection

  public users = ref<Record<string, User>>({})
  public currentUser = ref('')

  constructor() {
    let user = localStorage.getItem('user')
    if (!user) {
      user = crypto.randomUUID()
      localStorage.setItem('user', user)
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/api/transfer', {
        accessTokenFactory: () => user,
      })
      .build()

    this.currentUser.value = user

    this.connection.on('Connections', (users: User[]) => {
      for (const item of users) {
        if (item.id === this.currentUser.value)
          continue

        let user = this.users.value[item.id]
        if (!user) {
          user = item
          this.users.value[item.id] = user
        }
        else {
          user.connectionId = item.connectionId
        }
      }
    })

    const { message } = createDiscreteApi(['message'])

    this.connection.on('Connect', async (userId: string, offer: RTCSessionDescriptionInit) => {
      const user = this.users.value[userId]
      if (!user) {
        message.error('User not found')
        return
      }

      if (!user.pc) {
        const pc = new RTCPeerConnection({
          iceServers: [{
            urls: 'stun:stun.l.google.com:19302',
          }],
        })
        pc.addEventListener('datachannel', (event) => {
          const channel = event.channel

          const chunk: ArrayBuffer[] = []
          channel.addEventListener('message', (event: MessageEvent<ArrayBuffer>) => {
            chunk.push(event.data)
          })
          channel.addEventListener('close', () => {
            const blob = new Blob(chunk)
            const reader = new FileReader()

            // 下载文件
            reader.addEventListener('load', () => {
              const a = document.createElement('a')
              a.href = reader.result as string
              a.download = channel.label
              a.click()
            })

            reader.readAsDataURL(blob)
            channel.close()
          })
        })

        user.pc = pc
      }

      await user.pc.setRemoteDescription(offer)
      const answer = await user.pc.createAnswer()
      await user.pc.setLocalDescription(answer)

      return answer
    })
    this.connection.on('IceCandidate', async (userId: string, candidate: RTCIceCandidate) => {
      const user = this.users.value[userId]
      if (!user) {
        message.error('User not found')
        return
      }

      if (!user.pc) {
        message.error('PeerConnection not found')
        return
      }

      user.pc.addIceCandidate(candidate)
    })
  }

  async start() {
    await this.connection.start()
  }

  async stop() {
    await this.connection.stop()
  }

  connect(userId: string) {
    const { message } = createDiscreteApi(['message'])

    const user = this.users.value[userId]
    if (!user) {
      message.error('User not found')
      return
    }

    if (user.pc)
      return

    const pc = new RTCPeerConnection({
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302',
      }],
    })
    pc.addEventListener('icecandidate', async (event) => {
      if (event.candidate)
        this.connection.send('IceCandidate', userId, event.candidate)
    })

    pc.addEventListener('connectionstatechange', () => {
      user.status = pc.connectionState
    })

    pc.addEventListener('negotiationneeded', async () => {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const answer = await this.connection.invoke<RTCSessionDescriptionInit>('Connect', userId, offer)
      await pc.setRemoteDescription(answer)
    })

    user.pc = pc
  }

  upload = async (options: UploadCustomRequestOptions) => {
    const { message } = createDiscreteApi(['message'])

    const file = options.file.file
    if (!file) {
      message.error('File not found')
      options.onError()
      return
    }

    const userId = (options.data as any).userId as string

    const user = this.users.value[userId]
    if (!user) {
      message.error('User not found')
      options.onError()
      return
    }

    if (!user.pc) {
      message.error('PeerConnection not found')
      options.onError()
      return
    }

    const total = file.size
    const channel = user.pc.createDataChannel(file.name)
    const CHUNK_SIZE = 64 * 1024
    let offset = 0

    const readSlice = async () => {
      const slice = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer()
      offset += slice.byteLength
      channel.send(slice)
    }

    channel.addEventListener('open', () => {
      readSlice()
    })

    channel.addEventListener('bufferedamountlow', () => {
      if (offset < total) {
        options.onProgress({ percent: offset / total * 100 })
        readSlice()
      }
      else if (channel.bufferedAmount === 0) {
        channel.close()
        options.onFinish()
      }
    })
  }
}
