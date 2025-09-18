import { useState } from 'react'
import { Eye, EyeOff, User, Lock, Shield, Sprout, Stethoscope, Heart, Microscope } from 'lucide-react'

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '', role: '' })
  const [showPassword, setShowPassword] = useState(false)

  const roles = [
    { id: 'farmer', label: 'Farmer', icon: Sprout, color: 'emerald' },
    { id: 'veterinarian', label: 'Veterinarian', icon: Stethoscope, color: 'blue' },
    { id: 'volunteer', label: 'Volunteer', icon: Heart, color: 'pink' },
    { id: 'lab', label: 'Lab Technician', icon: Microscope, color: 'orange' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.username && formData.password && formData.role) {
      onLogin(formData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pashu Setu</h1>
            <p className="text-white/90">Animal Healthcare Management</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="input pl-10"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input pl-10 pr-12"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">Select Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({...formData, role: role.id})}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.role === role.id
                            ? `border-${role.color}-500 bg-${role.color}-50`
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          formData.role === role.id ? `text-${role.color}-600` : 'text-neutral-500'
                        }`} />
                        <p className={`text-sm font-medium ${
                          formData.role === role.id ? `text-${role.color}-700` : 'text-neutral-600'
                        }`}>
                          {role.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary w-full">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}