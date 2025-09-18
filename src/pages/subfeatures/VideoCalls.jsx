import { Video, Phone, Users, Clock } from 'lucide-react'

export default function VideoCalls() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Video Consultations
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 hover-lift">
          <Video className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="text-2xl font-bold text-neutral-800">24/7</h3>
          <p className="text-neutral-600">Available Doctors</p>
        </div>
        <div className="card p-6 hover-lift">
          <Users className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-2xl font-bold text-neutral-800">150+</h3>
          <p className="text-neutral-600">Veterinarians</p>
        </div>
        <div className="card p-6 hover-lift">
          <Clock className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="text-2xl font-bold text-neutral-800">2min</h3>
          <p className="text-neutral-600">Avg Wait Time</p>
        </div>
      </div>
      
      <div className="card p-8">
        <h3 className="text-xl font-semibold text-neutral-800 mb-6">Start Video Consultation</h3>
        <div className="text-center">
          <button className="btn btn-success text-lg px-8 py-4">
            <Video className="w-6 h-6 mr-2" />
            Start Video Call
          </button>
        </div>
      </div>
    </div>
  )
}