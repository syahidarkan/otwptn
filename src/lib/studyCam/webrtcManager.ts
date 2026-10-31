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
  // Google Global STUN servers (IPv4 + IPv6 worldwide coverage)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // Cloudflare Edge STUN
  { urls: 'stun:stun.cloudflare.com:3478' },
  // Global Twilio STUN
  { urls: 'stun:global.stun.twilio.com:3478' },
  // Mozilla Global STUN
  { urls: 'stun:stun.services.mozilla.com:3478' },
  // OpenRelay Public TURN & STUN (Metered.ca) for cross-country and symmetric NAT traversal
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
  private disconnectGraceTimer: NodeJS.Timeout | null = null
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
          // Track already registered
        }
      })
    }
  }

  // Start Matchmaking: Uses Supabase Presence + Broadcast for guaranteed cross-device pairing
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

    const handlePotentialMatch = (remotePeer: PeerInfo) => {
      if (this.isCleanedUp || this.matchedRoomId) return
      if (!remotePeer || remotePeer.id === this.myProfile.id) return

      // Deterministic tie-breaker: Lexicographically smaller ID acts as initiator
      if (this.myProfile.id < remotePeer.id) {
        const roomId = `room_${this.myProfile.id}_${remotePeer.id}`
        this.matchedRoomId = roomId
        this.currentPeer = remotePeer

        // Notify remote peer with match invitation
        lobby.send({
          type: 'broadcast',
          event: 'match_invitation',
          payload: {
            from: this.myProfile,
            toId: remotePeer.id,
            roomId,
          },
        })

        lobby.untrack().catch(() => {})
        this.stopSearchingTimers()
        this.initiateWebRTCSession(roomId, remotePeer, true)
      }
    }

    lobby
      .on('presence', { event: 'sync' }, () => {
        if (this.isCleanedUp || this.matchedRoomId) return
        const state = lobby.presenceState()
        const peers: PeerInfo[] = []
        Object.values(state).forEach((presences: any) => {
          if (Array.isArray(presences)) {
            presences.forEach((p: any) => {
              if (p?.peer && p.peer.id !== this.myProfile.id) {
                peers.push(p.peer)
              }
            })
          }
        })
        if (peers.length > 0) {
          handlePotentialMatch(peers[0])
        }
      })
      .on('broadcast', { event: 'peer_searching' }, ({ payload }) => {
        if (payload?.peer) {
          handlePotentialMatch(payload.peer as PeerInfo)
        }
      })
      .on('broadcast', { event: 'match_invitation' }, ({ payload }) => {
        if (this.isCleanedUp || this.matchedRoomId) return
        if (payload.toId !== this.myProfile.id) return

        const initiator = payload.from as PeerInfo
        const roomId = payload.roomId as string

        this.matchedRoomId = roomId
        this.currentPeer = initiator

        // Send confirmation back to initiator
        lobby.send({
          type: 'broadcast',
          event: 'match_accept',
          payload: {
            from: this.myProfile,
            toId: initiator.id,
            roomId,
          },
        })

        lobby.untrack().catch(() => {})
        this.stopSearchingTimers()
        this.initiateWebRTCSession(roomId, initiator, false)
      })
      .on('broadcast', { event: 'match_accept' }, ({ payload }) => {
        if (this.isCleanedUp) return
        if (payload.toId !== this.myProfile.id) return
        // Initiator confirms receiver acknowledged invitation
        if (!this.matchedRoomId) {
          this.matchedRoomId = payload.roomId
          this.currentPeer = payload.from
          lobby.untrack().catch(() => {})
          this.stopSearchingTimers()
          this.initiateWebRTCSession(payload.roomId, payload.from, true)
        }
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Register presence
          await lobby.track({
            peer: this.myProfile,
            joinedAt: Date.now(),
          })

          // Broadcast search beacon
          lobby.send({
            type: 'broadcast',
            event: 'peer_searching',
            payload: { peer: this.myProfile },
          })

          // Periodic broadcast heartbeat every 1.5s
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

    // Timeout: 35s to allow cross-country or mobile handshakes
    this.searchTimeoutTimer = setTimeout(() => {
      if (!this.matchedRoomId && !this.isCleanedUp) {
        this.stopSearchingTimers()
        this.callbacks.onTimeout()
      }
    }, 35000)
  }

  private stopSearchingTimers() {
    if (this.searchTimeoutTimer) {
      clearTimeout(this.searchTimeoutTimer)
      this.searchTimeoutTimer = null
    }
    if (this.searchBeaconInterval) {
      clearInterval(this.searchBeaconInterval)
      this.searchBeaconInterval = null
    }
  }

  // Setup private WebRTC signaling session
  private async initiateWebRTCSession(roomId: string, peer: PeerInfo, isInitiator: boolean) {
    this.callbacks.onMatchFound(peer, isInitiator)
    this.candidateQueue = []
    this.isRemoteDescriptionSet = false
    this.remoteMediaStream = new MediaStream()

    if (this.disconnectGraceTimer) {
      clearTimeout(this.disconnectGraceTimer)
      this.disconnectGraceTimer = null
    }

    // Setup RTCPeerConnection with global STUN/TURN servers
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 4,
    })
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

    // Apply bitrate and bandwidth management to eliminate lag and network choking
    const applyBandwidthConstraint = () => {
      pc.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === 'video') {
          try {
            const params = sender.getParameters()
            if (!params.encodings || params.encodings.length === 0) {
              params.encodings = [{}]
            }
            params.encodings[0].maxBitrate = 400000 // 400 kbps: smooth 30fps without bufferbloat
            params.encodings[0].maxFramerate = 25
            sender.setParameters(params).catch(() => {})
          } catch {
            // Ignore if browser restricts setParameters
          }
        }
      })
    }

    // Handle incoming remote tracks
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

    // Robust connection state listener: 10s grace period for temporary network jitter
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'connected') {
        if (this.disconnectGraceTimer) {
          clearTimeout(this.disconnectGraceTimer)
          this.disconnectGraceTimer = null
        }
        applyBandwidthConstraint()
      } else if (state === 'disconnected') {
        // Temporary packet loss or mobile cell switch. Do not disconnect immediately!
        if (!this.disconnectGraceTimer) {
          this.disconnectGraceTimer = setTimeout(() => {
            if (this.pc && (this.pc.connectionState === 'disconnected' || this.pc.connectionState === 'failed')) {
              this.callbacks.onPeerLeft()
            }
          }, 10000)
        }
      } else if (state === 'failed') {
        try {
          pc.restartIce()
        } catch {
          this.callbacks.onPeerLeft()
        }
      }
    }

    // Private signaling room channel
    const roomChannel = this.supabase.channel(`webrtc_signaling_${roomId}`, {
      config: { broadcast: { self: false } },
    })
    this.roomChannel = roomChannel

    // Forward ICE candidates
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
          applyBandwidthConstraint()
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

    // Signaling events
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
          applyBandwidthConstraint()

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
            setTimeout(() => sendOffer(), 400)
            let retries = 0
            this.offerRetryInterval = setInterval(() => {
              retries++
              if (retries > 6 || this.isRemoteDescriptionSet) {
                if (this.offerRetryInterval) {
                  clearInterval(this.offerRetryInterval)
                  this.offerRetryInterval = null
                }
                return
              }
              sendOffer()
            }, 1200)
          } else {
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
    this.stopSearchingTimers()

    if (this.disconnectGraceTimer) {
      clearTimeout(this.disconnectGraceTimer)
      this.disconnectGraceTimer = null
    }

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

    if (this.lobbyChannel) {
      this.supabase.removeChannel(this.lobbyChannel)
      this.lobbyChannel = null
    }
  }
}
