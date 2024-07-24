import * as signalR from '@microsoft/signalr'
import { type UploadCustomRequestOptions, createDiscreteApi, useModal } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'

interface User {
  id: string
  connectionId: string
  status: 'online' | 'offline'
  connectionState?: string
  pc?: RTCPeerConnection
  channel?: RTCDataChannel
}

interface RoomInfo {
  name: string
  users: Array<{
    id: string
    connectionId: string
  }>
}

export class Client {
  private connection: signalR.HubConnection

  public users = ref<Record<string, User>>({})
  public rooms = ref<RoomInfo[]>([])
  public currentUser = ref('')

  constructor() {
    let user = localStorage.getItem('user')
    if (!user) {
      user = uuidv4()
      localStorage.setItem('user', user)
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/api/transfer', {
        accessTokenFactory: () => user,
      })
      .build()

    this.currentUser.value = user

    this.connection.on('Connections', (roomInfo: RoomInfo) => {
      const room = this.rooms.value.find(item => item.name === roomInfo.name)
      if (!room)
        this.rooms.value.push(roomInfo)
      else
        room.users = roomInfo.users

      for (const item of roomInfo.users) {
        if (item.id === this.currentUser.value)
          continue

        let user = this.users.value[item.id]
        if (!user) {
          user = {
            id: item.id,
            connectionId: item.connectionId,
            status: 'online',
          }
          this.users.value[item.id] = user
        }
        else {
          user.connectionId = item.connectionId
          user.status = 'online'
        }
      }

      for (const id in this.users.value) {
        if (!roomInfo.users.find(item => item.id === id)) {
          const user = this.users.value[id]
          user.connectionState = ''
          user.channel?.close()
          user.channel = undefined
          user.pc?.close()
          user.pc = undefined
          user.status = 'offline'
        }
      }
    })

    const { message } = createDiscreteApi(['message'])

    this.connection.on('Connect', async (userId: string, offer: RTCSessionDescriptionInit) => {
      const user = this.users.value[userId]
      if (!user) {
        message.error('User not found')
        throw new Error('User not found')
      }

      if (!user.pc)
        user.pc = createPeerConnection(this.connection, user)

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
    for (const user of Object.values(this.users.value)) {
      user.channel?.close()
      user.pc?.close()
    }
    await this.connection.stop()
  }

  joinRoom(name: string) {
    this.connection.send('JoinRoom', name)
  }

  leaveRoom(name: string) {
    this.connection.send('LeaveRoom', name)
    this.rooms.value = this.rooms.value.filter(item => item.name !== name)
  }

  connect(userId: string) {
    const { message } = createDiscreteApi(['message'])

    const user = this.users.value[userId]
    if (!user) {
      message.error('User not found')
      return
    }

    if (user.channel) {
      message.error('DataChannel already exists')
      return
    }

    const pc = createPeerConnection(this.connection, user)
    const channel = pc.createDataChannel('fileChannel')
    channel.addEventListener('message', createMessageHandler())

    user.pc = pc
    user.channel = channel
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

    const channel = user.channel
    if (!channel) {
      message.error('DataChannel not found')
      options.onError()
      return
    }

    const total = file.size
    const CHUNK_SIZE = 64 * 1024
    let offset = 0

    const readSlice = async () => {
      const slice = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer()
      offset += slice.byteLength
      channel.send(slice)
    }

    const bufferedamountlow = () => {
      if (offset < total) {
        options.onProgress({ percent: offset / total * 100 })
        readSlice()
      }
      else if (channel.bufferedAmount === 0) {
        options.onFinish()
        channel.send(JSON.stringify({
          name: file.name,
          action: 'end',
        }))
        channel.removeEventListener('bufferedamountlow', bufferedamountlow)
      }
    }

    channel.addEventListener('bufferedamountlow', bufferedamountlow)
    channel.send(JSON.stringify({
      name: file.name,
      action: 'begin',
    }))
  }
}

function createPeerConnection(connection: signalR.HubConnection, user: User) {
  const pc = new RTCPeerConnection({
    iceServers: [{
      urls: 'stun:stun.l.google.com:19302',
    }],
  })
  pc.addEventListener('datachannel', (event) => {
    const channel = event.channel
    channel.addEventListener('message', createMessageHandler())
    user.channel = channel
  })

  pc.addEventListener('icecandidate', async (event) => {
    if (event.candidate)
      connection.send('IceCandidate', user.id, event.candidate)
  })

  pc.addEventListener('connectionstatechange', () => {
    if (pc.connectionState === 'disconnected')
      pc.restartIce()

    user.connectionState = pc.connectionState
  })

  pc.addEventListener('negotiationneeded', async () => {
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    const answer = await connection.invoke<RTCSessionDescriptionInit>('Connect', user.id, offer)
    await pc.setRemoteDescription(answer)
  })

  return pc
}

function createMessageHandler() {
  let chunk: ArrayBuffer[] = []
  return (event: MessageEvent<ArrayBuffer | string>) => {
    if (event.data instanceof ArrayBuffer) {
      chunk.push(event.data)
    }
    else if (typeof event.data === 'string') {
      const obj = JSON.parse(event.data)
      if (obj.action === 'begin') {
        chunk = []
      }
      else if (obj.action === 'end') {
        const blob = new Blob(chunk)
        const reader = new FileReader()

        reader.addEventListener('load', () => {
          const url = reader.result as string
          const a = document.createElement('a')
          a.href = url
          a.download = obj.name
          a.click()
          URL.revokeObjectURL(url)
        })

        reader.readAsDataURL(blob)
      }
      else {
        throw new TypeError('Unknown action')
      }
    }
    else {
      throw new TypeError('Unknown data type')
    }
  }
}
