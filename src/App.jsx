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
import { supabase } from './lib/supabase'

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

  useEffect(() => {
    
    // Check URL for routing
    const checkRoute = () => {
      const path = window.location.pathname
      if (path === '/login') {
        setCurrentPage('auth')
      } else if (path === '/signup') {
        setCurrentPage('signup')
      } else if (path.match(/^\/(farmer|veterinary|volunteer|lab|dispatcher)(\/dashboard)?/)) {
        const pathParts = path.split('/').filter(p => p)
        const role = pathParts[0]
        const section = pathParts[2] || 'dashboard'
        
        // Verify user role matches URL
        const userRole = localStorage.getItem('userRole')
        if (userRole && userRole !== role) {
          // Redirect to correct role dashboard
          window.history.pushState({}, '', `/${userRole}/dashboard`)
          return
        }
        
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
    }
  }, [])

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    return currentPage === 'signup' ? <Signup /> : <Auth />
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
          <CurrentPage />
        </main>
      </div>
    </div>
  )
}