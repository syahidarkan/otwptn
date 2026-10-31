import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface PeerInfo {
  id: string
  name: string
  school: string
  city: string
  targetPTN: string
}

export interface WebRTCCallbacks {
  onMatchFound: (peer: PeerInfo, isInitiator: boolean) => void
  onRemoteStream: (stream: MediaStream) => void
  onPeerLeft: () => void
  onTimeout: () => void
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
]

export class StudyCamWebRTC {
  private supabase = createClient()
  private lobbyChannel: RealtimeChannel | null = null
  private roomChannel: RealtimeChannel | null = null
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private myProfile: PeerInfo
  private currentPeer: PeerInfo | null = null
  private callbacks: WebRTCCallbacks
  private searchTimeoutTimer: NodeJS.Timeout | null = null
  private searchBeaconInterval: NodeJS.Timeout | null = null
  private matchedRoomId: string | null = null
  private isCleanedUp = false

  constructor(myProfile: PeerInfo, localStream: MediaStream | null, callbacks: WebRTCCallbacks) {
    this.myProfile = myProfile
    this.localStream = localStream
    this.callbacks = callbacks
  }

  public setLocalStream(stream: MediaStream) {
    this.localStream = stream
    if (this.pc) {
      stream.getTracks().forEach(track => {
        this.pc?.addTrack(track, stream)
      })
    }
  }

  // Start Matchmaking: Broadcast searching beacon and check for other real devices
  public startMatchmaking() {
    this.cleanup()
    this.isCleanedUp = false

    const lobby = this.supabase.channel('study_cam_matchmaking_pool', {
      config: {
        broadcast: { self: false },
        presence: { key: this.myProfile.id },
      },
    })
    this.lobbyChannel = lobby

    lobby
      .on('broadcast', { event: 'peer_searching' }, ({ payload }) => {
        if (this.isCleanedUp || this.matchedRoomId) return
        const remotePeer = payload.peer as PeerInfo
        if (!remotePeer || remotePeer.id === this.myProfile.id) return

        // Tie-breaker: Lexicographically smaller ID acts as initiator
        if (this.myProfile.id < remotePeer.id) {
          const roomId = `room_${this.myProfile.id}_${remotePeer.id}`
          this.matchedRoomId = roomId
          this.currentPeer = remotePeer

          // Notify remote peer of match
          lobby.send({
            type: 'broadcast',
            event: 'match_invitation',
            payload: {
              from: this.myProfile,
              toId: remotePeer.id,
              roomId,
            },
          })

          this.stopMatchmaking()
          this.initiateWebRTCSession(roomId, remotePeer, true)
        }
      })
      .on('broadcast', { event: 'match_invitation' }, ({ payload }) => {
        if (this.isCleanedUp || this.matchedRoomId) return
        if (payload.toId !== this.myProfile.id) return

        const initiator = payload.from as PeerInfo
        const roomId = payload.roomId as string

        this.matchedRoomId = roomId
        this.currentPeer = initiator

        this.stopMatchmaking()
        this.initiateWebRTCSession(roomId, initiator, false)
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          // Immediately announce presence to anyone waiting
          lobby.send({
            type: 'broadcast',
            event: 'peer_searching',
            payload: { peer: this.myProfile },
          })

          // Heartbeat broadcast every 1.5s while searching
          this.searchBeaconInterval = setInterval(() => {
            if (this.matchedRoomId || this.isCleanedUp) return
            lobby.send({
              type: 'broadcast',
              event: 'peer_searching',
              payload: { peer: this.myProfile },
            })
          }, 1500)
        }
      })

    // Timeout: If after 12s no other real device is online, trigger onTimeout
    this.searchTimeoutTimer = setTimeout(() => {
      if (!this.matchedRoomId && !this.isCleanedUp) {
        this.stopMatchmaking()
        this.callbacks.onTimeout()
      }
    }, 12000)
  }

  private stopMatchmaking() {
    if (this.searchTimeoutTimer) {
      clearTimeout(this.searchTimeoutTimer)
      this.searchTimeoutTimer = null
    }
    if (this.searchBeaconInterval) {
      clearInterval(this.searchBeaconInterval)
      this.searchBeaconInterval = null
    }
    if (this.lobbyChannel) {
      this.supabase.removeChannel(this.lobbyChannel)
      this.lobbyChannel = null
    }
  }

  // Setup private WebRTC signaling channel for the paired room
  private async initiateWebRTCSession(roomId: string, peer: PeerInfo, isInitiator: boolean) {
    this.callbacks.onMatchFound(peer, isInitiator)

    // Setup RTCPeerConnection
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    this.pc = pc

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // Handle remote tracks
    pc.ontrack = event => {
      if (event.streams && event.streams[0]) {
        this.callbacks.onRemoteStream(event.streams[0])
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.callbacks.onPeerLeft()
      }
    }

    // Create private signaling channel for this specific pair
    const roomChannel = this.supabase.channel(`webrtc_signaling_${roomId}`, {
      config: { broadcast: { self: false } },
    })
    this.roomChannel = roomChannel

    // Forward ICE candidates to peer
    pc.onicecandidate = event => {
      if (event.candidate) {
        roomChannel.send({
          type: 'broadcast',
          event: 'ice_candidate',
          payload: { candidate: event.candidate, fromId: this.myProfile.id },
        })
      }
    }

    // Handle signaling messages
    roomChannel
      .on('broadcast', { event: 'sdp_offer' }, async ({ payload }) => {
        if (payload.fromId === this.myProfile.id) return
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          roomChannel.send({
            type: 'broadcast',
            event: 'sdp_answer',
            payload: { answer, fromId: this.myProfile.id },
          })
        } catch {
          // Fallback ignore error
        }
      })
      .on('broadcast', { event: 'sdp_answer' }, async ({ payload }) => {
        if (payload.fromId === this.myProfile.id) return
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
        } catch {
          // Fallback ignore error
        }
      })
      .on('broadcast', { event: 'ice_candidate' }, async ({ payload }) => {
        if (payload.fromId === this.myProfile.id) return
        try {
          if (payload.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
          }
        } catch {
          // Fallback ignore error
        }
      })
      .on('broadcast', { event: 'peer_disconnect' }, () => {
        this.callbacks.onPeerLeft()
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED' && isInitiator) {
          try {
            // Small delay to ensure receiver has subscribed
            setTimeout(async () => {
              if (this.pc && pc.signalingState !== 'closed') {
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                roomChannel.send({
                  type: 'broadcast',
                  event: 'sdp_offer',
                  payload: { offer, fromId: this.myProfile.id },
                })
              }
            }, 500)
          } catch {
            // Fallback ignore error
          }
        }
      })
  }

  public disconnect() {
    if (this.roomChannel) {
      this.roomChannel.send({
        type: 'broadcast',
        event: 'peer_disconnect',
        payload: { fromId: this.myProfile.id },
      })
    }
    this.cleanup()
  }

  public cleanup() {
    this.isCleanedUp = true
    this.matchedRoomId = null
    this.currentPeer = null
    this.stopMatchmaking()

    if (this.pc) {
      this.pc.ontrack = null
      this.pc.onicecandidate = null
      this.pc.onconnectionstatechange = null
      this.pc.close()
      this.pc = null
    }

    if (this.roomChannel) {
      this.supabase.removeChannel(this.roomChannel)
      this.roomChannel = null
    }
  }
}
