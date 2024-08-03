import * as signalR from '@microsoft/signalr'
import { type UploadCustomRequestOptions, createDiscreteApi } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid'
import { computed, ref } from 'vue'

interface Peer {
  pc?: RTCPeerConnection
}

interface User {
  id: string
  status?: RTCPeerConnectionState
}

export class Client {
  private connection: signalR.HubConnection
  private peers: Record<string, Peer> = {}
  private neighborUsers = ref<User[]>([])
  private qrcodeUsers = ref<User[]>([])
  public currentUserId = ref('')

  public users = computed(() => {
    return this.neighborUsers.value.concat(this.qrcodeUsers.value)
  })

  constructor() {
    let userId = localStorage.getItem('user')
    if (!userId) {
      userId = uuidv4()
      localStorage.setItem('user', userId)
    }
    this.currentUserId.value = userId

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/hub/transfer', {
        accessTokenFactory: () => userId,
      })
      .withAutomaticReconnect()
      .build()

    this.connection.on('Users', (users: User[]) => {
      const newUsers = []
      for (const user of users) {
        if (user.id === userId)
          continue

        if (this.qrcodeUsers.value.find(m => m.id === user.id))
          continue

        newUsers.push(user)
      }

      this.neighborUsers.value = newUsers
    })

    this.connection.on('Connect', async (userId: string, offer: RTCSessionDescriptionInit) => {
      let peer = this.peers[userId]
      if (!peer) {
        peer = {}
        this.peers[userId] = peer
      }

      if (!peer.pc) {
        const user = this.users.value.find(m => m.id === userId)
        if (!user)
          throw new Error('User not found')

        peer.pc = createPeerConnection(this.connection, user)
      }

      await peer.pc.setRemoteDescription(offer)
      const answer = await peer.pc.createAnswer()
      await peer.pc.setLocalDescription(answer)

      return answer
    })

    this.connection.on('IceCandidate', async (userId: string, candidate: RTCIceCandidate) => {
      const peer = this.peers[userId]
      if (!peer)
        throw new Error('Peer not found')

      if (!peer.pc)
        throw new Error('PeerConnection not found')

      peer.pc.addIceCandidate(candidate)
    })
  }

  async start() {
    await this.connection.start()
  }

  async stop() {
    for (const peer of Object.values(this.peers))
      peer.pc?.close()

    await this.connection.stop()
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
    const user = this.users.value.find(m => m.id === userId)
    if (!user) {
      message.error('User not found')
      options.onError()
      return
    }

    let peer = this.peers[userId]
    if (!peer) {
      peer = {}
      this.peers[userId] = peer
    }

    let pc = peer.pc
    if (!pc) {
      pc = createPeerConnection(this.connection, user)
      peer.pc = pc
    }

    const channel = pc.createDataChannel('fileChannel')
    channel.addEventListener('message', createMessageHandler())

    const total = file.size
    const CHUNK_SIZE = 64 * 1024
    let offset = 0

    const bufferedamountlow = async () => {
      if (offset < total) {
        options.onProgress({ percent: offset / total * 100 })
        const slice = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer()
        offset += slice.byteLength
        channel.send(slice)
        if (offset === total) {
          channel.send(JSON.stringify({
            name: file.name,
            action: 'end',
          }))
        }
      }
      else if (channel.bufferedAmount === 0) {
        options.onFinish()
      }
    }

    channel.addEventListener('bufferedamountlow', bufferedamountlow)
    channel.addEventListener('open', () => {
      channel.send(JSON.stringify({
        name: file.name,
        action: 'begin',
      }))
    })
  }

  public async addQrcodeUser(userId: string) {
    if (this.users.value.find(m => m.id === userId)) {
      const { message } = createDiscreteApi(['message'])
      message.error('User already exists')
      return
    }

    this.qrcodeUsers.value.push({
      id: userId,
    })
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
  })

  pc.addEventListener('icecandidate', async (event) => {
    if (event.candidate)
      connection.send('IceCandidate', user.id, event.candidate)
  })

  pc.addEventListener('connectionstatechange', () => {
    if (pc.connectionState === 'disconnected')
      pc.restartIce()

    user.status = pc.connectionState
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

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = obj.name
        a.click()
        URL.revokeObjectURL(url)
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
