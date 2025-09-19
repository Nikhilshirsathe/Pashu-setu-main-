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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="text-center p-8 pb-6">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isHindi ? 'पशु सेतु में आपका स्वागत है' : 'Welcome to Pashu Setu'}
            </h1>
            <p className="text-gray-600">
              {isHindi ? 'पशु स्वास्थ्य पोर्टल' : 'Animal Health Portal'}
            </p>
          </div>

          {/* Role Selection Section */}
          <div className="px-8 pb-6">
            <p className="text-gray-700 font-medium mb-4">
              {isHindi ? 'अपनी भूमिका चुनें' : 'Select your role'}
            </p>
            <div className="space-y-2">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                      selectedRole === role.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{role.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Login Form Section */}
          <div className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={isHindi ? 'ईमेल' : 'Email'}
                  required
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                  placeholder={isHindi ? 'पासवर्ड' : 'Password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
              >
                {isHindi ? 'लॉगिन' : 'Login'}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="px-8 pb-8 border-t border-gray-100 pt-6 space-y-3">
            <div className="text-center">
              <a href="/signup" className="text-blue-600 hover:text-blue-800 text-sm">
                {isHindi ? 'नया उपयोगकर्ता? साइन अप करें' : 'New user? Sign up'}
              </a>
            </div>
            <div className="text-center">
              <button
                onClick={() => setIsHindi(!isHindi)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                {isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}