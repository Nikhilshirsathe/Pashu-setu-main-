import { User, Heart, Syringe, AlertCircle, CheckCircle, Thermometer, Stethoscope, Pill, FileText, Plus, Calendar, MapPin, Activity, Video, Phone, TrendingUp, Bell, Baby } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations/translations'
import { getNotifications, getRecentActivities, markAsRead } from '../lib/notificationService'

export default function Dashboard() {
  const { language } = useLanguage()
  const [stats, setStats] = useState([])
  const [userRole, setUserRole] = useState('farmer')
  const [activities, setActivities] = useState([])
  const [notifications, setNotifications] = useState([])
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState('Pune, Maharashtra')
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'farmer'
    const normalizedRole = role === 'doctor' ? 'veterinarian' : role === 'lab_employee' ? 'lab' : role
    setUserRole(normalizedRole)
    fetchDashboardData(normalizedRole)
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      const API_KEY = 'f3348345e448453ea29181418251209'
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Pune&aqi=no`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather({
          temp: Math.round(data.current.temp_c),
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          icon: getWeatherIcon(data.current.condition.text)
        })
        setLocation(`${data.location.name}, ${data.location.country}`)
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
    }
  }

  const getWeatherIcon = (condition) => {
    const text = condition.toLowerCase()
    if (text.includes('sunny') || text.includes('clear')) return '☀️'
    if (text.includes('cloud')) return '☁️'
    if (text.includes('rain')) return '🌧️'
    return '☀️'
  }

  const fetchDashboardData = async (role) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let animals = []
      if (role === 'farmer') {
        const { data: animalData } = await supabase
          .from('animals')
          .select('*')
          .eq('owner_id', user?.id)
        animals = animalData || []
      }
      
      const { data: healthRecords } = await supabase
        .from('health_records')
        .select('*, animals(name)')
        .in('animal_id', animals?.map(a => a.id) || [])
        .order('created_at', { ascending: false })
      
      const totalAnimals = animals?.length || 0
      const totalHealthRecords = healthRecords?.length || 0
      
      const overdueVaccinations = healthRecords?.filter(record => {
        if (record.last_vaccination_date) {
          const daysSince = Math.floor((new Date() - new Date(record.last_vaccination_date)) / (1000 * 60 * 60 * 24))
          return daysSince > 365
        }
        return false
      }).length || 0
      
      let roleStats = []
      
      if (role === 'farmer') {
        roleStats = [
          { icon: User, label: t('total_animals', language), value: totalAnimals.toString(), change: '+' + totalAnimals },
          { icon: Heart, label: t('health_records', language), value: totalHealthRecords.toString(), change: '+' + totalHealthRecords },
          { icon: Syringe, label: t('vaccinations_due', language), value: overdueVaccinations.toString(), change: overdueVaccinations.toString() },
          { icon: AlertCircle, label: t('alerts', language), value: overdueVaccinations.toString(), change: '+' + overdueVaccinations },
        ]
      } else if (role === 'veterinarian') {
        const recentConsultations = healthRecords?.filter(record => {
          const daysSince = Math.floor((new Date() - new Date(record.created_at)) / (1000 * 60 * 60 * 24))
          return daysSince <= 7
        }).length || 0
        
        roleStats = [
          { icon: User, label: t('total_animals', language), value: totalAnimals.toString(), change: '+' + totalAnimals },
          { icon: Heart, label: t('consultations', language), value: recentConsultations.toString(), change: '+' + recentConsultations },
          { icon: AlertCircle, label: 'Critical Cases', value: '0', change: '0' },
          { icon: Calendar, label: 'Follow-ups Due', value: overdueVaccinations.toString(), change: '+' + overdueVaccinations },
        ]
      }
      
      setStats(roleStats)
      
      // Fetch real activities and notifications with fallback
      const userId = user?.id || localStorage.getItem('userEmail')
      let realActivities = []
      let userNotifications = []
      
      try {
        realActivities = await getRecentActivities(userId)
        userNotifications = await getNotifications(userId)
      } catch (error) {
        console.log('Database tables may not exist yet, using fallback data')
      }
      
      // Convert database activities to display format
      const formattedActivities = realActivities.map(activity => ({
        icon: getActivityIcon(activity.type),
        title: activity.description,
        time: new Date(activity.created_at).toLocaleDateString(),
        type: getActivityType(activity.type),
        color: getActivityColor(activity.type),
        bg: getActivityBg(activity.type)
      }))
      
      // Add fallback activities from health records and animals
      healthRecords?.slice(0, 3).forEach(record => {
        formattedActivities.push({
          icon: CheckCircle,
          title: `Health record added for ${record.animals?.name}`,
          time: new Date(record.created_at).toLocaleDateString(),
          type: 'success',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50'
        })
      })
      
      if (overdueVaccinations > 0) {
        formattedActivities.push({
          icon: Syringe,
          title: `${overdueVaccinations} animal(s) need vaccination`,
          time: 'Now',
          type: 'warning',
          color: 'text-orange-600',
          bg: 'bg-orange-50'
        })
      }
      
      if (totalAnimals === 0) {
        formattedActivities.push({
          icon: User,
          title: 'Welcome to Pashu Setu! Add your first animal to get started',
          time: 'Now',
          type: 'info',
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        })
      }
      
      setActivities(formattedActivities)
      setNotifications(userNotifications)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'animal_added': return User
      case 'health_record': return Heart
      case 'vaccination': return Syringe
      default: return CheckCircle
    }
  }
  
  const getActivityType = (type) => {
    switch (type) {
      case 'animal_added': return 'success'
      case 'health_record': return 'info'
      case 'vaccination': return 'warning'
      default: return 'info'
    }
  }
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'animal_added': return 'text-emerald-600'
      case 'health_record': return 'text-blue-600'
      case 'vaccination': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }
  
  const getActivityBg = (type) => {
    switch (type) {
      case 'animal_added': return 'bg-emerald-50'
      case 'health_record': return 'bg-blue-50'
      case 'vaccination': return 'bg-orange-50'
      default: return 'bg-gray-50'
    }
  }
  
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
    }
  }

  const navigateTo = (section) => {
    const userRole = localStorage.getItem('userRole') || 'farmer'
    window.location.href = `/${userRole}/dashboard/${section}`
  }

  const userName = localStorage.getItem('userEmail')?.split('@')[0] || 'User'
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ backgroundColor: '#f9fafa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {t('welcome_back', language)}, {userName}! 👋
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-1 font-medium">
            {userRole === 'farmer' ? t('manage_livestock_health', language) :
             userRole === 'veterinarian' ? 'Provide expert consultation and monitor animal health across farms' :
             userRole === 'volunteer' ? 'Support farmers with education, outreach, and community health programs' :
             userRole === 'lab' ? 'Process samples, generate reports, and manage diagnostic workflows' :
             userRole === 'dispatcher' ? 'Coordinate emergency responses and manage ambulance services' :
             'Your comprehensive animal healthcare management platform'}
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            {userRole === 'farmer' ? t('keep_animals_healthy_ai', language) :
             userRole === 'veterinarian' ? 'Access patient records, provide remote consultations, and track treatment outcomes' :
             userRole === 'volunteer' ? 'Help bridge the gap between farmers and healthcare services in your community' :
             userRole === 'lab' ? 'Ensure accurate diagnostics and timely reporting for better animal health outcomes' :
             userRole === 'dispatcher' ? 'Provide rapid emergency response and coordinate field operations efficiently' :
             'Streamline your workflow with integrated tools and real-time insights'}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          {weather && (
            <div style={{ 
              background: '#f0f9ff', 
              padding: '8px 12px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #e0f2fe'
            }}>
              <span style={{ fontSize: '16px' }}>{weather.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#0369a1' }}>
                {weather.temp}°C
              </span>
            </div>
          )}
          
          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                width: '300px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 50
              }}>
                <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{t('notifications', language)}</h3>
                </div>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        background: notification.read ? 'white' : '#f0f9ff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
                            {notification.title}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            {notification.message}
                          </p>
                          <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            background: '#3b82f6',
                            borderRadius: '50%',
                            marginLeft: '8px',
                            marginTop: '4px'
                          }} />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{t('no_notifications_yet', language)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <span style={{ fontSize: '14px', color: '#6b7280' }}>👤 {userName.toUpperCase()}</span>
        </div>
      </div>

      {/* Role-Specific Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {userRole === 'farmer' && (
          <>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #0ea5e9' }} onClick={() => navigateTo('consultation')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Stethoscope style={{ width: '20px', height: '20px', color: '#0369a1' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>🩺 {t('expert_consultation', language)}</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>{t('connect_certified_veterinarians', language)}</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #22c55e' }} onClick={() => navigateTo('records')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FileText style={{ width: '20px', height: '20px', color: '#15803d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📋 {t('health_records', language)}</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>{t('track_vaccination_schedules', language)}</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b' }} onClick={() => navigateTo('pharmacy')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Pill style={{ width: '20px', height: '20px', color: '#d97706' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>💊 {t('pharmacy', language)}</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>{t('order_medicines_vaccines', language)}</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '1px solid #ec4899' }} onClick={() => window.location.href = '/maternity-care'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Baby style={{ width: '20px', height: '20px', color: '#be185d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>🤱 {t('maternity_care', language)}</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>{t('monitor_pregnant_animals', language)}</p>
            </div>
          </>
        )}
        
        {userRole === 'veterinarian' && (
          <>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #0ea5e9' }} onClick={() => navigateTo('consultation')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Video style={{ width: '20px', height: '20px', color: '#0369a1' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📹 Patient Consultations</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>View pending consultation requests and provide expert medical advice</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #22c55e' }} onClick={() => navigateTo('records')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FileText style={{ width: '20px', height: '20px', color: '#15803d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📊 Patient Records</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Access comprehensive animal health records and treatment history</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b' }} onClick={() => navigateTo('pharmacy')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Pill style={{ width: '20px', height: '20px', color: '#d97706' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>💊 Prescriptions</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Manage prescriptions and recommend treatments for patients</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '1px solid #ec4899' }} onClick={() => navigateTo('education')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Calendar style={{ width: '20px', height: '20px', color: '#be185d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📅 Schedule</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Manage appointments and consultation schedules</p>
            </div>
          </>
        )}
        
        {userRole === 'volunteer' && (
          <>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #0ea5e9' }} onClick={() => navigateTo('education')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Heart style={{ width: '20px', height: '20px', color: '#0369a1' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>❤️ Community Outreach</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Organize health camps and educational programs for farmers</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #22c55e' }} onClick={() => navigateTo('education')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FileText style={{ width: '20px', height: '20px', color: '#15803d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📚 Training Materials</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Access and distribute educational resources to farming communities</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b' }} onClick={() => navigateTo('alerts')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <AlertCircle style={{ width: '20px', height: '20px', color: '#d97706' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>⚠️ Field Reports</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Report disease outbreaks and coordinate response efforts</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '1px solid #ec4899' }} onClick={() => navigateTo('consultation')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Users style={{ width: '20px', height: '20px', color: '#be185d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>👥 Farmer Support</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Assist farmers with consultation requests and basic guidance</p>
            </div>
          </>
        )}
        
        {userRole === 'lab' && (
          <>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #0ea5e9' }} onClick={() => navigateTo('lab')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Microscope style={{ width: '20px', height: '20px', color: '#0369a1' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>🔬 Sample Processing</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Process incoming samples and manage diagnostic workflows</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #22c55e' }} onClick={() => navigateTo('lab')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FileText style={{ width: '20px', height: '20px', color: '#15803d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📋 Test Reports</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Generate and manage diagnostic reports for veterinarians</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b' }} onClick={() => navigateTo('lab')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Calendar style={{ width: '20px', height: '20px', color: '#d97706' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📅 Sample Pickup</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Schedule and coordinate sample collection from farms</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '1px solid #ec4899' }} onClick={() => navigateTo('lab')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <TrendingUp style={{ width: '20px', height: '20px', color: '#be185d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📈 Lab Analytics</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Track lab performance and diagnostic trends</p>
            </div>
          </>
        )}
        
        {userRole === 'dispatcher' && (
          <>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #0ea5e9' }} onClick={() => navigateTo('emergency')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Truck style={{ width: '20px', height: '20px', color: '#0369a1' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>🚛 Emergency Dispatch</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Coordinate ambulance services and emergency response teams</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #22c55e' }} onClick={() => navigateTo('emergency')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <MapPin style={{ width: '20px', height: '20px', color: '#15803d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📍 Field Operations</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Track field teams and manage resource allocation</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b' }} onClick={() => navigateTo('alerts')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Phone style={{ width: '20px', height: '20px', color: '#d97706' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📞 Emergency Calls</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Handle incoming emergency calls and dispatch responses</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '1px solid #ec4899' }} onClick={() => navigateTo('alerts')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Activity style={{ width: '20px', height: '20px', color: '#be185d' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📊 Response Analytics</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Monitor response times and operational efficiency</p>
            </div>
          </>
        )}
      </div>

      {/* Core Healthcare Services */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900">
            {userRole === 'farmer' ? `🏥 ${t('comprehensive_healthcare_services', language)}` :
             userRole === 'veterinarian' ? '👩‍⚕️ Professional Veterinary Tools' :
             userRole === 'volunteer' ? '🤝 Community Support Services' :
             userRole === 'lab' ? '🔬 Laboratory Management System' :
             userRole === 'dispatcher' ? '🚨 Emergency Response Center' :
             '🏥 Healthcare Services'}
          </h2>
          <p className="text-sm text-gray-600">
            {userRole === 'farmer' ? t('access_professional_veterinary_care', language) :
             userRole === 'veterinarian' ? 'Advanced tools for patient management, consultation, and treatment planning' :
             userRole === 'volunteer' ? 'Resources and tools to support farming communities and health education' :
             userRole === 'lab' ? 'Complete diagnostic workflow management and reporting system' :
             userRole === 'dispatcher' ? 'Coordinate emergency services and manage field operations efficiently' :
             'Professional tools for animal healthcare management'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="card" style={{ cursor: 'pointer', border: '2px solid #10b981', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }} onClick={() => navigateTo('consultation')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                background: '#059669', 
                padding: '10px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Video style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>🎥 {t('live_video_consultation', language)}</h3>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>{t('available_24_7', language)}</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5', marginBottom: '8px' }}>
              {t('connect_instantly_certified_veterinarians', language)}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>{t('emergency_care', language)}</span>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>{t('expert_diagnosis', language)}</span>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>{t('treatment_plans', language)}</span>
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer', border: '2px solid #3b82f6', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }} onClick={() => navigateTo('records')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                background: '#2563eb', 
                padding: '10px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Heart style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>❤️ {t('smart_health_records', language)}</h3>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>{t('ai_powered_insights', language)}</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5', marginBottom: '8px' }}>
              {t('comprehensive_digital_health_profiles', language)}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>{t('monthly_reports', language)}</span>
              <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>{t('vaccination_alerts', language)}</span>
              <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>{t('growth_tracking', language)}</span>
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer', border: '2px solid #f59e0b', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }} onClick={() => navigateTo('pharmacy')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                background: '#f59e0b', 
                padding: '10px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Pill style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>🏪 {t('digital_pharmacy', language)}</h3>
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>{t('fast_delivery', language)}</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5', marginBottom: '8px' }}>
              {t('order_medicines_prescription_management', language)}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>{t('prescription_drugs', language)}</span>
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>{t('vaccines', language)}</span>
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>{t('supplements', language)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ 
                    background: '#f0fdf4', 
                    padding: '8px', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon style={{ width: '20px', height: '20px', color: '#059669' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', lineHeight: '1' }}>
                      {stat.value}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Activities */}
      {activities.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            {t('recent_activities', language)}
          </h3>
          <div className="flex flex-col gap-3">
            {activities.slice(0, 5).map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  background: activity.bg,
                  borderRadius: '8px'
                }}>
                  <Icon style={{ width: '16px', height: '16px' }} className={activity.color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {activity.title}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}