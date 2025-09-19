import { Sprout, Stethoscope, Heart, Microscope, Truck, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [selectedRole, setSelectedRole] = useState('farmer')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: 'nikhilshirsathe@gmail.com', password: '' })
  const [isHindi, setIsHindi] = useState(true)

  const roles = [
    {
      id: 'farmer',
      icon: Sprout,
      title: isHindi ? 'किसान' : 'Farmer',
      englishTitle: 'Farmer'
    },
    {
      id: 'veterinarian',
      icon: Stethoscope,
      title: isHindi ? 'पशु चिकित्सक' : 'Veterinarian',
      englishTitle: 'Veterinarian'
    },
    {
      id: 'volunteer',
      icon: Heart,
      title: isHindi ? 'स्वयंसेवक' : 'Volunteer',
      englishTitle: 'Volunteer'
    },
    {
      id: 'lab',
      icon: Microscope,
      title: isHindi ? 'लैब तकनीशियन' : 'Lab Technician',
      englishTitle: 'Lab Technician'
    },
    {
      id: 'dispatcher',
      icon: Truck,
      title: isHindi ? 'डिस्पेचर' : 'Dispatcher',
      englishTitle: 'Dispatcher'
    }
  ]



  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      
      if (error) {
        alert(isHindi ? 'लॉगिन असफल: ' + error.message : 'Login failed: ' + error.message)
        return
      }
      
      localStorage.setItem('userRole', selectedRole)
      window.location.href = '/dashboard'
    } catch (error) {
      alert(isHindi ? 'लॉगिन त्रुटि: ' + error.message : 'Login error: ' + error.message)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
          {/* Header Section */}
          <div className="text-center p-8 pb-6 bg-gradient-to-br from-green-500 to-emerald-600">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
              {isHindi ? 'पशु सेतु में आपका स्वागत है' : 'Welcome to Pashu Setu'}
            </h1>
            <p className="text-green-100 text-lg font-medium">
              {isHindi ? 'पशु स्वास्थ्य पोर्टल' : 'Animal Health Portal'}
            </p>
          </div>

          {/* Role Selection Section */}
          <div className="px-8 py-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {isHindi ? 'अपनी भूमिका चुनें' : 'Select your role'}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center space-x-4 transform hover:scale-105 ${
                      selectedRole === role.id
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-green-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === role.id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-lg">{role.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Login Form Section */}
          <div className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                  placeholder={isHindi ? 'ईमेल पता' : 'Email Address'}
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                  placeholder={isHindi ? 'पासवर्ड' : 'Password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {isHindi ? '🔐 लॉगिन' : '🔐 Login'}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="px-8 pb-8 border-t border-gray-100 pt-6 space-y-4 bg-gray-50">
            <div className="text-center">
              <a href="/signup" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium">
                <span>👤</span>
                <span>{isHindi ? 'नया उपयोगकर्ता? साइन अप करें' : 'New user? Sign up'}</span>
              </a>
            </div>
            <div className="text-center">
              <button
                onClick={() => setIsHindi(!isHindi)}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                <span>🌐</span>
                <span>{isHindi ? 'Switch to English' : 'हिंदी में बदलें'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}