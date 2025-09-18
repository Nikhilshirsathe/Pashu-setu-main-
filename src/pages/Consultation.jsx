import { MessageCircle, Video, Search, Baby, Clock, Users, Calendar, Phone } from 'lucide-react'

export default function Consultation() {
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
              
              <button className={`btn w-full ${
                service.color === 'emerald' ? 'btn-success' :
                service.color === 'blue' ? 'btn-primary' :
                service.color === 'purple' ? 'btn-primary' : 'btn-danger'
              }`}>
                {service.action}
              </button>
            </div>
          )
        })}
      </div>
      
      <div className="card p-8">
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">Recent Consultations</h3>
        <div className="space-y-4">
          {[
            { doctor: 'Dr. Sharma', time: '2 hours ago', type: 'Video Call', status: 'Completed' },
            { doctor: 'Dr. Patel', time: '1 day ago', type: 'Chat', status: 'Completed' },
            { doctor: 'AI Analyzer', time: '3 days ago', type: 'Diagnosis', status: 'Report Ready' }
          ].map((consultation, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{consultation.doctor.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">{consultation.doctor}</p>
                  <p className="text-sm text-neutral-600">{consultation.type} • {consultation.time}</p>
                </div>
              </div>
              <div className="badge badge-success">{consultation.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}