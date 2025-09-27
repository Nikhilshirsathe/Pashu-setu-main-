import { MessageCircle, Video, Search, Baby, Clock, Users, Calendar, Phone, Bell, CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import DiseaseAnalyzer from '../components/DiseaseAnalyzer'
import ChatBot from '../components/ChatBot'
import VoiceAssistant from '../components/VoiceAssistant'
import MaternityCare from '../components/MaternityCare'
import { createNotification, createActivity } from '../lib/notificationService'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations/translations'

export default function Consultation({ onStartVideoCall }) {
  const { language } = useLanguage()
  const [userRole, setUserRole] = useState('farmer')
  const [consultationRequests, setConsultationRequests] = useState([])
  const [animals, setAnimals] = useState([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [showDiseaseAnalyzer, setShowDiseaseAnalyzer] = useState(false)
  const [showChatBot, setShowChatBot] = useState(false)
  const [showMaternityCare, setShowMaternityCare] = useState(false)
  const [chatBotSendMessage, setChatBotSendMessage] = useState(null)
  const [newRequestNotification, setNewRequestNotification] = useState(null)

  const handleQuickMessage = useCallback((sendMessageFn) => {
    setChatBotSendMessage(() => sendMessageFn)
  }, [])


  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'farmer'
    setUserRole(role)
    fetchConsultationRequests(role)
    // Only fetch animals for farmers
    if (role === 'farmer') {
      fetchAnimals()
    }
    
    // Listen for VARHA-triggered vet calls
    const handleVarhaCallVet = (event) => {
      if (role === 'farmer') {
        const { roomId, requestId } = event.detail
        // Show VARHA confirmation
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#059669] text-white px-6 py-3 rounded-lg shadow-lg z-50'
        notification.innerHTML = '🤖 VARHA: Connecting you with a veterinarian...'
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
        
        // Create consultation request and start video call
        createConsultationRequest(true)
      }
    }
    
    window.addEventListener('varhaCallVet', handleVarhaCallVet)
    
    // Real-time subscription for veterinarians
    if (role === 'veterinarian') {
      const subscription = supabase
        .channel('consultation_requests')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_requests'
        }, (payload) => {
          console.log('New consultation request:', payload)
          setNewRequestNotification(payload.new)
          fetchConsultationRequests(role)
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setNewRequestNotification(null)
          }, 5000)
        })
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
        window.removeEventListener('varhaCallVet', handleVarhaCallVet)
      }
    }
    
    return () => {
      window.removeEventListener('varhaCallVet', handleVarhaCallVet)
    }
  }, [])

  const fetchAnimals = async () => {
    const role = localStorage.getItem('userRole')
    if (role !== 'farmer') {
      return
    }
    
    try {
      const userEmail = localStorage.getItem('userEmail')
      if (!userEmail) {
        console.log('No user email found, using mock data')
        setAnimals([
          { id: 1, name: 'Cow 1', species: 'Cattle' },
          { id: 2, name: 'Cow 2', species: 'Cattle' }
        ])
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || userEmail
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', userId)
      
      if (error) throw error
      setAnimals(data || [])
    } catch (error) {
      console.error('Error fetching animals:', error)
      // Fallback to mock data
      setAnimals([
        { id: 1, name: 'Cow 1', species: 'Cattle' },
        { id: 2, name: 'Cow 2', species: 'Cattle' }
      ])
    }
  }

  const fetchConsultationRequests = async (role) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let query = supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (role === 'farmer') {
        query = query.eq('farmer_id', user?.id)
      } else if (role === 'veterinarian') {
        query = query.or(`veterinarian_id.eq.${user?.id},veterinarian_id.is.null`)
      }
      
      const { data, error } = await query
      if (error) throw error
      setConsultationRequests(data || [])
    } catch (error) {
      console.error('Error fetching consultation requests:', error)
    }
  }

  const createConsultationRequest = async (isVarhaTriggered = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      
      // Create consultation request
      const { data, error } = await supabase
        .from('consultation_requests')
        .insert({
          farmer_id: user?.id,
          animal_id: selectedAnimal || null,
          request_type: 'video_call',
          message: isVarhaTriggered ? 'VARHA: User requested doctor connection' : (requestMessage || 'Farmer requesting video consultation'),
          status: 'pending'
        })
        .select()
        .single()
      
      if (error) throw error
      
      const actualRequestId = data.id
      const actualRoomId = `consultation_${actualRequestId}`
      
      alert('Call request sent! Veterinarians will be notified instantly.')
      
      // Directly start video call
      if (onStartVideoCall) {
        onStartVideoCall({ roomId: actualRoomId, requestId: actualRequestId })
      }
      
      fetchConsultationRequests(userRole)
    } catch (error) {
      alert('Error sending request: ' + error.message)
    }
  }

  const acceptConsultationRequest = async (requestId) => {
    console.log('acceptConsultationRequest called with:', requestId)
    console.log('onStartVideoCall prop:', onStartVideoCall)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('consultation_requests')
        .update({
          veterinarian_id: user?.id,
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
      
      if (error) throw error
      
      // Start video call
      const roomId = `consultation_${requestId}`
      console.log('Starting video call with roomId:', roomId)
      
      if (onStartVideoCall) {
        onStartVideoCall({ roomId, requestId })
      } else {
        console.error('onStartVideoCall prop is not available')
        alert('Video call function not available')
      }
      
    } catch (error) {
      console.error('Error accepting request:', error)
      alert('Error accepting request: ' + error.message)
    }
  }

  const startVideoCall = (requestId) => {
    console.log('startVideoCall called with:', requestId)
    const roomId = `consultation_${requestId}`
    console.log('Starting video call with roomId:', roomId)
    
    if (onStartVideoCall) {
      onStartVideoCall({ roomId, requestId })
    } else {
      console.error('onStartVideoCall prop is not available')
      alert('Video call function not available')
    }
  }

  if (userRole === 'veterinarian') {
    return (
      <div className="min-h-screen bg-[#f9fafa] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* New Request Notification */}
          {newRequestNotification && (
            <div className="fixed top-4 right-4 z-50 bg-[#059669] text-white p-4 rounded-xl shadow-lg animate-bounce">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <div>
                  <p className="font-bold">New Video Call Request!</p>
                  <p className="text-sm">Farmer requesting consultation</p>
                </div>
                <button 
                  onClick={() => setNewRequestNotification(null)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Veterinarian Console
            </h1>
            <p className="text-gray-600">Manage patient consultations and requests</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <Bell className="w-8 h-8 text-[#059669] mx-auto mb-3" />
              <h3 className="font-bold text-2xl text-gray-900">{consultationRequests.filter(r => r.status === 'pending').length}</h3>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-xs text-[#059669] mt-1">🔴 Live</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <CheckCircle className="w-8 h-8 text-[#059669] mx-auto mb-3" />
              <h3 className="font-bold text-2xl text-gray-900">{consultationRequests.filter(r => r.status === 'accepted').length}</h3>
              <p className="text-sm text-gray-600">Active Consultations</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 text-[#059669] mx-auto mb-3" />
              <h3 className="font-bold text-2xl text-gray-900">{consultationRequests.length}</h3>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
          
          {/* Consultation Requests */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Consultation Requests</h3>
            <div className="space-y-4">
              {consultationRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No consultation requests yet</p>
              ) : (
                consultationRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        request.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {request.status === 'pending' ? <AlertCircle className="w-6 h-6" /> :
                         request.status === 'accepted' ? <CheckCircle className="w-6 h-6" /> :
                         <Video className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Farmer Request - {request.request_type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-500 mt-1">{request.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                      {request.status === 'pending' && (
                        <button 
                          onClick={() => {
                            console.log('Accept button clicked for request:', request.id)
                            acceptConsultationRequest(request.id)
                          }}
                          className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors"
                        >
                          Accept & Start Call
                        </button>
                      )}
                      {request.status === 'accepted' && (
                        <button 
                          onClick={() => {
                            console.log('Join call button clicked for request:', request.id)
                            startVideoCall(request.id)
                          }}
                          className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors"
                        >
                          Join Call
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  const services = [
    {
      icon: MessageCircle,
      title: t('one_to_one_chat', language),
      description: 'Direct messaging with veterinarians, share images and videos',
      action: t('start_chat', language),
      color: 'emerald',
      stats: t('avg_response', language)
    },
    {
      icon: Video,
      title: t('video_consultation', language),
      description: 'Live video calls with veterinary experts',
      action: t('schedule_call', language),
      color: 'blue',
      stats: t('available', language)
    },
    {
      icon: Search,
      title: t('disease_analyzer', language),
      description: 'AI-powered symptom analysis and disease suggestions',
      action: t('analyze_symptoms', language),
      color: 'purple',
      stats: t('accuracy', language)
    },
    {
      icon: Baby,
      title: t('maternity_care', language),
      description: 'Track pregnancy, diet, medication, and test reminders',
      action: t('manage_maternity', language),
      color: 'pink',
      stats: t('expert_care', language)
    }
  ]



  if (showDiseaseAnalyzer) {
    return <DiseaseAnalyzer onBack={() => setShowDiseaseAnalyzer(false)} />
  }

  if (showMaternityCare) {
    return <MaternityCare onBack={() => setShowMaternityCare(false)} />
  }

  if (showChatBot) {
    return (
      <div className="min-h-screen bg-[#f9fafa] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowChatBot(false)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">One-to-One Chat</h1>
              <p className="text-gray-600">Chat with our AI assistant about animal health and farm management</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatBot onQuickMessage={handleQuickMessage} />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Topics</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => chatBotSendMessage && chatBotSendMessage('Tell me about animal vaccination schedules')}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Animal vaccination schedules
                  </button>
                  <button 
                    onClick={() => chatBotSendMessage && chatBotSendMessage('What are common disease symptoms and treatments for farm animals?')}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Disease symptoms and treatment
                  </button>
                  <button 
                    onClick={() => chatBotSendMessage && chatBotSendMessage('How do I manage breeding and maternity care for my animals?')}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Breeding and maternity care
                  </button>
                  <button 
                    onClick={() => chatBotSendMessage && chatBotSendMessage('How can I optimize milk production on my farm?')}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Milk production optimization
                  </button>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafa] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('health_consultation', language)}
          </h1>
          <p className="text-gray-600">{t('consultation_desc', language)}</p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div key={index} className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-[#059669]/10 p-3 rounded-xl">
                    <Icon className="w-8 h-8 text-[#059669]" />
                  </div>
                  <span className="px-3 py-1 bg-[#059669]/10 text-[#059669] rounded-full text-xs font-medium">
                    {service.stats}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <button 
                  onClick={async () => {
                    if (service.title === 'Video Consultation') {
                      await createConsultationRequest()
                    }
                    else if (service.title === 'Disease Analyzer') {
                      setShowDiseaseAnalyzer(true)
                    }
                    else if (service.title === t('one_to_one_chat', language)) {
                      setShowChatBot(true)
                    }
                    else if (service.title === t('maternity_care', language)) {
                      setShowMaternityCare(true)
                    }
                  }}
                  className="w-full px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors"
                >
                  {service.action}
                </button>
              </div>
            )
          })}
        </div>
        
        {/* Video Call Request Form */}
        {showRequestForm && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Video Consultation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Animal (Optional)</label>
                <select
                  value={selectedAnimal}
                  onChange={(e) => setSelectedAnimal(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                >
                  <option value="">General Consultation</option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} - {animal.species}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                  rows="3"
                  placeholder="Describe the issue or reason for consultation..."
                />
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={createConsultationRequest}
                  className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors"
                >
                  Send Request
                </button>
                <button 
                  onClick={() => setShowRequestForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* My Consultation Requests */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Consultation Requests</h3>
          <div className="space-y-4">
            {consultationRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No consultation requests yet</p>
            ) : (
              consultationRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      request.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Video Consultation Request
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-500 mt-1">{request.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                    {request.status === 'accepted' && (
                      <button 
                        onClick={() => startVideoCall(request.id)}
                        className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors"
                      >
                        Join Call
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        

      </div>
    </div>
  )
}