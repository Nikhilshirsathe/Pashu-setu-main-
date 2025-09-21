import { User, Heart, Syringe, AlertCircle, CheckCircle, Video, TrendingUp, Calendar, MapPin, Bell, Activity, Thermometer, Stethoscope, Pill, Clock, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [userRole, setUserRole] = useState('farmer')
  
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'farmer'
    const normalizedRole = role === 'doctor' ? 'veterinarian' : role === 'lab_employee' ? 'lab' : role
    setUserRole(normalizedRole)
    fetchDashboardData(normalizedRole)
  }, [])

  const fetchDashboardData = async (role) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch animals
      const { data: animals } = await supabase
        .from('animals')
        .select('*')
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
            icon: FlaskConical, 
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
            icon: Truck, 
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
            icon: FlaskConical, 
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
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            {userRole === 'farmer' ? 'Farm Dashboard' :
             userRole === 'veterinarian' ? 'Doctor Dashboard' :
             userRole === 'lab' ? 'Lab Dashboard' :
             userRole === 'dispatcher' ? 'Dispatcher Dashboard' :
             userRole === 'volunteer' ? 'Volunteer Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-neutral-600 mt-1">
            {userRole === 'farmer' ? 'Welcome back! Here\'s what\'s happening on your farm today.' :
             userRole === 'veterinarian' ? 'Welcome back, Doctor! Here are your patient updates.' :
             userRole === 'lab' ? 'Welcome back! Here\'s your lab status today.' :
             userRole === 'dispatcher' ? 'Welcome back! Here are your delivery updates.' :
             userRole === 'volunteer' ? 'Welcome back! Here are your assigned tasks.' : 'Welcome back!'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="card px-4 py-2 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">Pune, Maharashtra</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.hash = '#records'}
            className="btn btn-primary"
          >
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

      {/* Doctor-specific Quick Actions */}
      {userRole === 'veterinarian' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 hover-lift cursor-pointer" onClick={() => window.location.hash = '#consultation'}>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Start Consultation</p>
                <p className="text-xs text-gray-500">Begin new patient consultation</p>
              </div>
            </div>
          </div>
          <div className="card p-4 hover-lift cursor-pointer" onClick={() => window.location.hash = '#pharmacy'}>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Pill className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Prescribe Medicine</p>
                <p className="text-xs text-gray-500">Create prescription</p>
              </div>
            </div>
          </div>
          <div className="card p-4 hover-lift cursor-pointer" onClick={() => window.location.hash = '#records'}>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Patient Records</p>
                <p className="text-xs text-gray-500">View medical history</p>
              </div>
            </div>
          </div>
          <div className="card p-4 hover-lift cursor-pointer" onClick={() => window.location.hash = '#emergency'}>
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Emergency Cases</p>
                <p className="text-xs text-gray-500">Handle urgent cases</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 card hover-glow">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {userRole === 'veterinarian' ? 'Patient Updates' : 'Recent Activities'}
              </h3>
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

        {/* Weather & Alerts / Doctor Panel */}
        <div className="card hover-glow">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {userRole === 'veterinarian' ? 'Clinical Overview' : 'Weather & Alerts'}
              </h3>
              {userRole === 'veterinarian' ? 
                <Stethoscope className="w-5 h-5 text-gray-400" /> : 
                <Thermometer className="w-5 h-5 text-gray-400" />
              }
            </div>
          </div>
          <div className="p-6 space-y-4">
            {userRole === 'veterinarian' ? (
              // Doctor-specific panel
              <>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-gray-800 font-semibold">Today's Schedule</p>
                      <p className="text-sm text-gray-600">Available for consultations</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Morning: 9:00 - 12:00</div>
                    <div>Evening: 4:00 - 7:00</div>
                    <div>Emergency: 24/7</div>
                    <div>Status: Online</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-gray-800 font-medium text-sm">Treatment Success</p>
                      <p className="text-xs text-gray-600 mt-1">92% recovery rate this month. Excellent patient outcomes.</p>
                      <button className="text-xs text-green-600 font-medium mt-2 hover:underline">View Reports →</button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <Pill className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-gray-800 font-medium text-sm">Prescription Updates</p>
                      <p className="text-xs text-gray-600 mt-1">New antibiotics available. Updated treatment protocols.</p>
                      <button className="text-xs text-purple-600 font-medium mt-2 hover:underline">View Updates →</button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Regular weather panel for other roles
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}