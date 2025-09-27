import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Auth from './pages/Auth'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Consultation from './pages/Consultation'
import Lab from './pages/Lab'
import Emergency from './pages/Emergency'
import Education from './pages/Education'
import Alerts from './pages/Alerts'
import Pharmacy from './pages/Pharmacy'
import Records from './pages/Records'
import MaternityCare from './components/MaternityCare'
import CallNotification from './components/CallNotification'
import VideoCall from './components/VideoCall'
import VoiceAssistant from './components/VoiceAssistant'
import { supabase } from './lib/supabase'
import { getNotifications, markAsRead } from './lib/notificationService'
import { varhaFunctions } from './lib/varhaFunctions'
import { LanguageProvider } from './contexts/LanguageContext'

const pages = {
  dashboard: { component: Dashboard, title: 'Dashboard' },
  consultation: { component: Consultation, title: 'Health & Consultation' },
  lab: { component: Lab, title: 'Lab & Diagnostics' },
  emergency: { component: Emergency, title: 'Emergency Services' },
  education: { component: Education, title: 'Education Hub' },
  alerts: { component: Alerts, title: 'Risk & Alerts' },
  pharmacy: { component: Pharmacy, title: 'Pharmacy' },
  records: { component: Records, title: 'Records Management' },
}

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('auth')
  const [incomingCall, setIncomingCall] = useState(null)
  const [activeVideoCall, setActiveVideoCall] = useState(null)
  const [previousPath, setPreviousPath] = useState(null)
  const [showMaternityCare, setShowMaternityCare] = useState(false)

  useEffect(() => {
    // Check localStorage for authentication first
    const userRole = localStorage.getItem('userRole')
    const userEmail = localStorage.getItem('userEmail')
    
    if (userRole && userEmail) {
      setIsAuthenticated(true)
      setUser({ email: userEmail, user_metadata: { role: userRole } })
      
      // Set up notification listener for veterinarians
      if (userRole === 'veterinarian') {
        // Real-time notifications will be handled in Consultation.jsx
        console.log('Veterinarian logged in, notifications enabled')
      }
    }
    
    // Initialize VARHA integration
    varhaFunctions.setCallbacks({
      onNavigate: (section, path) => {
        setActiveSection(section)
        window.history.pushState({}, '', path)
      },
      onStartVideoCall: (callData) => {
        setPreviousPath(window.location.pathname)
        setActiveVideoCall(callData)
      }
    })
    varhaFunctions.init()
    
    // Check URL for routing
    const checkRoute = () => {
      const path = window.location.pathname
      if (path === '/login') {
        setCurrentPage('auth')
      } else if (path === '/signup') {
        setCurrentPage('signup')
      } else if (path === '/maternity-care') {
        setShowMaternityCare(true)
        setCurrentPage('dashboard')
      } else if (path.match(/^\/(farmer|veterinary|volunteer|lab|dispatcher)(\/dashboard)?/)) {
        const pathParts = path.split('/').filter(p => p)
        const role = pathParts[0]
        const section = pathParts[2] || 'dashboard'
        
        console.log('Route matched:', { path, role, section, pathParts })
        
        // Verify user role matches URL
        const userRole = localStorage.getItem('userRole')
        console.log('User role from localStorage:', userRole)
        
        if (userRole && userRole !== role) {
          console.log('Role mismatch, redirecting to:', `/${userRole}/dashboard`)
          // Redirect to correct role dashboard
          window.history.pushState({}, '', `/${userRole}/dashboard`)
          return
        }
        
        console.log('Setting active section to:', section)
        setActiveSection(section)
        setCurrentPage('dashboard')
      } else if (path.startsWith('/dashboard')) {
        // Legacy dashboard route - redirect to role-based route
        const userRole = localStorage.getItem('userRole')
        if (userRole) {
          const section = path.split('/')[2] || ''
          const newPath = section ? `/${userRole}/dashboard/${section}` : `/${userRole}/dashboard`
          window.history.pushState({}, '', newPath)
          setCurrentPage('dashboard')
        }
      } else if (path === '/') {
        setCurrentPage('auth')
      } else {
        setCurrentPage('auth')
      }
    }
    
    checkRoute()
    
    // Listen for popstate events
    window.addEventListener('popstate', checkRoute)

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setIsAuthenticated(true)
        // Set user role from metadata
        const userRole = session.user?.user_metadata?.role
        const normalizedRole = userRole === 'doctor' ? 'veterinary' : userRole === 'lab_employee' ? 'lab' : userRole
        if (normalizedRole) {
          localStorage.setItem('userRole', normalizedRole)
          if (!window.location.pathname.startsWith(`/${normalizedRole}/dashboard`)) {
            window.history.pushState({}, '', `/${normalizedRole}/dashboard`)
          }
        }
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
        setIsAuthenticated(true)
        // Set user role from metadata
        const userRole = session.user?.user_metadata?.role
        const normalizedRole = userRole === 'doctor' ? 'veterinary' : userRole === 'lab_employee' ? 'lab' : userRole
        if (normalizedRole) {
          localStorage.setItem('userRole', normalizedRole)
          window.history.pushState({}, '', `/${normalizedRole}/dashboard`)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setCurrentPage('auth')
        localStorage.removeItem('userRole')
        // Redirect to login if not on auth pages
        if (!window.location.pathname.match(/^\/(login|signup)$/)) {
          window.history.pushState({}, '', '/login')
        }
      }
    })



    return () => {
      subscription.unsubscribe()
      window.removeEventListener('popstate', checkRoute)
      // Cleanup handled by individual components
    }
  }, [])

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    return currentPage === 'signup' ? <Signup /> : <Auth />
  }

  // Handle maternity care view
  if (showMaternityCare) {
    return (
      <LanguageProvider>
        <MaternityCare onBack={() => {
          setShowMaternityCare(false)
          const userRole = localStorage.getItem('userRole')
          window.history.pushState({}, '', `/${userRole}/dashboard`)
        }} />
      </LanguageProvider>
    )
  }

  // Handle active video call
  if (activeVideoCall) {
    return (
      <VideoCall 
        roomId={activeVideoCall.roomId}
        onEndCall={() => {
          setActiveVideoCall(null)
          // Restore previous URL if available
          if (previousPath) {
            window.history.pushState({}, '', previousPath)
            // Re-parse the route to set correct activeSection
            const pathParts = previousPath.split('/').filter(p => p)
            const section = pathParts[2] || 'dashboard'
            setActiveSection(section)
          }
        }}
        userRole={localStorage.getItem('userRole')}
        userEmail={localStorage.getItem('userEmail')}
      />
    )
  }

  const handleAcceptCall = () => {
    if (incomingCall) {
      // Store current path before starting video call
      setPreviousPath(window.location.pathname)
      setActiveVideoCall({ roomId: incomingCall.roomId })
      markAsRead(incomingCall.id)
      setIncomingCall(null)
    }
  }

  const handleDeclineCall = () => {
    if (incomingCall) {
      markAsRead(incomingCall.id)
      setIncomingCall(null)
    }
  }

  // Redirect authenticated users to role-based dashboard, unauthenticated to login
  if (window.location.pathname === '/') {
    if (isAuthenticated) {
      const userRole = localStorage.getItem('userRole')
      if (userRole) {
        window.history.pushState({}, '', `/${userRole}/dashboard`)
      }
    } else {
      window.history.pushState({}, '', '/login')
    }
  }

  const CurrentPage = pages[activeSection].component

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          user={user}
        />
        
        <Header 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          user={user}
        />
        
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
          <main className="p-6 min-h-screen mt-20">
            <CurrentPage onStartVideoCall={(callData) => {
              console.log('Video call started from App:', callData)
              // Store current path before starting video call
              setPreviousPath(window.location.pathname)
              setActiveVideoCall(callData)
            }} />
          </main>
        </div>

        {/* Incoming Call Notification */}
        {incomingCall && (
          <CallNotification 
            notification={incomingCall}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
          />
        )}
        
        {/* Voice Assistant */}
        <VoiceAssistant />
      </div>
    </LanguageProvider>
  )
}