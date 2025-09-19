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
    <div className="h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* 📦 Outer Box (Main Screen) */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          
          {/* ⬜ Top Section (Header Box) */}
          <div className="text-center p-6 bg-white border-b border-gray-100">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {isHindi ? 'पशु सेतु में आपका स्वागत है' : 'Welcome to Pashu Setu'}
            </h1>
            <p className="text-gray-600">
              {isHindi ? 'पशु स्वास्थ्य पोर्टल' : 'Animal Health Portal'}
            </p>
          </div>

          {/* 🟩 Middle Section (Role Selection Box) */}
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
              {isHindi ? 'अपनी भूमिका चुनें' : 'Select your role'}
            </h2>
            <div className="space-y-2">
              {roles.map((role, index) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                      selectedRole === role.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <span className="text-lg font-bold">{index + 1}️⃣</span>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{role.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 📧 Login Box (Form Section) */}
          <div className="p-6 bg-white">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">📧</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Email"
                  required
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Password"
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
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
              >
                {isHindi ? 'लॉगिन' : 'Login'}
              </button>
            </form>
          </div>

          {/* 📦 Bottom Section (Footer Box) */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
            <div className="text-center">
              <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                {isHindi ? 'नया उपयोगकर्ता? साइन अप करें' : 'New user? Sign up'}
              </a>
            </div>
            <div className="text-center">
              <button
                onClick={() => setIsHindi(!isHindi)}
                className="text-gray-600 hover:text-gray-800 font-medium"
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