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

export const ICE_SERVERS: RTCIceServer[] = [
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
  // OpenRelay Public STUN
  { urls: 'stun:openrelay.metered.ca:80' },
  // OpenRelay Free Global TURN (UDP + TCP on 80 & 443 for bypassing strict firewalls, Windows Defender, & Symmetric NAT)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:80?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]

export class StudyCamWebRTC {
  private supabase = createClient()
  private lobbyChannel: RealtimeChannel | null = null
  private roomChannel: RealtimeChannel | null = null
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
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
      this.attachLocalTracksToPc(stream)
    }
  }

  private attachLocalTracksToPc(stream: MediaStream) {
    if (!this.pc) return
    const senders = this.pc.getSenders()
    stream.getTracks().forEach(track => {
      const sender = senders.find(s => s.track?.kind === track.kind || (s as any).kind === track.kind)
      if (sender) {
        sender.replaceTrack(track).catch(err => {
          console.warn('[StudyCam WebRTC] replaceTrack warning:', err)
        })
      } else {
        try {
          this.pc?.addTrack(track, stream)
        } catch (err) {
          console.warn('[StudyCam WebRTC] addTrack warning:', err)
        }
      }
    })
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
    this.remoteStream = new MediaStream()

    if (this.disconnectGraceTimer) {
      clearTimeout(this.disconnectGraceTimer)
      this.disconnectGraceTimer = null
    }

    // Setup RTCPeerConnection with global STUN + TURN servers
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      bundlePolicy: 'max-bundle',
      iceCandidatePoolSize: 10,
      rtcpMuxPolicy: 'require',
    })
    this.pc = pc

    // Ensure transceivers exist for both video and audio in sendrecv direction
    try {
      pc.addTransceiver('video', { direction: 'sendrecv' })
      pc.addTransceiver('audio', { direction: 'sendrecv' })
    } catch (err) {
      console.warn('[StudyCam WebRTC] addTransceiver warning:', err)
    }

    // Attach local tracks if already available
    if (this.localStream) {
      this.attachLocalTracksToPc(this.localStream)
    }

    // Handle incoming remote stream and tracks
    pc.ontrack = event => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
      }
      if (event.track) {
        if (!this.remoteStream.getTracks().some(t => t.id === event.track.id)) {
          this.remoteStream.addTrack(event.track)
        }
      }
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach(t => {
          if (!this.remoteStream!.getTracks().some(existing => existing.id === t.id)) {
            this.remoteStream!.addTrack(t)
          }
        })
      }
      this.callbacks.onRemoteStream(this.remoteStream)
    }

    // Robust connection state listener: 10s grace period for temporary network jitter
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'connected') {
        if (this.disconnectGraceTimer) {
          clearTimeout(this.disconnectGraceTimer)
          this.disconnectGraceTimer = null
        }
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
            console.warn('[StudyCam WebRTC] Error adding queued candidate:', err)
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
            payload: {
              offer: {
                type: pc.localDescription.type,
                sdp: pc.localDescription.sdp,
              },
              fromId: this.myProfile.id,
            },
          })
        }
      } catch (err) {
        console.warn('[StudyCam WebRTC] Error creating/sending offer:', err)
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
          if (this.isRemoteDescriptionSet && pc.localDescription) {
            // Already answered - re-send in case initiator dropped packet
            roomChannel.send({
              type: 'broadcast',
              event: 'sdp_answer',
              payload: {
                answer: {
                  type: pc.localDescription.type,
                  sdp: pc.localDescription.sdp,
                },
                fromId: this.myProfile.id,
              },
            })
            return
          }

          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
          this.isRemoteDescriptionSet = true
          await drainCandidateQueue()

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          roomChannel.send({
            type: 'broadcast',
            event: 'sdp_answer',
            payload: {
              answer: {
                type: answer.type,
                sdp: answer.sdp,
              },
              fromId: this.myProfile.id,
            },
          })
        } catch (err) {
          console.warn('[StudyCam WebRTC] Error handling sdp_offer:', err)
        }
      })
      .on('broadcast', { event: 'sdp_answer' }, async ({ payload }) => {
        if (payload.fromId === this.myProfile.id) return
        try {
          if (this.offerRetryInterval) {
            clearInterval(this.offerRetryInterval)
            this.offerRetryInterval = null
          }
          if (pc.signalingState === 'stable') return
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
          this.isRemoteDescriptionSet = true
          await drainCandidateQueue()
        } catch (err) {
          console.warn('[StudyCam WebRTC] Error handling sdp_answer:', err)
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
            console.warn('[StudyCam WebRTC] Error adding live candidate:', err)
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
    this.remoteStream = null

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
