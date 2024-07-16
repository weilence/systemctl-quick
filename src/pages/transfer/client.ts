import * as signalR from '@microsoft/signalr'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { ref } from 'vue'

interface RoomUser {
  id: string
  connectionId: string
}

export class Client {
  private connection: signalR.HubConnection
  public connectionIds = ref<RoomUser[]>([])
  private peers: Record<string, RTCPeerConnection> = {}

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
    this.connection.on('Connections', (connectionIds: RoomUser[]) => {
      this.connectionIds.value = connectionIds.filter(m => m.id !== user)
    })
    this.connection.on('Connect', async (connectionId: string, offer: RTCSessionDescriptionInit) => {
      let pc = this.peers[connectionId]
      if (!pc) {
        pc = new RTCPeerConnection({
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
        this.peers[connectionId] = pc
      }

      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      return answer
    })
    this.connection.on('IceCandidate', async (connectionId: string, candidate: RTCIceCandidate) => {
      const peer = this.peers[connectionId]
      if (!peer) {
        console.error('Peer not found with connectionId:', connectionId)
        return
      }

      peer.addIceCandidate(candidate)
    })
  }

  async start() {
    await this.connection.start()
  }

  async stop() {
    await this.connection.stop()
  }

  connect(connectionId: string) {
    let pc = this.peers[connectionId]
    if (pc)
      return

    pc = new RTCPeerConnection({
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302',
      }],
    })
    pc.addEventListener('icecandidate', async (event) => {
      if (event.candidate)
        this.connection.send('IceCandidate', connectionId, event.candidate)
    })
    pc.addEventListener('negotiationneeded', async () => {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const answer = await this.connection.invoke<RTCSessionDescriptionInit>('Connect', connectionId, offer)
      await pc.setRemoteDescription(answer)
    })

    this.peers[connectionId] = pc
  }

  upload = async (options: UploadCustomRequestOptions) => {
    const file = options.file.file
    if (!file) {
      options.onError()
      return
    }

    const connectionId = (options.data as any).connectionId as string
    const pc = this.peers[connectionId]
    if (!pc) {
      options.onError()
      return
    }

    const total = file.size
    const channel = pc.createDataChannel(file.name)
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
