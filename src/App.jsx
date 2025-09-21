import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Auth from './pages/Auth'
import SignUp from './pages/SignUp'
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
      if (path === '/signup') {
        setCurrentPage('signup')
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
        if (userRole) {
          localStorage.setItem('userRole', userRole === 'doctor' ? 'veterinarian' : userRole === 'lab_employee' ? 'lab' : userRole)
        }
        // Update URL to root when authenticated
        if (window.location.pathname !== '/') {
          window.history.pushState({}, '', '/')
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
        if (userRole) {
          localStorage.setItem('userRole', userRole === 'doctor' ? 'veterinarian' : userRole === 'lab_employee' ? 'lab' : userRole)
        }
        // Update URL to root when authenticated
        window.history.pushState({}, '', '/')
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setCurrentPage('auth')
        localStorage.removeItem('userRole')
      }
    })

    // Listen for hash changes to switch sections
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1)
      if (hash && pages[hash]) {
        setActiveSection(hash)
      }
    }
    
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Check initial hash

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', checkRoute)
    }
  }, [])

  if (!isAuthenticated) {
    return currentPage === 'signup' ? <SignUp /> : <Auth />
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