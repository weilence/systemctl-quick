import * as signalR from '@microsoft/signalr'
import type { SettledFileInfo } from 'naive-ui/es/upload/src/interface'
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
    this.connection.on('Answer', async (connectionId: string, offer: RTCSessionDescriptionInit) => {
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

  connect = async (connectionId: string, f: SettledFileInfo) => {
    if (!f?.file)
      return false

    try {
      const file = f.file

      let pc = this.peers[connectionId]
      if (!pc) {
        pc = new RTCPeerConnection({
          iceServers: [{
            urls: 'stun:stun.l.google.com:19302',
          }],
        })

        pc.addEventListener('icecandidate', async (event) => {
          if (event.candidate)
            this.connection.send('IceCandidate', connectionId, event.candidate)
        })
        this.peers[connectionId] = pc
      }

      const channel = pc.createDataChannel(file.name)
      channel.addEventListener('open', async () => {
        const writableStream = new WritableStream({
          write(chunk) {
            channel.send(chunk)
          },
        })

        await file.stream().pipeTo(writableStream)
        channel.close()
      })

      if (pc.connectionState === 'connected')
        return

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const answer = await this.connection.invoke<RTCSessionDescriptionInit>('Connect', connectionId, offer)
      await pc.setRemoteDescription(answer)
    }
    catch (e: any) {
      console.error(e)
    }

    return false
  }
}
