import { Sprout, Stethoscope, Heart, Microscope, ArrowRight, Shield, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignUp() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const roles = [
    {
      id: 'farmer',
      icon: Sprout,
      title: 'Farmer',
      description: 'Manage your farm, animals, and access veterinary services',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      id: 'veterinarian',
      icon: Stethoscope,
      title: 'Veterinarian',
      description: 'Provide consultations, manage prescriptions and patient care',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'volunteer',
      icon: Heart,
      title: 'Volunteer',
      description: 'Support sample collection and community outreach programs',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'lab',
      icon: Microscope,
      title: 'Lab Technician',
      description: 'Process samples, generate reports and manage laboratory operations',
      gradient: 'from-orange-500 to-red-600'
    }
  ]

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })
      
      if (error) {
        alert('Signup failed: ' + error.message)
        return
      }
      
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          email: formData.email,
          password: formData.password,
          role: selectedRole.id === 'veterinarian' ? 'doctor' : selectedRole.id === 'lab' ? 'lab_employee' : selectedRole.id
        })
      
      if (dbError) {
        alert('Database error: ' + dbError.message)
        return
      }
      
      alert('Account created successfully! Please check your email to verify.')
      window.location.href = '/'
    } catch (error) {
      alert('Signup error: ' + error.message)
    }
  }

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card shadow-2xl overflow-hidden hover-glow">
            <div className={`bg-gradient-to-r ${selectedRole.gradient} p-8 text-center`}>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <selectedRole.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Sign Up as {selectedRole.title}</h2>
              <p className="text-white/90 text-sm">{selectedRole.description}</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                >
                  Create {selectedRole.title} Account
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                  Already have an account? Sign In
                </a>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="btn btn-outline w-full"
                >
                  ← Back to Role Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">Join Pashu Setu</h1>
          <p className="text-xl text-neutral-600 mb-2">Create your account and choose your role</p>
          <p className="text-neutral-500">Start your journey in comprehensive animal healthcare management</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className="card hover-lift cursor-pointer group overflow-hidden animate-slide-in"
              >
                <div className={`bg-gradient-to-br ${role.gradient} p-6 text-center`}>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-neutral-600 mb-6 text-sm leading-relaxed">{role.description}</p>
                  
                  <button className="btn btn-primary w-full flex items-center justify-center space-x-2">
                    <span>Sign Up as {role.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-12 text-center">
          <div className="card p-6 inline-block hover-glow">
            <p className="text-neutral-600 text-sm mb-2">Already have an account?</p>
            <a href="/" className="text-blue-600 font-semibold hover:text-blue-800">Sign In Here</a>
          </div>
        </div>
      </div>
    </div>
  )
}