import React, { useState, useEffect } from 'react'
import { Mic, Phone, PhoneCall, Bot, AlertCircle, X, Ear } from 'lucide-react'
import { vapiService } from '../lib/vapiService'
import { wakeWordService } from '../lib/wakeWordService'

export default function VoiceAssistant() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isWakeWordListening, setIsWakeWordListening] = useState(false)
  const [lastCallEnd, setLastCallEnd] = useState(0)

  useEffect(() => {
    const checkCallStatus = () => {
      const currentStatus = vapiService.getCallStatus()
      if (isCallActive && !currentStatus) {
        // Call ended, record timestamp
        setLastCallEnd(Date.now())
      }
      setIsCallActive(currentStatus)
    }
    
    const interval = setInterval(checkCallStatus, 1000)
    
    // Initialize wake word detection
    const initializeWakeWord = async () => {
      const accessKey = import.meta.env.VITE_PICOVOICE_ACCESS_KEY
      if (accessKey) {
        const success = await wakeWordService.initialize(accessKey, handleWakeWordDetected)
        if (success) {
          await wakeWordService.startListening()
          setIsWakeWordListening(true)
        }
      } else {
        console.log('Picovoice access key not found - wake word disabled')
      }
    }
    
    initializeWakeWord()
    
    return () => {
      clearInterval(interval)
      wakeWordService.release()
    }
  }, [])
  
  const handleWakeWordDetected = () => {
    console.log('Wake word detected - activating VARHA')
    setIsExpanded(true)
    handleStartCall()
  }

  const handleStartCall = async () => {
    // Prevent rapid reconnections
    const now = Date.now()
    if (now - lastCallEnd < 3000) {
      setError('Please wait a moment before reconnecting')
      return
    }
    
    setIsLoading(true)
    setError(null)
    try {
      const success = await vapiService.startCall()
      if (success) {
        setIsCallActive(true)
      } else {
        setError('Failed to connect to VARHA')
      }
    } catch (err) {
      setError('VARHA is currently unavailable')
      console.error('VAPI call error:', err)
    }
    setIsLoading(false)
  }

  const handleEndCall = async () => {
    setIsLoading(true)
    try {
      await vapiService.endCall()
      setIsCallActive(false)
      setLastCallEnd(Date.now())
    } catch (err) {
      console.error('Error ending call:', err)
    }
    setIsLoading(false)
  }

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      {/* Floating Button */}
      {!isExpanded ? (
        <div className="relative">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <Bot className="w-6 h-6 text-white mb-0.5" />
            <span className="text-xs text-white font-bold">VARHA</span>
          </button>
          
          {/* Status Indicators */}
          {isCallActive && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-pulse border-2 border-white flex items-center justify-center">
              <Mic className="w-3 h-3 text-white" />
            </div>
          )}
          {isWakeWordListening && !isCallActive && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse border-2 border-white flex items-center justify-center">
              <Ear className="w-2 h-2 text-white" />
            </div>
          )}
          
          {/* Side Label */}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            <div className="text-sm font-semibold text-gray-900">VARHA Voice Assistant</div>
            <div className="text-xs text-gray-600">
              {isWakeWordListening ? 'Say "Hey Google" or click to start' : 'Click to start talking'}
            </div>
            {isWakeWordListening && (
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                <Ear className="w-3 h-3" />
                <span>Listening for wake word</span>
              </div>
            )}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
      ) : (
        /* Expanded Interface */
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">VARHA</h3>
                <div className="text-sm text-green-700 font-medium">Pashu Setu Voice Assistant</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span>{isCallActive ? 'Active Call' : 'Ready to Help'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Welcome Message */}
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-800 font-semibold mb-1">
                    Hi! I'm VARHA, your Pashu Setu assistant.
                  </p>
                  <p className="text-xs text-green-700 leading-relaxed">
                    I can help you call veterinarians, get disease advice for your animals, check health records, and navigate the platform. 
                    {isWakeWordListening ? 'Say "Hey Google" to activate me hands-free, or' : ''} Just speak naturally!
                  </p>
                  {isWakeWordListening && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <Ear className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Wake word detection active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call Button */}
            {!isCallActive ? (
              <button
                onClick={handleStartCall}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {isLoading ? 'Connecting...' : 'Start Voice Chat'}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Active Status */}
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <Mic className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-green-800 font-medium text-sm">Listening...</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}} />
                    <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
                
                {/* End Call */}
                <button
                  onClick={handleEndCall}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span className="font-medium">End Call</span>
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Error</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 border-t border-gray-100 mt-4 pt-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Bot className="w-3 h-3" />
                <span>Powered by Pashu Setu AI Technology</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}