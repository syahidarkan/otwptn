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
  // Google Public STUN
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // OpenRelay Public TURN & STUN (Metered.ca) for Symmetric NAT & Cellular traversal
  { urls: 'stun:stun.relay.metered.ca:80' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelay',
    credential: 'openrelay',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelay',
    credential: 'openrelay',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelay',
    credential: 'openrelay',
  },
]

export class StudyCamWebRTC {
  private supabase = createClient()
  private lobbyChannel: RealtimeChannel | null = null
  private roomChannel: RealtimeChannel | null = null
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteMediaStream = new MediaStream()
  private myProfile: PeerInfo
  private currentPeer: PeerInfo | null = null
  private callbacks: WebRTCCallbacks
  private searchTimeoutTimer: NodeJS.Timeout | null = null
  private searchBeaconInterval: NodeJS.Timeout | null = null
  private offerRetryInterval: NodeJS.Timeout | null = null
  private candidateQueue: RTCIceCandidateInit[] = []
  private isRemoteDescriptionSet = false
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
        try {
          this.pc?.addTrack(track, stream)
        } catch {
          // Track already added or connection updating
        }
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
    this.candidateQueue = []
    this.isRemoteDescriptionSet = false
    this.remoteMediaStream = new MediaStream()

    // Setup RTCPeerConnection
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    this.pc = pc

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, this.localStream!)
        } catch (err) {
          console.warn('Could not add track:', err)
        }
      })
    }

    // Handle remote tracks and aggregate into remoteMediaStream
    pc.ontrack = event => {
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach(track => {
          if (!this.remoteMediaStream.getTracks().some(t => t.id === track.id)) {
            this.remoteMediaStream.addTrack(track)
          }
        })
      } else if (event.track) {
        if (!this.remoteMediaStream.getTracks().some(t => t.id === event.track.id)) {
          this.remoteMediaStream.addTrack(event.track)
        }
      }
      this.callbacks.onRemoteStream(this.remoteMediaStream)
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
          payload: { candidate: event.candidate.toJSON(), fromId: this.myProfile.id },
        })
      }
    }

    const drainCandidateQueue = async () => {
      while (this.candidateQueue.length > 0) {
        const candidate = this.candidateQueue.shift()
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.warn('Error adding queued candidate:', err)
          }
        }
      }
    }

    const sendOffer = async () => {
      if (!this.pc || pc.signalingState === 'closed') return
      try {
        if (!pc.localDescription) {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
          await pc.setLocalDescription(offer)
        }
        if (pc.localDescription) {
          roomChannel.send({
            type: 'broadcast',
            event: 'sdp_offer',
            payload: { offer: pc.localDescription, fromId: this.myProfile.id },
          })
        }
      } catch (err) {
        console.warn('Error creating/sending offer:', err)
      }
    }

    // Handle signaling messages
    roomChannel
      .on('broadcast', { event: 'ready_for_offer' }, () => {
        if (isInitiator && !this.isRemoteDescriptionSet) {
          sendOffer()
        }
      })
      .on('broadcast', { event: 'sdp_offer' }, async ({ payload }) => {
        if (payload.fromId === this.myProfile.id) return
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
          this.isRemoteDescriptionSet = true
          await drainCandidateQueue()

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          roomChannel.send({
            type: 'broadcast',
            event: 'sdp_answer',
            payload: { answer, fromId: this.myProfile.id },
          })
        } catch (err) {
          console.warn('Error handling sdp_offer:', err)
        }
      })
      .on('broadcast', { event: 'sdp_answer' }, async ({ payload }) => {
        if (payload.fromId === this.myProfile.id) return
        try {
          if (this.offerRetryInterval) {
            clearInterval(this.offerRetryInterval)
            this.offerRetryInterval = null
          }
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
          this.isRemoteDescriptionSet = true
          await drainCandidateQueue()
        } catch (err) {
          console.warn('Error handling sdp_answer:', err)
        }
      })
      .on('broadcast', { event: 'ice_candidate' }, async ({ payload }) => {
        if (payload.fromId === this.myProfile.id) return
        if (!payload.candidate) return
        if (!this.isRemoteDescriptionSet) {
          this.candidateQueue.push(payload.candidate)
        } else {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
          } catch (err) {
            console.warn('Error adding live candidate:', err)
          }
        }
      })
      .on('broadcast', { event: 'peer_disconnect' }, () => {
        this.callbacks.onPeerLeft()
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          if (isInitiator) {
            // First attempt with 400ms delay to let responder connect
            setTimeout(() => sendOffer(), 400)
            let retries = 0
            this.offerRetryInterval = setInterval(() => {
              retries++
              if (retries > 5 || this.isRemoteDescriptionSet) {
                if (this.offerRetryInterval) {
                  clearInterval(this.offerRetryInterval)
                  this.offerRetryInterval = null
                }
                return
              }
              sendOffer()
            }, 1200)
          } else {
            // Responder announces readiness for offer
            roomChannel.send({
              type: 'broadcast',
              event: 'ready_for_offer',
              payload: { fromId: this.myProfile.id },
            })
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

    if (this.offerRetryInterval) {
      clearInterval(this.offerRetryInterval)
      this.offerRetryInterval = null
    }

    this.candidateQueue = []
    this.isRemoteDescriptionSet = false

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
