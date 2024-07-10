import * as signalR from '@microsoft/signalr'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { ref } from 'vue'

export class Client {
  private connection: signalR.HubConnection
  public connectionIds = ref<string[]>([])
  private peers: Record<string, RTCPeerConnection> = {}

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/api/transfer')
      .build()
    this.connection.on('Connections', (connectionIds: string[]) => {
      this.connectionIds.value = connectionIds.filter(id => id !== this.connection.connectionId)
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

  upload = (options: UploadCustomRequestOptions) => {
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
    channel.addEventListener('open', async () => {
      const CHUNK_SIZE = 16 * 1024 // 每块16KB
      const arrayBuffer = await file.arrayBuffer()

      try {
        for (let offset = 0; offset < total; offset += CHUNK_SIZE) {
          const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE)
          channel.send(chunk)
        }

        options.onFinish()
      }
      catch (e: any) {
        console.error(e)
        options.onError()
      }
      finally {
        channel.close()
      }
    })
  }
}
