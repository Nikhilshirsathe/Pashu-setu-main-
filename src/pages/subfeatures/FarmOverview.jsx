import { User, Heart, Droplets, Thermometer } from 'lucide-react'

export default function FarmOverview() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
        Farm Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 hover-lift">
          <User className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-2xl font-bold text-neutral-800">156</h3>
          <p className="text-neutral-600">Total Cattle</p>
        </div>
        <div className="card p-6 hover-lift">
          <Heart className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="text-2xl font-bold text-neutral-800">142</h3>
          <p className="text-neutral-600">Healthy Animals</p>
        </div>
        <div className="card p-6 hover-lift">
          <Droplets className="w-8 h-8 text-cyan-600 mb-3" />
          <h3 className="text-2xl font-bold text-neutral-800">850L</h3>
          <p className="text-neutral-600">Daily Milk Production</p>
        </div>
        <div className="card p-6 hover-lift">
          <Thermometer className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="text-2xl font-bold text-neutral-800">28°C</h3>
          <p className="text-neutral-600">Farm Temperature</p>
        </div>
      </div>
    </div>
  )
}