import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Auth from './pages/Auth'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setIsAuthenticated(true)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!isAuthenticated) {
    return <Auth />
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