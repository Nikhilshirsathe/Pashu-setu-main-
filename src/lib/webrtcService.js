import { supabase } from './supabase'

// WebRTC Service for Video Consultations
export class WebRTCService {
  constructor() {
    this.localStream = null
    this.remoteStream = null
    this.peerConnection = null
    this.supabaseChannel = null
    this.roomId = null
    this.userRole = null
    this.isInitiator = false
    this.onRemoteStream = null
    this.onConnectionStateChange = null
    this.isNegotiating = false
    this.hasJoined = false
    
    this.pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
  }

  // Reset camera permissions
  async resetCameraPermissions() {
    try {
      // Stop any existing streams
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop())
        this.localStream = null
      }
      console.log('Camera permissions reset')
    } catch (error) {
      console.log('Error resetting camera:', error)
    }
  }

  // Initialize Supabase real-time connection
  async initializeWebSocket(roomId, userRole, userEmail) {
    // Clean up existing connection
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe()
    }
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    
    // Reset camera before starting (no await for speed)
    this.resetCameraPermissions()
    
    this.roomId = roomId
    this.userRole = userRole
    this.isInitiator = userRole === 'farmer'
    
    // Create Supabase real-time channel for signaling
    this.supabaseChannel = supabase.channel(`webrtc_${roomId}`)
      .on('broadcast', { event: 'webrtc_signal' }, (payload) => {
        console.log('Received WebRTC signal:', payload)
        this.handleSignalingMessage(payload.payload)
      })
      .subscribe()
    
    console.log(`Connected to room: ${roomId} as ${userRole}`)
    return Promise.resolve()
  }

  // Handle signaling messages from Supabase
  handleSignalingMessage(message) {
    // Ignore messages from self
    if (message.sender === this.userRole) {
      return
    }
    
    console.log('Processing signal:', message.type, 'from', message.sender)
    
    switch (message.type) {
      case 'join':
        if (this.isInitiator && !this.isNegotiating) {
          this.isNegotiating = true
          // Start offer immediately for faster connection
          this.createOffer()
        }
        break
      case 'offer':
        this.handleOffer(message.offer)
        break
      case 'answer':
        this.handleAnswer(message.answer)
        break
      case 'ice-candidate':
        this.handleIceCandidate(message.candidate)
        break
    }
  }
  
  // Send signaling message via Supabase
  sendSignal(message) {
    if (this.supabaseChannel) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'webrtc_signal',
        payload: message
      })
    }
  }

  // Get user media (camera and microphone) - fast version
  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      // Try standard camera first
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Camera access successful')
      return this.localStream
    } catch (error) {
      console.log('Camera failed, trying lower quality...')
      try {
        // Try lower quality
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true
        })
        console.log('Lower quality camera successful')
        return this.localStream
      } catch (error2) {
        console.log('All camera attempts failed, using demo')
        this.localStream = this.createDemoVideoStream()
        return this.localStream
      }
    }
  }
  


  // Initialize peer connection
  initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.pcConfig)
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('ontrack event received:', event)
      console.log('Remote streams:', event.streams)
      console.log('Remote tracks:', event.streams[0]?.getTracks())
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        console.log('Remote stream assigned:', this.remoteStream.id)
        console.log('Remote stream active:', this.remoteStream.active)
        console.log('Remote video tracks:', this.remoteStream.getVideoTracks().length)
        console.log('Remote audio tracks:', this.remoteStream.getAudioTracks().length)
        
        if (this.onRemoteStream) {
          console.log('Calling onRemoteStream callback')
          this.onRemoteStream(this.remoteStream)
        }
      } else {
        console.log('No remote streams in ontrack event')
      }
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
          sender: this.userRole
        })
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState)
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState)
      }
    }
    
    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState)
    }
    
    // Handle signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      console.log('Signaling state:', this.peerConnection.signalingState)
    }
  }

  // Create and send offer
  async createOffer() {
    if (!this.peerConnection) {
      this.initializePeerConnection()
    }

    try {
      if (this.peerConnection.signalingState !== 'stable') {
        console.log('Cannot create offer - signaling state:', this.peerConnection.signalingState)
        return
      }
      
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      
      this.sendSignal({
        type: 'offer',
        offer: offer,
        sender: this.userRole
      })
    } catch (error) {
      console.error('Error creating offer:', error)
      this.isNegotiating = false
    }
  }

  // Handle incoming offer
  async handleOffer(offer) {
    console.log('Handling offer from:', offer)
    if (!this.peerConnection) {
      this.initializePeerConnection()
    }

    try {
      if (this.peerConnection.signalingState === 'stable') {
        console.log('Setting remote description (offer)')
        await this.peerConnection.setRemoteDescription(offer)
        console.log('Creating answer')
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        
        console.log('Sending answer')
        this.sendSignal({
          type: 'answer',
          answer: answer,
          sender: this.userRole
        })
      } else {
        console.log('Ignoring offer - wrong signaling state:', this.peerConnection.signalingState)
      }
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  // Handle incoming answer
  async handleAnswer(answer) {
    console.log('Handling answer:', answer)
    try {
      if (this.peerConnection.signalingState === 'have-local-offer') {
        console.log('Setting remote description (answer)')
        await this.peerConnection.setRemoteDescription(answer)
        this.isNegotiating = false
        console.log('Answer processed successfully')
      } else {
        console.log('Ignoring answer - wrong signaling state:', this.peerConnection.signalingState)
      }
    } catch (error) {
      console.error('Error handling answer:', error)
      this.isNegotiating = false
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
    }
  }

  // Join room
  joinRoom() {
    if (!this.hasJoined) {
      this.hasJoined = true
      this.sendSignal({
        type: 'join',
        sender: this.userRole
      })
    }
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }

  // End call
  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }
    
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe()
    }
    
    // Don't stop shared camera stream, just remove reference
    if (this.localStream && this.localStream !== window.sharedCameraStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }
    
    // Reset all properties
    this.localStream = null
    this.remoteStream = null
    this.peerConnection = null
    this.supabaseChannel = null
    this.roomId = null
    this.userRole = null
    this.isInitiator = false
    this.isNegotiating = false
    this.hasJoined = false
  }

  // Create demo video stream with canvas
  createDemoVideoStream() {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    
    // Create animated demo content
    let frame = 0
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw animated circle
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(
        canvas.width / 2 + Math.sin(frame * 0.05) * 100,
        canvas.height / 2 + Math.cos(frame * 0.03) * 50,
        30,
        0,
        2 * Math.PI
      )
      ctx.fill()
      
      // Draw role text
      ctx.fillStyle = '#ffffff'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(
        `${this.userRole?.toUpperCase() || 'USER'} - DEMO MODE`,
        canvas.width / 2,
        canvas.height / 2 + 100
      )
      
      // Draw timestamp
      ctx.font = '16px Arial'
      ctx.fillText(
        new Date().toLocaleTimeString(),
        canvas.width / 2,
        canvas.height / 2 + 130
      )
      
      frame++
      requestAnimationFrame(animate)
    }
    animate()
    
    // Get video stream from canvas
    const videoStream = canvas.captureStream(30)
    
    // Create audio context for demo audio
    try {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.01, audioContext.currentTime) // Very low volume
      
      oscillator.connect(gainNode)
      const destination = audioContext.createMediaStreamDestination()
      gainNode.connect(destination)
      
      oscillator.start()
      
      // Combine video and audio
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ])
      
      return combinedStream
    } catch (error) {
      console.log('Audio context failed, using video only')
      return videoStream
    }
  }

  // Get connection statistics
  async getStats() {
    if (this.peerConnection) {
      return await this.peerConnection.getStats()
    }
    return null
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService()