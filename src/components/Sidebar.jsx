import { 
  LayoutDashboard, Shield, Stethoscope, FlaskConical, 
  Truck, GraduationCap, AlertTriangle, Pill, 
  ClipboardList, Menu, X, ChevronDown, ChevronRight, ChevronLeft, User, LogOut 
} from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations/translations'

const getMenuItems = (language) => ({
  farmer: [
    { 
      id: 'dashboard', 
      label: t('dashboard', language), 
      icon: LayoutDashboard,
      color: 'blue',
      subItems: [t('farm_overview', language)]
    },
    { 
      id: 'consultation', 
      label: t('consultation', language), 
      icon: Stethoscope,
      color: 'emerald',
      subItems: [t('health_consultation', language)]
    },
    { 
      id: 'records', 
      label: t('records', language), 
      icon: ClipboardList,
      color: 'indigo',
      subItems: [t('animal_records', language)]
    },
    { 
      id: 'lab', 
      label: t('lab', language), 
      icon: FlaskConical,
      color: 'purple',
      subItems: ['Test Reports', 'Lab Data']
    },
    { 
      id: 'alerts', 
      label: t('alerts', language), 
      icon: AlertTriangle,
      color: 'orange',
      subItems: [t('weather', language), 'Regional Alerts']
    },
    { 
      id: 'education', 
      label: t('education', language), 
      icon: GraduationCap,
      color: 'amber',
      subItems: ['Educational Resources', 'Government Policies', 'Community Platform']
    },
    { 
      id: 'pharmacy', 
      label: t('pharmacy', language), 
      icon: Pill,
      color: 'teal',
      subItems: [t('medicine', language), t('vaccinations', language), 'Supplies']
    },
    { 
      id: 'emergency', 
      label: t('emergency', language), 
      icon: Truck,
      color: 'red',
      subItems: ['Quick Help & SOS']
    },
  ],
  veterinarian: [
    { 
      id: 'dashboard', 
      label: t('dashboard', language), 
      icon: LayoutDashboard,
      color: 'blue',
      subItems: [t('farm_overview', language)]
    },
    { 
      id: 'consultation', 
      label: t('consultation', language), 
      icon: Stethoscope,
      color: 'emerald',
      subItems: [t('health_consultation', language)]
    },
    { 
      id: 'education', 
      label: t('education', language), 
      icon: GraduationCap,
      color: 'amber',
      subItems: ['Educational Resources', 'Government Policies', 'Community Platform']
    },
  ],
  volunteer: [
    { 
      id: 'dashboard', 
      label: t('dashboard', language), 
      icon: LayoutDashboard,
      color: 'blue',
      subItems: [t('farm_overview', language)]
    },
    { 
      id: 'lab', 
      label: t('lab', language), 
      icon: FlaskConical,
      color: 'purple',
      subItems: ['Test Reports', 'Lab Data']
    },
    { 
      id: 'education', 
      label: t('education', language), 
      icon: GraduationCap,
      color: 'amber',
      subItems: ['Educational Resources', 'Government Policies', 'Community Platform']
    },
  ],
  lab: [
    { 
      id: 'dashboard', 
      label: t('dashboard', language), 
      icon: LayoutDashboard,
      color: 'blue',
      subItems: [t('farm_overview', language)]
    },
    { 
      id: 'lab', 
      label: t('lab', language), 
      icon: FlaskConical,
      color: 'purple',
      subItems: ['Test Reports', 'Lab Data']
    },
  ],
  dispatcher: [
    { 
      id: 'dashboard', 
      label: t('dashboard', language), 
      icon: LayoutDashboard,
      color: 'blue',
      subItems: [t('farm_overview', language)]
    },
    { 
      id: 'pharmacy', 
      label: t('pharmacy', language), 
      icon: Pill,
      color: 'teal',
      subItems: [t('medicine', language), t('vaccinations', language), 'Supplies']
    },
    { 
      id: 'emergency', 
      label: t('emergency', language), 
      icon: Truck,
      color: 'red',
      subItems: ['Quick Help & SOS']
    },
  ]
})

export default function Sidebar({ activeSection, setActiveSection, isOpen, setIsOpen, user }) {
  const { language } = useLanguage()
  const [expandedItems, setExpandedItems] = useState({})
  
  // Get user role from localStorage or user metadata
  const userRole = localStorage.getItem('userRole') || user?.user_metadata?.role || 'farmer'
  const normalizedRole = userRole === 'doctor' ? 'veterinarian' : userRole === 'lab_employee' ? 'lab' : userRole
  const allMenuItems = getMenuItems(language)
  const menuItems = allMenuItems[normalizedRole] || allMenuItems.farmer

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => {
      const newExpanded = {}
      if (!prev[itemId]) {
        newExpanded[itemId] = true
      }
      return newExpanded
    })
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${isOpen ? 'block' : 'hidden'}`} 
           onClick={() => setIsOpen(false)} />
      
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 border-r border-gray-200 overflow-hidden flex flex-col lg:translate-x-0 lg:z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        
        <nav className="p-4 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isExpanded = expandedItems[item.id]
            const isActive = activeSection === item.id
            
            return (
              <div key={item.id} className="mb-2">
                <button
                  onClick={() => {
                    console.log('Sidebar navigation clicked:', item.id, 'Role:', normalizedRole)
                    const url = item.id === 'dashboard' ? `/${normalizedRole}/dashboard` : `/${normalizedRole}/dashboard/${item.id}`
                    console.log('Navigating to:', url)
                    
                    // Update active section first
                    setActiveSection(item.id)
                    
                    // Then update URL
                    window.history.pushState({}, '', url)
                    window.dispatchEvent(new PopStateEvent('popstate'))
                    
                    toggleExpanded(item.id)
                    if (window.innerWidth < 1024) setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    {isOpen && <span className="font-medium text-sm">{item.label}</span>}
                  </div>
                  {isOpen && (isExpanded ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="mt-2 ml-6 space-y-1">
                    {item.subItems.map((subItem, index) => (
                      <div 
                        key={index} 
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Sidebar sub-item clicked:', subItem, 'for:', item.id)
                          
                          // Update active section
                          setActiveSection(item.id)
                          
                          const url = item.id === 'dashboard' ? `/${normalizedRole}/dashboard` : `/${normalizedRole}/dashboard/${item.id}`
                          console.log('Sub-item navigating to:', url)
                          
                          window.history.pushState({}, '', url)
                          window.dispatchEvent(new PopStateEvent('popstate'))
                          
                          if (item.id === 'education') {
                            const tabMap = {
                              'Educational Resources': 'resources',
                              'Government Policies': 'policies', 
                              'Community Platform': 'community'
                            }
                            localStorage.setItem('educationTab', tabMap[subItem] || 'resources')
                            window.dispatchEvent(new Event('educationTabChange'))
                          }
                          if (window.innerWidth < 1024) setIsOpen(false)
                        }}
                        className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 cursor-pointer transition-all duration-200 rounded-md"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <span className="font-medium">{subItem}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white border border-gray-200 mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {isOpen && (
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{user?.user_metadata?.name || 'User'}</p>
                <p className="text-xs text-gray-600 capitalize">{normalizedRole === 'veterinarian' ? 'Veterinarian' : normalizedRole === 'lab' ? 'Lab Technician' : normalizedRole}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              setIsOpen(false)
              window.location.reload()
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 bg-white border border-gray-200"
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="font-medium text-sm">{t('logout', language)}</span>}
          </button>
        </div>
      </div>
    </>
  )
}