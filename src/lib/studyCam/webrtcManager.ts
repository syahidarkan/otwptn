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
  // High-reliability Google Global STUN servers (IPv4 + IPv6 worldwide)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // Cloudflare Edge STUN
  { urls: 'stun:stun.cloudflare.com:3478' },
  // Global Twilio STUN
  { urls: 'stun:global.stun.twilio.com:3478' },
]

type MatchmakingState = 'idle' | 'searching' | 'proposing' | 'matched'

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

  private matchmakingState: MatchmakingState = 'idle'
  private sessionId = 'sess_' + Math.random().toString(36).substring(2, 9)
  private activeInviteId: string | null = null
  private inviteTimeoutTimer: NodeJS.Timeout | null = null

  private searchTimeoutTimer: NodeJS.Timeout | null = null
  private searchBeaconInterval: NodeJS.Timeout | null = null
  private offerRetryInterval: NodeJS.Timeout | null = null
  private roomPingInterval: NodeJS.Timeout | null = null
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
    if (!this.pc) return

    stream.getTracks().forEach(track => {
      const senders = this.pc?.getSenders() || []
      const existingSender = senders.find(s => s.track?.kind === track.kind)
      if (existingSender) {
        existingSender.replaceTrack(track).catch(err => {
          console.warn('[StudyCam WebRTC] replaceTrack warning:', err)
        })
        return
      }

      // Check if there is an inactive/recvonly transceiver we can upgrade to sendrecv
      const transceivers = this.pc?.getTransceivers() || []
      const recvTransceiver = transceivers.find(
        t => t.receiver.track.kind === track.kind
      )
      if (recvTransceiver && recvTransceiver.sender) {
        recvTransceiver.direction = 'sendrecv'
        recvTransceiver.sender.replaceTrack(track).catch(err => {
          console.warn('[StudyCam WebRTC] replaceTrack on transceiver warning:', err)
        })
        return
      }

      try {
        this.pc?.addTrack(track, stream)
      } catch (err) {
        console.warn('[StudyCam WebRTC] addTrack warning:', err)
      }
    })
  }

  // High-concurrency matchmaking with Two-Way Handshake, collision prevention & auto-retry
  public startMatchmaking() {
    this.cleanup()
    this.isCleanedUp = false
    this.sessionId = 'sess_' + Math.random().toString(36).substring(2, 9)
    this.matchmakingState = 'searching'
    this.activeInviteId = null

    // Channel name unique per matchmaking pool
    const lobby = this.supabase.channel('study_cam_matchmaking_pool', {
      config: {
        broadcast: { self: false },
        presence: { key: this.sessionId },
      },
    })
    this.lobbyChannel = lobby

    const proposeMatch = (targetPeer: PeerInfo) => {
      if (this.isCleanedUp || this.matchmakingState !== 'searching') return
      if (!targetPeer || targetPeer.id === this.myProfile.id) return

      // Deterministic tie-breaker: Lexicographically smaller ID initiates proposal
      if (this.myProfile.id < targetPeer.id) {
        const inviteId = 'inv_' + Math.random().toString(36).substring(2, 9)
        const roomId = `room_${this.myProfile.id}_${targetPeer.id}`

        this.matchmakingState = 'proposing'
        this.activeInviteId = inviteId
        this.matchedRoomId = roomId

        // Send match invitation
        lobby.send({
          type: 'broadcast',
          event: 'match_invitation',
          payload: {
            inviteId,
            from: this.myProfile,
            fromSession: this.sessionId,
            toId: targetPeer.id,
            roomId,
          },
        })

        // 3.0 second invitation timeout: If target does not accept within 3s, rollback & keep searching
        if (this.inviteTimeoutTimer) {
          clearTimeout(this.inviteTimeoutTimer)
        }
        this.inviteTimeoutTimer = setTimeout(() => {
          if (this.matchmakingState === 'proposing' && this.activeInviteId === inviteId) {
            console.warn('[StudyCam Matchmaker] Invitation timeout, resuming search...')
            this.matchmakingState = 'searching'
            this.activeInviteId = null
            this.matchedRoomId = null
          }
        }, 3000)
      }
    }

    const evaluateAvailablePeers = () => {
      if (this.isCleanedUp || this.matchmakingState !== 'searching') return
      const state = lobby.presenceState()
      const candidatePeers: PeerInfo[] = []
      const now = Date.now()

      Object.values(state).forEach((presences: any) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: any) => {
            // Must have peer, must not be self, must not be expired (> 12s)
            if (p?.peer && p.peer.id !== this.myProfile.id) {
              const age = now - (p.timestamp || now)
              if (age < 12000 && p.status !== 'matched') {
                candidatePeers.push(p.peer)
              }
            }
          })
        }
      })

      if (candidatePeers.length > 0) {
        // Anti-thundering herd: Randomly select from candidates instead of always peers[0]
        const randomIndex = Math.floor(Math.random() * candidatePeers.length)
        proposeMatch(candidatePeers[randomIndex])
      }
    }

    lobby
      .on('presence', { event: 'sync' }, () => {
        evaluateAvailablePeers()
      })
      .on('broadcast', { event: 'peer_searching' }, ({ payload }) => {
        if (payload?.peer && payload.peer.id !== this.myProfile.id) {
          proposeMatch(payload.peer as PeerInfo)
        }
      })
      .on('broadcast', { event: 'match_invitation' }, ({ payload }) => {
        if (this.isCleanedUp) return
        if (payload.toId !== this.myProfile.id) return

        // If we are already proposing or matched with someone else, reject gracefully
        if (this.matchmakingState !== 'searching') {
          lobby.send({
            type: 'broadcast',
            event: 'match_reject',
            payload: {
              inviteId: payload.inviteId,
              toId: payload.from.id,
              reason: 'busy',
            },
          })
          return
        }

        // We accept the invitation!
        const initiator = payload.from as PeerInfo
        const roomId = payload.roomId as string

        this.matchmakingState = 'matched'
        this.matchedRoomId = roomId
        this.currentPeer = initiator

        // Send confirmation back to initiator
        lobby.send({
          type: 'broadcast',
          event: 'match_accept',
          payload: {
            inviteId: payload.inviteId,
            from: this.myProfile,
            fromSession: this.sessionId,
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
        if (this.matchmakingState !== 'proposing') return
        if (this.activeInviteId && payload.inviteId !== this.activeInviteId) return

        if (this.inviteTimeoutTimer) {
          clearTimeout(this.inviteTimeoutTimer)
          this.inviteTimeoutTimer = null
        }

        this.matchmakingState = 'matched'
        this.matchedRoomId = payload.roomId
        this.currentPeer = payload.from

        lobby.untrack().catch(() => {})
        this.stopSearchingTimers()
        this.initiateWebRTCSession(payload.roomId, payload.from, true)
      })
      .on('broadcast', { event: 'match_reject' }, ({ payload }) => {
        if (this.isCleanedUp) return
        if (payload.toId !== this.myProfile.id) return
        if (this.activeInviteId && payload.inviteId === this.activeInviteId) {
          if (this.inviteTimeoutTimer) {
            clearTimeout(this.inviteTimeoutTimer)
            this.inviteTimeoutTimer = null
          }
          this.matchmakingState = 'searching'
          this.activeInviteId = null
          this.matchedRoomId = null
          // Immediately try evaluating remaining peers
          setTimeout(() => evaluateAvailablePeers(), 300)
        }
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Register presence
          await lobby.track({
            id: this.myProfile.id,
            sessionId: this.sessionId,
            peer: this.myProfile,
            status: 'searching',
            timestamp: Date.now(),
          })

          // Broadcast search beacon immediately
          lobby.send({
            type: 'broadcast',
            event: 'peer_searching',
            payload: {
              peer: this.myProfile,
              sessionId: this.sessionId,
            },
          })

          // Periodic heartbeat every 1.5s to refresh presence and seek peers
          this.searchBeaconInterval = setInterval(() => {
            if (this.matchmakingState !== 'searching' || this.isCleanedUp) return
            lobby.send({
              type: 'broadcast',
              event: 'peer_searching',
              payload: {
                peer: this.myProfile,
                sessionId: this.sessionId,
              },
            })
            evaluateAvailablePeers()
          }, 1500)
        }
      })

    // Timeout: 35s to allow matchmaking
    this.searchTimeoutTimer = setTimeout(() => {
      if (this.matchmakingState !== 'matched' && !this.isCleanedUp) {
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
    if (this.inviteTimeoutTimer) {
      clearTimeout(this.inviteTimeoutTimer)
      this.inviteTimeoutTimer = null
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

    // Setup RTCPeerConnection with high-speed global STUN
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    })
    this.pc = pc

    // Add local tracks directly to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, this.localStream!)
        } catch (err) {
          console.warn('[StudyCam WebRTC] addTrack warning:', err)
        }
      })
    }

    // Ensure we can receive both video and audio even if local device lacks one of them
    const senders = pc.getSenders()
    const hasVideo = senders.some(s => s.track?.kind === 'video')
    const hasAudio = senders.some(s => s.track?.kind === 'audio')

    if (!hasVideo) {
      try {
        pc.addTransceiver('video', { direction: 'recvonly' })
      } catch (err) {
        console.warn('[StudyCam WebRTC] addTransceiver video warning:', err)
      }
    }
    if (!hasAudio) {
      try {
        pc.addTransceiver('audio', { direction: 'recvonly' })
      } catch (err) {
        console.warn('[StudyCam WebRTC] addTransceiver audio warning:', err)
      }
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

      // Re-wrap into fresh MediaStream so Safari destroys audio-only pipeline and binds video decoder
      const streamToDeliver = new MediaStream(this.remoteStream.getTracks())
      this.callbacks.onRemoteStream(streamToDeliver)

      if (event.track) {
        event.track.onunmute = () => {
          if (this.remoteStream) {
            const fresh = new MediaStream(this.remoteStream.getTracks())
            this.callbacks.onRemoteStream(fresh)
          }
        }
      }
    }

    // ICE connection state listener with auto-restart
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        if (this.remoteStream && this.remoteStream.getTracks().length > 0) {
          this.callbacks.onRemoteStream(this.remoteStream)
        }
      } else if (pc.iceConnectionState === 'failed') {
        try {
          pc.restartIce()
        } catch (e) {
          console.warn('[StudyCam WebRTC] restartIce error:', e)
        }
      }
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

    let isRoomSubscribed = false
    const pendingOutgoingCandidates: any[] = []

    const sendCandidateSafe = (candidate: any) => {
      if (!isRoomSubscribed) {
        pendingOutgoingCandidates.push(candidate)
        return
      }
      roomChannel.send({
        type: 'broadcast',
        event: 'ice_candidate',
        payload: { candidate, fromId: this.myProfile.id },
      })
    }

    // Forward ICE candidates with guaranteed queueing
    pc.onicecandidate = event => {
      if (event.candidate) {
        sendCandidateSafe(event.candidate.toJSON())
      }
    }

    const drainCandidateQueue = async () => {
      while (this.candidateQueue.length > 0) {
        const candidate = this.candidateQueue.shift()
        if (candidate && candidate.candidate) {
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
          // Wait 250ms for initial host & STUN candidates to be baked into localDescription
          await new Promise(r => setTimeout(r, 250))
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
          // Wait 200ms for initial host & STUN candidates to be gathered
          await new Promise(r => setTimeout(r, 200))

          roomChannel.send({
            type: 'broadcast',
            event: 'sdp_answer',
            payload: {
              answer: {
                type: (pc.localDescription || answer).type,
                sdp: (pc.localDescription || answer).sdp,
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
        if (!payload.candidate || !payload.candidate.candidate) return
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
          isRoomSubscribed = true
          // Drain any candidates that were generated before room subscription completed
          while (pendingOutgoingCandidates.length > 0) {
            const cand = pendingOutgoingCandidates.shift()
            if (cand) {
              sendCandidateSafe(cand)
            }
          }

          if (isInitiator) {
            setTimeout(() => sendOffer(), 300)
            let retries = 0
            this.offerRetryInterval = setInterval(() => {
              retries++
              if (retries > 12 || this.isRemoteDescriptionSet) {
                if (this.offerRetryInterval) {
                  clearInterval(this.offerRetryInterval)
                  this.offerRetryInterval = null
                }
                return
              }
              sendOffer()
            }, 1200)
          } else {
            // Receiver notifies readiness immediately and retries ping every 1.5s
            roomChannel.send({
              type: 'broadcast',
              event: 'ready_for_offer',
              payload: { fromId: this.myProfile.id },
            })
            let pingCount = 0
            this.roomPingInterval = setInterval(() => {
              pingCount++
              if (pingCount > 10 || this.isRemoteDescriptionSet) {
                if (this.roomPingInterval) {
                  clearInterval(this.roomPingInterval)
                  this.roomPingInterval = null
                }
                return
              }
              roomChannel.send({
                type: 'broadcast',
                event: 'ready_for_offer',
                payload: { fromId: this.myProfile.id },
              })
            }, 1500)
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
    this.matchmakingState = 'idle'
    this.matchedRoomId = null
    this.currentPeer = null
    this.activeInviteId = null
    this.stopSearchingTimers()

    if (this.disconnectGraceTimer) {
      clearTimeout(this.disconnectGraceTimer)
      this.disconnectGraceTimer = null
    }

    if (this.offerRetryInterval) {
      clearInterval(this.offerRetryInterval)
      this.offerRetryInterval = null
    }

    if (this.roomPingInterval) {
      clearInterval(this.roomPingInterval)
      this.roomPingInterval = null
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
