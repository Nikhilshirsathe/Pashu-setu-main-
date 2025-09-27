import { useState, useEffect } from 'react'
import { Video, Phone, X, User } from 'lucide-react'

export default function CallNotification({ notification, onAccept, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(30) // 30 second timeout

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDecline() // Auto-decline after timeout
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onDecline])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-bounce-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Incoming Video Call</h3>
          <p className="text-gray-600 mt-1">Farmer requesting consultation</p>
        </div>

        {/* Caller Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{notification.farmerName || 'Farmer'}</p>
              <p className="text-sm text-gray-600">{notification.farmerEmail}</p>
            </div>
          </div>
          {notification.message && (
            <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">{notification.message}</p>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Auto-decline in {timeLeft}s</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Decline</span>
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span>Accept</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Call ID: {notification.roomId}
          </p>
        </div>
      </div>
    </div>
  )
}