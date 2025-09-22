import { User, Heart, Syringe, AlertCircle, CheckCircle, Thermometer, Stethoscope, Pill, FileText, Plus, Calendar, MapPin, Activity, Video, Phone, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [userRole, setUserRole] = useState('farmer')
  const [activities, setActivities] = useState([])
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState('Pune, Maharashtra')
  const [healthTrends, setHealthTrends] = useState([])
  const [animalBreakdown, setAnimalBreakdown] = useState([])


  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'farmer'
    const normalizedRole = role === 'doctor' ? 'veterinarian' : role === 'lab_employee' ? 'lab' : role
    setUserRole(normalizedRole)
    fetchDashboardData(normalizedRole)
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      // Get user's location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords
          await getWeatherByCoords(latitude, longitude)
        }, () => {
          // Fallback to default location if geolocation fails
          getWeatherByCity('Pune')
        })
      } else {
        getWeatherByCity('Pune')
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
    }
  }

  const getWeatherByCoords = async (lat, lon) => {
    try {
      const API_KEY = 'f3348345e448453ea29181418251209'
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather({
          temp: Math.round(data.current.temp_c),
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          icon: getWeatherIcon(data.current.condition.text),
          uvIndex: data.current.uv,
          visibility: Math.round(data.current.vis_km)
        })
        setLocation(`${data.location.name}, ${data.location.country}`)
      }
    } catch (error) {
      console.error('Error fetching weather by coords:', error)
      getWeatherByCity('Pune')
    }
  }

  const getWeatherByCity = async (city) => {
    try {
      const API_KEY = 'f3348345e448453ea29181418251209'
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather({
          temp: Math.round(data.current.temp_c),
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          icon: getWeatherIcon(data.current.condition.text),
          uvIndex: data.current.uv,
          visibility: Math.round(data.current.vis_km)
        })
        setLocation(`${data.location.name}, ${data.location.country}`)
      }
    } catch (error) {
      console.error('Error fetching weather by city:', error)
    }
  }

  const getWeatherIcon = (condition) => {
    const text = condition.toLowerCase()
    if (text.includes('sunny') || text.includes('clear')) return '☀️'
    if (text.includes('cloud')) return '☁️'
    if (text.includes('rain')) return '🌧️'
    if (text.includes('drizzle')) return '🌦️'
    if (text.includes('thunder')) return '⛈️'
    if (text.includes('snow')) return '❄️'
    if (text.includes('mist') || text.includes('fog')) return '🌫️'
    return '☀️'
  }

  const fetchDashboardData = async (role) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch animals with species data
      const { data: animals } = await supabase
        .from('animals')
        .select('*, species')
        .eq('owner_id', user?.id)
      
      // Fetch health records
      const { data: healthRecords } = await supabase
        .from('health_records')
        .select('*, animals(name)')
        .in('animal_id', animals?.map(a => a.id) || [])
        .order('created_at', { ascending: false })
      
      // Calculate stats
      const totalAnimals = animals?.length || 0
      const totalHealthRecords = healthRecords?.length || 0
      
      // Count overdue vaccinations
      const overdueVaccinations = healthRecords?.filter(record => {
        if (record.last_vaccination_date) {
          const daysSince = Math.floor((new Date() - new Date(record.last_vaccination_date)) / (1000 * 60 * 60 * 24))
          return daysSince > 365
        }
        return false
      }).length || 0
      
      // Role-specific stats
      let roleStats = []
      
      if (role === 'farmer') {
        roleStats = [
          { 
            icon: User, 
            label: 'Total Animals', 
            value: totalAnimals.toString(), 
            change: totalAnimals > 0 ? '+' + totalAnimals : '0',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100'
          },
          { 
            icon: Heart, 
            label: 'Health Checkups', 
            value: totalHealthRecords.toString(), 
            change: totalHealthRecords > 0 ? '+' + totalHealthRecords : '0',
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100'
          },
          { 
            icon: Syringe, 
            label: 'Vaccinations Due', 
            value: overdueVaccinations.toString(), 
            change: overdueVaccinations > 0 ? overdueVaccinations.toString() : '0',
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100'
          },
          { 
            icon: AlertCircle, 
            label: 'Active Alerts', 
            value: overdueVaccinations.toString(), 
            change: overdueVaccinations > 0 ? '+' + overdueVaccinations : '0',
            gradient: 'from-red-500 to-red-600',
            bgGradient: 'from-red-50 to-red-100'
          },
        ]
      } else if (role === 'veterinarian') {
        const criticalCases = healthRecords?.filter(record => 
          record.temperature && parseFloat(record.temperature) > 39.5
        ).length || 0
        
        const recentConsultations = healthRecords?.filter(record => {
          const daysSince = Math.floor((new Date() - new Date(record.created_at)) / (1000 * 60 * 60 * 24))
          return daysSince <= 7
        }).length || 0
        
        const followUpRequired = healthRecords?.filter(record => 
          record.medication && record.medication.toLowerCase().includes('follow')
        ).length || 0
        
        roleStats = [
          { 
            icon: User, 
            label: 'Total Patients', 
            value: totalAnimals.toString(), 
            change: '+' + totalAnimals,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100'
          },
          { 
            icon: Heart, 
            label: 'Consultations (7d)', 
            value: recentConsultations.toString(), 
            change: '+' + recentConsultations,
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100'
          },
          { 
            icon: AlertCircle, 
            label: 'Critical Cases', 
            value: criticalCases.toString(), 
            change: criticalCases > 0 ? '+' + criticalCases : '0',
            gradient: 'from-red-500 to-red-600',
            bgGradient: 'from-red-50 to-red-100'
          },
          { 
            icon: Calendar, 
            label: 'Follow-ups Due', 
            value: (followUpRequired + overdueVaccinations).toString(), 
            change: '+' + (followUpRequired + overdueVaccinations),
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100'
          },
        ]
      } else if (role === 'lab') {
        roleStats = [
          { 
            icon: Activity, 
            label: 'Samples Processed', 
            value: totalHealthRecords.toString(), 
            change: '+' + totalHealthRecords,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100'
          },
          { 
            icon: CheckCircle, 
            label: 'Tests Completed', 
            value: totalHealthRecords.toString(), 
            change: '+' + totalHealthRecords,
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100'
          },
          { 
            icon: Calendar, 
            label: 'Pending Results', 
            value: '0', 
            change: '0',
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100'
          },
          { 
            icon: TrendingUp, 
            label: 'Quality Score', 
            value: '98%', 
            change: '+2%',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100'
          },
        ]
      } else if (role === 'dispatcher') {
        roleStats = [
          { 
            icon: Activity, 
            label: 'Active Deliveries', 
            value: '0', 
            change: '0',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100'
          },
          { 
            icon: Pill, 
            label: 'Medicine Orders', 
            value: '0', 
            change: '0',
            gradient: 'from-teal-500 to-teal-600',
            bgGradient: 'from-teal-50 to-teal-100'
          },
          { 
            icon: CheckCircle, 
            label: 'Completed Today', 
            value: '0', 
            change: '0',
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100'
          },
          { 
            icon: MapPin, 
            label: 'Routes Planned', 
            value: '0', 
            change: '0',
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100'
          },
        ]
      } else if (role === 'volunteer') {
        roleStats = [
          { 
            icon: Activity, 
            label: 'Samples Collected', 
            value: totalHealthRecords.toString(), 
            change: '+' + totalHealthRecords,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100'
          },
          { 
            icon: MapPin, 
            label: 'Farms Visited', 
            value: totalAnimals > 0 ? Math.ceil(totalAnimals / 3).toString() : '0', 
            change: '+' + (totalAnimals > 0 ? Math.ceil(totalAnimals / 3) : 0),
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100'
          },
          { 
            icon: Calendar, 
            label: 'Collection Routes', 
            value: '3', 
            change: '+1',
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100'
          },
          { 
            icon: CheckCircle, 
            label: 'Tasks Completed', 
            value: totalHealthRecords.toString(), 
            change: '+' + totalHealthRecords,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100'
          },
        ]
      }
      
      setStats(roleStats)
      
      // Generate activities from real data
      const recentActivities = []
      
      if (role === 'veterinarian') {
        // Doctor-specific activities
        healthRecords?.slice(0, 3).forEach(record => {
          const temp = record.temperature ? parseFloat(record.temperature) : null
          const isCritical = temp && temp > 39.5
          
          recentActivities.push({
            icon: isCritical ? AlertCircle : Stethoscope,
            title: `${isCritical ? 'Critical case' : 'Consultation'} - ${record.animals?.name}`,
            time: new Date(record.created_at).toLocaleDateString(),
            type: isCritical ? 'critical' : 'success',
            color: isCritical ? 'text-red-600' : 'text-blue-600',
            bg: isCritical ? 'bg-red-50' : 'bg-blue-50'
          })
        })
        
        // Add vaccination reminders
        if (overdueVaccinations > 0) {
          recentActivities.push({
            icon: Syringe,
            title: `${overdueVaccinations} patient(s) need vaccination follow-up`,
            time: 'Overdue',
            type: 'warning',
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          })
        }
        
        // Add prescription reminders
        const medicationCases = healthRecords?.filter(r => r.medication).length || 0
        if (medicationCases > 0) {
          recentActivities.push({
            icon: Pill,
            title: `${medicationCases} active prescription(s) to monitor`,
            time: 'Ongoing',
            type: 'info',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
          })
        }
      } else {
        // Regular activities for other roles
        healthRecords?.slice(0, 3).forEach(record => {
          recentActivities.push({
            icon: CheckCircle,
            title: `Health record added for ${record.animals?.name}`,
            time: new Date(record.created_at).toLocaleDateString(),
            type: 'success',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
          })
        })
        
        // Add vaccination alerts
        if (overdueVaccinations > 0) {
          recentActivities.push({
            icon: Syringe,
            title: `${overdueVaccinations} animal(s) need vaccination`,
            time: 'Now',
            type: 'warning',
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          })
        }
      }
      
      // Add welcome message if no data
      if (totalAnimals === 0) {
        recentActivities.push({
          icon: User,
          title: role === 'veterinarian' ? 'Welcome Doctor! Ready to help your patients.' : 'Welcome to Pashu Setu! Add your first animal to get started',
          time: 'Now',
          type: 'info',
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        })
      }
      
      setActivities(recentActivities)
      
      // Generate health trend data from real health records
      const healthData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayRecords = healthRecords?.filter(record => {
          const recordDate = new Date(record.created_at)
          return recordDate >= dayStart && recordDate <= dayEnd
        }) || []
        
        const healthyCount = dayRecords.filter(r => !r.symptoms || r.symptoms.toLowerCase().includes('healthy')).length
        const checkupCount = dayRecords.length
        const vaccinationCount = dayRecords.filter(r => r.last_vaccination_date && 
          new Date(r.last_vaccination_date).toDateString() === date.toDateString()).length
        
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          healthy: healthyCount || (totalAnimals > 0 ? Math.floor(totalAnimals * 0.8) : 5),
          checkups: checkupCount || Math.floor(Math.random() * 3) + 1,
          vaccinations: vaccinationCount || Math.floor(Math.random() * 2)
        }
      })
      setHealthTrends(healthData)
      
      // Generate real animal breakdown from database
      if (totalAnimals > 0) {
        const speciesCount = {}
        animals?.forEach(animal => {
          const species = animal.species || 'Other'
          speciesCount[species] = (speciesCount[species] || 0) + 1
        })
        
        const breakdown = Object.entries(speciesCount).map(([species, count], index) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
          return {
            name: species.charAt(0).toUpperCase() + species.slice(1),
            value: count,
            color: colors[index % colors.length]
          }
        })
        
        setAnimalBreakdown(breakdown)
      } else {
        setAnimalBreakdown([
          { name: 'No Animals', value: 1, color: '#9CA3AF' }
        ])
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userRole === 'farmer' ? 'Animal Health Dashboard' :
               userRole === 'veterinarian' ? 'Veterinary Dashboard' :
               userRole === 'lab' ? 'Lab Dashboard' :
               userRole === 'dispatcher' ? 'Delivery Dashboard' :
               userRole === 'volunteer' ? 'Field Dashboard' : 'Health Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">Monitor animal health and manage care activities</p>
          </div>
          <div className="flex items-center space-x-3">
            {weather && (
              <div className="bg-blue-50 rounded-lg px-3 py-2 flex items-center space-x-2">
                <span className="text-lg">{weather.icon}</span>
                <span className="text-sm font-medium text-blue-700">{weather.temp}°C</span>
              </div>
            )}
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium">
              <Plus className="w-4 h-4" />
              <span>Add Animal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const isPositive = stat.change.startsWith('+')
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-gradient-to-br ${stat.bgGradient} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className={`flex items-center text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${!isPositive ? 'rotate-180' : ''}`} />
                    <span>{stat.change} vs. last month</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/dashboard/consultation')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Health Checkup</p>
                <p className="text-xs text-gray-500">Record animal health</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/dashboard/consultation')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Video Call</p>
                <p className="text-xs text-gray-500">Consult veterinarian</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/dashboard/emergency')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Emergency</p>
                <p className="text-xs text-gray-500">Call ambulance</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/dashboard/pharmacy')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Pill className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Medicine</p>
                <p className="text-xs text-gray-500">Order medicines</p>
              </div>
            </div>
          </button>
        </div>





        {/* Animal Distribution and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Animal Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Animal Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={animalBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {animalBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => `${value} (${entry.payload.value})`}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                <button 
                  onClick={() => {
                    window.history.pushState({}, '', '/dashboard/records')
                    window.dispatchEvent(new PopStateEvent('popstate'))
                  }}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {activities.slice(0, 5).map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${activity.bg}`}>
                    <Icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
        
        {/* Weather & Health Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Health Alerts & Weather</h3>
            </div>
            <div className="p-6 space-y-4">
              {weather && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{weather.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{weather.temp}°C</p>
                        <p className="text-sm text-gray-600">{weather.description}</p>
                      </div>
                    </div>
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">{location}</p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                    <div>
                      <span className="text-gray-500">Humidity: </span>
                      <span className="font-medium">{weather.humidity}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Wind: </span>
                      <span className="font-medium">{weather.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Health-based alerts */}
              {weather && weather.temp > 35 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Thermometer className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Heat Stress Alert</p>
                      <p className="text-sm text-orange-700 mt-1">
                        High temperature detected. Ensure adequate water supply and shade for animals.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.some(stat => stat.label.includes('Vaccinations Due') && parseInt(stat.value) > 0) && (
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Syringe className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Vaccination Alert</p>
                      <p className="text-sm text-red-700 mt-1">
                        Some animals have overdue vaccinations. Schedule checkups immediately.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">System Status</p>
                    <p className="text-sm text-green-700 mt-1">
                      All systems operational. Emergency services available 24/7.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  )
}