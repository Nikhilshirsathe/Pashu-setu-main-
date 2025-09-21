import { Menu, CloudSun, User, Bell, Search, ChevronDown, LogOut, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Header({ isOpen, setIsOpen, user }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const fetchNotifications = async () => {
    try {
      const { data: animals } = await supabase
        .from('animals')
        .select('id, name')
        .eq('owner_id', user?.id)

      const { data: healthRecords } = await supabase
        .from('health_records')
        .select('*, animals(name)')
        .in('animal_id', animals?.map(a => a.id) || [])
        .order('created_at', { ascending: false })

      const notifs = []
      
      // Check for overdue vaccinations
      healthRecords?.forEach(record => {
        if (record.last_vaccination_date) {
          const lastVax = new Date(record.last_vaccination_date)
          const daysSince = Math.floor((new Date() - lastVax) / (1000 * 60 * 60 * 24))
          if (daysSince > 365) {
            notifs.push({
              id: `vax-${record.id}`,
              type: 'warning',
              title: 'Vaccination Overdue',
              message: `${record.animals?.name} needs vaccination (${daysSince} days overdue)`,
              time: '2h ago'
            })
          }
        }
      })

      // Recent health records
      healthRecords?.slice(0, 2).forEach(record => {
        notifs.push({
          id: `health-${record.id}`,
          type: 'info',
          title: 'Health Record Added',
          message: `New health record for ${record.animals?.name}`,
          time: new Date(record.created_at).toLocaleDateString()
        })
      })

      setNotifications(notifs)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }
  return (
    <header className="glass shadow-xl border-b border-neutral-200/50 px-6 py-4 fixed top-0 left-0 right-0 z-30 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <Menu className="w-6 h-6 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Pashu Setu</h1>
            <p className="text-sm text-neutral-500">Animal Healthcare Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-neutral-100 rounded-xl px-4 py-2 space-x-2 hover:shadow-md transition-all duration-200">
            <Search className="w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search animals, records..."
              className="bg-transparent text-sm text-neutral-600 placeholder-neutral-400 outline-none w-48"
            />
          </div>
          
          {/* Weather */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 hover:scale-105">
            <CloudSun className="w-5 h-5 text-blue-500" />
            <div className="text-sm">
              <span className="text-blue-700 font-semibold">28°C</span>
              <span className="text-blue-600 ml-1">Sunny</span>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative notification-dropdown">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <Bell className="w-5 h-5 text-neutral-600" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{notifications.length}</span>
                </div>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notif.type === 'warning' ? 'bg-yellow-500' : 
                            notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{notif.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                            <p className="text-gray-400 text-xs mt-2">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        setNotifications([])
                        setShowNotifications(false)
                      }}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-xl border border-emerald-200">
              <User className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                {user?.email || 'User'}
              </span>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="p-2 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-neutral-600 group-hover:text-red-600" />
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}