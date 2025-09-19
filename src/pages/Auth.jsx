import { Sprout, Stethoscope, Heart, Microscope, ArrowRight, Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSignUp, setIsSignUp] = useState(false)

  const roles = [
    {
      id: 'farmer',
      icon: Sprout,
      title: 'Farmer',
      description: 'Manage your farm, animals, and access veterinary services',
      gradient: 'from-emerald-500 to-green-600',
      features: ['Animal Records', 'Health Monitoring', 'Vet Consultations', 'Emergency Services']
    },
    {
      id: 'veterinarian',
      icon: Stethoscope,
      title: 'Veterinarian',
      description: 'Provide consultations, manage prescriptions and patient care',
      gradient: 'from-blue-500 to-indigo-600',
      features: ['Patient Management', 'Video Consultations', 'Prescriptions', 'Medical Records']
    },
    {
      id: 'volunteer',
      icon: Heart,
      title: 'Volunteer',
      description: 'Support sample collection and community outreach programs',
      gradient: 'from-purple-500 to-pink-600',
      features: ['Sample Collection', 'Community Support', 'Emergency Response', 'Education']
    },
    {
      id: 'lab',
      icon: Microscope,
      title: 'Lab Technician',
      description: 'Process samples, generate reports and manage laboratory operations',
      gradient: 'from-orange-500 to-red-600',
      features: ['Sample Processing', 'Report Generation', 'Quality Control', 'Lab Management']
    }
  ]

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      
      if (error) {
        alert('Login failed: ' + error.message)
        return
      }
      
      localStorage.setItem('userRole', selectedRole.id)
      window.location.href = '/dashboard'
    } catch (error) {
      alert('Login error: ' + error.message)
    }
  }

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
      
      // Insert user into users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          email: formData.email,
          password: formData.password, // In production, this should be hashed
          role: selectedRole.id === 'veterinarian' ? 'doctor' : selectedRole.id === 'lab' ? 'lab_employee' : selectedRole.id
        })
      
      if (dbError) {
        alert('Database error: ' + dbError.message)
        return
      }
      
      alert('Account created successfully! Please check your email to verify.')
      setIsSignUp(false)
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
              <h2 className="text-2xl font-bold text-white mb-2">{selectedRole.title} Login</h2>
              <p className="text-white/90 text-sm">{selectedRole.description}</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
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
                      placeholder="Enter your password"
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
                  {isSignUp ? `Sign Up as ${selectedRole.title}` : `Sign In as ${selectedRole.title}`}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">Welcome to Pashu Setu</h1>
          <p className="text-xl text-neutral-600 mb-2">Choose your role to access the platform</p>
          <p className="text-neutral-500">Secure, role-based access for comprehensive animal healthcare management</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className="card hover-lift cursor-pointer group overflow-hidden animate-slide-in"
                style={{animationDelay: `${role.id === 'farmer' ? '0.1s' : role.id === 'veterinarian' ? '0.2s' : role.id === 'volunteer' ? '0.3s' : '0.4s'}`}}
              >
                <div className={`bg-gradient-to-br ${role.gradient} p-6 text-center`}>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-neutral-600 mb-4 text-sm leading-relaxed">{role.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-neutral-500">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <button className="btn btn-primary w-full flex items-center justify-center space-x-2">
                    <span>Login as {role.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-12 text-center">
          <div className="card p-6 inline-block hover-glow">
            <p className="text-neutral-600 text-sm mb-2">Need help? Contact support</p>
            <p className="text-blue-600 font-semibold">support@pashusetu.com | +91-XXXX-XXXX</p>
          </div>
        </div>
      </div>
    </div>
  )
}