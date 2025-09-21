import { MessageCircle, Video, Search, Baby, Clock, Users, Calendar, Phone, Bell, CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Consultation() {
  const [userRole, setUserRole] = useState('farmer')
  const [consultationRequests, setConsultationRequests] = useState([])
  const [animals, setAnimals] = useState([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState('')
  const [requestMessage, setRequestMessage] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'farmer'
    setUserRole(role)
    fetchConsultationRequests(role)
    if (role === 'farmer') {
      fetchAnimals()
    }
  }, [])

  const fetchAnimals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', user?.id)
      if (error) throw error
      setAnimals(data || [])
    } catch (error) {
      console.error('Error fetching animals:', error)
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

  const createConsultationRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('consultation_requests')
        .insert({
          farmer_id: user?.id,
          animal_id: selectedAnimal || null,
          request_type: 'video_call',
          message: requestMessage,
          status: 'pending'
        })
      
      if (error) throw error
      alert('Video call request sent successfully!')
      setShowRequestForm(false)
      setSelectedAnimal('')
      setRequestMessage('')
      fetchConsultationRequests(userRole)
    } catch (error) {
      alert('Error sending request: ' + error.message)
    }
  }

  const acceptConsultationRequest = async (requestId) => {
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
      alert('Consultation request accepted!')
      fetchConsultationRequests(userRole)
    } catch (error) {
      alert('Error accepting request: ' + error.message)
    }
  }

  if (userRole === 'veterinarian') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Veterinarian Console
          </h1>
          <p className="text-neutral-600 text-lg">Manage patient consultations and requests</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 text-center hover-lift">
            <Bell className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-2xl text-neutral-800">{consultationRequests.filter(r => r.status === 'pending').length}</h3>
            <p className="text-sm text-neutral-600">Pending Requests</p>
          </div>
          <div className="card p-6 text-center hover-lift">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-2xl text-neutral-800">{consultationRequests.filter(r => r.status === 'accepted').length}</h3>
            <p className="text-sm text-neutral-600">Active Consultations</p>
          </div>
          <div className="card p-6 text-center hover-lift">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-2xl text-neutral-800">{consultationRequests.length}</h3>
            <p className="text-sm text-neutral-600">Total Requests</p>
          </div>
        </div>
        
        <div className="card p-8">
          <h3 className="text-2xl font-bold text-neutral-800 mb-6">Consultation Requests</h3>
          <div className="space-y-4">
            {consultationRequests.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No consultation requests yet</p>
            ) : (
              consultationRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
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
                      <p className="font-semibold text-neutral-800">
                        Farmer Request - {request.request_type}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.message && (
                        <p className="text-sm text-neutral-500 mt-1">{request.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`badge ${
                      request.status === 'pending' ? 'badge-warning' :
                      request.status === 'accepted' ? 'badge-success' :
                      'badge-secondary'
                    }`}>
                      {request.status}
                    </div>
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => acceptConsultationRequest(request.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }
  const services = [
    {
      icon: MessageCircle,
      title: 'One-to-One Chat',
      description: 'Direct messaging with veterinarians, share images and videos',
      action: 'Start Chat',
      color: 'emerald',
      stats: '2min avg response'
    },
    {
      icon: Video,
      title: 'Video Consultation',
      description: 'Live video calls with veterinary experts',
      action: 'Schedule Call',
      color: 'blue',
      stats: '24/7 available'
    },
    {
      icon: Search,
      title: 'Disease Analyzer',
      description: 'AI-powered symptom analysis and disease suggestions',
      action: 'Analyze Symptoms',
      color: 'purple',
      stats: '95% accuracy'
    },
    {
      icon: Baby,
      title: 'Maternity Care',
      description: 'Track pregnancy, diet, medication, and test reminders',
      action: 'Manage Maternity',
      color: 'pink',
      stats: 'Expert care'
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Health & Consultation Services
        </h1>
        <p className="text-neutral-600 text-lg">Connect with veterinarians for expert animal healthcare</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center hover-lift">
          <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-bold text-2xl text-neutral-800">24/7</h3>
          <p className="text-sm text-neutral-600">Available</p>
        </div>
        <div className="card p-6 text-center hover-lift">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-2xl text-neutral-800">150+</h3>
          <p className="text-sm text-neutral-600">Veterinarians</p>
        </div>
        <div className="card p-6 text-center hover-lift">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-bold text-2xl text-neutral-800">1000+</h3>
          <p className="text-sm text-neutral-600">Consultations</p>
        </div>
        <div className="card p-6 text-center hover-lift">
          <Phone className="w-8 h-8 text-pink-600 mx-auto mb-3" />
          <h3 className="font-bold text-2xl text-neutral-800">2min</h3>
          <p className="text-sm text-neutral-600">Avg Response</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <div key={index} className="card p-8 hover-lift hover-glow group">
              <div className="flex items-start justify-between mb-6">
                <div className={`bg-gradient-to-br from-${service.color}-100 to-${service.color}-200 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 text-${service.color}-600`} />
                </div>
                <div className={`badge ${
                  service.color === 'emerald' ? 'badge-success' :
                  service.color === 'blue' ? 'badge-primary' :
                  service.color === 'purple' ? 'badge-primary' : 'badge-danger'
                }`}>
                  {service.stats}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-neutral-800 mb-3">{service.title}</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">{service.description}</p>
              
              <button 
                onClick={() => service.title === 'Video Consultation' ? setShowRequestForm(true) : null}
                className={`btn w-full ${
                  service.color === 'emerald' ? 'btn-success' :
                  service.color === 'blue' ? 'btn-primary' :
                  service.color === 'purple' ? 'btn-primary' : 'btn-danger'
                }`}
              >
                {service.action}
              </button>
            </div>
          )
        })}
      </div>
      
      {/* Video Call Request Form */}
      {showRequestForm && (
        <div className="card p-8">
          <h3 className="text-2xl font-bold text-neutral-800 mb-6">Request Video Consultation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Animal (Optional)</label>
              <select
                value={selectedAnimal}
                onChange={(e) => setSelectedAnimal(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Describe the issue or reason for consultation..."
              />
            </div>
            <div className="flex space-x-4">
              <button onClick={createConsultationRequest} className="btn btn-primary">
                Send Request
              </button>
              <button onClick={() => setShowRequestForm(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="card p-8">
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">My Consultation Requests</h3>
        <div className="space-y-4">
          {consultationRequests.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No consultation requests yet</p>
          ) : (
            consultationRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    request.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">
                      Video Consultation Request
                    </p>
                    <p className="text-sm text-neutral-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.message && (
                      <p className="text-sm text-neutral-500 mt-1">{request.message}</p>
                    )}
                  </div>
                </div>
                <div className={`badge ${
                  request.status === 'pending' ? 'badge-warning' :
                  request.status === 'accepted' ? 'badge-success' :
                  'badge-secondary'
                }`}>
                  {request.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}