import { Sprout, Stethoscope, Heart, Microscope, Truck, Eye, EyeOff, Mail, Lock, User, ArrowRight, Globe } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [selectedRole, setSelectedRole] = useState('farmer')
  const [showPassword, setShowPassword] = useState(false)
  const [isHindi, setIsHindi] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '',
    email: '', 
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const roles = [
    { id: 'farmer', icon: Sprout, title: isHindi ? 'किसान' : 'Farmer' },
    { id: 'veterinarian', icon: Stethoscope, title: isHindi ? 'पशु चिकित्सक' : 'Veterinarian' },
    { id: 'volunteer', icon: Heart, title: isHindi ? 'स्वयंसेवक' : 'Volunteer' },
    { id: 'lab', icon: Microscope, title: isHindi ? 'लैब तकनीशियन' : 'Lab Tech' },
    { id: 'dispatcher', icon: Truck, title: isHindi ? 'डिस्पेचर' : 'Dispatcher' }
  ]

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert(isHindi ? 'पासवर्ड मैच नहीं कर रहे' : 'Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: selectedRole
          }
        }
      })
      
      if (error) {
        alert(isHindi ? 'साइनअप असफल: ' + error.message : 'Signup failed: ' + error.message)
        return
      }
      
      localStorage.setItem('userRole', selectedRole)
      alert(isHindi ? 'खाता बनाया गया! अपना ईमेल चेक करें' : 'Account created! Check your email for verification')
      window.location.hash = '#auth'
    } catch (error) {
      alert(isHindi ? 'साइनअप त्रुटि: ' + error.message : 'Signup error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0" style={{backgroundColor: '#e9f2e4', zIndex: -1}}></div>
      
      {/* Bokeh Circles */}
      <div className="absolute w-80 h-80 bg-white/5 rounded-full blur-3xl animate-drift" style={{top: '10%', left: '15%'}}></div>
      <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl animate-drift-reverse" style={{bottom: '5%', right: '10%'}}></div>
      <div className="absolute w-60 h-60 bg-white/3 rounded-full blur-2xl animate-drift" style={{top: '60%', left: '5%'}}></div>
      <div className="absolute w-72 h-72 bg-white/4 rounded-full blur-3xl animate-drift-reverse" style={{top: '30%', right: '5%'}}></div>

      {/* Floating Stars */}
      <div className="absolute text-white/60 text-xl animate-float" style={{top: '15%', left: '25%'}}>✦</div>
      <div className="absolute text-white/50 text-lg animate-float-reverse" style={{top: '70%', left: '80%'}}>✦</div>
      <div className="absolute text-white/40 text-sm animate-float" style={{top: '40%', left: '10%'}}>★</div>
      <div className="absolute text-white/45 text-base animate-float-reverse" style={{top: '25%', left: '70%'}}>✧</div>
      <div className="absolute text-white/35 text-xs animate-float" style={{top: '80%', left: '30%'}}>✦</div>
      <div className="absolute text-white/50 text-lg animate-float-reverse" style={{top: '10%', left: '85%'}}>★</div>
      <div className="absolute text-white/40 text-sm animate-float" style={{top: '55%', left: '60%'}}>✧</div>
      <div className="absolute text-white/45 text-base animate-float-reverse" style={{top: '85%', left: '75%'}}>✦</div>

      {/* Floating Bubbles */}
      <div className="absolute w-4 h-4 bg-white/20 rounded-full animate-bubble" style={{bottom: '10%', left: '20%'}}></div>
      <div className="absolute w-6 h-6 bg-white/15 rounded-full animate-bubble-slow" style={{bottom: '20%', left: '50%'}}></div>
      <div className="absolute w-3 h-3 bg-white/25 rounded-full animate-bubble-fast" style={{bottom: '15%', left: '70%'}}></div>
      <div className="absolute w-5 h-5 bg-white/18 rounded-full animate-bubble" style={{bottom: '25%', left: '10%'}}></div>
      <div className="absolute w-2 h-2 bg-white/30 rounded-full animate-bubble-fast" style={{bottom: '30%', left: '85%'}}></div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 text-3xl font-bold text-gray-800">
            <span className="font-extrabold">{isHindi ? 'पशु' : 'Pashu'}</span>
            <span className="font-light">{isHindi ? 'सेतु' : 'Setu'}</span>
          </div>
          <p className="text-gray-500 text-sm">{isHindi ? 'आपका व्यापक पशु स्वास्थ्य प्लेटफॉर्म' : 'Your comprehensive animal healthcare platform'}</p>
          <button
            onClick={() => setIsHindi(!isHindi)}
            className="mt-2 flex items-center gap-1 mx-auto text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Globe size={12} /> {isHindi ? 'English' : 'हिंदी'}
          </button>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-4 text-center">{isHindi ? 'अपनी भूमिका चुनें' : 'Select your role'}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                    selectedRole === role.id
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <Icon size={16} className={selectedRole === role.id ? "text-white" : "text-gray-500"} />
                  <span>{role.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isHindi ? 'पूरा नाम' : 'Full Name'}</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <User size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={isHindi ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                className="w-full outline-none text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isHindi ? 'ईमेल' : 'Email'}</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Mail size={16} className="text-gray-400 mr-2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={isHindi ? 'आपका ईमेल पता' : 'you@example.com'}
                className="w-full outline-none text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isHindi ? 'पासवर्ड' : 'Password'}</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Lock size={16} className="text-gray-400 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full outline-none text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Lock size={16} className="text-gray-400 mr-2" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                className="w-full outline-none text-sm"
                required
              />
            </div>
          </div>

          {/* Create Account Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (isHindi ? 'खाता बनाया जा रहा...' : 'Creating Account...') : (isHindi ? 'खाता बनाएं' : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-4 text-sm text-gray-600">
          {isHindi ? 'पहले से खाता है?' : 'Already have an account?'}{" "}
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/login')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="text-emerald-500 font-medium hover:underline"
          >
            {isHindi ? 'साइन इन करें' : 'Sign in'}
          </button>
        </div>

        {/* Supportive Message */}
        <div className="text-center mt-3 text-gray-500 text-sm flex items-center justify-center gap-1">
          <Heart size={14} className="text-red-400" />
          {isHindi ? 'आपकी पशु स्वास्थ्य यात्रा यहाँ से शुरू होती है। हम मदद के लिए यहाँ हैं।' : "Your animal healthcare journey starts here. We're here to help."}
        </div>
      </div>
    </div>
  )
}