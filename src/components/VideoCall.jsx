import { useState, useEffect, useRef } from 'react'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users } from 'lucide-react'
import { webrtcService } from '../lib/webrtcService'

export default function VideoCall({ roomId, onEndCall, userRole, userEmail }) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [connectionState, setConnectionState] = useState('new')
  const [isConnecting, setIsConnecting] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const callStartTime = useRef(null)

  useEffect(() => {
    initializeCall()
    return () => {
      webrtcService.endCall()
    }
  }, [])

  useEffect(() => {
    // Update call duration every second
    const interval = setInterval(() => {
      if (callStartTime.current) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const initializeCall = async () => {
    try {
      // Set up event handlers first
      webrtcService.onRemoteStream = (remoteStream) => {
        console.log('🎥 Remote stream received:', remoteStream.id)
        console.log('🎥 Remote stream tracks:', remoteStream.getTracks().map(t => t.kind))
        
        if (remoteVideoRef.current) {
          console.log('🎥 Setting remote video srcObject')
          remoteVideoRef.current.srcObject = remoteStream
          
          // Force play and handle any errors
          remoteVideoRef.current.play().then(() => {
            console.log('✅ Remote video playing successfully')
          }).catch(error => {
            console.log('❌ Remote video play error:', error)
            // Try to play again after a short delay
            setTimeout(() => {
              remoteVideoRef.current.play().catch(console.log)
            }, 1000)
          })
        } else {
          console.log('❌ Remote video ref not available')
        }
        
        setIsConnecting(false)
        callStartTime.current = Date.now()
      }

      webrtcService.onConnectionStateChange = (state) => {
        console.log('🔗 Connection state:', state)
        setConnectionState(state)
        if (state === 'connected') {
          setIsConnecting(false)
        }
      }

      // Initialize connection and media in parallel for speed
      const [, localStream] = await Promise.all([
        webrtcService.initializeWebSocket(roomId, userRole, userEmail),
        webrtcService.getUserMedia()
      ])
      
      // Set local video immediately
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream
      }

      // Join room immediately
      webrtcService.joinRoom()
      console.log('🚀 Call initialized for', userRole)
      
    } catch (error) {
      console.error('❌ Call initialization failed:', error)
      setIsConnecting(false)
    }
  }

  const toggleVideo = () => {
    const enabled = webrtcService.toggleVideo()
    setIsVideoEnabled(enabled)
  }

  const toggleAudio = () => {
    const enabled = webrtcService.toggleAudio()
    setIsAudioEnabled(enabled)
  }

  const handleEndCall = () => {
    webrtcService.endCall()
    onEndCall()
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">
              {userRole === 'farmer' ? 'Consultation with Veterinarian' : 'Consultation with Farmer'}
            </span>
          </div>
          {!isConnecting && (
            <div className="text-sm text-gray-300">
              Duration: {formatDuration(callDuration)}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded text-xs ${
            connectionState === 'connected' ? 'bg-green-600' : 
            connectionState === 'connecting' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {isConnecting ? 'Connecting...' : connectionState}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {/* Remote Video (Main) - 16:9 aspect ratio */}
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            controls={false}
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#000' }}
            onError={(e) => console.log('❌ Remote video error:', e)}
            onLoadStart={() => console.log('📺 Remote video load start')}
            onLoadedData={() => console.log('📺 Remote video loaded data')}
            onLoadedMetadata={() => console.log('📺 Remote video metadata loaded')}
            onCanPlay={() => console.log('📺 Remote video can play')}
            onPlay={() => console.log('✅ Remote video playing')}
            onPause={() => console.log('⏸️ Remote video paused')}
          />
          
          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ backgroundColor: '#000' }}
              onLoadedData={() => console.log('📺 Local video loaded')}
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <VideoOff className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Connection Status Overlay */}
        {isConnecting && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Connecting to consultation...</p>
              <p className="text-sm text-gray-300 mt-2">
                {userRole === 'farmer' ? 'Waiting for veterinarian to join' : 'Joining farmer consultation'}
              </p>
            </div>
          </div>
        )}

        {/* No Remote Video Placeholder */}
        {!isConnecting && !remoteVideoRef.current?.srcObject && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Waiting for other participant...</p>
              <p className="text-sm text-gray-400 mt-2">Connection: {connectionState}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Settings */}
          <button className="p-4 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Call Info */}
        <div className="mt-4 text-center text-gray-300 text-sm">
          <p>Room ID: {roomId}</p>
          <p className="mt-1">
            {userRole === 'farmer' 
              ? 'You are consulting with a veterinarian' 
              : 'You are providing consultation to a farmer'
            }
          </p>
        </div>
      </div>
    </div>
  )
}