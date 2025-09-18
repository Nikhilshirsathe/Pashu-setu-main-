import { User, Heart, Syringe, AlertCircle, CheckCircle, Video, TrendingUp, Calendar, MapPin, Bell, Activity, Thermometer } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { 
      icon: User, 
      label: 'Total Animals', 
      value: '156', 
      change: '+12%',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    { 
      icon: Heart, 
      label: 'Health Checkups', 
      value: '23', 
      change: '+8%',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100'
    },
    { 
      icon: Syringe, 
      label: 'Vaccinations Due', 
      value: '8', 
      change: '-15%',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
    { 
      icon: AlertCircle, 
      label: 'Active Alerts', 
      value: '3', 
      change: '+2',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100'
    },
  ]

  const activities = [
    {
      icon: CheckCircle,
      title: 'Vaccination completed for Cow #123',
      time: '2 hours ago',
      type: 'success',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: Video,
      title: 'Video consultation with Dr. Sharma',
      time: '4 hours ago',
      type: 'info',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Calendar,
      title: 'Health checkup scheduled for tomorrow',
      time: '6 hours ago',
      type: 'warning',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      icon: Bell,
      title: 'New disease alert in your region',
      time: '8 hours ago',
      type: 'alert',
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ]

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Farm Dashboard</h1>
          <p className="text-neutral-600 mt-1">Welcome back! Here's what's happening on your farm today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="card px-4 py-2 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">Pune, Maharashtra</span>
            </div>
          </div>
          <button className="btn btn-primary">
            Add Animal
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-6 hover-lift hover-glow">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.bgGradient} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'none'}} />
                </div>
                <div className={`flex items-center space-x-1 text-xs font-medium ${
                  stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 card hover-glow">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Recent Activities</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className={`flex items-start space-x-4 p-4 ${activity.bg} rounded-xl transition-all hover:shadow-md`}>
                    <div className={`${activity.color} ${activity.bg} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Weather & Alerts */}
        <div className="card hover-glow">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Weather & Alerts</h3>
              <Thermometer className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-3xl">☀️</div>
                <div>
                  <p className="text-gray-800 font-semibold text-lg">28°C</p>
                  <p className="text-sm text-gray-600">Sunny & Clear</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Humidity: 65%</div>
                <div>Wind: 12 km/h</div>
                <div>UV Index: 7</div>
                <div>Visibility: 10km</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium text-sm">Disease Alert</p>
                  <p className="text-xs text-gray-600 mt-1">Foot & Mouth Disease reported 15km away. Implement biosecurity measures.</p>
                  <button className="text-xs text-red-600 font-medium mt-2 hover:underline">View Details →</button>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium text-sm">Upcoming Events</p>
                  <p className="text-xs text-gray-600 mt-1">Vaccination drive scheduled for next week. Register your animals.</p>
                  <button className="text-xs text-blue-600 font-medium mt-2 hover:underline">Register Now →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}